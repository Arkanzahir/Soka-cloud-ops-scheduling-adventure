import * as T from 'three/webgpu'
import { AcoWorld } from './aco/AcoWorld.js'
export function registerAcoWorld(game,manager){
 const world=new AcoWorld(game,new T.Vector3(220,0,0));
 world.isActive=()=>manager.currentZone==='aco';
 manager.register({id:'aco',name:'Ant Research Park',center:[220,0],radius:24,spawn:{position:[220,8],rotation:Math.PI/2}});
 // Put the entrance on the paved spawn plaza, clear of the pond and Cloud gate.
 const gate=manager.findReturnCheckpoint({position:[42,35],rotation:0});if(!gate)throw Error('ACO gate unavailable');
 const [x,z]=gate.position;
 const ground=manager.transitions.safeSpawn(gate).y-1.7;
 world.entry=manager.createStation({zone:'main',label:'Ant Research Park',position:[x,ground+1.5,z],onInteract:()=>manager.enter('aco')});
 world.exit=manager.createStation({zone:'aco',label:'Kembali ke Main',position:[220,1.5,12],onInteract:()=>manager.enter('main')});
 world.onResearch=()=>{if(manager.currentZone==='aco'&&manager.canInteract()&&game.player.position.distanceTo(new T.Vector3(211,1,7))<3)world.onLearn?world.onLearn():manager.openPanel('aco-research')};
 manager.registerPanel('aco-research');manager.presentation.sections.push('aco');return world;
}
