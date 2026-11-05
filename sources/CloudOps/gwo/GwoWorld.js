import {makeWolf} from './WolfModel.js'
import {CandidateBoard} from './CandidateBoard.js'
import {validateState,optimizerState} from './state.js'
import * as T from 'three/webgpu'
import {color,texture} from 'three/tsl'
import {Area} from '../../Game/World/Areas/Area.js'
import {MeshDefaultMaterial} from '../../Game/Materials/MeshDefaultMaterial.js'

export class GwoWorld extends Area {
 constructor(manager){
  const root=new T.Group();root.name='gwo'
  for(const name of ['refZoneBounding','refZoneFrustum']){const r=new T.Object3D();r.name=name;r.position.set(-65,0,65);r.scale.setScalar(18);r.userData.preventAutoAdd=true;root.add(r)}
  super(root);this.manager=manager;this.wolves=[];this.time=0
  this.materials={};for(const [n,c]of Object.entries({fur:'#777485',light:'#c1b9a4',dark:'#383039',wood:'#a87762',sand:'#ffcf8b',slate:'#596574',warm:'#9b8474',alpha:'#d9aa50',beta:'#75b7ae',delta:'#ba8d7a'}))this.materials[n]=new MeshDefaultMaterial({colorNode:color(c)})
  const ground=(x,z)=>{const ray=new this.game.RAPIER.Ray({x,y:15,z},{x:0,y:-1,z:0});const hit=this.game.physics.world.castRayAndGetNormal(ray,30,true,undefined,undefined,undefined,manager.transitions.body);if(!hit||hit.normal.y<.97||15-hit.timeOfImpact<-.1)throw new Error('GWO placement needs dry level terrain');return 15-hit.timeOfImpact}
  this.ground=ground
  // Original terrain/circuit provides the perimeter driving route; no replacement floor.
  const formation=[[-58.5,58],[-54.5,59.5],[-56.5,63.2],[-62.5,62.5],[-52.7,64]]
  for(let i=0;i<5;i++){
   const [x,z]=formation[i],y=ground(x,z),g=makeWolf(this,i)
   g.position.set(x,y+.04,z);this.game.scene.add(g);this.objects.hideable.push(g)
   const label=this.sign('',x,y+3.35,z,2.35,true)
   const pad=new T.Mesh(new T.CylinderGeometry(1.4,1.55,.12,9),this.materials.wood);pad.position.set(x,y+.03,z);this.game.scene.add(pad);this.objects.hideable.push(pad)
   this.wolves.push({home:g.position.clone(),id:'wolf-'+(i+1),mesh:g,label,base:g.position.clone(),pad})
  }
  const tracksideModels=this.objects.hideable.slice()
  // A small observation shelter replaces boards that previously cut across the driving view.
  this.sign('WOLF FIELD RESEARCH',-69,2.8,73.5,5.3)
  this.sign('GREY WOLF OPTIMIZER',-69,2.2,73.5,4.6)
  for(const x of [-71.4,-66.6])this.block(x,1.4,73.55,.18,2.8,.18,'wood')
  const roof=this.block(-69,3.3,73.5,5.7,.22,2.1,'dark');roof.rotation.z=.05
  this.board=this.sign('',-69,1.6,73.7,4.5)
  this.schedules=new CandidateBoard(this)
  this.raceVisuals=[...tracksideModels,this.schedules.root]
  this.boardHome=this.schedules.root.position.clone()
  this.sign('RESEARCH | E / ENTER',-69,.95,73.7,4)
  this.block(-69,.7,73.5,5,.14,1.8,'wood')
  // Observation binoculars: an environmental cue, not a second game camera.
  for(const dx of [-.2,.2]){const scope=new T.Mesh(new T.CylinderGeometry(.13,.18,.65,8),this.materials.slate);scope.rotation.x=Math.PI/2;scope.position.set(-70+dx,1.15,73.4);this.game.scene.add(scope);this.objects.hideable.push(scope)}  // Reuse Bruno's bench geometry/materials; fixed colliders remain outside driving corridor.
  const base=this.game.world.benches.instancedGroup.group
  for(const [x,z]of [[-72,59],[-72,72]]){const model=base.clone(true);model.position.set(x,ground(x,z),z);this.game.objects.add({model,updateMaterials:false});this.objects.hideable.push(model)}
  const spawn={position:[-65,65],rotation:0};manager.transitions.safeSpawn(spawn)
  manager.register({id:'gwo',name:'Wolf Field Research',center:[-65,65],radius:18,spawn})
  const gate=manager.findReturnCheckpoint({position:[39,50],rotation:0});if(!gate)throw new Error('No safe GWO gate');this.mainGate=gate;this.entry=manager.createStation({zone:'main',label:'Wolf Field Research',position:[gate.position[0],1.5,gate.position[1]],onInteract:()=>manager.enter('gwo')})
  this.exit=manager.createStation({zone:'gwo',label:'Kembali ke Main',position:[-65,1.5,75],onInteract:()=>manager.enter('main')})
  this.station=manager.createStation({zone:'gwo',label:'GWO Research',position:[-65,1.5,70],onInteract:()=>this.onLearn?this.onLearn():manager.openPanel('gwo-research')})
  this.resetVisualization();manager.registerPanel('gwo-research');manager.presentation.sections.push('gwo');manager.refresh()
 }
 setTracksideLayout(active){
  // Keep the original terrain and actors. The roadside formation is two clear rows near the rail.
  const formation=[[-64,57],[-59,57],[-54,57],[-62,62],[-57,62]]
  const facing=active?-Math.PI*.7:0
  for(const [i,wolf] of this.wolves.entries()){
   const [x,z]=active?formation[i]:[wolf.home.x,wolf.home.z]
   wolf.base.set(x,wolf.home.y,z)
   wolf.mesh.position.copy(wolf.base)
   wolf.mesh.rotation.y+=facing-(wolf.facing||0)
   wolf.facing=facing
   wolf.pad.position.x=x;wolf.pad.position.z=z
   wolf.label.mesh.position.x=x;wolf.label.mesh.position.z=z
   wolf.label.mesh.rotation.set(active?-.24:0,active?-Math.PI/4:0,0,'YXZ')
   wolf.label.mesh.scale.setScalar(active?1.22:1)
  }
  const board=this.schedules.root
  board.position.copy(this.boardHome)
  if(active)board.position.set(-69, this.boardHome.y, 65)
  board.rotation.y=active?-Math.PI/4:0
  board.updateMatrix()
 }
 mesh(geo,mat,parent,x,y,z,sx=1,sy=1,sz=1){const m=new T.Mesh(geo,this.materials[mat]);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
 block(x,y,z,w,h,d,mat,solid=false){const g=new T.Group();this.mesh(new T.BoxGeometry(w,h,d),mat,g,0,0,0);g.position.set(x,y,z);this.game.objects.add({model:g,updateMaterials:false},solid?{type:'fixed',position:{x,y,z},colliders:[{shape:'cuboid',parameters:[w/2,h/2,d/2],category:'object'}]}:null);this.objects.hideable.push(g);return g}
 sign(text,x,y,z,width,stacked=false){
  const c=document.createElement('canvas');c.width=stacked?768:1536;c.height=stacked?256:192
  const ctx=c.getContext('2d'),tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace
  const mat=new MeshDefaultMaterial({colorNode:texture(tex),...(stacked?{hasDropShadows:false,hasCoreShadows:false}:{})})
  const m=new T.Mesh(new T.PlaneGeometry(width,stacked?width/3.6:width/8),mat);m.position.set(x,y,z)
  if(stacked){m.castShadow=false;m.receiveShadow=false}
  // Frustum culling toggles the holder, preserving each leader label's own visibility.
  const holder=stacked?new T.Group():m;if(stacked)holder.add(m)
  this.game.scene.add(holder);this.objects.hideable.push(holder)
  const write=value=>{
   ctx.fillStyle=stacked?'#fff0bf':'#ffcf8b';ctx.fillRect(0,0,c.width,c.height)
   ctx.fillStyle='#383039';ctx.textAlign='center';ctx.textBaseline='middle'
   if(stacked){const lines=String(value).split(' | ');ctx.font='bold 88px sans-serif';ctx.fillText(lines[0],384,75,730);ctx.font='bold 72px sans-serif';ctx.fillText(lines.slice(1).join(' | '),384,187,730)}
   else{ctx.font='bold 76px sans-serif';ctx.fillText(value,768,96,1490)}
   tex.needsUpdate=true
  };write(text);return {mesh:m,write}
 }
 applyOptimizerState(input){this.applyState(optimizerState(input),{guides:input.guides});this.board.write(`5 of ${input.candidates.length} candidates | ITER ${input.iteration} | BEST ${input.bestMakespan.toFixed(2)} s`)}
 applyState(input,{preview=false,guides=null}={}){
  const previous=this.state,state=validateState(input);this.state=state;this.preview=preview
  const ranked=[...state.candidates].sort((a,b)=>a.fitness-b.fitness)
  state.candidates.forEach((candidate,i)=>{const wolf=this.wolves[i];const old=previous?.candidates.find(c=>c.id===candidate.id);wolf.motion=old&&(old.fitness!==candidate.fitness||old.assignment.some((v,j)=>v!==candidate.assignment[j]))?1:0;wolf.id=candidate.id;const leader=Object.entries(state.leaders).find(([,id])=>id===candidate.id)?.[0];wolf.role=leader||null;wolf.label.mesh.visible=!!leader;wolf.targetScale=leader==='alpha'?1.18:leader==='beta'?1.08:leader==='delta'?1.03:.94;wolf.mesh.userData.accents.forEach(m=>m.material=this.materials[leader||'wood']);wolf.pad.material=this.materials[leader||'wood'];wolf.label.write(`${leader?.toUpperCase()||candidate.id} | ${candidate.fitness.toFixed(2)} s`);wolf.targetRotation=ranked.findIndex(c=>c.id===candidate.id)*.12;wolf.assignment=[...candidate.assignment]})
  this.board.write(`${preview?'DEMO':'LIVE'} / ${state.iteration} / BEST ${state.bestMakespan.toFixed(2)} s`)
  this.schedules.write(state,previous,{preview,guides})
  const detail=document.getElementById('gwo-state');if(detail)detail.textContent=`${preview?'DEMO / PREVIEW — synthetic values':'External engine event'}; iteration ${state.iteration}; best makespan ${state.bestMakespan} s. `+state.candidates.map(c=>`${c.id}: [${c.assignment.join(',')}] fitness ${c.fitness}`).join('; ')
 }
 resetVisualization(){this.schedules.reset();this.state=null;this.preview=false;this.board.write('5 of 12 candidates | waiting for engine');for(const [i,w] of this.wolves.entries()){w.mesh.position.copy(w.base);w.mesh.rotation.y=w.facing||0;w.targetRotation=0;w.motion=0;w.targetScale=1;w.mesh.scale.setScalar(1);w.mesh.userData.body.rotation.z=0;w.role=null;w.label.mesh.visible=false;w.mesh.userData.accents.forEach(m=>m.material=this.materials.wood);w.pad.material=this.materials.wood;w.assignment=null;w.label.write(`CANDIDATE ${i+1} | waiting`)}this.time=0}
 update(){if(!this.wolves)return;if(this.manager.currentZone!=='gwo'&&!this.trackside) return;this.time+=this.game.ticker.delta;for(const w of this.wolves){w.motion=Math.max(0,(w.motion||0)-this.game.ticker.delta);w.mesh.position.y=w.base.y+Math.sin((1-w.motion)*Math.PI*4)*.05*w.motion;w.mesh.userData.body.scale.y=1+Math.sin(this.time*1.8+w.base.x)*.009;w.mesh.userData.head.rotation.z=Math.sin(this.time*1.1+w.base.x)*.025;w.mesh.userData.tail.rotation.x=Math.sin(this.time*1.6+w.base.x)*.12;w.mesh.scale.setScalar(w.mesh.scale.x+((w.targetScale||1)-w.mesh.scale.x)*Math.min(1,this.game.ticker.delta*4));w.mesh.rotation.y+=((w.facing||0)+w.targetRotation-w.mesh.rotation.y)*Math.min(1,this.game.ticker.delta*4);w.mesh.userData.body.rotation.z=Math.sin(this.time*1.4+w.base.x)*.012}}
}
