import { Game } from '../../Game/Game.js'
import { AcoWorld } from './AcoWorld.js'
export async function startPreview(){
 const game=Game.getInstance();window.acoGame=game;while(game.reveal?.step!==2)await new Promise(r=>setTimeout(r,100))
 const world=new AcoWorld(game);window.acoPreview=world
 const position=world.origin.clone();position.z=8;position.y=3
 game.respawns.items.set('acoPreview',{name:'acoPreview',position,rotation:Math.PI/2})
 game.player.respawn('acoPreview')
 const hud=document.createElement('div');hud.style.cssText='position:fixed;left:20px;bottom:20px;background:#fff0bf;color:#382c38;padding:14px 20px;border:3px solid #a87762;border-radius:12px;font:16px sans-serif;z-index:20';hud.textContent='ANT RESEARCH PARK · DUMMY ANIMATION · WASD drive · R reset';document.body.append(hud)
 const panel=document.createElement('dialog');panel.style.cssText='background:#fff0bf;color:#382c38;border:4px solid #a87762;border-radius:14px;padding:30px;max-width:480px';panel.innerHTML='<h2>Ant Colony Optimization</h2><p>Preview animasi DUMMY — bukan hasil algoritma.</p><p>T1–T8 adalah task; VM1–VM3 adalah pilihan mesin. Satu semut mewakili kandidat jadwal. Simulator dapat mengirim selectedVM melalui applyEvent(event).</p><button>Back to car / Esc</button>';document.body.append(panel)
 world.onResearch=()=>{game.physicalVehicle.moveTo(game.player.position.clone(),game.physicalVehicle.rotation||0);game.inputs.filters.clear();game.inputs.filters.add('modal');panel.showModal()};panel.querySelector('button').onclick=()=>panel.close();panel.addEventListener('close',()=>{game.inputs.filters.clear();game.inputs.filters.add('wandering')})
}

