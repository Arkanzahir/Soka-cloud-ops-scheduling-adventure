import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium } from 'playwright';
const url=process.argv[2]||'http://127.0.0.1:1247/';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:900}});
const report={url,checks:[],errors:[],httpErrors:[]};
page.on('pageerror',e=>report.errors.push(e.message));
page.on('response',r=>{if(r.status()>=400)report.httpErrors.push(r.url())});
function check(name,passed){report.checks.push({name,passed:!!passed});assert.ok(passed,name);console.log('PASS '+name)}
const fixture=JSON.parse(fs.readFileSync('tests/fixtures/cloud-round-robin.json','utf8'));
const driving=()=>page.waitForFunction(()=>game.world.cloudOps.state==='DRIVING'&&!game.world.cloudOps.transitions.busy,null,{timeout:20000});
async function near(key){await page.evaluate(k=>{const p=game.world.areas.cloud[k].position;game.physicalVehicle.moveTo({x:p.x,y:2,z:p.z},0)},key);await page.waitForFunction(()=>game.physicalVehicle.wheels.inContactCount>=2&&Math.abs(game.physicalVehicle.speed)<.5);await page.waitForTimeout(500)}
try {
 await page.goto(url+'#skip',{waitUntil:'networkidle'});
 await page.waitForFunction(()=>window.game?.world?.areas?.cloud&&game.reveal.step===2,null,{timeout:90000});
 await page.evaluate(()=>{for(const [c,v] of [[game.dayCycles,.1],[game.yearCycles,.25]]){c.newAbsoluteProgressBinding.manual=true;c.newAbsoluteProgressBinding.manualValue=v;c.update(true)}});
 check('Cloud registered alongside existing M2 zones',await page.evaluate(()=>['main','test','cloud'].every(id=>game.world.cloudOps.zones.has(id))));
 check('eight task crates and three VM bodies reuse M3 Bruno geometry',await page.evaluate(()=>{const cloud=game.world.areas.cloud;const geometries=new Set(),materials=new Set();game.world.bricks.instancedGroup.group.traverse(o=>{if(o.isMesh){geometries.add(o.geometry);materials.add(o.material)}});return cloud.tasks.length===8&&cloud.vms.length===3&&cloud.vms.every(v=>{let shared=true;v.visual.object3D.children[0].traverse(o=>{if(o.isMesh)shared&&=geometries.has(o.geometry)&&materials.has(o.material)});return shared&&v.physical.type==='fixed'})}));
 await near('entry');await page.keyboard.press('e');await page.waitForFunction(()=>game.world.cloudOps.currentZone==='cloud',null,{timeout:20000});await driving();
 check('E enters Cloud, grounded and unlocked',await page.evaluate(()=>game.world.cloudOps.currentZone==='cloud'&&game.physicalVehicle.wheels.inContactCount>=2&&game.physicalVehicle.chassis.physical.body.isEnabled()&&game.world.cloudOps.lastError===null));
 await page.waitForTimeout(8000);await page.screenshot({path:'docs/evidence/cloud-final-cloud.png'});
 // Separate runtime views retain the original follow camera, moving only the car.
 async function view(x,z,name){await page.evaluate(([x,z])=>game.physicalVehicle.moveTo({x,y:2,z},0),[x,z]);await page.waitForTimeout(4000);await page.screenshot({path:`docs/evidence/cloud-final-${name}.png`})}
 await view(-65,-28,'queue');await view(-62,-34,'vms');
 const eventResult=await page.evaluate(events=>{const w=game.world.areas.cloud;w.setPreviewMode(true);const count=w.objects.hideable.length;for(const e of events)if(!w.applyAllocation(e))throw new Error(w.lastVisualizationError);return {count,loads:w.vms.map(v=>v.load),invalid:w.applyAllocation({...events[0],selectedVM:9,vmIndex:9}),targets:w.tasks.map(t=>t.vm)}},fixture.events);
 check('M4 Round Robin events update exact task destinations and loads',JSON.stringify(eventResult.targets)==='[0,1,2,0,1,2,0,1]'&&Math.abs(eventResult.loads[0]-11.833333333333334)<1e-8&&Math.abs(eventResult.loads[1]-8.1)<1e-8&&Math.abs(eventResult.loads[2]-2.2)<1e-8&&!eventResult.invalid);
 await page.waitForFunction(()=>game.world.areas.cloud.tasks.every(t=>!t.motion),null,{timeout:30000});check('animation reaches VM pads without adding meshes',await page.evaluate(count=>{const w=game.world.areas.cloud;return w.tasks.every((t,i)=>!t.motion&&t.mesh.position.distanceTo(w.allocationTarget(i,t.vm))<.001)&&w.objects.hideable.length===count},eventResult.count));await page.screenshot({path:'docs/evidence/cloud-final-allocation.png'});
 check('reset cancels motion and restores queue and zero loads',await page.evaluate(()=>{const w=game.world.areas.cloud;w.resetVisualization();return w.tasks.every(t=>!t.motion&&t.vm===null&&t.mesh.position.distanceTo(t.home)<.001)&&w.vms.every(v=>v.load===0)}));
 await page.evaluate(events=>{const w=game.world.areas.cloud;w.applyAllocation(events[0]);w.resetVisualization();w.applySchedule({assignments:[0,1,2,0,1,2,0,1],vmLoads:[11.833333333333334,8.1,2.2],makespan:11.833333333333334});w.resetVisualization()},fixture.events);
 await page.evaluate(()=>{const t=game.world.cloudOps.transitions;t.place(t.safeSpawn({position:[-65,-25],rotation:0}),0)});await page.waitForFunction(()=>game.physicalVehicle.wheels.inContactCount>=2);await page.waitForTimeout(1000); const before=await page.evaluate(()=>({p:game.player.position.toArray(),c:game.view.camera.position.toArray()}));
 await page.keyboard.down('ArrowUp');await page.waitForFunction(p=>Math.hypot(...game.player.position.toArray().map((v,i)=>v-p[i]))>1.5,before.p,{timeout:10000});await page.keyboard.up('ArrowUp');await page.waitForTimeout(500);
 const after=await page.evaluate(()=>({p:game.player.position.toArray(),c:game.view.camera.position.toArray()}));
 const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
 check('vehicle and camera move in Cloud',distance(before.p,after.p)>1&&distance(before.c,after.c)>.5);
 await page.keyboard.press('r');await driving();
 check('R stays in Cloud safe spawn',await page.evaluate(()=>game.world.cloudOps.currentZone==='cloud'&&Math.hypot(game.player.position.x+65,game.player.position.z+25)<.5&&game.physicalVehicle.wheels.inContactCount>=2));
 await near('station');await page.keyboard.press('Enter');await page.waitForFunction(()=>game.modals.current?.name==='cloud-foundation'&&game.modals.state===1);
 check('station opens placeholder panel and freezes vehicle',await page.evaluate(()=>game.world.cloudOps.state==='LEARNING_UI'&&!game.physicalVehicle.chassis.physical.body.isEnabled()));
 await page.screenshot({path:'docs/evidence/cloud-final-panel.png'});
 await page.keyboard.press('Escape');await driving();
 check('Esc restores driving',await page.evaluate(()=>game.modals.current===null&&game.inputs.filters.has('wandering')&&game.physicalVehicle.chassis.physical.body.isEnabled()));
 await near('exit');await page.keyboard.press('Enter');await page.waitForFunction(()=>game.world.cloudOps.currentZone==='main',null,{timeout:20000});await driving();
 check('Enter returns safely to Main',await page.evaluate(()=>{const m=game.world.cloudOps,p=m.returnPoint.position;return m.currentZone==='main'&&m.lastError===null&&Math.hypot(game.player.position.x-p[0],game.player.position.z-p[1])<.5&&game.physicalVehicle.wheels.inContactCount>=2}));
 check('M2 gate remains available',await page.evaluate(()=>game.world.cloudOps.stations[0].enabled===true));
 check('no page or local HTTP errors',report.errors.length===0&&report.httpErrors.filter(u=>u.startsWith(new URL(url).origin)).length===0);
 report.passed=true;
}catch(error){report.passed=false;report.failure=error.stack;report.state=await page.evaluate(()=>({zone:game.world.cloudOps.currentZone,state:game.world.cloudOps.state,error:game.world.cloudOps.lastError,position:game.player.position.toArray(),entryInside:game.world.areas.cloud.entry.trigger.isIn,active:game.interactivePoints.activeItem===game.world.areas.cloud.entry.point,entryState:game.world.areas.cloud.entry.point.state}));await page.screenshot({path:'docs/evidence/cloud-final-failure.png'});throw error}
finally{fs.writeFileSync('docs/evidence/cloud-final-browser.json',JSON.stringify(report,null,2));await browser.close()}





