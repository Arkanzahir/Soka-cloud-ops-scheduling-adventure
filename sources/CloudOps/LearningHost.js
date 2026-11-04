import { LearningPanel } from './learning/LearningPanel.js'
import './learning/learning-panel.css'
export class LearningHost {
 constructor(game,manager){
  this.game=game;this.manager=manager;this.busy=false;
  manager.presentation.sections=['main','cloud','aco','gwo'];
  manager.registerPanel('learning');
  this.panel=new LearningPanel({mount:document.querySelector('#learning-mount'),embedded:true,escapeCloses:false,worlds:{cloud:game.world.areas.cloud,aco:game.world.areas.aco,gwo:game.world.areas.gwo},onClose:()=>game.modals.close(),navigate:id=>this.navigate(id)});
  game.modals.items.get('learning').events.on('close',()=>this.panel.close());
  for(const [id,index] of [['cloud',1],['aco',2],['gwo',3]])game.world.areas[id].onLearn=()=>this.open(index);
  this.button=document.querySelector('#presentation-open');this.button.hidden=false;this.button.onclick=()=>{if(manager.canInteract())this.open(0)};
 }
 open(index){this.manager.openPanel('learning');this.panel.open(index)}
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
