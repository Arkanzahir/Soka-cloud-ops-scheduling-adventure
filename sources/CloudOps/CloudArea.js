import {allocationEvent,scheduleState} from './cloud/visualState.js'
import * as THREE from 'three/webgpu'
import {texture} from 'three/tsl'
import {MeshDefaultMaterial} from '../Game/Materials/MeshDefaultMaterial.js'
import { Area } from '../Game/World/Areas/Area.js'
import { YardKit } from './cloud/YardKit.js'
import { Trees } from '../Game/World/Trees.js'

export const CLOUD_LAYOUT={center:[-65,-35],radius:20,spawn:{position:[-65,-25],rotation:0},exit:[-55,1.5,-25],station:[-76,1.5,-30]}
export const TASK_MI=[1200,2400,1800,3200,2100,1500,2700,3600]
export class CloudArea extends Area {
 constructor(manager){
  const {center,radius,spawn}=CLOUD_LAYOUT
  const model=new THREE.Group();model.name='cloudArea'
  for(const name of ['refZoneBounding','refZoneFrustum']){const reference=new THREE.Object3D();reference.name=name;reference.position.set(center[0],0,center[1]);reference.scale.setScalar(radius);reference.userData.preventAutoAdd=true;model.add(reference)}
  super(model);this.manager=manager;this.kit=new YardKit(this);this.tasks=[];this.previewMode=false;this.motionPosition=new THREE.Vector3()
  // Probe before creating geometry, then validate again after the yard has colliders.
  manager.transitions.safeSpawn(spawn)
  this.vms=[-71,-65,-59].map((x,i)=>this.addVM(i,x,-40))
  this.buildQueue();this.buildEnvironment()
  manager.transitions.safeSpawn(spawn)
  manager.register({id:'cloud',name:'Cloud Compute Yard',center,radius,spawn})
  this.entry=manager.createStation({zone:'main',label:'Cloud Compute Yard',position:[49,1.5,34.5],onInteract:()=>manager.enter('cloud')})
  this.exit=manager.createStation({zone:'cloud',label:'Kembali ke Main',position:CLOUD_LAYOUT.exit,onInteract:()=>manager.enter('main')})
  this.station=manager.createStation({zone:'cloud',label:'Learn scheduling',position:CLOUD_LAYOUT.station,onInteract:()=>this.onLearn?this.onLearn():manager.openPanel('cloud-foundation')})
  manager.registerPanel('cloud-foundation')
 }
 addVM(index,x,z){
  // Retain M3's original Bruno brick body, geometry and materials.
  const brick=this.game.world.bricks.instancedGroup.group.clone(true);brick.position.set(0,0,0);brick.quaternion.identity()
  const size=new THREE.Box3().setFromObject(brick).getSize(new THREE.Vector3());brick.scale.multiply(new THREE.Vector3(2.7/size.x,.3/size.y,2.4/size.z))
  const bounds=new THREE.Box3().setFromObject(brick),center=bounds.getCenter(new THREE.Vector3());brick.position.set(-center.x,-bounds.min.y,-center.z)
  const group=new THREE.Group();group.add(brick)
  const object=this.game.objects.add({model:group,updateMaterials:false},{type:'fixed',position:{x,y:0,z},colliders:[{shape:'cuboid',parameters:[1.25,1.1,1],position:{x:0,y:1.1,z:0},category:'object'}]});this.objects.items.push(object);this.objects.hideable.push(group)
  const k=this.kit,accent=['coral','sage','blue'][index]
  k.rounded(x,.23,z,3.2,.46,2.8,'wood')
  k.rounded(x,1.55,z,2.5,2.6,2.1,'cream')
  k.rounded(x,1.6,z+1.05,2.16,2.2,.16,'dark')
  k.rounded(x,2.91,z,2.7,.28,2.3,accent)
  // One, two or three cooling stacks make capacity visible without reading text.
  for(let j=0;j<=index;j++){
   const offset=(j-index*.5)*.72
   k.mesh(new THREE.CylinderGeometry(.3,.34,.55,10),accent,new THREE.Vector3(x+offset,3.25,z))
   k.mesh(new THREE.CylinderGeometry(.22,.22,.06,10),'dark',new THREE.Vector3(x+offset,3.56,z))
  }
  for(let j=0;j<3;j++)k.rounded(x,1.7+j*.18,z+1.16,1.7,.07,.05,'wood')
  const badge=k.label(`VM${index+1}\n${[600,1000,1500][index]} MIPS`,x,2.45,z+1.19,2.05,.65)
  const loadLabel=k.label('LOAD 0.00 s',x,1.15,z+1.19,2,.42)
  k.rounded(x,.12,z+3.7,4.6,.24,3.2,'sand')
  for(const dx of [-2,2])k.box(x+dx,.3,z+3.7,.12,.15,3,accent)
  const bar=k.box(x-1.05,.68,z+1.19,.05,.13,.07,accent);bar.geometry.translate(.025,0,0)
  const activity=k.mesh(new THREE.IcosahedronGeometry(.09,1),accent,new THREE.Vector3(x+.84,.68,z+1.2)); const selection=k.mesh(new THREE.TorusGeometry(1.9,.07,6,32),accent,new THREE.Vector3(x,.2,z));selection.rotation.x=Math.PI/2;selection.visible=false
  return {object,visual:object.visual,physical:object.physical,x,z,loadLabel,bar,selection,badge,activity,load:0}
 }
 buildQueue(){const k=this.kit
  // Two staggered rows on a compact dispatch dock. Face labels travel with their modules.
  k.rounded(-65,.18,-31.5,10,.36,4.2,'wood')
  // One static painted surface; these are parking outlines, never duplicate task actors.
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=512
  const ctx=canvas.getContext('2d');ctx.fillStyle='#a87762';ctx.fillRect(0,0,1024,512)
  ctx.strokeStyle='#fff0bf';ctx.lineWidth=5;ctx.fillStyle='#fff0bf';ctx.font='bold 38px sans-serif';ctx.textAlign='left'
  for(let i=0;i<TASK_MI.length;i++){
   const x=58+(i%4)*251,z=35+Math.floor(i/4)*256
   ctx.strokeRect(x,z,155,202);ctx.fillText(`T${i+1}`,x+12,z+43)
  }
  const paint=new THREE.CanvasTexture(canvas);paint.colorSpace=THREE.SRGBColorSpace
  const markings=k.mesh(new THREE.PlaneGeometry(9.8,4),new MeshDefaultMaterial({colorNode:texture(paint),hasDropShadows:false,hasCoreShadows:false}),new THREE.Vector3(-65,.365,-31.5))
  markings.rotation.x=-Math.PI/2;markings.castShadow=false;markings.receiveShadow=false
  TASK_MI.forEach((mi,i)=>{
   const group=new THREE.Group(),x=-68.6+(i%4)*2.4,z=-32.5+Math.floor(i/4)*2
   group.position.set(x,.4,z);const height=.76+mi/14000,accent=['coral','sage','blue'][i%3]
   k.rounded(0,height/2,0,1.24,height,1.05,accent,group)
   k.rounded(0,.12,0,1.34,.24,1.15,'wood',group)
   k.rounded(0,height+.08,0,.7,.14,.35,'dark',group)
   for(const dx of [-.46,.46])k.rounded(dx,height/2,.53,.09,height*.7,.07,'cream',group)
   this.game.scene.add(group);this.objects.hideable.push(group)
   const label=k.label(`T${i+1}\n${mi} MI`,x,.4+height*.55,z+.65,1,.67)
   const home=group.position.clone();this.tasks.push({id:`T${i+1}`,mesh:group,label,home,labelOffset:new THREE.Vector3(0,height*.55,.65),vm:null})
  })
  k.sign('TASK DISPATCH',-72,-30.5,3,1.8)
 } buildEnvironment(){const k=this.kit
  k.path(-65,-25,25,4);k.path(-77,-35,4,22);k.path(-53,-35,4,22);k.path(-65,-46,25,4)
  // Identity sits at the roadside rather than across the windscreen.
  k.sign('CLOUD COMPUTE YARD',-73,-23,5.2,2.5)
  k.label('8 TASKS / 3 VMs',-73,1.85,-22.8,3.5,.4)
  k.rounded(-78,1.15,-33,3.1,2.3,1.2,'wood')
  k.rounded(-78,2.5,-33,3.7,.28,2,'coral')
  k.label('RESEARCH / E',-78,2,-32.35,2.7,.45)
  k.label('MI = work / MIPS = speed',-78,1.45,-32.35,2.8,.35)
  this.makespanLabel=k.label('MAKESPAN: waiting for data',-78,.93,-32.35,2.8,.4)
  // Small utility cabinet and cable reel frame the facility without blocking the drive.
  k.rounded(-74,.55,-43,1.2,1.1,1,'dark')
  k.mesh(new THREE.CylinderGeometry(.45,.45,.5,10),'wood',new THREE.Vector3(-75,.5,-43)).rotation.z=Math.PI/2  // Reuse the original bench template along the roadside, outside the safe stop.
  for(const [x,z]of [[-78,-26],[-52,-44]]){const model=this.game.world.benches.instancedGroup.group.clone(true);model.position.set(x,0,z);this.game.objects.add({model,updateMaterials:false});this.objects.hideable.push(model)}
  const refs=[];for(const [x,z]of [[-79,-44],[-51,-28],[-51,-43],[-78,-22]]){const r=new THREE.Object3D();r.position.set(x,0,z);r.scale.setScalar(.65);r.updateMatrixWorld();refs.push(r)}
  this.trees=new Trees('Cloud yard',this.game.resources.oakTreesVisualModel.scene.clone(true),refs,'#b4b536','#d8cf3b')
  // Low wooden boundaries frame the beds; all corners leave four-unit driving clearance.
  for(const x of [-73,-57])for(const z of [-46,-23]){k.box(x,.5,z,.16,1,.16,'wood');k.box(x+1,.65,z,2,.12,.12,'wood')}
 }
 // M5 supplies all numerical values. This layer only validates and displays them.
 allocationTarget(taskIndex,vmIndex){const vm=this.vms[vmIndex];return new THREE.Vector3(vm.x-1.3+(taskIndex%2)*1.3,.38,vm.z+2.7+Math.floor(taskIndex/2)*.7)}
 applyAllocation(input){
  let event;try{event=allocationEvent(input)}catch(error){this.lastVisualizationError=error.message;return false}
  this.lastVisualizationError=null;this.lastAllocation=event
  const task=this.tasks[event.taskIndex];task.vm=event.vmIndex
  task.motion={from:task.mesh.position.clone(),to:this.allocationTarget(event.taskIndex,event.vmIndex),elapsed:0,duration:1.4}
  this.tasks.forEach(t=>t.mesh.scale.setScalar(t===task?1.12:1));this.vms.forEach((vm,i)=>vm.selection.visible=i===event.vmIndex)
  this.displayLoads(event.vmLoads,Math.max(...event.vmLoads));return true
 }
 displayLoads(loads,makespan){const max=Math.max(...loads,1);this.vms.forEach((vm,i)=>{vm.load=loads[i];vm.loadLabel.write(`LOAD ${loads[i].toFixed(2)} s`);vm.bar.scale.x=35*loads[i]/max+.01});this.makespanLabel.write(`${this.previewMode?'DEMO/PREVIEW | ':''}MAKESPAN ${makespan.toFixed(3)} s`)}
 positionTask(task,position){task.mesh.position.copy(position);task.label.mesh.position.copy(position).add(task.labelOffset)}
 applySchedule(input){let state;try{state=scheduleState(input)}catch(error){this.lastVisualizationError=error.message;return false}this.resetVisualization();this.tasks.forEach((task,i)=>{task.vm=state.assignments[i];this.positionTask(task,this.allocationTarget(i,task.vm))});this.displayLoads(state.vmLoads,state.makespan);return true}
 resetVisualization(){this.tasks.forEach(task=>{task.motion=null;task.vm=null;task.mesh.scale.setScalar(1);this.positionTask(task,task.home)});this.vms.forEach(vm=>vm.selection.visible=false);this.lastAllocation=null;this.lastVisualizationError=null;this.displayLoads([0,0,0],0)}
 setPreviewMode(enabled){this.previewMode=!!enabled;this.displayLoads(this.vms.map(vm=>vm.load),Math.max(...this.vms.map(vm=>vm.load)))}
 update(){if(!this.tasks)return;const dt=this.game.ticker.delta;for(const vm of this.vms){vm.activity.scale.setScalar(vm.selection.visible?1.25+Math.sin(this.game.ticker.elapsed*4)*.2:1)}for(const task of this.tasks){if(!task.motion)continue;const m=task.motion;m.elapsed=Math.min(m.duration,m.elapsed+dt);const p=m.elapsed/m.duration,eased=p*p*(3-2*p),position=this.motionPosition;position.copy(m.from).lerp(m.to,eased);position.y+=Math.sin(p*Math.PI)*1.25;this.positionTask(task,position);if(p===1){task.motion=null;task.mesh.scale.setScalar(1)}}}
}
