import * as T from 'three/webgpu'
import { color, texture, uv, mix } from 'three/tsl'
import { MeshDefaultMaterial } from '../../Game/Materials/MeshDefaultMaterial.js'
import { Trees } from '../../Game/World/Trees.js'
import { InteractivePoints } from '../../Game/InteractivePoints.js'
import {createPheromoneGeometry,setPheromoneRadius} from './PheromoneGeometry.js'

// Procedural source assets: no Blender or external model dependencies.
export class AcoWorld {
 constructor(game, origin = new T.Vector3(220, 0, 0)) {
  this.game=game; this.origin=origin; this.ants=[]; this.paths=[]; this.pathMeshes=[]; this.pathBeds=[]; this.taskActors=[]; this.vmActors=[]; this.experiment={taskCount:8,vmCount:3}; this.colonyMode='colony'; this.returning=false; this.moving=false; this.elapsed=0; this.demo=false;this.antPosition=new T.Vector3();this.antTangent=new T.Vector3()
  this.group=new T.Group(); this.group.position.copy(origin); game.scene.add(this.group)
  this.mat={}; for(const [n,c] of Object.entries({sand:'#ffcf8b',wood:'#a87762',soil:'#ac6942',trail:'#b98260',dark:'#382c38',leaf:'#b8b62e',cream:'#fff0bf',red:'#b85b47'})) this.mat[n]=new MeshDefaultMaterial({colorNode:color(c)})
  this.build(); this.decorate(); this.makeFeedback(); this.resetVisualization()
  this.tick=()=>{const active=!this.isActive||this.isActive();this.group.visible=active;if(active)this.update(game.ticker.delta)}; game.ticker.events.on('tick',this.tick,10)
 }
 mesh(geometry,mat,x,y,z,sx=1,sy=1,sz=1){const m=new T.Mesh(geometry,this.mat[mat]||mat);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;m.receiveShadow=true;this.group.add(m);return m}
 box(x,y,z,w,h,d,mat='wood',solid=false){const m=this.mesh(new T.BoxGeometry(w,h,d),mat,x,y,z);if(solid)this.game.objects.add(null,{type:'fixed',position:{x:x+this.origin.x,y:y+this.origin.y,z:z+this.origin.z},colliders:[{shape:'cuboid',parameters:[w/2,h/2,d/2],category:'object'}]});return m}
 label(text,x,y,z,width=4){const c=document.createElement('canvas');c.width=1024;c.height=160;const ctx=c.getContext('2d');ctx.fillStyle='#fff0bf';ctx.fillRect(0,0,1024,160);ctx.fillStyle='#382c38';ctx.font='bold 64px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,512,80,980);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;return this.mesh(new T.PlaneGeometry(width,width/6.4),new MeshDefaultMaterial({colorNode:texture(tex)}),x,y,z)}
 build(){
  const ground=new MeshDefaultMaterial({colorNode:mix(color('#a87762'),color('#ffcf8b'),texture(this.game.resources.floorSlabsTexture,uv().mul(8)).r)})
  this.mesh(new T.BoxGeometry(36,3,32),ground,0,-1.5,0)
  this.game.objects.add(null,{type:'fixed',friction:.7,position:this.origin.clone().add(new T.Vector3(0,-1.5,0)),colliders:[{shape:'cuboid',parameters:[18,1.5,16],category:'floor'}]})
  // Perimeter fences keep independent preview safely inside its grounded courtyard.
  for(let x=-17;x<=17;x+=3.4)for(const z of [-15,15]){this.box(x,.7,z,.2,1.4,.2);this.box(x,.9,z,3.4,.18,.15);this.box(x,.4,z,3.4,.18,.15)}
  for(let z=-13.5;z<15;z+=3)for(const x of [-17,17]){this.box(x,.7,z,.2,1.4,.2);this.box(x,.7,z,.15,.2,3)}
  for(const [x,z,w,d] of [[0,15,36,.3],[0,-15,36,.3],[-17,0,.3,30],[17,0,.3,30]])this.box(x,.6,z,w,1.2,d,'wood',true)
  // Keep the title on the courtyard verge, clear of the car and pheromone table.
  for(const x of [-14.7,-9.3])this.box(x,1.4,11.5,.24,2.8,.24,'wood',true)
  this.box(-12,2.65,11.5,6,1.65,.3,'wood');this.label('ANT RESEARCH PARK',-12,3.05,11.68,5.6)
  this.label('ANT COLONY OPTIMIZATION',-12,2.25,11.68,5)
  // Faceted earthen mound with entrance and stone edging.
  this.mesh(new T.ConeGeometry(3.4,3.5,11,3), 'soil',-8,1.75,-5)
  this.mesh(new T.SphereGeometry(.8,12,8),'dark',-8,.55,-2.55,1,.7,.35)
  this.game.objects.add(null,{type:'fixed',position:this.origin.clone().add(new T.Vector3(-8,1,-5)),colliders:[{shape:'cylinder',parameters:[1,2.3],category:'object'}]})
  this.label('COLONY',-8,3.8,-4.5,3)
  this.box(3,.22,-3,12,.44,11,'wood',true)
  this.box(3,.48,-3,11.7,.08,10.7,'sand')
  for(let i=0;i<8;i++){const x=-1.8+i*1.35;const box=this.box(x,.75,1,1,.45,1,'red');const label=this.label('T'+(i+1),x,1.2,1.55,1);this.taskActors.push([box,label])}
  // A single low-profile trail leaves the nest. Only the branches split
  // toward VMs: overlapping three copies here looked like an enormous cable.
  this.trunkCurve=this.nestToFork()
  this.trunkBed=this.mesh(new T.TubeGeometry(this.trunkCurve,48,.085,6,false),'trail',0,0,0)
  this.trunkSignal=this.mesh(new T.TubeGeometry(this.raiseCurve(this.trunkCurve,.09),48,.027,5,false),'leaf',0,0,0)
  for(let j=0;j<3;j++){
   const visualStart=this.group.children.length;
   const x=j*4-1;
   this.box(x,1,-7,2,1,1.8,'wood');this.box(x,1.65,-7,1.6,.3,1.4,'cream');this.label('VM'+(j+1),x,2,-6.1,2)
   // Save the original positions so switching 2 → 3 VMs cannot accumulate offsets.
   this.vmActors.push(this.group.children.slice(visualStart).map(mesh=>({mesh,homeX:mesh.position.x})))
   this.paths.push(this.routeTo(x))
   const branch=this.branchTo(x)
   this.pathBeds.push(this.mesh(new T.TubeGeometry(branch,32,.085,6,false),'trail',0,0,0))
   this.pathMeshes.push(this.mesh(createPheromoneGeometry(this.raiseCurve(branch,.09)),'leaf',0,0,0))
  }
  // These are the actual 12 search agents generated by the scheduling engine.
  // They are separate from the VM buildings and are never merely random foraging props.
  for(let i=0;i<12;i++){
   const ant=this.makeAnt();ant.scale.setScalar(i===0?.70:.52)
   if(i===0)ant.children[2].material=this.mat.cream
   this.group.add(ant);this.ants.push({mesh:ant,antId:i+1,vm:0,phase:i/12})
  }
  this.box(-9,1.3,5,4.5,2.6,.35,'wood',true);this.label('ACO RESEARCH',-9,2,5.2,4);this.label('E / ENTER : INSPECT',-9,1.2,5.2,4)
  this.point=this.game.interactivePoints.create(this.origin.clone().add(new T.Vector3(-9,1,7)),'Research',InteractivePoints.ALIGN_RIGHT,InteractivePoints.STATE_CONCEALED,()=>this.onResearch?.());this.point.show()
 }
 makeAnt(){const g=new T.Group();g.userData.legs=[];g.userData.antennae=[];for(const [z,r]of [[-.3,.29],[0,.18],[.3,.23]]){const m=new T.Mesh(new T.SphereGeometry(r,8,6),this.mat.dark);m.position.set(0,.24,z);m.scale.x=.8;g.add(m)}for(let i=0;i<3;i++)for(const side of [-1,1]){const p=[new T.Vector3(0,.2,(i-1)*.18),new T.Vector3(side*.28,.22,(i-1)*.27),new T.Vector3(side*.4,0,(i-1)*.34)];const leg=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(p),4,.025,4),this.mat.dark);leg.userData.phase=i*Math.PI+side;g.add(leg);g.userData.legs.push(leg)}for(const s of [-1,1]){const m=new T.Mesh(new T.CylinderGeometry(.018,.018,.32,4),this.mat.dark);m.position.set(s*.12,.43,.43);m.rotation.x=.6;m.rotation.z=s*-.5;g.add(m);g.userData.antennae.push(m)}g.scale.setScalar(1.15);return g}
 makeFeedback(){const c=document.createElement('canvas');c.width=1024;c.height=256;const ctx=c.getContext('2d'),tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;this.mesh(new T.PlaneGeometry(9,2.25),new MeshDefaultMaterial({colorNode:texture(tex)}),3,3.4,-8.4);this.writeFeedback=lines=>{ctx.fillStyle='#fff0bf';ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle='#382c38';ctx.textAlign='center';ctx.font='bold 38px sans-serif';lines.forEach((line,i)=>ctx.fillText(line,512,55+i*65,980));tex.needsUpdate=true}}
 decorate(){
  const refs=[];for(const [x,z]of [[-13,-10],[-3,-12],[10,-12],[14,-5],[-14,1],[13,9]]){const r=new T.Object3D();r.position.copy(this.origin).add(new T.Vector3(x,0,z));r.scale.setScalar(.7);r.updateMatrixWorld();refs.push(r)}
  this.trees=new Trees('ACO trees',this.game.resources.oakTreesVisualModel.scene.clone(true),refs,'#b4b536','#d8cf3b')
  for(let i=0;i<35;i++){const a=i*2.399;const x=-8+Math.cos(a)*(3.6+(i%3)*.3),z=-5+Math.sin(a)*(3.6+(i%3)*.3);this.mesh(new T.DodecahedronGeometry(.2+(i%3)*.08,0),'cream',x,.16,z,1,.7,1)}
  for(let i=0;i<220;i++){const x=-15+(i*7.31%30),z=-13+(i*3.17%26);if(Math.abs(x)<12&&z>-10&&z<11)continue;const m=this.mesh(new T.ConeGeometry(.12,.55,3),'leaf',x,.275,z);m.rotation.y=i}
 }

 // The nest is on the courtyard floor (y≈0); the VM platform is raised.
 // Shared trunk + independent branches avoids stacking three thick pipes.
 nestToFork(){
  return new T.CatmullRomCurve3([
   new T.Vector3(-7.25,.13,-1.90),
   new T.Vector3(-6.20,.12,-1.80),
   new T.Vector3(-4.90,.13,-2.12),
   new T.Vector3(-3.70,.18,-2.45),
   new T.Vector3(-2.73,.63,-2.75),
   new T.Vector3(-1.50,.64,-3.55)
  ])
 }
 branchTo(x){
  return new T.CatmullRomCurve3([
   new T.Vector3(-1.50,.64,-3.55),
   new T.Vector3(-.3+(x+1)*.17,.64,-4.44),
   new T.Vector3(x,.64,-5.90)
  ])
 }
 routeTo(x){
  const trunk=this.nestToFork().points
  return new T.CatmullRomCurve3([...trunk,...this.branchTo(x).points.slice(1)])
 }
 // The pheromone is a narrow visible stripe just above the earthen trail,
 // not another full-width cable interpenetrating the ground.
 raiseCurve(curve,y){
  return new T.CatmullRomCurve3(curve.points.map(p=>new T.Vector3(p.x,p.y+y,p.z)))
 }
 // Task dispatch automatically centers 4, 6 or 8 crates on the existing table.
 applyExperimentLayout(){
  const taskCount=this.experiment.taskCount
  const columns=taskCount===6?3:4
  for(const [i,actors] of this.taskActors.entries()){
   const row=Math.floor(i/columns),col=i%columns
   const x=3+(col-(columns-1)/2)*1.85
   const z=taskCount===4?1.05:1.15-row*1.5
   actors[0].position.set(x,.75,z)
   actors[1].position.set(x,1.2,z+.55)
  }
  const vmCount=this.experiment.vmCount
  for(let j=0;j<3;j++){
   const x=3+(j-(vmCount-1)/2)*4
   const originalX=j*4-1,dx=x-originalX
   for(const {mesh,homeX} of this.vmActors[j])mesh.position.x=homeX+dx
   const curve=this.routeTo(x)
   this.paths[j]=curve
   const branch=this.branchTo(x)
   const oldBed=this.pathBeds[j].geometry
   this.pathBeds[j].geometry=new T.TubeGeometry(branch,32,.085,6,false)
   oldBed.dispose()
   const oldSignal=this.pathMeshes[j].geometry
   this.pathMeshes[j].geometry=createPheromoneGeometry(this.raiseCurve(branch,.09))
   oldSignal.dispose()
  }
 }
 setColonyMode(mode){
  if(!['colony','focus'].includes(mode))throw new RangeError('Unsupported ant display mode')
  this.colonyMode=mode
  this.applyExperimentVisibility()
 }
 applyExperimentVisibility(){
  for(const [i,actors] of this.taskActors.entries())
   for(const actor of actors)actor.visible=i<this.experiment.taskCount
  for(const [i,actors] of this.vmActors.entries())
   for(const {mesh} of actors)mesh.visible=i<this.experiment.vmCount
  for(const [i,bed] of this.pathBeds.entries())bed.visible=i<this.experiment.vmCount
  for(const [i,signal] of this.pathMeshes.entries())signal.visible=i<this.experiment.vmCount
  this.ants.forEach((ant,i)=>ant.mesh.visible=this.colonyMode==='colony'||i===0)
 }
 placeAntAtNest(ant,i){
  // Twelve deterministic, well-spaced positions in the sandy clearing.
  // Keep every ant outside the solid anthill and away from the dispatch table.
  const row=Math.floor(i/4),col=i%4
  const x=-8.25+col*1.08+(row%2)*.30
  const z=-1.87+row*.93+.09*Math.sin(i*2.13)
  if(!ant.home)ant.home=new T.Vector3()
  ant.home.set(x,.055,z)
  ant.homeHeading=-.3+(i%5)*.27
  ant.mesh.position.copy(ant.home)
  ant.mesh.rotation.y=ant.homeHeading
 }
 applyEvent(event){
  if(!Number.isInteger(event.selectedVM)||event.selectedVM<0||event.selectedVM>=this.experiment.vmCount)throw new RangeError('selectedVM is not active')
  if(event.pheromone&&(event.pheromone.length!==this.experiment.vmCount||event.pheromone.some(v=>!Number.isFinite(v)||v<0)))throw new RangeError('Pheromone must match active VMs')
  if(event.pheromone)this.setPheromone(event.pheromone)
  const choices=event.colonyChoices||[]
  if(choices.length&& (choices.length!==this.ants.length||new Set(choices.map(c=>c.ant)).size!==choices.length||
    choices.some(c=>!Number.isInteger(c.ant)||c.ant<1||c.ant>this.ants.length||!Number.isInteger(c.selectedVM)||c.selectedVM<0||c.selectedVM>=this.experiment.vmCount)))
   throw new RangeError('Colony choices must contain twelve real ant-to-VM decisions')
  this.currentTask=event.task
  const previousDecision=!!this.event
  this.demo=false;this.event={...event};this.iteration=null;this.returning=false;this.moving=true;this.elapsed=0
  const destinations=new Map(choices.map(c=>[c.ant,c.selectedVM]))
  this.ants.forEach((ant,i)=>{
   ant.fromVM=previousDecision?ant.vm:null
   ant.vm=destinations.get(i+1)??(i===0?event.selectedVM:0)
  })
  this.applyExperimentVisibility()
  const counts=Array.from({length:this.experiment.vmCount},(_,i)=>choices.filter(c=>c.selectedVM===i).length)
  this.pathMeshes.forEach((mesh,i)=>mesh.material=this.mat[i<counts.length&&counts[i]>0?'leaf':'soil'])
  const probability=(event.probabilities||[]).map(p=>(p*100).toFixed(1)+'%').join(' / ')
  this.writeFeedback([
   `ITER ${event.iteration} | T${event.task+1} | ${choices.length||1} SEMUT`,
   `Fokus semut ${event.ant}: VM${event.selectedVM+1} | P: ${probability}`,
   choices.length?`Pilihan VM: ${counts.join(' / ')} semut | L: detail`:'Tekan L untuk melihat alokasi'
  ])
 }
 resetVisualization(){
  this.demo=false;this.event=null;this.iteration=null;this.returning=false;this.moving=false;this.elapsed=0;this.currentTask=0
  this.applyExperimentLayout()
  this.ants.forEach((a,i)=>{a.vm=0;a.fromVM=null;this.placeAntAtNest(a,i);a.mesh.userData.legs.forEach(l=>l.rotation.y=0)})
  this.pathMeshes.forEach(m=>m.material=this.mat.leaf)
  this.setPheromone(Array(this.experiment.vmCount).fill(1))
  this.applyExperimentVisibility()
  this.writeFeedback([`ACO | ${this.experiment.taskCount} TASK / ${this.experiment.vmCount} VM`,
   `12 semut · Mode ${this.colonyMode==='colony'?'Koloni':'Fokus'}`,'Langkah: pilihan engine · L: dashboard'])
 }
 setPheromone(row){
  const max=Math.max(...row,1e-6)
  this.pathMeshes.forEach((m,j)=>setPheromoneRadius(m.geometry,.022+.026*(row[j]??0)/max))
 }
 applyIteration(e){
  this.iteration=e;this.event=null;this.returning=true;this.moving=false;this.elapsed=0
  const row=e.pheromoneSnapshot[this.currentTask]
  this.setPheromone(row)
  this.pathMeshes.forEach((m,j)=>m.material=this.mat[j<row.length?'leaf':'soil'])
  this.writeFeedback([`ITER ${e.iteration} | Feromon diperbarui`,
   `T${this.currentTask+1} τ: ${row.map(v=>v.toFixed(3)).join(' / ')}`,
   `Terbaik sejauh ini: ${e.bestSoFar.toFixed(2)} s`])
 }
 setExperimentConfig({taskCount,vmCount}){
  if(![4,6,8].includes(taskCount)||![2,3].includes(vmCount))throw new RangeError('Unsupported ACO world configuration')
  this.experiment={taskCount,vmCount};this.resetVisualization()
 }
 update(dt){
  if(!Number.isFinite(dt)||dt<0)return
  this.elapsed+=dt
  const activeMotion=this.moving||this.returning
  const completedReturn=this.returning&&this.elapsed>=1.15
  for(const [i,ant] of this.ants.entries()){
   if(activeMotion){
    const delay=Math.floor(i/4)*.07+(i%4)*.035
    const progress=Math.max(0,Math.min(1,(this.elapsed-delay)*1.55))
    // Between task decisions, return along the previous branch before taking
    // the new VM route. This avoids teleporting ants between destinations.
    const returningToNest=this.returning||(this.moving&&ant.fromVM!==null&&progress<.32)
    const vm=this.returning?ant.vm:(returningToNest&&ant.fromVM!==null?ant.fromVM:ant.vm)
    const t=this.returning?1-progress:
     ant.fromVM!==null?(progress<.32?1-progress/.32:Math.min(1,(progress-.32)/.68)):progress
    const curve=this.paths[vm]
    const point=curve.getPoint(t,this.antPosition)
    const tangent=curve.getTangent(t,this.antTangent)
    // Small lateral offsets keep a real twelve-ant colony legible.
    const lateral=((i%4)-1.5)*.24
    ant.mesh.position.copy(point)
    ant.mesh.position.x+=tangent.z*lateral
    ant.mesh.position.z-=tangent.x*lateral
    ant.mesh.rotation.y=Math.atan2(tangent.x,tangent.z)+(returningToNest?Math.PI:0)

   }else{
    // Idle movement at the anthill is ambient only; VM choices remain engine-driven.
    ant.mesh.position.x+=Math.sin(this.elapsed*1.1+i)*.002
   }
   ant.mesh.userData.legs.forEach(l=>l.rotation.y=Math.sin(this.elapsed*27+l.userData.phase)*.2)
   ant.mesh.userData.antennae.forEach((m,k)=>m.rotation.x=.6+Math.sin(this.elapsed*9+k+i)*.08)
  }
  if(completedReturn){
   this.returning=false
   this.ants.forEach((a,j)=>this.placeAntAtNest(a,j))
  }
 }

}

