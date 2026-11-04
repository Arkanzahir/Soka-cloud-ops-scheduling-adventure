import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage();const report={checks:[]};
try{
 await page.goto((process.argv[2]||'http://127.0.0.1:1245/')+'#skip',{waitUntil:'networkidle'});
 await page.waitForFunction(()=>window.game?.world?.learning,null,{timeout:90000});await page.waitForTimeout(2500);
 const cdp=await page.context().newCDPSession(page);
 async function counts(){
  const keyboard={};for(const target of ['window','document']){
   const {result}=await cdp.send('Runtime.evaluate',{expression:target});
   const {listeners}=await cdp.send('DOMDebugger.getEventListeners',{objectId:result.objectId});
   keyboard[target]=listeners.filter(l=>l.type.startsWith('key')).map(l=>`${l.type}:${l.useCapture}`).sort();
  }
  const modal=await page.evaluate(()=>{const count=e=>Object.values(e.callbacks).flat(2).filter(x=>typeof x==='function').length;return [count(game.modals.events),count(game.modals.items.get('learning').events)]});
  return {keyboard,modal};
 }
 // Complete the original one-shot intro keyboard handler before measuring steady state.
 await page.locator('#presentation-open').click();await page.waitForFunction(()=>game.modals.state===1);
 await page.keyboard.press('Escape');await page.waitForFunction(()=>game.world.cloudOps.state==='DRIVING'&&game.modals.state===3);
 const before=await counts();
 for(let i=0;i<3;i++){
  await page.locator('#presentation-open').click();
  await page.waitForFunction(()=>game.modals.state===1);
  await page.locator('.co-learning [data-action="next"]').click();
  await page.waitForFunction(()=>!game.world.learning.busy&&game.modals.state===1&&game.world.cloudOps.currentZone==='cloud');
  await page.locator('.co-learning [data-index="0"]').click();
  await page.waitForFunction(()=>!game.world.learning.busy&&game.modals.state===1&&game.world.cloudOps.currentZone==='main');
  await page.keyboard.press('Escape');
  await page.waitForFunction(()=>game.world.cloudOps.state==='DRIVING'&&game.modals.state===3);
 }
 const after=await counts();report.before=before;report.after=after;
 assert.deepEqual(after,before);report.checks.push({name:'keyboard and modal listeners stable across three presentation round trips',passed:true});report.passed=true;console.log('PASS stable keyboard and modal listeners');
}catch(error){report.passed=false;report.failure=error.stack;throw error}finally{fs.writeFileSync(`docs/evidence/${process.argv[3]||'m7-listeners'}.json`,JSON.stringify(report,null,2));await browser.close()}
