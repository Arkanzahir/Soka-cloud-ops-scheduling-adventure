/** Moves only the native modal surface; simulation/player state is untouched. */
export class FloatingDashboard {
 constructor(root){
  this.surface=root.closest('.container')||root;this.header=root.querySelector('.co-header');this.position=null;
  this.reset=document.createElement('button');this.reset.type='button';this.reset.className='co-button co-position';this.reset.textContent='↺ Posisi';this.reset.title='Reset posisi dashboard';this.header.insertBefore(this.reset,this.header.lastElementChild);
  this.reset.onclick=()=>{this.position=null;this.fit()};
  this.down=e=>{if(e.button!==0||e.target.closest('button,a,input'))return;e.preventDefault();e.stopPropagation();const r=this.surface.getBoundingClientRect();this.drag={id:e.pointerId,dx:e.clientX-r.left,dy:e.clientY-r.top};this.header.setPointerCapture(e.pointerId)};
  this.move=e=>{if(this.drag?.id!==e.pointerId)return;e.preventDefault();e.stopPropagation();this.position={x:e.clientX-this.drag.dx,y:e.clientY-this.drag.dy};this.fit()};
  this.up=e=>{if(this.drag?.id===e.pointerId){this.drag=null;if(this.header.hasPointerCapture(e.pointerId))this.header.releasePointerCapture(e.pointerId);e.stopPropagation()}};
  this.resize=()=>this.fit();this.header.addEventListener('pointerdown',this.down);this.header.addEventListener('pointermove',this.move);this.header.addEventListener('pointerup',this.up);this.header.addEventListener('pointercancel',this.up);window.addEventListener('resize',this.resize);
 }
 fit(){const r=this.surface.getBoundingClientRect();if(!r.width||!r.height)return;const p=this.position||{x:innerWidth-r.width-16,y:(innerHeight-r.height)/2};this.position={x:Math.max(8,Math.min(p.x,innerWidth-r.width-8)),y:Math.max(8,Math.min(p.y,innerHeight-r.height-8))};Object.assign(this.surface.style,{left:this.position.x+'px',top:this.position.y+'px',right:'auto'})}
 dispose(){window.removeEventListener('resize',this.resize);this.header.removeEventListener('pointerdown',this.down);this.header.removeEventListener('pointermove',this.move);this.header.removeEventListener('pointerup',this.up);this.header.removeEventListener('pointercancel',this.up);this.reset.remove()}
}
