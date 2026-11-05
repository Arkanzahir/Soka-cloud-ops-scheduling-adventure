import {TubeGeometry,Vector3,DynamicDrawUsage} from 'three/webgpu'

// Keep curve centers and radial normals fixed; only upload the changed tube radius.
export function createPheromoneGeometry(curve){
 const geometry=new TubeGeometry(curve,32,.075,5,false);
 const centers=new Float32Array(geometry.attributes.position.array.length),point=new Vector3();
 for(let ring=0;ring<=32;ring++){
  curve.getPointAt(ring/32,point);
  for(let side=0;side<=5;side++){const i=(ring*6+side)*3;centers[i]=point.x;centers[i+1]=point.y;centers[i+2]=point.z}
 }
 geometry.userData.pheromoneCenters=centers;
 geometry.attributes.position.setUsage(DynamicDrawUsage);
 return geometry;
}
export function setPheromoneRadius(geometry,radius){
 if(!Number.isFinite(radius)||radius<=0)throw new RangeError('Pheromone radius must be positive');
 const position=geometry.attributes.position,normal=geometry.attributes.normal,centers=geometry.userData.pheromoneCenters;
 for(let i=0;i<position.array.length;i++)position.array[i]=centers[i]+normal.array[i]*radius;
 position.needsUpdate=true;geometry.parameters.radius=radius;geometry.computeBoundingSphere();
}
