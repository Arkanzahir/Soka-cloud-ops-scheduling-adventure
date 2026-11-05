import {chromium} from 'playwright';
import fs from 'node:fs';
const url=process.argv[2]||'http://127.0.0.1:4192/Soka-cloud-ops-scheduling-adventure/';
const label=process.argv[3]||'release-before';
const browser=await chromium.launch({channel:'chrome',headless:true});
const context=await browser.newContext({viewport:{width:1366,height:768},deviceScaleFactor:2});
const page=await context.newPage(),cdp=await context.newCDPSession(page),root=await browser.newBrowserCDPSession();
const report={url,label,viewport:{width:1366,height:768},deviceScaleFactor:2,sampleMs:5000,scenarios:[],stress:[],errors:[]};
page.on('pageerror',e=>report.errors.push(e.message));
const metrics=async()=>Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(x=>[x.name,x.value]));
async function close(){if(await page.evaluate(()=>game.world.learning.panel.visible)){await page.keyboard.press('Escape');await page.waitForFunction(()=>game.modals.state===3&&game.world.cloudOps.state==='DRIVING')}}
async function enter(id){await close();await page.evaluate(async id=>{if(!await game.world.cloudOps.enter(id,true))throw Error('Cannot enter '+id)},id);await page.waitForFunction(()=>!game.world.cloudOps.transitions.busy);}
async function sample(id,quality){
 await page.waitForTimeout(2000);const before=await metrics();
 const frames=await page.evaluate(ms=>new Promise(resolve=>{
  const times=[],draws=[],triangles=[];let previous=performance.now(),start=previous;
  const tick=()=>{const now=performance.now(),info=game.rendering.renderer.info;times.push(now-previous);previous=now;draws.push(info.render.drawCalls);triangles.push(info.render.triangles);
   if(now-start>=ms){game.ticker.events.off('tick',tick);const sorted=[...times].sort((a,b)=>a-b),mean=a=>a.reduce((s,x)=>s+x,0)/a.length;
    resolve({frames:times.length,durationMs:now-start,fps:1000/mean(times),meanMs:mean(times),p50Ms:sorted[Math.floor(sorted.length*.5)],p95Ms:sorted[Math.floor(sorted.length*.95)],drawCalls:mean(draws),triangles:mean(triangles),resources:{...info.memory},gpuTimestamp:info.render.timestamp,quality:game.quality.level,devicePixelRatio:devicePixelRatio,renderPixelRatio:game.rendering.renderer.getPixelRatio(),canvas:[game.canvasElement.width,game.canvasElement.height]});}
  };game.ticker.events.on('tick',tick,999);
 }),report.sampleMs);
 const after=await metrics();report.scenarios.push({id,quality,...frames,cpu:{taskMs:(after.TaskDuration-before.TaskDuration)*1000,scriptMs:(after.ScriptDuration-before.ScriptDuration)*1000,layoutMs:(after.LayoutDuration-before.LayoutDuration)*1000},heapBytes:after.JSHeapUsedSize});console.log(label,id,quality,frames.fps.toFixed(1)+' FPS',frames.p95Ms.toFixed(1)+' ms p95');
 if(process.argv.includes('--capture-low')&&id==='main'&&quality===1)await page.screenshot({path:`docs/evidence/${label}-main-low.png`});
}
try{
 report.gpu=await root.send('SystemInfo.getInfo');await cdp.send('Performance.enable');const start=Date.now();
 await page.goto(url+'#skip',{waitUntil:'networkidle'});await page.waitForFunction(()=>window.game?.world?.learning,null,{timeout:120000});report.loadToGameMs=Date.now()-start;
 report.environment=await page.evaluate(()=>({userAgent:navigator.userAgent,cores:navigator.hardwareConcurrency,deviceMemory:navigator.deviceMemory,backend:game.rendering.renderer.backend.constructor.name}));
 await page.waitForTimeout(2500);await page.evaluate(()=>{for(const [c,v]of [[game.dayCycles,.1],[game.yearCycles,.25]]){c.newAbsoluteProgressBinding.manual=true;c.newAbsoluteProgressBinding.manualValue=v;c.update(true)}});
 // Complete the original one-shot keyboard handler before measuring steady state.
 await page.locator('#presentation-open').click();await page.waitForFunction(()=>game.modals.state===1);await close();
 for(const quality of [0,1]){
  await page.evaluate(q=>game.quality.changeLevel(q),quality);
  for(const id of ['main','cloud','aco','gwo']){
   const start=Date.now();await enter(id);const transitionMs=Date.now()-start;
   if(id!=='main')await page.evaluate(id=>{const p={cloud:[-62,-34],aco:[220,8],gwo:[-57,65]}[id];game.physicalVehicle.moveTo({x:p[0],y:2,z:p[1]},0)},id);
   await sample(id,quality);report.scenarios.at(-1).transitionMs=transitionMs;
  }
  await page.evaluate(()=>{game.world.learning.open(3);game.world.learning.panel.player.play()});await sample('panel-gwo-play',quality);await close();
 }
 for(const [id,index]of [['cloud',1],['aco',2],['gwo',3]]){
  await enter(id);await page.evaluate(index=>game.world.learning.open(index),index);await page.waitForFunction(()=>game.modals.state===1);
  const stress=await page.evaluate(()=>{const panel=game.world.learning.panel,w=game.world.areas[game.world.cloudOps.currentZone];const snapshot=()=>{const geometries=new Set(),textures=new Set();let meshes=0;game.scene.traverse(o=>{if(o.isMesh){meshes++;geometries.add(o.geometry.uuid)}for(const mat of [o.material].flat().filter(Boolean)){if(mat.map)textures.add(mat.map.uuid)}});return {meshes,geometries:geometries.size,textures:textures.size,renderer:{...game.rendering.renderer.info.memory}}};
   const before=snapshot(),changed=new Set(),start=performance.now();for(let i=0;i<20;i++){panel.player.seek(Math.min(9,panel.lesson.timeline.length));panel.player.reset();for(const p of w.pathMeshes||[])changed.add(p.geometry.uuid)}return {before,after:snapshot(),elapsedMs:performance.now()-start,iterations:20,distinctPheromoneGeometryIds:changed.size};});
  await page.waitForTimeout(500);await cdp.send('HeapProfiler.collectGarbage');stress.heapAfterGC=(await metrics()).JSHeapUsedSize;stress.id=id;report.stress.push(stress);await close();
 }
 report.resourceTransfer=await page.evaluate(()=>{const entries=performance.getEntriesByType('resource').filter(r=>r.name.startsWith(location.origin));return {decodedBytes:entries.reduce((s,r)=>s+r.decodedBodySize,0),encodedBytes:entries.reduce((s,r)=>s+r.encodedBodySize,0),requests:entries.length,largest:entries.sort((a,b)=>b.decodedBodySize-a.decodedBodySize).slice(0,6).map(r=>({url:r.name,bytes:r.decodedBodySize}))}});
 report.webgpuAdapter=await page.evaluate(async()=>{const info=game.rendering.renderer.backend.device?.adapterInfo||(await navigator.gpu?.requestAdapter({powerPreference:'high-performance'}))?.info;return info?Object.fromEntries(['vendor','architecture','device','description','isFallbackAdapter'].map(k=>[k,info[k]])):null});
 report.passed=report.errors.length===0;
}catch(error){report.passed=false;report.failure=error.stack;throw error}finally{fs.writeFileSync(`docs/evidence/${label}.json`,JSON.stringify(report,null,2));await browser.close()}
