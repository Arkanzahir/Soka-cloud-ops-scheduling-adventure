import * as T from 'three/webgpu'
import {color,texture} from 'three/tsl'
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js'
import {TTFLoader} from 'three/addons/loaders/TTFLoader.js'
import {Font} from 'three/addons/loaders/FontLoader.js'
import {TextGeometry} from 'three/addons/geometries/TextGeometry.js'
import {MeshDefaultMaterial} from '../../Game/Materials/MeshDefaultMaterial.js'
import {DESTINATIONS} from './content.js'
import './campus.css'

export class MainHub {
 constructor(game){
  this.game=game;this.root=new T.Group();this.root.name='group8-campus';game.scene.add(this.root);this.ready=false;this.textures=[];
  this.materials={};for(const [key,value]of Object.entries({wood:'#a87762',cream:'#fff0bf',coral:'#db7957',sage:'#a5ab65',teal:'#5b9a92',dark:'#383039'}))this.materials[key]=new MeshDefaultMaterial({colorNode:color(value)});
  this.boxGeometry=new RoundedBoxGeometry(1,1,1,2,.06);
  this.retiredLetters=game.world.areas.landing.references.items.get('letters');
  for(const reference of this.retiredLetters){const object=reference.userData.object;game.objects.disable(object);object.visual.object3D.visible=false;}
  const social=game.world.areas.social;
  this.retiredSocial=[];
  for(const object of social.objects.items)if(/^(onlyfans|bluesky|discord|github|linkedin|mail|twitch|x|youtube)/i.test(object.visual?.object3D.name||'')){game.objects.disable(object);object.visual.object3D.visible=false;this.retiredSocial.push(object);}
  this.landmark=new T.Group();this.landmark.name='cloud-ops-welcome';this.landmark.position.set(44,0,43);this.landmark.rotation.y=Math.PI/4;this.root.add(this.landmark);
  this.box(this.landmark,0,.18,0,8,.36,1.35,'wood');
  this.box(this.landmark,0,.43,0,7.6,.16,1.05,'sage');
  this.label(this.landmark,'SCHEDULING ADVENTURE',0,1.13,.04,5.9,.48);
  this.label(this.landmark,'KELOMPOK 8  /  SOKA',0,.68,.08,3.6,.4,'#5b9a92','#fff0bf');
  for(const [x,height]of [[-3.6,1.2],[3.6,1.65]]){this.box(this.landmark,x,height/2+.3,0,.7,height,.85,'teal');for(const y of [.65,.9])this.box(this.landmark,x,y,.45,.45,.1,.04,'cream');}
  game.ticker.events.on('tick',()=>{this.root.visible=(game.world.cloudOps?.currentZone??'main')==='main'},10);
  this.readyPromise=new TTFLoader().loadAsync('fonts/Nunito.ttf').then(data=>{
   const geometry=new TextGeometry('CLOUD OPS',{font:new Font(data),size:.9,depth:.14,curveSegments:2,bevelEnabled:true,bevelThickness:.018,bevelSize:.015,bevelSegments:1});geometry.computeBoundingBox();geometry.translate(-(geometry.boundingBox.min.x+geometry.boundingBox.max.x)/2,0,0);
   const mesh=new T.Mesh(geometry,this.materials.cream);mesh.position.set(0,1.55,0);mesh.castShadow=true;this.landmark.add(mesh);this.title=mesh;this.freeze();this.ready=true;
  }).catch(error=>{this.lastError=error.message;this.label(this.landmark,'CLOUD OPS',0,1.95,0,6.3,.85);this.freeze();this.ready=true;});
 }
 setWayfinding(){
  this.signs=[];
  for(const destination of DESTINATIONS){
   const area=this.game.world.areas[destination.id];
   const position=destination.id==='gwo'?area.mainGate.position:[area.entry.position.x,area.entry.position.z];
   const isAco=destination.id==='aco';
   const ground=isAco?area.entry.position.y-1.5:0;
   const sign=new T.Group();
   sign.name='campus-wayfinding-'+destination.id;
   sign.position.set(position[0] - (isAco ? .9 : 2), ground, position[1] - (isAco ? .9 : 2.2));
   sign.rotation.y=Math.PI/4;
   this.root.add(sign);
   for(const x of [-1.75,1.75])this.box(sign,x,.8,0,.14,1.6,.18,'wood');
   this.box(sign,0,1.72,-.06,4.1,1.0,.18,'wood');
   this.label(sign,destination.title,0,1.92,.05,3.85,.34,destination.color,'#fff0bf');
   this.label(sign,destination.subtitle,0,1.58,.05,3.85,.28);
   this.label(sign,isAco?'LINGKARAN · E / ENTER':'GERBANG  →  E / ENTER',0,1.08,.05,3.1,.26);
   if(isAco){
    const ring=new T.Mesh(new T.RingGeometry(1.85,2,36),this.materials.coral);
    ring.name='aco-entry-marker';
    ring.rotation.x=-Math.PI/2;
    ring.position.set(position[0],ground+.045,position[1]);
    this.root.add(ring);
   }
   this.signs.push({destination,group:sign});
  }
  this.freeze();
  this.bindUI();
 }
 box(parent,x,y,z,w,h,d,material){const mesh=new T.Mesh(this.boxGeometry,this.materials[material]);mesh.position.set(x,y,z);mesh.scale.set(w,h,d);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh}
 label(parent,text,x,y,z,w,h,background='#fff0bf',foreground='#383039'){
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=160;const ctx=canvas.getContext('2d');ctx.fillStyle=background;ctx.fillRect(0,0,1024,160);ctx.fillStyle=foreground;ctx.font='bold 64px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,512,80,980);
  const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;this.textures.push(tex);const material=new MeshDefaultMaterial({colorNode:texture(tex),hasDropShadows:false,hasCoreShadows:false});
  const mesh=new T.Mesh(new T.PlaneGeometry(w,h),material);mesh.position.set(x,y,z);parent.add(mesh);return mesh;
 }
 freeze(){this.root.updateMatrixWorld(true);this.root.traverse(object=>{object.updateMatrix();object.matrixAutoUpdate=false})}
 bindUI(){
  let busy=false;
  for(const button of document.querySelectorAll('[data-campus-start]'))button.onclick=async()=>{
   if(busy||this.game.menu.state!==1)return;busy=true;button.disabled=true;
   try{await new Promise(resolve=>{const done=()=>{this.game.menu.events.off('closed',done);resolve()};this.game.menu.events.on('closed',done);this.game.menu.close()});await this.game.world.learning.startPresentation()}
   finally{busy=false;button.disabled=false}
  };
 }
}
