import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js'
import * as T from 'three/webgpu'
import {color,texture,uv,mix} from 'three/tsl'
import {MeshDefaultMaterial} from '../../Game/Materials/MeshDefaultMaterial.js'

// All new meshes use Bruno's existing node shading; original textures remain shared.
export class YardKit {
 constructor(area){this.area=area;this.game=area.game;this.materials={};for(const [key,value]of Object.entries({wood:'#a87762',sand:'#ffcf8b',dark:'#383039',cream:'#fff0bf',coral:'#db7957',sage:'#b4b536',blue:'#5bc2b9'}))this.materials[key]=new MeshDefaultMaterial({colorNode:color(value)})}
 mesh(geometry,material,position,parent=this.game.scene){const mesh=new T.Mesh(geometry,typeof material==='string'?this.materials[material]:material);mesh.position.copy(position);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);if(parent===this.game.scene)this.area.objects.hideable.push(mesh);return mesh}
 box(x,y,z,w,h,d,material='wood',solid=false){const mesh=this.mesh(new T.BoxGeometry(w,h,d),material,new T.Vector3(x,y,z));if(solid){const object=this.game.objects.add(null,{type:'fixed',position:{x,y,z},colliders:[{shape:'cuboid',parameters:[w/2,h/2,d/2],category:'object'}]});this.area.objects.items.push(object)}return mesh}
 rounded(x,y,z,w,h,d,mat,parent=this.game.scene){return this.mesh(new RoundedBoxGeometry(w,h,d,2,Math.min(w,h,d)*.12),mat,new T.Vector3(x,y,z),parent)}
 label(text,x,y,z,width=4,height=.65){const canvas=document.createElement('canvas');const multiline=String(text).includes('\n');canvas.width=multiline?512:1024;canvas.height=multiline?384:192;const ctx=canvas.getContext('2d');const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;const material=new MeshDefaultMaterial({colorNode:texture(tex),hasDropShadows:false,hasCoreShadows:false});const mesh=this.mesh(new T.PlaneGeometry(width,height),material,new T.Vector3(x,y,z));mesh.castShadow=false;mesh.receiveShadow=false;const write=value=>{ctx.fillStyle='#fff0bf';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#383039';ctx.textAlign='center';ctx.textBaseline='middle';const lines=String(value).split('\n');lines.forEach((line,i)=>{ctx.font=multiline?(i===0?'bold 150px sans-serif':'bold 86px sans-serif'):'bold 110px sans-serif';ctx.fillText(line,canvas.width/2,multiline?110+i*165:96,canvas.width-32)});tex.needsUpdate=true};write(text);return {mesh,write,texture:tex}}
 sign(text,x,z,width=5,y=2){this.box(x,y,z,width,.85,.22,'wood',true);for(const dx of [-width*.4,width*.4])this.box(x+dx,y*.5,z,.16,y,.16,'wood',true);return this.label(text,x,y,z+.18,width-.2,.65)}
 path(x,z,w,d){const mat=new MeshDefaultMaterial({colorNode:mix(color('#a87762'),color('#ffcf8b'),texture(this.game.resources.floorSlabsTexture,uv().mul(4)).r)});const m=this.mesh(new T.PlaneGeometry(w,d),mat,new T.Vector3(x,.018,z));m.rotation.x=-Math.PI/2;m.castShadow=false;return m}
}



