import test from 'node:test';import assert from 'node:assert/strict';
import {CatmullRomCurve3,Vector3,TubeGeometry} from 'three/webgpu';
import {createPheromoneGeometry,setPheromoneRadius} from '../sources/CloudOps/aco/PheromoneGeometry.js';
test('reused pheromone buffer matches fresh tube geometry without changing identity',()=>{
 const curve=new CatmullRomCurve3([new Vector3(3,.61,.5),new Vector3(3,.61,-2),new Vector3(-1,.61,-4),new Vector3(-1,.61,-6)]);
 const geometry=createPheromoneGeometry(curve),position=geometry.attributes.position,id=geometry.uuid;let disposals=0;geometry.addEventListener('dispose',()=>disposals++);
 for(const radius of [.04,.2,.08,.15,.04,.2]){
  setPheromoneRadius(geometry,radius);const expected=new TubeGeometry(curve,32,radius,5,false);
  for(let i=0;i<position.array.length;i++)assert.ok(Math.abs(position.array[i]-expected.attributes.position.array[i])<2e-6);
  assert.equal(geometry.uuid,id);assert.equal(geometry.attributes.position,position);assert.ok(geometry.boundingSphere.radius>0);expected.dispose();
 }
 assert.equal(disposals,0);assert.throws(()=>setPheromoneRadius(geometry,NaN),RangeError);geometry.dispose();
});
