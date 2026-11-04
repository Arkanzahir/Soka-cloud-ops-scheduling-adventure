import * as THREE from 'three/webgpu'
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
  super(model);this.manager=manager;this.kit=new YardKit(this);this.tasks=[];this.previewMode=false
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
  const size=new THREE.Box3().setFromObject(brick).getSize(new THREE.Vector3());brick.scale.multiply(new THREE.Vector3(2.5/size.x,2.2/size.y,2/size.z))
  const bounds=new THREE.Box3().setFromObject(brick),center=bounds.getCenter(new THREE.Vector3());brick.position.set(-center.x,-bounds.min.y,-center.z)
  const group=new THREE.Group();group.add(brick)
  const object=this.game.objects.add({model:group,updateMaterials:false},{type:'fixed',position:{x,y:0,z},colliders:[{shape:'cuboid',parameters:[1.25,1.1,1],position:{x:0,y:1.1,z:0},category:'object'}]});this.objects.items.push(object);this.objects.hideable.push(group)
  const k=this.kit,accent=['coral','sage','blue'][index]
  k.box(x,.16,z,3.3,.32,2.8,'wood',true);k.box(x,2.45,z,2.7,.5,2.2,accent)
  for(let i=0;i<3;i++){k.box(x,.75+i*.45,z+1.03,1.8,.14,.12,'dark');k.box(x+.95,.75+i*.45,z+1.04,.12,.12,.14,accent)}
  const badge=k.label(`VM${index+1} | ${[600,1000,1500][index]} MIPS`,x,3.1,z,4.8,.75)
  const loadLabel=k.label('LOAD 0.00 s',x,2.5,z+2,3.5,.6)
  k.box(x,.12,z+3.7,4.6,.24,3.2,'sand')
  const bar=k.box(x-1.8,.45,z+5.3,.08,.22,.2,accent);bar.geometry.translate(.5,0,0)
  const selection=k.mesh(new THREE.TorusGeometry(1.9,.07,6,32),accent,new THREE.Vector3(x,.2,z));selection.rotation.x=Math.PI/2;selection.visible=false
  return {object,visual:object.visual,physical:object.physical,x,z,loadLabel,bar,selection,badge,load:0}
 }
 buildQueue(){const k=this.kit;k.box(-65,.18,-32,13,.36,2.2,'wood',true)
  TASK_MI.forEach((mi,i)=>{const group=new THREE.Group(),x=-70.25+i*1.5,z=-32;group.position.set(x,.4,z);const height=.55+mi/6500;k.mesh(new THREE.BoxGeometry(.95,height,.95),['coral','sage','blue'][i%3],new THREE.Vector3(0,height/2,0),group);for(const dx of [-.31,.31])k.mesh(new THREE.BoxGeometry(.07,height+.05,1), 'wood',new THREE.Vector3(dx,height/2,0),group);this.game.scene.add(group);this.objects.hideable.push(group);const label=k.label(`T${i+1} | ${mi} MI`,x,1.7,z+.5,1.65,.5);const home=group.position.clone();this.tasks.push({id:`T${i+1}`,mesh:group,label,home,vm:null})})
  k.sign('TASK QUEUE | MI = workload',-65,-30.2,8,2.8)
 }
 buildEnvironment(){const k=this.kit
  k.path(-65,-25,25,4);k.path(-77,-35,4,22);k.path(-53,-35,4,22);k.path(-65,-46,25,4)
  k.sign('CLOUD COMPUTE YARD',-65,-23,12,3.8);k.label('8 Tasks | 3 Virtual Machines',-65,3,-22.7,8,.65)
  k.sign('PRESS E | LEARN SCHEDULING',-78,-32,5,2.5);k.sign('MI: work | MIPS: speed',-78,-37,5,2.5)
  k.sign('Makespan = longest VM load',-65,-44,8,3)
  this.makespanLabel=k.label('MAKESPAN: waiting for data',-65,2.25,-43.7,7,.65)
  // Reuse the original bench template along the roadside, outside the safe stop.
  for(const [x,z]of [[-78,-26],[-52,-44]]){const model=this.game.world.benches.instancedGroup.group.clone(true);model.position.set(x,0,z);this.game.objects.add({model,updateMaterials:false});this.objects.hideable.push(model)}
  const refs=[];for(const [x,z]of [[-79,-44],[-51,-28],[-51,-43],[-78,-22]]){const r=new THREE.Object3D();r.position.set(x,0,z);r.scale.setScalar(.65);r.updateMatrixWorld();refs.push(r)}
  this.trees=new Trees('Cloud yard',this.game.resources.oakTreesVisualModel.scene.clone(true),refs,'#b4b536','#d8cf3b')
  // Low wooden boundaries frame the beds; all corners leave four-unit driving clearance.
  for(const x of [-73,-57])for(const z of [-46,-23]){k.box(x,.5,z,.16,1,.16,'wood');k.box(x+1,.65,z,2,.12,.12,'wood')}
 }
}
