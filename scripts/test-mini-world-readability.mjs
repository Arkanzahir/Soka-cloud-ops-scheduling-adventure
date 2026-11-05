import {chromium} from 'playwright'
import assert from 'node:assert/strict'
import fs from 'node:fs'

const url=process.argv[2]||'http://127.0.0.1:1254/'
const label=process.argv[3]||'mini-polish-after'
const onlyWorld=process.argv.find(a=>a.startsWith('--world='))?.split('=')[1]
const browser=await chromium.launch({channel:'chrome',headless:true})
const context=await browser.newContext({viewport:{width:1366,height:768},deviceScaleFactor:2})
const page=await context.newPage(),cdp=await context.newCDPSession(page)
const report={url,label,viewport:[1366,768],deviceScaleFactor:2,checks:[],errors:[],httpErrors:[],samples:[]}
page.on('pageerror',e=>report.errors.push(e.message))
page.on('response',r=>{if(r.status()>=400&&r.url().startsWith(new URL(url).origin))report.httpErrors.push(r.url())})
const check=(name,value)=>{report.checks.push({name,passed:!!value});assert.ok(value,name);console.log('PASS '+name)}
const driving=()=>page.waitForFunction(()=>game.world.cloudOps.state==='DRIVING'&&!game.world.cloudOps.transitions.busy)
const panel=()=>page.waitForFunction(()=>game.world.learning.panel.visible&&!game.world.learning.busy&&game.modals.state===1)
const shot=name=>page.screenshot({path:`docs/evidence/${label}-${name}.png`})
async function near(position){await page.evaluate(p=>game.physicalVehicle.moveTo({x:p[0],y:2,z:p[1]},0),position);await page.waitForTimeout(2500)}
async function close(){await page.keyboard.press('Escape');await driving()}
async function enter(id){await page.evaluate(async id=>{if(!await game.world.cloudOps.enter(id,true))throw Error('Transition '+id)},id);await driving()}
async function sample(id){
 const result=await page.evaluate(()=>new Promise(resolve=>{const times=[],draws=[],triangles=[];let last=performance.now(),start=last;const tick=()=>{const now=performance.now(),info=game.rendering.renderer.info;times.push(now-last);last=now;draws.push(info.render.drawCalls);triangles.push(info.render.triangles);if(now-start<5000)return;game.ticker.events.off('tick',tick);const sorted=[...times].sort((a,b)=>a-b),mean=a=>a.reduce((s,x)=>s+x,0)/a.length;resolve({fps:1000/mean(times),p95Ms:sorted[Math.floor(sorted.length*.95)],drawCalls:mean(draws),triangles:mean(triangles),resources:{...info.memory},renderPixelRatio:game.rendering.renderer.getPixelRatio(),cameraMode:game.view.mode,camera:game.view.camera.position.toArray(),car:game.player.position.toArray()})};game.ticker.events.on('tick',tick,999)}))
 report.samples.push({id,...result});console.log(id,JSON.stringify(result))
 check(id+' uses original gameplay camera and Low DPR1',result.cameraMode===1&&result.renderPixelRatio===1)
}
try{
 await page.goto(url+'#skip',{waitUntil:'networkidle',timeout:90000})
 await page.waitForFunction(()=>window.game?.world?.learning,null,{timeout:120000})
 await page.waitForTimeout(2500)
 await page.evaluate(()=>{game.quality.changeLevel(1);for(const [c,v]of [[game.dayCycles,.1],[game.yearCycles,.25]]){c.newAbsoluteProgressBinding.manual=true;c.newAbsoluteProgressBinding.manualValue=v;c.update(true)}})
 report.environment=await page.evaluate(()=>({userAgent:navigator.userAgent,backend:game.rendering.renderer.backend.constructor.name}))
 report.gpu=await (await browser.newBrowserCDPSession()).send('SystemInfo.getInfo')
 for(const [id,station,index,overview]of [['aco',[211,7],2,[220,8]],['cloud',[-76,-30],1,[-65,-25]],['gwo',[-65,70],3,[-57,65]]]){
  if(onlyWorld&&id!==onlyWorld)continue
  await enter(id);await near(overview);await shot(id+'-arrival')
  await near(station);await page.keyboard.press('Enter');await panel()
  check(id+' native station opens existing M6',await page.evaluate(i=>game.world.learning.panel.slide===i,index))
  await page.locator('.co-learning [data-action="reset"]').click()
  await shot(id+'-reset-panel')
  for(let i=0;i<(id==='cloud'?8:id==='aco'?9:1);i++)await page.locator('.co-learning [data-action="step"]').click()
  await page.waitForTimeout(1800);await shot(id+'-live-panel')
  check(id+' real events reach visuals',await page.evaluate(id=>{const w=game.world.areas[id];if(id==='cloud')return w.tasks.length===8&&w.tasks.every((t,i)=>t.vm===game.world.learning.panel.lesson.run.bestAssignment[i]);if(id==='aco')return w.event?.task===7&&!w.demo;return w.state?.candidates.length===5&&!w.preview&&w.wolves.filter(v=>v.label.mesh.visible).length===3&&w.wolves.every(v=>v.label.mesh.visible===!!v.role)},id))
  await close();await near(overview);await shot(id+'-live');await sample(id)
  // Warmed repeated seeks/resets must reuse all existing actors and GPU resources.
  await near(station);await page.keyboard.press('e');await panel()
  const stress=await page.evaluate(()=>{const p=game.world.learning.panel,w=game.world.areas[game.world.cloudOps.currentZone];const count=()=>({meshes:(()=>{let n=0;game.scene.traverse(o=>{if(o.isMesh)n++});return n})(),geometry:game.rendering.renderer.info.memory.geometries,textures:game.rendering.renderer.info.memory.textures});const before=count();for(let i=0;i<20;i++){p.player.seek(Math.min(9,p.lesson.timeline.length));p.player.reset()}return {before,after:count(),tasks:w.tasks?.length,wolves:w.wolves?.length,ants:w.ants?.length}})
  check(id+' 20 resets keep mesh/geometry/texture counts stable',JSON.stringify(stress.before)===JSON.stringify(stress.after));report.checks.at(-1).detail=stress
  await close();await near(overview);await shot(id+'-reset')
  if(id==='gwo'){
   check('GWO reset clears leader labels',await page.evaluate(()=>game.world.areas.gwo.wolves.every(w=>!w.label.mesh.visible)))
   await enter('main');await enter('gwo');await near(overview)
   check('GWO frustum re-entry preserves neutral labels',await page.evaluate(()=>game.world.areas.gwo.state===null&&game.world.areas.gwo.wolves.every(w=>!w.label.mesh.visible)))
  }
 }
 await cdp.send('HeapProfiler.collectGarbage')
 await cdp.send('Performance.enable');report.heap=(await cdp.send('Performance.getMetrics')).metrics.find(m=>m.name==='JSHeapUsedSize')?.value
 check('no JavaScript/local HTTP errors',!report.errors.length&&!report.httpErrors.length)
 report.passed=true
}catch(error){report.passed=false;report.failure=error.stack;await shot('failure').catch(()=>{});throw error}finally{fs.writeFileSync(`docs/evidence/${label}.json`,JSON.stringify(report,null,2));await browser.close()}
