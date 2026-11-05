import {chromium} from 'playwright';import assert from 'node:assert/strict';import fs from 'node:fs';
const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage({viewport:{width:1366,height:768}}),report={checks:[],errors:[],httpErrors:[]};
const url=process.argv[2]||'http://127.0.0.1:4193/Soka-cloud-ops-scheduling-adventure/';
page.on('pageerror',e=>report.errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&r.url().startsWith(new URL(url).origin))report.httpErrors.push(r.url())});
const check=(name,value)=>{report.checks.push({name,passed:!!value});assert.ok(value,name);console.log('PASS '+name)};
const shot=name=>page.screenshot({path:`docs/evidence/group8-release-${name}.png`});
const settled=()=>page.waitForFunction(()=>{const p=document.querySelector('.co-learning'),m=document.querySelector('.modals');return p&&!p.hidden&&!p.inert&&m.classList.contains('is-visible')&&m.getAnimations({subtree:true}).every(a=>a.playState!=='running')},null,{timeout:30000});
try{
 await page.goto(url,{waitUntil:'networkidle'});
 for(let i=0;i<60&&!await page.locator('#presentation-open').isVisible();i++){await page.keyboard.press('Enter');await page.waitForTimeout(1000)}
 await page.locator('#presentation-open').waitFor({state:'visible',timeout:30000});
 check('normal release has branded title and no debug Game',await page.evaluate(()=>window.game===undefined&&document.title==='Cloud Ops: Scheduling Adventure — Kelompok 8'));await shot('main');
 await page.locator('.js-menu-trigger').click();await page.locator('.campus-home').waitFor({state:'visible'});await page.locator('.js-navigation-item[data-name="behindTheScene"]').click();await page.locator('.campus-credits').waitFor({state:'visible'});
 const summary=page.locator('.campus-license summary');await summary.scrollIntoViewIfNeeded();await summary.click();await page.locator('.campus-license pre').scrollIntoViewIfNeeded();check('MIT copyright and source repository accessible in the real release menu',await page.locator('.campus-license pre').innerText().then(t=>t.includes('Copyright (c) 2025 Bruno Simon')&&t.includes('Permission is hereby granted')));await shot('license');
 await page.locator('.js-navigation-item[data-name="home"]').click();await page.locator('[data-campus-start]').click();await settled();
 for(const [index,id]of [[1,'cloud'],[2,'aco'],[3,'gwo']]){
  await page.locator(`.co-learning [data-index="${index}"]`).click();await settled();await page.locator('.co-learning [data-action="step"]').click();
  check(id+' normal release Step updates the visible lesson',/^1\s*\//.test(await page.locator('.co-step-count').innerText()));
  await page.locator('.co-learning [data-action="play"]').click();await page.waitForTimeout(1150);await page.locator('.co-learning [data-action="pause"]').click();const count=await page.locator('.co-step-count').innerText();await page.waitForTimeout(1100);check(id+' normal release Play/Pause holds progress',count===await page.locator('.co-step-count').innerText()&&!/^1\s*\//.test(count));
  await page.locator('.co-learning [data-action="reset"]').click();check(id+' normal release Reset clears lesson progress',/^0\s*\//.test(await page.locator('.co-step-count').innerText()));
 }
 await page.locator('.co-learning [data-index="4"]').click();await settled();check('normal release comparison has three metrics, two curves and eight tasks',await page.evaluate(()=>document.querySelectorAll('.co-metric').length===3&&document.querySelectorAll('.co-plot polyline').length===2&&document.querySelectorAll('.co-assignment-table tbody tr').length===8));await page.locator('.co-plot-wrap').scrollIntoViewIfNeeded();await shot('results');
 await page.locator('.co-learning [data-index="5"]').click();await settled();check('normal release has three scientific reference cards',await page.locator('.co-paper').count()===3);
 await page.locator('.co-learning [data-index="0"]').click();await settled();await page.keyboard.press('Escape');await page.locator('.co-learning').waitFor({state:'hidden'});check('normal release closes presentation with one canvas and panel',await page.locator('.js-canvas').count()===1&&await page.locator('.co-learning').count()===1);
 check('normal release has no JS or local HTTP errors',report.errors.length===0&&report.httpErrors.length===0);report.passed=true;
}catch(error){report.passed=false;report.failure=error.stack;await shot('failure').catch(()=>{});throw error}finally{fs.writeFileSync('docs/evidence/group8-release.json',JSON.stringify(report,null,2));await browser.close()}
