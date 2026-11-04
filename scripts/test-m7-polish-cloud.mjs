import {chromium} from 'playwright';import assert from 'node:assert/strict';import fs from 'node:fs';
const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage({viewport:{width:1440,height:900}}),report={checks:[],errors:[]};
page.on('pageerror',e=>report.errors.push(e.message));
const check=(name,value)=>{report.checks.push({name,passed:!!value});assert.ok(value,name);console.log('PASS '+name)};
const near=async(x,z)=>{await page.evaluate(([x,z])=>game.physicalVehicle.moveTo({x,y:2,z},0),[x,z]);await page.waitForTimeout(2500)};
const shot=name=>page.screenshot({path:`docs/evidence/m7-polish-${name}.png`});
try{
 await page.goto((process.argv[2]||'http://127.0.0.1:4191/Soka-cloud-ops-scheduling-adventure/')+'#skip',{waitUntil:'networkidle'});
 await page.waitForFunction(()=>window.game?.world?.learning,null,{timeout:90000});await page.waitForTimeout(2500);
 await page.evaluate(()=>{for(const [c,v]of [[game.dayCycles,.1],[game.yearCycles,.25]]){c.newAbsoluteProgressBinding.manual=true;c.newAbsoluteProgressBinding.manualValue=v;c.update(true)}});
 await near(49,34.5);await page.keyboard.press('e');await page.waitForFunction(()=>game.world.cloudOps.currentZone==='cloud'&&game.world.cloudOps.state==='DRIVING');
 await near(-65,-28);await shot('cloud-queue');
 await near(-76,-30);await page.keyboard.press('Enter');await page.waitForFunction(()=>game.modals.state===1&&game.world.learning.panel.visible);
 check('Cloud schedule snapshot uses actual M6 engine results',await page.evaluate(()=>{const w=game.world.areas.cloud,run=game.world.learning.panel.lesson.run;return w.applySchedule({assignments:run.bestAssignment,vmLoads:run.metrics.vmLoads,makespan:run.metrics.makespan})&&w.tasks.every((t,i)=>t.vm===run.bestAssignment[i]&&t.mesh.position.distanceTo(w.allocationTarget(i,t.vm))<1e-6)}));
 await page.keyboard.press('Escape');await page.waitForFunction(()=>game.world.cloudOps.state==='DRIVING');await near(-62,-34);await shot('cloud-servers');
 check('Cloud preview toggle preserves real loads and rejects invalid snapshot',await page.evaluate(()=>{const w=game.world.areas.cloud,loads=w.vms.map(v=>v.load);w.setPreviewMode(true);w.setPreviewMode(false);return !w.previewMode&&w.vms.every((v,i)=>v.load===loads[i])&&w.applySchedule({})===false}));
 check('Cloud reset returns polished labels and packages to dispatch',await page.evaluate(()=>{const w=game.world.areas.cloud;w.resetVisualization();return w.tasks.every(t=>t.vm===null&&!t.motion&&t.mesh.position.distanceTo(t.home)<1e-6&&t.label.mesh.position.distanceTo(t.home.clone().add(t.labelOffset))<1e-6)&&w.vms.every(v=>v.load===0&&!v.selection.visible)}));
 check('no JavaScript page errors',report.errors.length===0);report.passed=true;
}catch(error){report.passed=false;report.failure=error.stack;throw error}finally{fs.writeFileSync('docs/evidence/m7-polish-cloud-api.json',JSON.stringify(report,null,2));await browser.close()}
