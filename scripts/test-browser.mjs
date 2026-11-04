import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import sharp from 'sharp';
const url=process.argv[2] || 'http://127.0.0.1:1234/';
const label=process.argv[3] || 'foundation-dev';
const production=process.argv.includes('--production');
const output=path.resolve('docs/evidence'); fs.mkdirSync(output,{recursive:true});
const browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL || 'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:900}});
const result={url,label,browser:browser.version(),viewport:{width:1440,height:900},checks:[],errors:[],httpErrors:[],requestFailures:[]};
page.on('pageerror',e=>result.errors.push(e.message));
page.on('response',r=>{if(r.status()>=400)result.httpErrors.push({url:r.url(),status:r.status()})});
page.on('requestfailed',r=>result.requestFailures.push({url:r.url(),error:r.failure()?.errorText}));
function check(name,value,detail){result.checks.push({name,passed:!!value,detail});assert.ok(value,name);console.log('PASS '+name)}
const snapshot=()=>page.evaluate(()=>({position:game.player.position.toArray(),camera:game.view.camera.position.toArray(),rotation:game.physicalVehicle.quaternion.toArray(),speed:game.physicalVehicle.speed,contacts:game.physicalVehicle.wheels.inContactCount,filters:[...game.inputs.filters]}));
async function captureWorld(){
 const screenshot=await page.screenshot({path:path.join(output,`${label}-main-world.png`)});
 const {channels}=await sharp(screenshot).extract({left:200,top:150,width:1000,height:600}).stats();
 const contrast=channels.slice(0,3).reduce((sum,c)=>sum+c.stdev,0)/3;
 check('world renders visible geometry',contrast>15,{meanChannelDeviation:contrast});
}
try {
 await page.goto(url,{waitUntil:'networkidle',timeout:90000});
 if(production){
  await page.waitForTimeout(8000);await page.keyboard.press('Enter');await page.waitForTimeout(7000);
  await captureWorld();
  await page.keyboard.press('Escape');await page.waitForTimeout(1500);
  check('production menu opens',await page.locator('.js-menu.is-open, .js-menu.is-visible, .menu.is-open').count()>0 || await page.locator('body').innerText().then(t=>t.includes('CONTROLS')||t.includes('Controls')));
  await page.keyboard.press('Escape');await page.waitForTimeout(1000);
 } else {
  await page.evaluate(async()=>{window.game=(await import('./Game/Game.js')).Game.getInstance()});
  await page.waitForFunction(()=>game.inputs?.actions.has('introStart'),null,{timeout:90000});
  await page.evaluate(()=>{for(const [c,v] of [[game.dayCycles,0.1],[game.yearCycles,0.25]]){c.newAbsoluteProgressBinding.manual=true;c.newAbsoluteProgressBinding.manualValue=v;c.update(true)}});
  await page.keyboard.press('Enter');await page.waitForFunction(()=>game.reveal.step===2,null,{timeout:30000});await page.waitForTimeout(2500);
  result.environment=await page.evaluate(()=>({backend:game.rendering.renderer.backend.constructor.name,quality:game.quality.level,day:game.dayCycles.progress,year:game.yearCycles.progress,whispersCount:game.world.whispers.count,userAgent:navigator.userAgent,hardwareConcurrency:navigator.hardwareConcurrency}));
  check('whispers buffer count is finite',Number.isInteger(result.environment.whispersCount)&&result.environment.whispersCount>=0,result.environment.whispersCount);
  await captureWorld();
  const before=await snapshot();await page.keyboard.down('ArrowUp');await page.waitForTimeout(1600);await page.keyboard.up('ArrowUp');const after=await snapshot();
  const distance=(a,b)=>Math.hypot(...a.map((x,i)=>x-b[i]));
  check('vehicle moves with keyboard',distance(before.position,after.position)>1,{before,after});
  check('camera follows vehicle',distance(before.camera,after.camera)>0.5);
  await page.keyboard.down('ArrowUp');await page.keyboard.down('ArrowLeft');await page.waitForTimeout(1000);await page.keyboard.up('ArrowLeft');await page.keyboard.up('ArrowUp');const turned=await snapshot();
  check('steering changes orientation',distance(after.rotation,turned.rotation)>0.01,turned);
  await page.keyboard.down('b');await page.waitForTimeout(1200);await page.keyboard.up('b');const braking=await snapshot();check('brake leaves finite physics',braking.position.every(Number.isFinite)&&Number.isFinite(braking.speed),braking);
  await page.keyboard.press('r');await page.waitForTimeout(3500);const respawn=await snapshot();check('respawn settles on terrain',respawn.contacts>0&&respawn.speed<1&&respawn.position[1]>-2,respawn);
  for(const key of ['e','Enter']){
   const reset=await page.evaluate(()=>{const p=game.world.areas.landing.references.items.get('kioskInteractivePoint')[0].position;game.physicalVehicle.moveTo({x:p.x,y:2,z:p.z},0);return {linear:game.physicalVehicle.chassis.physical.body.linvel(),angular:game.physicalVehicle.chassis.physical.body.angvel()}});
   check(`${key}: moveTo resets velocity`,Object.values(reset.linear).every(v=>v===0)&&Object.values(reset.angular).every(v=>v===0));
   await page.waitForTimeout(2000);await page.keyboard.press(key);await page.waitForFunction(()=>game.modals.current?.name==='map'&&game.modals.state===1);
   check(`${key}: map interaction`,await page.evaluate(()=>game.inputs.filters.has('modal')));
   if(key==='e')await page.screenshot({path:path.join(output,`${label}-map-interaction.png`)});
   await page.keyboard.press('Escape');await page.waitForFunction(()=>game.modals.state===3);
   check(`${key}: Escape restores driving`,await page.evaluate(()=>game.inputs.filters.has('wandering')));
  }
  result.frameSample=await page.evaluate(()=>new Promise(resolve=>{const times=[];let previous=performance.now();const tick=now=>{times.push(now-previous);previous=now;if(times.length===90){times.shift();times.sort((a,b)=>a-b);resolve({frames:times.length,medianFrameMs:times[Math.floor(times.length/2)],p95FrameMs:times[Math.floor(times.length*.95)],averageFps:1000/(times.reduce((a,b)=>a+b)/times.length)})}else requestAnimationFrame(tick)};requestAnimationFrame(tick)}));
 }
 check('no JavaScript page errors',result.errors.length===0,result.errors);
 check('no failed local HTTP responses',result.httpErrors.filter(e=>e.url.startsWith(new URL(url).origin)).length===0,result.httpErrors);
 check('no failed local requests',result.requestFailures.filter(e=>e.url.startsWith(new URL(url).origin)).length===0,result.requestFailures);
 result.passed=true;
} catch(error){result.passed=false;result.failure=error.stack;await page.screenshot({path:path.join(output,`${label}-failure.png`)}).catch(()=>{});throw error}
finally{fs.writeFileSync(path.join(output,`${label}-browser.json`),JSON.stringify(result,null,2));await browser.close()}
