import {InteractivePoints} from '../../Game/InteractivePoints.js'

export function hideReferences(area,names){
 for(const name of names)for(const reference of area.references.items.get(name)||[]){
  reference.visible=false;
  area.objects.hideable=area.objects.hideable.filter(object=>object!==reference);
 }
}

// Retain native scenery, references and achievement IDs; never construct the old gallery handlers.
export function configureExhibit(area,id,title){
 area.portfolioDisabled=true;
 hideReferences(area,['images','title','url','attributes','distinctions','previous','next','pagination','blackboardLabelsMouseKeyboard','blackboardLabelsGamepadPlaystation','blackboardLabelsGamepadXbox']);
 area.open=()=>{const host=area.game.world.learning;if(host&&area.game.world.cloudOps.currentZone==='main'){
  area.game.achievements.setProgress(id,title);return host.startPresentation();
 }};
 area.close=()=>{};
 area.interactivePoint=area.game.interactivePoints.create(area.references.items.get('interactivePoint')[0].position,title,InteractivePoints.ALIGN_RIGHT,InteractivePoints.STATE_CONCEALED,()=>area.open(),()=>area.game.inputs.interactiveButtons.addItems(['interact']),()=>area.game.inputs.interactiveButtons.removeItems(['interact']),()=>area.game.inputs.interactiveButtons.removeItems(['interact']));
}
