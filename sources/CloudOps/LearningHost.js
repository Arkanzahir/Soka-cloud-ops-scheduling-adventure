import { LearningPanel } from './learning/LearningPanel.js'
import { FloatingDashboard } from './learning/FloatingDashboard.js'
import './learning/learning-panel.css'
export class LearningHost {
 constructor(game,manager){
  this.game=game;this.manager=manager;this.busy=false;
  manager.presentation.sections=['main','cloud','aco','gwo'];
  manager.registerPanel('learning');
  this.panel=new LearningPanel({mount:document.querySelector('#learning-mount'),embedded:true,escapeCloses:false,worlds:{cloud:game.world.areas.cloud,aco:game.world.areas.aco,gwo:game.world.areas.gwo},onClose:()=>game.modals.close(),onPlayback:snapshot=>game.world.presentationRace?.updatePlayback(snapshot),navigate:id=>this.navigate(id)});
  this.floating=new FloatingDashboard(this.panel.root);
  const learningModal=game.modals.items.get('learning');
  learningModal.events.on('open',()=>game.audio.setMusicMix({ducked:true}));
  learningModal.events.on('opened',()=>this.floating.fit());
  learningModal.events.on('close',()=>game.audio.setMusicMix({ducked:false}));
  game.modals.items.get('learning').events.on('close',()=>this.panel.close());
  for(const [id,index] of [['cloud',1],['aco',2],['gwo',3]])game.world.areas[id].onLearn=()=>this.openStation(index);
  this.button=document.querySelector('#presentation-open');this.button.hidden=false;this.button.onclick=()=>this.startPresentation();
  this.quick=document.createElement('button');this.quick.type='button';this.quick.id='dashboard-open';this.quick.textContent='Buka Dashboard · L';this.quick.title='L: buka/tutup; Esc: kembali mengemudi. Seret header untuk memindahkan panel.';this.quick.hidden=true;document.body.appendChild(this.quick);
  this.toggle=()=>{
   if(this.busy)return;
   if(this.panel.visible){this.panel.close();return}
   const race=game.world.presentationRace;
   if(race?.active){race.openNearbyStop();return}
   const index={cloud:1,aco:2,gwo:3}[manager.currentZone];
   if(index&&manager.canInteract())this.open(index);
  };this.quick.onclick=this.toggle;
  this.shortcut=e=>{
   if(e.code!=='KeyL'||e.repeat||e.ctrlKey||e.altKey||e.metaKey||e.target.closest?.('input,textarea,select,[contenteditable="true"]'))return;
   const race=game.world.presentationRace;
   const available=race?.active?race.nearbyStop()!==-1:manager.canInteract()&&manager.currentZone!=='main';
   if(this.panel.visible||available){e.preventDefault();e.stopImmediatePropagation();this.toggle()}
  };document.addEventListener('keydown',this.shortcut,true);
  this.refreshQuick=()=>{const visible=!game.world.presentationRace?.active&&['cloud','aco','gwo'].includes(manager.currentZone)&&manager.canInteract();if(this.quick.hidden===visible)this.quick.hidden=!visible};game.ticker.events.on('tick',this.refreshQuick,15);
  const controls=document.createElement('div');controls.className='co-music-controls';controls.innerHTML='<label><input id="music-enabled" type="checkbox" checked> Musik latar</label><label>Volume musik <input id="music-volume" type="range" min="0" max="0.3" step="0.01" value="0.12" aria-label="Volume musik"></label><small>Musik mengecil saat dashboard terbuka. M: mute seluruh audio.</small>';document.querySelector('.options-content .content-inner').appendChild(controls);
  controls.querySelector('#music-enabled').onchange=e=>game.audio.setMusicMix({enabled:e.target.checked});controls.querySelector('#music-volume').oninput=e=>game.audio.setMusicMix({volume:Number(e.target.value)});
 }
 async startPresentation(){
  if(this.busy||this.game.world.presentationRace?.active||!this.manager.canInteract())return;
  this.busy=true;this.button.disabled=true;
  try{
   // Return while the native modal is still closed, avoiding an open/close transition race.
   if(this.manager.currentZone!=='main'&&!await this.manager.enter('main',true))return;
   await this.game.world.presentationRace.start();
  }finally{this.busy=false;this.button.disabled=this.game.world.presentationRace.active}
 }
 open(index,category){if(!this.manager.openPanel('learning',category))return false;this.panel.open(index);return true}
 openStation(index){
  this.open(index);
 }
 async navigate(id){
  if(id===this.manager.currentZone)return true;
  if(this.busy)return false;
  this.busy=true;this.panel.root.inert=true;
  const index=this.panel.slide;
  try{
   const closed=new Promise(resolve=>{const done=()=>{this.game.modals.items.get('learning').events.off('closed',done);resolve()};this.game.modals.items.get('learning').events.on('closed',done)});
   this.panel.close();await closed;
   const moved=await this.manager.enter(id,true);
   this.open(index);return moved;
  }finally{this.busy=false;this.panel.root.inert=false}
 }
}
