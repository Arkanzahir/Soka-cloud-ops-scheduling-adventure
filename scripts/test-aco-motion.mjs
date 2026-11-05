import {chromium} from 'playwright'
import assert from 'node:assert/strict'
import fs from 'node:fs'
const url=process.argv[2],label=process.argv[3]||'final-aco-motion'
const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage({viewport:{width:1366,height:768}}),report={checks:[],errors:[]}
page.on('pageerror',e=>report.errors.push(e.message))
const check=(name,v)=>{report.checks.push({name,passed:!!v});assert.ok(v,name);console.log('PASS '+name)}
const panel=()=>page.waitForFunction(()=>game.modals.state===1&&game.world.learning.panel.visible)
try{
 await page.goto(url+'#skip',{waitUntil:'networkidle'});await page.waitForFunction(()=>window.game?.world?.learning,null,{timeout:120000});await page.waitForTimeout(2000)
 await page.evaluate(()=>{game.quality.changeLevel(1);for(const [c,v]of [[game.dayCycles,.1],[game.yearCycles,.25]]){c.newAbsoluteProgressBinding.manual=true;c.newAbsoluteProgressBinding.manualValue=v;c.update(true)}})
 await page.evaluate(()=>game.world.cloudOps.enter('aco',true));await page.waitForFunction(()=>!game.world.cloudOps.transitions.busy)
 await page.evaluate(()=>game.physicalVehicle.moveTo({x:211,y:2,z:7},0));await page.waitForTimeout(2000);await page.keyboard.press('Enter');await panel()
 const ids=await page.evaluate(()=>game.world.areas.aco.pathMeshes.map(m=>m.geometry.uuid))
 await page.locator('.co-learning [data-action="step"]').click()
 const start=await page.evaluate(()=>game.world.areas.aco.ants[0].mesh.position.toArray());await page.waitForTimeout(150)
 check('ant position actually moves along the selected route',await page.evaluate(p=>{const a=game.world.areas.aco.ants[0];return a.mesh.visible&&a.mesh.position.distanceTo({x:p[0],y:p[1],z:p[2]})>.2},start))
 await page.waitForTimeout(650)
 check('ant reaches the VM route chosen by the real M4 event',await page.evaluate(()=>{const w=game.world.areas.aco,e=game.world.learning.panel.player.snapshot().step.source,a=w.ants[0];return a.vm===e.selectedVM&&a.mesh.position.distanceTo(w.paths[e.selectedVM].getPoint(1))<1e-6&&w.ants.filter(x=>x.mesh.visible).length===1}))
 for(let i=0;i<8;i++)await page.locator('.co-learning [data-action="step"]').click()
 check('rendered pheromone radii match the real iteration snapshot',await page.evaluate(()=>{const w=game.world.areas.aco,e=game.world.learning.panel.player.snapshot().step.source,row=e.pheromoneSnapshot[w.currentTask],max=Math.max(...row,1e-6);return w.pathMeshes.every((m,j)=>Math.abs(m.geometry.parameters.radius-(.04+.16*row[j]/max))<1e-8)}))
 check('pheromone update reuses the same three geometries',await page.evaluate(ids=>game.world.areas.aco.pathMeshes.every((m,i)=>m.geometry.uuid===ids[i]),ids))
 await page.locator('.co-learning [data-action="reset"]').click();await page.locator('.co-learning [data-action="play"]').click();await page.waitForTimeout(1150);await page.locator('.co-learning [data-action="pause"]').click()
 const cursor=await page.evaluate(()=>game.world.learning.panel.player.cursor);await page.waitForTimeout(900)
 check('ACO Play advances and Pause holds the real trace cursor',await page.evaluate(n=>n>0&&game.world.learning.panel.player.cursor===n,cursor))
 await page.keyboard.press('Escape');await page.waitForFunction(()=>game.world.cloudOps.state==='DRIVING')
 await page.evaluate(()=>{game.world.cloudOps.transitions.safeSpawn({position:[232,-7],rotation:0});game.physicalVehicle.moveTo({x:232,y:2,z:-7},0)});await page.waitForTimeout(2200)
 await page.screenshot({path:`docs/evidence/${label}-trace.png`})
 check('close-up uses original camera and a grounded vehicle',await page.evaluate(()=>game.view.mode===1&&game.physicalVehicle.wheels.inContactCount>=2))
 check('no JavaScript errors',report.errors.length===0);report.passed=true
}catch(error){report.passed=false;report.failure=error.stack;await page.screenshot({path:`docs/evidence/${label}-failure.png`}).catch(()=>{});throw error}finally{fs.writeFileSync(`docs/evidence/${label}.json`,JSON.stringify(report,null,2));await browser.close()}
