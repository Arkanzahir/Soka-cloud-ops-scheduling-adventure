import { LearningPanel } from './learning/LearningPanel.js'
import { FloatingDashboard } from './learning/FloatingDashboard.js'
import './learning/learning-panel.css'
export class LearningHost {
 constructor(game,manager){
  this.game=game;this.manager=manager;this.busy=false;
  const chapters={cloud:1,aco:2,gwo:3,hybrid:4};
  manager.presentation.sections=['main',...Object.keys(chapters)];
  manager.registerPanel('learning');
  const worlds=Object.fromEntries(Object.keys(chapters).map(id=>[id,game.world.areas[id]]));
  this.panel=new LearningPanel({mount:document.querySelector('#learning-mount'),embedded:true,escapeCloses:false,worlds,onClose:()=>game.modals.close(),onPlayback:snapshot=>game.world.presentationRace?.updatePlayback(snapshot),navigate:id=>this.navigate(id)});
  this.floating=new FloatingDashboard(this.panel.root);
  const learningModal=game.modals.items.get('learning');
  learningModal.events.on('open',()=>game.audio.setMusicMix({ducked:true}));
  learningModal.events.on('opened',()=>this.floating.fit());
  learningModal.events.on('close',()=>game.audio.setMusicMix({ducked:false}));
  game.modals.items.get('learning').events.on('close',()=>this.panel.close());
  for(const [id,index] of Object.entries(chapters))worlds[id].onLearn=()=>this.openStation(index);
  worlds.hybrid.onLeave=()=>{
   if(this.panel.lesson?.algorithm==='hybrid')this.panel.pauseLesson();
   game.world.presentationRace?.showDrivingHintAfterVisit();
  };
  this.button=document.querySelector('#presentation-open');this.button.hidden=false;this.button.onclick=()=>this.startPresentation();
  this.quick=document.createElement('button');this.quick.type='button';this.quick.id='dashboard-open';this.quick.textContent='Buka Dashboard · L';this.quick.title='L: buka/tutup; Esc: kembali mengemudi. Seret header untuk memindahkan panel.';this.quick.hidden=true;document.body.appendChild(this.quick);
  this.toggle=()=>{
   if(this.busy)return;
   if(this.panel.visible){this.panel.close();return}
   const race=game.world.presentationRace;
   if(race?.active&&manager.currentZone==='main'){race.openNearbyStop();return}
   const index=chapters[manager.currentZone];
   if(index)this.openStation(index);
  };this.quick.onclick=this.toggle;
  this.shortcut=e=>{
   if(e.code!=='KeyL'||e.repeat||e.ctrlKey||e.altKey||e.metaKey||e.target.closest?.('input,textarea,select,[contenteditable="true"]'))return;
   const race=game.world.presentationRace;
   const available=race?.active&&manager.currentZone==='main'?race.nearbyStop()!==-1:
    Object.hasOwn(chapters,manager.currentZone)&&manager.canInteract(manager.drivingCategory());
   if(this.panel.visible||available){e.preventDefault();e.stopImmediatePropagation();this.toggle()}
  };document.addEventListener('keydown',this.shortcut,true);
  this.refreshQuick=()=>{const visible=Object.hasOwn(chapters,manager.currentZone)&&manager.canInteract(manager.drivingCategory());if(this.quick.hidden===visible)this.quick.hidden=!visible};game.ticker.events.on('tick',this.refreshQuick,15);
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
 open(index,category){
  if(!this.manager.openPanel('learning',category))return false;
  // Cloud is on the left of the parked camera. ACO and GWO are on its right.
  const dockLeft=index===4||(category==='racing'&&(index===2||index===3));
  this.floating.setDock(dockLeft?'left':'right');
  this.panel.open(index);
  this.floating.fit();
  return true;
 }
 openStation(index){
  return this.open(index,this.manager.drivingCategory());
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
