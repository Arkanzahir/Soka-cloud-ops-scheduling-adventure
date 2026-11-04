import {chromium} from 'playwright';import assert from 'node:assert/strict';import fs from 'node:fs';
const browser=await chromium.launch({channel:'chrome',headless:true}),context=await browser.newContext({viewport:{width:1366,height:768},deviceScaleFactor:2}),page=await context.newPage();
const url=process.argv[2]||'http://127.0.0.1:4192/Soka-cloud-ops-scheduling-adventure/';const report={checks:[],errors:[]};page.on('pageerror',e=>report.errors.push(e.message));
const check=(name,value)=>{report.checks.push({name,passed:!!value});assert.ok(value,name);console.log('PASS '+name)};
const ready=()=>page.waitForFunction(()=>window.game?.world?.learning,null,{timeout:120000});
const panel=()=>page.waitForFunction(()=>game.world.learning.panel.visible&&!game.world.learning.busy&&game.modals.state===1,null,{timeout:30000});
const shot=name=>page.screenshot({path:`docs/evidence/release-${name}.png`});
async function toggle(){await page.evaluate(()=>game.menu.open('options'));await page.waitForFunction(()=>game.menu.state===1);await page.locator('.js-quality-toggle').click();await page.keyboard.press('Escape');await page.waitForFunction(()=>game.menu.state===3)}
try{
 await page.goto(url+'#skip',{waitUntil:'networkidle'});await ready();await page.waitForTimeout(2000);
 check('High quality retains original DPR 2 on HiDPI',await page.evaluate(()=>game.quality.level===0&&game.rendering.renderer.getPixelRatio()===2));
 await toggle();check('native Low toggle halves both canvas dimensions',await page.evaluate(()=>game.quality.level===1&&game.rendering.renderer.getPixelRatio()===1&&game.canvasElement.width===1366&&game.canvasElement.height===768));
 const start=await page.evaluate(()=>({p:game.player.position.toArray(),c:game.view.camera.position.toArray()}));await page.keyboard.down('ArrowUp');await page.waitForTimeout(900);await page.keyboard.up('ArrowUp');check('Low quality keeps vehicle and follow camera working',await page.evaluate(a=>game.player.position.distanceTo({x:a.p[0],y:a.p[1],z:a.p[2]})>.5&&game.view.camera.position.distanceTo({x:a.c[0],y:a.c[1],z:a.c[2]})>.3,start));await page.keyboard.press('r');await page.waitForFunction(()=>!game.overlay.mesh.visible&&game.physicalVehicle.wheels.inContactCount>=2,null,{timeout:15000});check('Low R reset remains grounded',await page.evaluate(()=>game.physicalVehicle.wheels.inContactCount>=2));
 await page.setViewportSize({width:1920,height:1080});await page.waitForTimeout(1200);check('Low DPR cap survives viewport resize',await page.evaluate(()=>game.viewport.pixelRatio===1&&game.canvasElement.width===1920));
 await page.reload({waitUntil:'networkidle'});await ready();await page.waitForTimeout(2000);check('Low preference persists across reload before renderer creation',await page.evaluate(()=>game.quality.level===1&&game.rendering.renderer.getPixelRatio()===1));
 await toggle();check('High can be restored through native menu',await page.evaluate(()=>game.quality.level===0&&game.rendering.renderer.getPixelRatio()===2));await toggle();
 for(const [width,height]of [[1366,768],[1920,1080]]){
  await page.setViewportSize({width,height});await page.waitForTimeout(1000);await page.locator('#presentation-open').click();await panel();
  for(let slide=0;slide<6;slide++){
   await page.locator(`.co-learning [data-index="${slide}"]`).click();await panel();
   check(`${width}x${height} section ${slide+1}: panel/footer fit and content scrolls without horizontal clipping`,await page.evaluate(()=>{const root=document.querySelector('.co-learning'),r=root.getBoundingClientRect(),content=root.querySelector('.co-content'),footer=root.querySelector('.co-footer').getBoundingClientRect();return r.x>=0&&r.y>=0&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1&&content.clientHeight>50&&content.scrollWidth<=content.clientWidth+1&&footer.bottom<=r.bottom&&footer.top>=r.top}));
   if(slide>=1&&slide<=3){const step=page.locator('.co-learning [data-action="step"]');await step.scrollIntoViewIfNeeded();check(`${width} section ${slide+1}: Step is reachable`,await step.isVisible());}
   if(slide===1)await shot(`panel-${width}`);
   if(slide===4){check(`${width}: actual metrics, assignments and convergence present`,await page.evaluate(()=>document.querySelectorAll('.co-metric').length===3&&document.querySelectorAll('.co-assignment-table tbody tr').length===8&&document.querySelectorAll('.co-plot polyline').length===2&&[...document.querySelectorAll('.co-metric small')].every(x=>x.textContent.includes('Utilisasi (proxy)'))));await page.locator('.co-plot-wrap').scrollIntoViewIfNeeded();await shot(`convergence-${width}`)}
  }
  await page.keyboard.press('Escape');await page.waitForFunction(()=>game.world.cloudOps.state==='DRIVING');
 }
 check('no JavaScript page errors',report.errors.length===0);report.passed=true;
}catch(error){report.passed=false;report.failure=error.stack;await shot('ui-failure').catch(()=>{});throw error}finally{fs.writeFileSync('docs/evidence/release-ui.json',JSON.stringify(report,null,2));await browser.close()}
