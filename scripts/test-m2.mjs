import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium } from 'playwright';
import sharp from 'sharp';
const url=process.argv[2]||'http://127.0.0.1:1240/';
const label=process.argv[3]||'m2-dev';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:900}});
const report={url,browser:browser.version(),checks:[],errors:[],requests:[]};
page.on('pageerror',e=>report.errors.push(e.message));page.on('response',r=>{if(r.status()>=400)report.requests.push({url:r.url(),status:r.status()})});
const check=(name,passed,detail)=>{report.checks.push({name,passed:!!passed,detail});assert.ok(passed,name);console.log('PASS '+name)};
const snapshot=()=>page.evaluate(()=>{const m=game.world.cloudOps,b=game.physicalVehicle.chassis.physical.body;return {zone:m.currentZone,state:m.state,busy:m.transitions.busy,position:game.player.position.toArray(),camera:game.view.camera.position.toArray(),linear:{...b.linvel()},angular:{...b.angvel()},contacts:game.physicalVehicle.wheels.inContactCount,enabled:b.isEnabled(),filters:[...game.inputs.filters],error:m.lastError}});
const waitDriving=()=>page.waitForFunction(()=>game.world.cloudOps.state==='DRIVING'&&!game.world.cloudOps.transitions.busy,null,{timeout:20000});
async function near(index){await page.evaluate(i=>{const p=game.world.cloudOps.stations[i].position;game.physicalVehicle.moveTo({x:p.x,y:2,z:p.z},0)},index);await page.waitForFunction(()=>game.physicalVehicle.wheels.inContactCount>=2&&Math.abs(game.physicalVehicle.speed)<.5);await page.waitForTimeout(500)}
async function capture(name){const buffer=await page.screenshot({path:`docs/evidence/${label}-${name}.png`});const {channels}=await sharp(buffer).extract({left:200,top:150,width:1000,height:600}).stats();check(`${name}: world visible`,channels.slice(0,3).reduce((n,c)=>n+c.stdev,0)/3>15)}
const delta=(a,b)=>Math.hypot(...a.map((x,i)=>x-b[i]));
try {
 await page.goto(url+'#skip',{waitUntil:'networkidle'});
 await page.waitForFunction(()=>window.game,null,{timeout:30000});
 await page.waitForFunction(()=>game.world?.cloudOps&&game.reveal.step===2,null,{timeout:90000});
 await page.evaluate(()=>{for(const [cycle,value] of [[game.dayCycles,.1],[game.yearCycles,.25]]){cycle.newAbsoluteProgressBinding.manual=true;cycle.newAbsoluteProgressBinding.manualValue=value;cycle.update(true)}});await page.waitForTimeout(2500);
 check('single original vehicle / Area / Zones registration',await page.evaluate(()=>game.world.areas.cloudOpsTest.isIn===false&&game.world.cloudOps.stations.every(s=>game.zones.items.includes(s.trigger))&&['main','test'].every(id=>game.world.cloudOps.zones.has(id))));
 check('reject duplicate and invalid zone definitions',await page.evaluate(()=>{let rejected=0;for(const z of [{id:'main',name:'duplicate',spawn:{position:[0,0],rotation:0}},{id:'bad',name:'bad',spawn:{position:[NaN,0],rotation:0}}]){try{game.world.cloudOps.register(z)}catch{rejected++}}return rejected===2}));
 check('remote interaction cannot teleport',await page.evaluate(()=>{game.world.cloudOps.stations[0].point.interact();return game.world.cloudOps.state==='DRIVING'&&game.world.cloudOps.currentZone==='main'}));
 await capture('main-gate');
 check('unsafe checkpoint rejected before locking',await page.evaluate(()=>{try{game.world.cloudOps.transitions.safeSpawn({position:[500,500],rotation:0});return false}catch{return !game.world.cloudOps.transitions.busy&&game.physicalVehicle.chassis.physical.body.isEnabled()}}));
 check('bench obstruction rejected',await page.evaluate(()=>{try{game.world.cloudOps.transitions.safeSpawn({position:[-68,71],rotation:0});return false}catch{return true}}));
 await near(0);await page.evaluate(()=>game.physicalVehicle.moveTo({x:43,y:8,z:43},0));await page.waitForTimeout(80);await page.keyboard.press('e');check('airborne gate refused',(await snapshot()).state==='DRIVING');await near(0);
 for(const key of ['e','Enter']){
  await page.keyboard.press(key);await page.waitForFunction(()=>game.world.cloudOps.state==='TRANSITION');
  const locked=await snapshot();check(`${key}: transition locks input and collision`,!locked.enabled&&locked.filters.includes('cloudOpsTransition'),locked);
  await page.keyboard.down('ArrowUp');await page.keyboard.press('e');await page.keyboard.press('Enter');await waitDriving();await page.keyboard.up('ArrowUp');
  const arrived=await snapshot();check(`${key}: test zone grounded, finite and unlocked`,arrived.zone==='test'&&arrived.contacts>=2&&arrived.position.every(Number.isFinite)&&Math.hypot(...Object.values(arrived.linear))<2&&Math.hypot(...Object.values(arrived.angular))<2&&arrived.enabled&&arrived.error===null,arrived);
  check(`${key}: no residual teleport velocity`,await page.evaluate(()=>Object.values(game.world.cloudOps.transitions.lastTeleport.linear).every(v=>v===0)&&Object.values(game.world.cloudOps.transitions.lastTeleport.angular).every(v=>v===0)));
  check(`${key}: camera follows destination`,await page.evaluate(()=>Math.hypot(game.view.focusPoint.smoothedPosition.x-game.player.position.x,game.view.focusPoint.smoothedPosition.z-game.player.position.z)<1));
  if(key==='e'){
   await capture('test-zone');const before=await snapshot();await page.keyboard.down('ArrowUp');await page.waitForTimeout(900);await page.keyboard.up('ArrowUp');const after=await snapshot();check('vehicle and camera move inside test zone',delta(before.position,after.position)>1&&delta(before.camera,after.camera)>.5,{before,after});
   await near(2);await page.keyboard.press('Enter');await page.waitForFunction(()=>game.modals.current?.name==='cloud-ops-test'&&game.modals.state===1);
   const panelStart=await snapshot();await page.keyboard.down('ArrowUp');await page.waitForTimeout(500);await page.keyboard.up('ArrowUp');const panelEnd=await snapshot();check('panel freezes vehicle with held driving input',panelEnd.state==='LEARNING_UI'&&!panelEnd.enabled&&delta(panelStart.position,panelEnd.position)<.01);
   await capture('panel');await page.keyboard.press('Escape');await waitDriving();check('Esc restores zone driving and body',await page.evaluate(()=>game.modals.current===null&&game.inputs.filters.has('wandering')&&game.physicalVehicle.chassis.physical.body.isEnabled()));
   await page.keyboard.press('r');await page.waitForFunction(()=>game.world.cloudOps.state==='TRANSITION');await page.keyboard.press('r');await waitDriving();const reset=await snapshot();check('R resets in current zone, repeated R safe',reset.zone==='test'&&Math.hypot(reset.position[0]+65,reset.position[2]-65)<.5&&reset.contacts>=2,reset);
   await page.evaluate(()=>game.physicalVehicle.moveTo({x:-40,y:2,z:65},0));await page.waitForFunction(()=>game.world.cloudOps.state==='TRANSITION');await waitDriving();check('boundary guard recovers within same zone',(await snapshot()).zone==='test'&&Math.hypot(...(await snapshot()).position.filter((_,i)=>i!==1).map((v,i)=>v-[-65,65][i]))<.5);
  }
  await near(1);await page.keyboard.press(key);await waitDriving();const returned=await snapshot();check(`${key}: returns to saved Main location`,returned.zone==='main'&&await page.evaluate(()=>{const p=game.world.cloudOps.returnPoint.position;return Math.hypot(game.player.position.x-p[0],game.player.position.z-p[1])<.5})&&returned.contacts>=2,returned);
  await near(0);
 }
 await page.evaluate(()=>{const p=game.world.areas.landing.references.items.get('kioskInteractivePoint')[0].position;game.physicalVehicle.moveTo({x:p.x,y:2,z:p.z},0)});await page.waitForTimeout(2000);await page.keyboard.press('e');await page.waitForFunction(()=>game.modals.current?.name==='map');await page.keyboard.press('Escape');await page.waitForFunction(()=>game.modals.current===null);check('original Map and Esc still work',await page.evaluate(()=>game.inputs.filters.has('wandering')));
 check('checkpoint navigation rejects unknown section',await page.evaluate(async()=>await game.world.cloudOps.presentation.goTo('unknown')===false));
 check('checkpoint next uses shared transition',await page.evaluate(async()=>await game.world.cloudOps.presentation.next())&&(await snapshot()).zone==='test');
 check('checkpoint previous returns safely',await page.evaluate(async()=>await game.world.cloudOps.presentation.previous())&&(await snapshot()).zone==='main');
 check('no page errors',report.errors.length===0,report.errors);check('no local HTTP errors',report.requests.filter(r=>r.url.startsWith(new URL(url).origin)).length===0,report.requests);
 report.passed=true;fs.rmSync(`docs/evidence/${label}-failure.png`,{force:true});
}catch(error){report.passed=false;report.failure=error.stack;await page.screenshot({path:`docs/evidence/${label}-failure.png`,timeout:5000}).catch(()=>{});throw error}
finally{fs.writeFileSync(`docs/evidence/${label}.json`,JSON.stringify(report,null,2));await browser.close()}
