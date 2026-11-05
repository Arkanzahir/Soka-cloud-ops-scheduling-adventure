import * as T from 'three/webgpu'
import {texture} from 'three/tsl'
import {MeshDefaultMaterial} from '../../Game/Materials/MeshDefaultMaterial.js'
import {candidateView} from './candidateView.js'

// One cached texture, redrawn on engine events/reset only. No colliders or extra input/UI.
export class CandidateBoard {
 constructor(world){
  this.canvas=document.createElement('canvas');this.canvas.width=1024;this.canvas.height=512
  this.ctx=this.canvas.getContext('2d');this.ctx.scale(2/3,2/3);this.texture=new T.CanvasTexture(this.canvas);this.texture.colorSpace=T.SRGBColorSpace
  this.root=new T.Group();this.root.name='gwo-candidate-schedules'
  this.root.position.set(-69,world.ground(-69,75),75)
  const frame=world.mesh(new T.BoxGeometry(7.8,4,.16),'wood',this.root,0,2.4,0)
  const postGeometry=new T.BoxGeometry(.16,2.4,.16)
  for(const x of [-3,3]){const post=world.mesh(postGeometry,'wood',this.root,x,1.2,0);post.castShadow=false}
  frame.castShadow=false
  const material=new MeshDefaultMaterial({colorNode:texture(this.texture),hasDropShadows:false,hasCoreShadows:false})
  this.mesh=new T.Mesh(new T.PlaneGeometry(7.6,3.8),material);this.mesh.position.set(0,2.4,.09);this.root.add(this.mesh)
  world.game.scene.add(this.root);world.objects.hideable.push(this.root)
  this.root.updateMatrixWorld(true);this.root.traverse(o=>{o.matrixAutoUpdate=false;o.updateMatrix()})
  this.drawCount=0;this.reset()
 }
 text(value,x,y,size=38,align='left',color='#383039'){
  const c=this.ctx;c.fillStyle=color;c.font=`bold ${size}px sans-serif`;c.textAlign=align;c.textBaseline='middle';c.fillText(value,x,y,align==='left'?1490-x:1460)
 }
 write(state,previous,options){this.view=candidateView(state,previous,options);this.draw()}
 reset(){this.view=null;this.draw()}
 draw(){
  const c=this.ctx,v=this.view,vmColors=['#db7957','#b4b536','#5bc2b9']
  c.fillStyle='#fff0bf';c.fillRect(0,0,1536,768)
  this.text('SATU SERIGALA = SATU CALON JADWAL',768,58,54,'center')
  this.text(v?`${v.preview?'DEMO / ':''}ITERASI ${v.iteration}  |  REKOR ${v.bestMakespan.toFixed(2)} s`:'TEKAN LANGKAH / PLAY DI STASIUN GWO',768,119,36,'center')
  this.text('KANDIDAT / PERAN',45,189,30)
  for(let i=0;i<8;i++)this.text(`T${i+1}`,435+i*98,189,40,'center')
  this.text('MAKESPAN',1380,189,30,'center')
  for(let r=0;r<5;r++){
   const row=v?.rows[r],y=256+r*76
   c.fillStyle=r%2?'#efddb8':'#f8e8c7';c.fillRect(28,y-35,1480,71)
   this.text(`${r+1}. ${row?.role?.toUpperCase()||'KANDIDAT'}`,45,y-12,32)
   this.text(row?`${row.id}${row.comparison==='newly-visible'?' · MASUK PILIHAN':''}`:'menunggu engine',45,y+21,25)
   for(let t=0;t<8;t++){
    const x=395+t*98;c.fillStyle=row?vmColors[row.assignment[t]]:'#ddc7a3';c.fillRect(x,y-27,80,54)
    c.strokeStyle=row?.changed[t]?'#a66c17':'#80614d';c.lineWidth=row?.changed[t]?8:2;c.strokeRect(x,y-27,80,54)
    this.text(row?`${row.assignment[t]+1}`:'—',x+40,y,48,'center')
   }
   this.text(row?`${row.fitness.toFixed(2)} s`:'—',1380,y,38,'center')
  }
  this.text('WARNA VM:',45,657,28)
  vmColors.forEach((color,i)=>{c.fillStyle=color;c.fillRect(245+i*180,640,32,32);this.text(`VM${i+1}`,290+i*180,657,28)})
  this.text('8 task / kandidat',1460,657,28,'right')
  const guides=v?.guides
  this.text(guides?`Panduan pembaruan: Alpha ${guides.alpha} · Beta ${guides.beta} · Delta ${guides.delta}`:'Jadwal diperbarui mengikuti tiga pemimpin, lalu dinilai kembali.',768,703,28,'center')
  this.text('Bingkai emas: task pindah VM untuk ID yang sama · Masuk pilihan: belum ada pembanding',768,743,27,'center')
  this.texture.needsUpdate=true;this.drawCount++
 }
}
