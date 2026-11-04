import {validateState,previewState} from './state.js'
import * as T from 'three/webgpu'
import {color,texture} from 'three/tsl'
import {Area} from '../../Game/World/Areas/Area.js'
import {MeshDefaultMaterial} from '../../Game/Materials/MeshDefaultMaterial.js'

export class GwoWorld extends Area {
 constructor(manager){
  const root=new T.Group();root.name='gwo'
  for(const name of ['refZoneBounding','refZoneFrustum']){const r=new T.Object3D();r.name=name;r.position.set(-65,0,65);r.scale.setScalar(18);r.userData.preventAutoAdd=true;root.add(r)}
  super(root);this.manager=manager;this.wolves=[];this.time=0
  this.materials={};for(const [n,c]of Object.entries({fur:'#777485',light:'#c1b9a4',dark:'#383039',wood:'#a87762',sand:'#ffcf8b'}))this.materials[n]=new MeshDefaultMaterial({colorNode:color(c)})
  const ground=(x,z)=>{const ray=new this.game.RAPIER.Ray({x,y:15,z},{x:0,y:-1,z:0});const hit=this.game.physics.world.castRayAndGetNormal(ray,30,true,undefined,undefined,undefined,manager.transitions.body);if(!hit||hit.normal.y<.97||15-hit.timeOfImpact<-.1)throw new Error('GWO placement needs dry level terrain');return 15-hit.timeOfImpact}
  this.ground=ground
  // Original terrain/circuit provides the perimeter driving route; no replacement floor.
  for(let i=0;i<5;i++){const x=-61+(i%3)*3,z=58+Math.floor(i/3)*4,y=ground(x,z);const g=this.makeWolf();g.position.set(x,y+.15,z);this.game.scene.add(g);this.objects.hideable.push(g);const label=this.sign(['ALPHA','BETA','DELTA','CANDIDATE 4','CANDIDATE 5'][i],x,y+2.4,z,2.8);this.wolves.push({id:'wolf-'+(i+1),mesh:g,label,base:g.position.clone()})}
  this.sign('GREY WOLF OPTIMIZER',-65,ground(-65,75)+3,75,9)
  for(const x of [-70,-60])this.block(x,ground(x,75)+1.5,75,.25,3,.25,'wood',true)
  this.board=this.sign('POPULATION 5 | DEMO / PREVIEW',-58,ground(-58,66)+2.7,66,7)
  this.sign('5 candidate schedules | 8 tasks / 3 VM',-58,ground(-58,66)+2,66,7)
  this.sign('Research: E / Enter',-65,ground(-65,72)+1.8,72,4)
  // Reuse Bruno's bench geometry/materials; fixed colliders remain outside driving corridor.
  const base=this.game.world.benches.instancedGroup.group
  for(const [x,z]of [[-72,59],[-72,72]]){const model=base.clone(true);model.position.set(x,ground(x,z),z);this.game.objects.add({model,updateMaterials:false});this.objects.hideable.push(model)}
  const spawn={position:[-65,65],rotation:0};manager.transitions.safeSpawn(spawn)
  manager.register({id:'gwo',name:'Wolf Field Research',center:[-65,65],radius:18,spawn})
  const gate=manager.findReturnCheckpoint({position:[39,50],rotation:0});if(!gate)throw new Error('No safe GWO gate');this.mainGate=gate;manager.createStation({zone:'main',label:'Wolf Field Research',position:[gate.position[0],1.5,gate.position[1]],onInteract:()=>manager.enter('gwo')})
  manager.createStation({zone:'gwo',label:'Kembali ke Main',position:[-65,1.5,75],onInteract:()=>manager.enter('main')})
  manager.createStation({zone:'gwo',label:'GWO Research',position:[-65,1.5,70],onInteract:()=>manager.openPanel('gwo-research')})
  this.resetVisualization();manager.registerPanel('gwo-research');manager.presentation.sections.push('gwo');manager.refresh()
 }
 mesh(geo,mat,parent,x,y,z,sx=1,sy=1,sz=1){const m=new T.Mesh(geo,this.materials[mat]);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
 makeWolf(){const g=new T.Group();this.mesh(new T.BoxGeometry(1.45,.65,.55),'fur',g,0,.85,0);this.mesh(new T.IcosahedronGeometry(.43,1),'light',g,.77,1.18,0,1,1.1,.85);this.mesh(new T.BoxGeometry(.5,.25,.3),'light',g,1.08,1.08,0);this.mesh(new T.BoxGeometry(.09,.14,.29),'dark',g,1.35,1.1,0);for(const z of [-.23,.23]){this.mesh(new T.ConeGeometry(.16,.38,3),'fur',g,.7,1.65,z);this.mesh(new T.BoxGeometry(.18,.65,.16),'fur',g,-.5,.36,z);this.mesh(new T.BoxGeometry(.18,.65,.16),'fur',g,.5,.36,z);this.mesh(new T.SphereGeometry(.045,6,4),'dark',g,.97,1.3,z*1.3)}const tail=this.mesh(new T.ConeGeometry(.18,.9,6),'fur',g,-1,.8,0);tail.rotation.z=-.9;return g}
 block(x,y,z,w,h,d,mat,solid=false){const g=new T.Group();this.mesh(new T.BoxGeometry(w,h,d),mat,g,0,0,0);g.position.set(x,y,z);this.game.objects.add({model:g,updateMaterials:false},solid?{type:'fixed',position:{x,y,z},colliders:[{shape:'cuboid',parameters:[w/2,h/2,d/2],category:'object'}]}:null);this.objects.hideable.push(g);return g}
 sign(text,x,y,z,width){const c=document.createElement('canvas');c.width=1536;c.height=192;const ctx=c.getContext('2d');const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;const mat=new MeshDefaultMaterial({colorNode:texture(tex)});const m=new T.Mesh(new T.PlaneGeometry(width,width/8),mat);m.position.set(x,y,z);this.game.scene.add(m);this.objects.hideable.push(m);const write=value=>{ctx.fillStyle='#ffcf8b';ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle='#383039';ctx.font='bold 76px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(value,768,96,1490);tex.needsUpdate=true};write(text);return {mesh:m,write}}
 applyState(input,{preview=false}={}){
  const state=validateState(input);this.state=state;this.preview=preview
  const ranked=[...state.candidates].sort((a,b)=>a.fitness-b.fitness)
  state.candidates.forEach((candidate,i)=>{const wolf=this.wolves[i];wolf.id=candidate.id;const leader=Object.entries(state.leaders).find(([,id])=>id===candidate.id)?.[0];wolf.label.write(`${leader?.toUpperCase()||'CANDIDATE'} | ${candidate.fitness.toFixed(2)} s`);wolf.targetRotation=ranked.findIndex(c=>c.id===candidate.id)*.12;wolf.assignment=[...candidate.assignment]})
  this.board.write(`${preview?'DEMO/PREVIEW':'ENGINE EVENT'} | ITER ${state.iteration} | BEST ${state.bestMakespan.toFixed(2)} s`)
  const detail=document.getElementById('gwo-state');if(detail)detail.textContent=`${preview?'DEMO / PREVIEW — synthetic values':'External engine event'}; iteration ${state.iteration}; best makespan ${state.bestMakespan} s. `+state.candidates.map(c=>`${c.id}: [${c.assignment.join(',')}] fitness ${c.fitness}`).join('; ')
 }
 resetVisualization(){this.applyState(previewState,{preview:true});for(const w of this.wolves){w.mesh.position.copy(w.base);w.mesh.rotation.y=0}this.time=0}
 update(){if(!this.wolves)return;this.time+=this.game.ticker.delta;for(const w of this.wolves){w.mesh.rotation.y+=(w.targetRotation-w.mesh.rotation.y)*Math.min(1,this.game.ticker.delta*4);w.mesh.position.y=w.base.y+Math.sin(this.time*2+w.base.x)*.025}}
}
