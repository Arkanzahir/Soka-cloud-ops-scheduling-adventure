import {chromium} from 'playwright'
import assert from 'node:assert/strict'
import fs from 'node:fs'
const url=process.argv[2]||'http://127.0.0.1:1255/',label=process.argv[3]||'gwo-explainer'
const browser=await chromium.launch({channel:'chrome',headless:true})
const page=await browser.newPage({viewport:{width:1366,height:768},deviceScaleFactor:2})
const report={checks:[],errors:[],httpErrors:[]}
page.on('pageerror',e=>report.errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&r.url().startsWith(new URL(url).origin))report.httpErrors.push(r.url())})
const check=(name,v)=>{report.checks.push({name,passed:!!v});assert.ok(v,name);console.log('PASS '+name)}
const driving=()=>page.waitForFunction(()=>game.world.cloudOps.state==='DRIVING'&&!game.world.cloudOps.transitions.busy)
const panel=()=>page.waitForFunction(()=>game.world.learning.panel.visible&&game.modals.state===1&&!game.world.learning.busy)
const shot=n=>page.screenshot({path:`docs/evidence/${label}-${n}.png`})
try{
 await page.goto(url+'#skip',{waitUntil:'networkidle'});await page.waitForFunction(()=>window.game?.world?.learning,null,{timeout:120000});await page.waitForTimeout(2500)
 await page.evaluate(()=>{game.quality.changeLevel(1);for(const [c,v]of [[game.dayCycles,.1],[game.yearCycles,.25]]){c.newAbsoluteProgressBinding.manual=true;c.newAbsoluteProgressBinding.manualValue=v;c.update(true)}})
 await page.evaluate(()=>game.world.cloudOps.enter('gwo',true));await driving()
 await page.evaluate(()=>game.physicalVehicle.moveTo({x:-65,y:2,z:70},0));await page.waitForTimeout(2500)
 check('one schedule board, five wolves and original four zones',await page.evaluate(()=>game.scene.getObjectsByProperty('name','gwo-candidate-schedules').length===1&&game.world.areas.gwo.wolves.length===5&&game.world.cloudOps.zones.size===4))
 check('neutral board has no invented schedule',await page.evaluate(()=>game.world.areas.gwo.schedules.view===null))
 await page.keyboard.press('Enter');await panel();await page.locator('.co-learning [data-action="step"]').click()
 check('all five rows show real event assignments, roles, fitness and guides',await page.evaluate(()=>{const w=game.world.areas.gwo,v=w.schedules.view,e=game.world.learning.panel.player.snapshot().step.source;return v.rows.length===5&&v.bestMakespan===e.bestSoFar&&v.rows.every(r=>{const a=e.wolves.find(w=>w.id===r.id);return JSON.stringify(r.assignment)===JSON.stringify(a.assignment)&&r.fitness===a.fitness&&r.role===(Object.entries(e.leaders).find(([,l])=>l.id===r.id)?.[0]||null)})&&Object.entries(v.guides).every(([role,id])=>e.guides[role].id===id)}))
 await shot('step-panel')
 report.boardBounds=await page.evaluate(()=>{const m=game.world.areas.gwo.schedules.mesh,a=m.geometry.attributes.position,points=Array.from({length:a.count},(_,i)=>m.localToWorld(m.position.clone().set(a.getX(i),a.getY(i),a.getZ(i))).project(game.view.camera));return {left:Math.min(...points.map(p=>(p.x+1)*innerWidth/2)),right:Math.max(...points.map(p=>(p.x+1)*innerWidth/2)),top:Math.min(...points.map(p=>(1-p.y)*innerHeight/2)),bottom:Math.max(...points.map(p=>(1-p.y)*innerHeight/2))}})
 check('full board fits native station camera',report.boardBounds.left>=0&&report.boardBounds.right<=1366&&report.boardBounds.top>=0&&report.boardBounds.bottom<=768)
 await page.keyboard.press('Escape');await driving();await page.waitForTimeout(1200);await shot('step-world')
 check('original follow camera and actual Low DPR1',await page.evaluate(()=>game.view.mode===1&&game.rendering.renderer.getPixelRatio()===1))
 report.stationSample=await page.evaluate(()=>new Promise(resolve=>{const times=[],draws=[];let last=performance.now(),start=last;const sample=()=>{const now=performance.now();times.push(now-last);last=now;draws.push(game.rendering.renderer.info.render.drawCalls);if(now-start<5000)return;game.ticker.events.off('tick',sample);const sorted=[...times].sort((a,b)=>a-b);resolve({fps:times.length*1000/(now-start),p95Ms:sorted[Math.floor(sorted.length*.95)],drawCalls:draws.reduce((s,v)=>s+v,0)/draws.length,resources:{...game.rendering.renderer.info.memory}})};game.ticker.events.on('tick',sample,999)}))
 await page.keyboard.press('e');await panel()
 await page.locator('.co-learning [data-action="step"]').click()
 const previous=await page.evaluate(()=>game.world.areas.gwo.state)
 await page.locator('.co-learning [data-action="step"]').click()
 check('changed task borders compare the same candidate IDs',await page.evaluate(previous=>game.world.areas.gwo.schedules.view.rows.every(r=>{const old=previous.candidates.find(c=>c.id===r.id);return r.changed.every((changed,i)=>changed===(old?r.assignment[i]!==old.assignment[i]:null))}),previous))
 await shot('changed-panel')
 const draws=await page.evaluate(()=>game.world.areas.gwo.schedules.drawCount);await page.waitForTimeout(700)
 check('paused rendering does not redraw canvas each frame',await page.evaluate(n=>game.world.areas.gwo.schedules.drawCount===n,draws))
 await page.locator('.co-learning [data-action="play"]').click();await page.waitForTimeout(1500);await page.locator('.co-learning [data-action="pause"]').click()
 const iteration=await page.evaluate(()=>game.world.areas.gwo.schedules.view.iteration);await page.waitForTimeout(800)
 check('Play updates actual iterations and Pause holds board',await page.evaluate(i=>game.world.areas.gwo.schedules.view.iteration===i&&i>2,iteration))
 const counts=()=>page.evaluate(()=>({geometries:game.rendering.renderer.info.memory.geometries,textures:game.rendering.renderer.info.memory.textures,wolves:game.world.areas.gwo.wolves.length,boards:game.scene.getObjectsByProperty('name','gwo-candidate-schedules').length}))
 const before=await counts();await page.evaluate(()=>{const p=game.world.learning.panel.player;for(let i=0;i<20;i++){p.seek(4);p.reset()}});await page.waitForTimeout(800)
 check('20 seek/reset cycles reuse board texture/geometry and actors',JSON.stringify(before)===JSON.stringify(await counts()))
 check('Reset clears assignment rows and leader labels',await page.evaluate(()=>{const w=game.world.areas.gwo;return w.schedules.view===null&&w.state===null&&w.wolves.every(v=>!v.label.mesh.visible)}));await shot('reset-panel')
 await page.keyboard.press('Escape');await driving();await page.keyboard.press('r');await page.waitForTimeout(2500)
 check('R keeps vehicle grounded in GWO',await page.evaluate(()=>game.world.cloudOps.currentZone==='gwo'&&game.physicalVehicle.wheels.inContactCount>=2))
 await page.evaluate(()=>game.world.cloudOps.enter('main',true));await driving();await page.evaluate(()=>game.world.cloudOps.enter('gwo',true));await driving()
 check('GWO re-entry keeps one neutral schedule board',await page.evaluate(()=>game.scene.getObjectsByProperty('name','gwo-candidate-schedules').length===1&&game.world.areas.gwo.schedules.view===null))
 check('no JS/local resource errors',!report.errors.length&&!report.httpErrors.length);report.passed=true
}catch(error){report.passed=false;report.failure=error.stack;await shot('failure').catch(()=>{});throw error}finally{fs.writeFileSync(`docs/evidence/${label}.json`,JSON.stringify(report,null,2));await browser.close()}
