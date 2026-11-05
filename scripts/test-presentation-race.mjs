import assert from 'node:assert/strict'
import {chromium} from 'playwright'
const b=await chromium.launch({channel:'chrome',headless:true})
const p=await b.newPage({viewport:{width:1366,height:768}})
const url = new URL(process.argv[2] || 'http://127.0.0.1:1263/#skip')
const errors=[],requests=[]
p.on('pageerror',e=>{if(errors.length<8)errors.push(e.stack)})
p.on('response',r=>{if(new URL(r.url()).origin===url.origin&&r.status()>=400)requests.push(r.status()+' '+r.url())})
const wait=(f,a,timeout=22000)=>p.waitForFunction(f,a,{timeout})
const action=name=>p.locator('.co-learning [data-action="'+name+'"]')
const driving=category=>wait(c=>game.world.cloudOps.canInteract(c),category)
const step=()=>action('step').click()
const finishLesson=()=>p.evaluate(()=>{
 const player=game.world.learning.panel.player
 player.seek(player.lesson.timeline.length)
})
const open=async(i,key='e')=>{await p.keyboard.press(key);await wait(i=>game.world.learning.panel.visible&&game.world.learning.panel.slide===i&&game.modals.state===1,i)}
const close=async(category,key='Escape')=>{await p.keyboard.press(key);await driving(category)}
const gotoStation=async(def)=>{
 await p.evaluate(def=>{
  const {cloudOps:m,areas,presentationRace:r}=game.world
  const s=def.index===undefined?areas[def.world][def.kind]:r.stops[def.index].station
  const {x,z}=s.position
  for(const d of [[0,0],[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]]){
   try{
    const spawn=m.transitions.safeSpawn({position:[x+d[0],z+d[1]],rotation:0})
    m.transitions.place(spawn,0);return
   }catch{}
  }
  throw new Error('Could not park at '+JSON.stringify(def))
 },def)
 await wait(def=>{
  const {areas,presentationRace:r}=game.world
  const s=def.index===undefined?areas[def.world][def.kind]:r.stops[def.index].station
  return game.physicalVehicle.wheels.inContactCount>=2&&game.interactivePoints.activeItem===s.point&&s.point.state===4&&s.trigger.isIn
 },def)
}
try{
 await p.goto(url.href)
 await wait(()=>window.game?.world?.cloudOps?.canInteract(),null,90000)
 await wait(()=>game.world.areas.aco.ants.every(a=>a.walkMixer)&&game.world.areas.gwo.wolves.every(w=>w.rig))
 for(const zone of ['cloud','aco','gwo']){
  await gotoStation({world:zone,kind:'entry'});await p.keyboard.press(zone==='aco'?'Enter':'e')
  await wait(zone=>game.world.cloudOps.currentZone===zone&&game.world.cloudOps.canInteract(),zone)
  if(zone==='cloud'){
   await p.keyboard.press('r');await wait(()=>game.world.cloudOps.transitions.busy)
   await wait(()=>game.world.cloudOps.canInteract()&&game.world.cloudOps.currentZone==='cloud'&&game.physicalVehicle.wheels.inContactCount>=2)
  }
  if(zone==='cloud')await gotoStation({world:zone,kind:'station'})
  await open({cloud:1,aco:2,gwo:3}[zone],zone==='cloud'?'e':'l');await step()
  assert.equal(await p.evaluate(()=>game.world.learning.panel.player.cursor),1)
  await close('wandering')
  await gotoStation({world:zone,kind:'exit'});await p.keyboard.press('e')
  await wait(()=>game.world.cloudOps.currentZone==='main'&&game.world.cloudOps.canInteract())
  console.log('PASS Free Drive',zone,'entry, L, step, exit')
 }
 await p.evaluate(()=>game.quality.changeLevel(1))
 assert.equal(await p.evaluate(()=>game.rendering.renderer.getPixelRatio()),1)
 await p.locator('#presentation-open').click()
 await wait(()=>game.world.presentationRace.active&&game.interactivePoints.activeItem===game.world.areas.circuit.interactivePoint&&game.interactivePoints.activeItem.state===4)
 await p.keyboard.press('Enter')
 await wait(()=>game.world.presentationRace.ready&&game.audio.raceMusic.playing(),null,35000)
 await p.keyboard.down('ArrowUp')
 try{
  await wait(()=>game.audio.groups.get('wheelsOnFloor').items[0].volume>.06)
  const [wheel,base]=await p.evaluate(()=>{const item=game.audio.groups.get('wheelsOnFloor').items[0];return [item.howl.volume(),item.volume]})
  assert.ok(Math.abs(wheel/base-.25)<1e-6,'road texture should be 25% of its original mix')
 }finally{await p.keyboard.up('ArrowUp')}
 await p.evaluate(()=>{
  const transitions=game.world.cloudOps.transitions
  const rotation=Math.PI/2
  transitions.place(transitions.safeSpawn({position:[-79,-37],rotation}),rotation)
 })
 await wait(()=>game.physicalVehicle.wheels.inContactCount>=2)
 await p.keyboard.down('ArrowUp')
 try{
  await wait(()=>game.player.position.z<-46&&Math.abs(game.player.position.x+79)<1.5,null,12000)
 }finally{await p.keyboard.up('ArrowUp')}
 console.log('PASS drove through west bend and former Cloud tree position')
 for(const i of [0,1,2,3,4,5]){
  await gotoStation({index:i});await open(i)
  assert.equal(await p.locator('.presentation-race-hud').isVisible(),false)
  if(i>=1&&i<=3){
   await action('reset').click()
   if(i===2){
    const [pose,origin]=await p.evaluate(()=>{const a=game.world.areas.aco.ants[0];return [a.idleMount.position.toArray(),a.mesh.position.toArray()]})
    await wait(pose=>game.world.areas.aco.ants[0].idleMount.position.toArray().some((v,k)=>Math.abs(v-pose[k])>.06),pose)
    assert.deepEqual(await p.evaluate(()=>game.world.areas.aco.ants[0].mesh.position.toArray()),origin)
   }
   if(i===3){
    const pose=await p.evaluate(()=>game.world.areas.gwo.wolves[0].rig.head.rotation.y)
    await wait(pose=>Math.abs(game.world.areas.gwo.wolves[0].rig.head.rotation.y-pose)>.13,pose)
    assert.equal(await p.evaluate(()=>game.world.areas.gwo.state),null)
    const waves=await p.evaluate(()=>game.audio.groups.get('waves').items[0].howl.volume())
    assert.ok(waves<.02,'waves near GWO should stay quiet in Presentation Race')
    console.log('PASS idle poses before Play and quieter waves at GWO',waves.toFixed(3))
   }
   assert.equal(await p.evaluate(()=>game.world.learning.panel.player.cursor),0)
   await action('play').click()
   await close('racing')
   await wait(()=>game.world.learning.panel.player.cursor>=1)
   assert.ok(await p.locator('.race-playback').isVisible())
   await open(i,'l');assert.ok(await p.evaluate(()=>game.world.learning.panel.player.cursor>=1))
   await action('pause').click()
   const paused=await p.evaluate(()=>game.world.learning.panel.player.cursor)
   await p.waitForTimeout(2300)
   assert.equal(await p.evaluate(()=>game.world.learning.panel.player.cursor),paused)
   await action('reset').click();assert.equal(await p.evaluate(()=>game.world.learning.panel.player.cursor),0)
   if(i===1){
    await step()
    await action('play').click();await action('pause').click()
    const position=await p.evaluate(()=>game.world.areas.cloud.tasks[0].mesh.position.toArray())
    await p.waitForTimeout(450)
    assert.deepEqual(await p.evaluate(()=>game.world.areas.cloud.tasks[0].mesh.position.toArray()),position)
    await action('play').click()
    await wait(()=>{const task=game.world.areas.cloud.tasks[0];return task.vm===0&&!task.motion&&task.mesh.position.distanceTo(task.home)>1})
    assert.ok(await p.evaluate(()=>{const a=game.world.areas.cloud;return a.vms.filter(vm=>vm.selection.visible).length===1}))
    await action('pause').click()
    await finishLesson()
    const loads=await p.evaluate(()=>game.world.areas.cloud.vms.map(vm=>vm.load.toFixed(2)))
    assert.deepEqual(loads,['11.83','8.10','2.20'])
   }
   if(i===2){
    await step()
    await wait(()=>{const a=game.world.areas.aco;return a.ants.every(v=>v.walkMixer.time>.08)&&a.ants.every(v=>v.vm===a.event.colonyChoices.find(c=>c.ant===v.antId).selectedVM)})
    await wait(()=>game.world.areas.aco.ants.every(a=>a.insideVm&&!a.mesh.visible))
    await finishLesson()
    assert.equal(await p.evaluate(()=>game.world.areas.aco.iteration.bestSoFar),6.2)
    assert.match(await p.locator('.co-step-details').innerText(),/Terbaik sejauh ini: 6,20 detik/)
   }
   if(i===3){
    await step();await step()
    await wait(()=>{const a=game.world.areas.gwo;return a.wolves.some(w=>w.rankMove&&w.rig.legs.some(l=>Math.abs(l.rotation.z)>.035))})
    assert.ok(await p.evaluate(()=>game.world.areas.gwo.wolves.every(w=>w.assignment.join()===game.world.areas.gwo.state.candidates.find(c=>c.id===w.id).assignment.join())))
    await wait(()=>game.world.areas.gwo.howl.howl.state()==='loaded')
    assert.ok(await p.evaluate(()=>game.world.areas.gwo.howl.lastPlay>-Infinity))
    await step();await step()
    const state=await p.evaluate(()=>game.world.areas.gwo.state)
    assert.equal(state.bestMakespan,6.5)
    assert.ok(state.candidates.every(candidate=>candidate.fitness.toFixed(2)==='6.73'))
    assert.match(await p.locator('.co-step-details').innerText(),/Rekor sejauh ini: 6,50 detik/)
   }
  }
  if(i===4){
   assert.deepEqual(await p.locator('.co-metrics strong').allTextContents(),['11,83 s','6,00 s','6,50 s'])
   assert.equal(await p.locator('.co-plot polyline').count(),2)
  }
  if(i===5)assert.equal(await p.locator('.co-paper').count(),3)
  await close('racing')
  if(i===3){
   await wait(()=>game.world.areas.gwo.wolves.every(w=>!w.rankMove))
   assert.ok(await p.evaluate(()=>game.world.areas.gwo.wolves.every(w=>w.mesh.position.distanceTo(w.base)<.01)))
  }
  console.log('PASS Race stop',i+1)
 }
 await p.locator('.race-stop').click()
 await wait(()=>game.world.areas.circuit.state===1&&game.world.cloudOps.canInteract())
 assert.equal(await p.evaluate(()=>game.audio.raceMusic.playing()),false)
 assert.deepEqual(errors,[]);assert.deepEqual(requests,[])
 console.log('PASS release flow, low DPR, no JS or local HTTP errors')
}catch(error){console.log('Captured errors',errors,requests);throw error}finally{await b.close()}
