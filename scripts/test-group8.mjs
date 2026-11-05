import {chromium} from 'playwright';import assert from 'node:assert/strict';import fs from 'node:fs';
const url=process.argv[2]||'http://127.0.0.1:4193/Soka-cloud-ops-scheduling-adventure/';
const label=process.argv[3]||'group8';
const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage({viewport:{width:1366,height:768}}),report={checks:[],errors:[],httpErrors:[]};
page.on('pageerror',e=>report.errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&r.url().startsWith(new URL(url).origin))report.httpErrors.push({url:r.url(),status:r.status()})});
await page.addInitScript(()=>{window.__campusOpened=[];window.open=url=>{window.__campusOpened.push(String(url));return null}});
const check=(name,value)=>{report.checks.push({name,passed:!!value});assert.ok(value,name);console.log('PASS '+name)};
const shot=name=>page.screenshot({path:`docs/evidence/${label}-${name}.png`});
const panel=()=>page.waitForFunction(()=>game.world.learning.panel.visible&&!game.world.learning.busy&&game.modals.state===1,null,{timeout:30000});
async function closePanel(){await page.keyboard.press('Escape');await page.waitForFunction(()=>game.modals.state===3&&game.world.cloudOps.state==='DRIVING')}
async function menu(id){await page.evaluate(id=>game.menu.open(id),id);await page.waitForFunction(()=>game.menu.state===1)}
async function closeMenu(){await page.keyboard.press('Escape');await page.waitForFunction(()=>game.menu.state===3)}
async function near(position){assert.ok(position.length===2&&position.every(Number.isFinite),'finite world position required');await page.evaluate(p=>game.physicalVehicle.moveTo({x:p[0],y:2,z:p[1]},0),position);await page.waitForTimeout(2000)}
try{
 await page.goto(url+'#skip',{waitUntil:'networkidle'});await page.waitForFunction(()=>window.game?.world?.campus?.ready,null,{timeout:120000});await page.waitForTimeout(2500);
 await page.evaluate(()=>{for(const [c,v]of [[game.dayCycles,.1],[game.yearCycles,.25]]){c.newAbsoluteProgressBinding.manual=true;c.newAbsoluteProgressBinding.manualValue=v;c.update(true)}});
 check('project title and metadata identify Kelompok 8',await page.evaluate(()=>document.title==='Cloud Ops: Scheduling Adventure — Kelompok 8'&&document.documentElement.lang==='id'&&document.querySelector('meta[property="og:title"]').content.includes('Kelompok 8')&&!document.head.innerHTML.includes('bruno-simon.com')));
 check('true 3D welcome landmark loads without font fallback',await page.evaluate(()=>!!game.world.campus.title&&!game.world.campus.lastError&&game.world.campus.title.geometry.type==='TextGeometry'));
 check('three campus destinations, one campus group, four original zones',await page.evaluate(()=>game.world.campus.signs.length===3&&game.scene.children.filter(x=>x.name==='group8-campus').length===1&&game.world.cloudOps.zones.size===4));
 check('personal letters and verified social-logo bodies disabled and invisible',await page.evaluate(()=>{const c=game.world.campus;return c.retiredLetters.length===10&&c.retiredSocial.length>=8&&[...c.retiredLetters.map(r=>r.userData.object),...c.retiredSocial].every(o=>!o.physical.body.isEnabled()&&!o.visual.object3D.visible)}));await shot('main');
 await near([46,36]);await shot('navigation');
 await menu('home');check('Home contains project explanation, course and shared CTA',await page.locator('.campus-home').innerText().then(t=>t.includes('Kelompok')||t.includes('KELOMPOK 8')&&t.includes('Virtual Machine')&&t.includes('MULAI PRESENTASI')));await shot('home');
 check('no personal account destinations remain in HTML',await page.evaluate(()=>![...document.querySelectorAll('a[href]')].some(a=>/mailto:|linkedin\.com|discord\.com|twitch\.tv|bsky\.app|x\.com\/bruno|youtube\.com|bruno-simon\.com/.test(a.href))));
 await page.locator('[data-campus-start]').click();await panel();check('Home CTA uses existing M6 and locks driving',await page.evaluate(()=>game.world.learning.panel.slide===0&&!game.physicalVehicle.chassis.physical.body.isEnabled()));await closePanel();
 await menu('behindTheScene');check('Credits distinguish contributions and preserve MIT copyright',await page.locator('.campus-credits').innerText().then(t=>t.includes('Bruno Simon')&&t.includes('Kontribusi Kelompok 8')&&t.includes('Copyright (c) 2025 Bruno Simon')));await shot('credits');await closeMenu();
 for(const width of [1366,1920]){await page.setViewportSize({width,height:width===1366?768:1080});await menu('home');const button=page.locator('[data-campus-start]');await button.scrollIntoViewIfNeeded();check(width+' Home CTA reachable and panel has no horizontal overflow',await page.evaluate(()=>{const e=document.querySelector('.campus-home');return e.scrollWidth<=e.clientWidth+1}));await shot('home-'+width);await closeMenu()}
 await page.setViewportSize({width:1366,height:768});
 for(const id of ['projects','lab']){
  const position=await page.evaluate(id=>{const p=game.world.areas[id].references.items.get('interactivePoint')[0].position;return [p.x,p.z]},id);await near(position);await page.keyboard.press('Enter');await panel();check(id+' native research interaction opens M6 without old cinematic',await page.evaluate(id=>game.world.areas[id].portfolioDisabled&&game.world.learning.panel.slide===0,id));await closePanel();
 }
 const social=await page.evaluate(()=>game.world.areas.social.campusLinks.map(({link,point})=>({link,position:[point.position.x,point.position.y]})));
 for(const [index,item]of social.entries()){
  await near(item.position);await page.keyboard.press('e');
  if(item.link.url){check('social repository destination is the actual group project',await page.evaluate(()=>window.__campusOpened.length===1&&window.__campusOpened[0]==='https://github.com/Arkanzahir/Soka-cloud-ops-scheduling-adventure'))}
  else if(item.link.menu){await page.waitForFunction(()=>game.menu.state===1);check('social credits interaction opens attribution menu',await page.evaluate(()=>game.menu.current.name==='behindTheScene'));await closeMenu()}
  else{await panel();check('social presentation interaction uses existing M6',await page.evaluate(()=>game.world.learning.panel.slide===0));await closePanel()}
 }
 check('career is a six-topic CTS learning path, not personal history',await page.evaluate(()=>game.world.areas.career.year.current===2026&&game.world.areas.career.lines.items.length===6&&game.world.areas.career.lines.items.every(x=>!!x.lesson)));
 // Exercise the retained reset API as well as the R driving action.
 await page.evaluate(()=>game.reset());await page.waitForFunction(()=>!game.overlay.mesh.visible,null,{timeout:20000});
 check('native reset retains disabled personal props and valid social dependencies',await page.evaluate(()=>game.world.campus.retiredLetters.every(r=>!r.userData.object.physical.body.isEnabled()&&!r.userData.object.visual.object3D.visible)&&!!game.world.areas.social.fans.instancedGroup));
 await near([39.5,37.8]);const before=await page.evaluate(()=>game.player.position.toArray());await page.keyboard.down('ArrowUp');await page.waitForTimeout(900);await page.keyboard.up('ArrowUp');check('vehicle drives through branded Main without new decoration collisions',await page.evaluate(p=>Math.hypot(...game.player.position.toArray().map((x,i)=>x-p[i]))>.7,before));await page.keyboard.press('r');await page.waitForFunction(()=>!game.overlay.mesh.visible&&game.physicalVehicle.wheels.inContactCount>=2,null,{timeout:20000});check('R remains grounded and title remains branded while driving',await page.evaluate(()=>document.title.includes('Kelompok 8')&&game.physicalVehicle.wheels.inContactCount>=2));
 await page.evaluate(()=>game.world.cloudOps.enter('gwo',true));await page.keyboard.press('m');await page.waitForFunction(()=>game.modals.current?.name==='map'&&game.modals.state===1);await page.locator('.js-map-container .location').filter({hasText:'Cloud Ops Campus'}).click();await page.waitForFunction(()=>game.world.cloudOps.currentZone==='main'&&!game.overlay.mesh.visible&&game.modals.state===3,null,{timeout:30000});check('campus map returns from mini-world through ZoneManager safely',await page.evaluate(()=>game.world.cloudOps.currentZone==='main'&&!game.map.navigating));
 check('no personal account was opened by any tested interaction',await page.evaluate(()=>window.__campusOpened.every(u=>u==='https://github.com/Arkanzahir/Soka-cloud-ops-scheduling-adventure')));
 check('no JavaScript or local resource errors',report.errors.length===0&&report.httpErrors.length===0);report.passed=true;
}catch(error){report.passed=false;report.failure=error.stack;report.state=await page.evaluate(()=>({zone:window.game?.world?.cloudOps?.currentZone,modal:window.game?.modals?.state,menu:window.game?.menu?.state,active:window.game?.interactivePoints?.activeItem?.text})).catch(()=>null);await shot('failure').catch(()=>{});throw error}finally{fs.writeFileSync(`docs/evidence/${label}-branding.json`,JSON.stringify(report,null,2));await browser.close()}
