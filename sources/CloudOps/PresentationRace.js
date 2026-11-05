import { Group, Mesh, RingGeometry, MeshBasicMaterial } from 'three/webgpu'
import { CircuitArea } from '../Game/World/Areas/CircuitArea.js'
import { PRESENTATION_SECTIONS } from './learning/PresentationContent.js'
import './presentation-race.css'

const MAIN_CHECKPOINTS = [
    { chapter: 0, title: 'Pembukaan', position: [44, 41] },
    { chapter: 4, title: 'Hasil', position: [42, 45] },
    { chapter: 5, title: 'Paper', position: [48, 43] },
    { chapter: 6, title: 'Finish', position: [54, 43] }
]
const CHAPTERS = [
    { zone: 'main', title: 'Pembukaan' },
    { zone: 'cloud', title: 'Cloud Compute Yard' },
    { zone: 'aco', title: 'Ant Research Park' },
    { zone: 'gwo', title: 'Wolf Field Research' },
    { zone: 'main', title: 'Hasil' },
    { zone: 'main', title: 'Paper dan kesimpulan' },
    { zone: 'main', title: 'Finish' }
]

/** Ordered, on-footprint checkpoints. The native zone gates own all travel. */
export class PresentationRace {
    constructor(game, manager, learning) {
        this.game = game
        this.manager = manager
        this.learning = learning
        this.active = false
        this.chapter = 0
        this.chapterOpen = false
        this.checkpoints = new Map()

        for(const checkpoint of MAIN_CHECKPOINTS) {
            const safe = manager.findReturnCheckpoint({position:checkpoint.position,rotation:0})
            if(!safe) throw new Error('Missing Presentation Race checkpoint: '+checkpoint.title)
            const [x,z] = safe.position
            const ground = manager.transitions.safeSpawn(safe).y-1.7
            const station = manager.createStation({
                zone:'main', label:checkpoint.title, position:[x,ground+1.5,z],
                isAvailable:()=>this.active&&this.chapter===checkpoint.chapter,
                onInteract:()=>this.openCheckpoint(checkpoint.chapter)
            })
            this.checkpoints.set(checkpoint.chapter,station.position)
        }
        this.checkpoints.set(1,game.world.areas.cloud.station.position)
        this.checkpoints.set(2,game.world.areas.aco.researchPosition)
        this.checkpoints.set(3,game.world.areas.gwo.station.position)

        this.marker = new Group()
        const ring = new Mesh(new RingGeometry(2,2.18,40),new MeshBasicMaterial({color:'#ffcb79'}))
        ring.rotation.x = -Math.PI/2
        this.marker.add(ring)
        this.marker.visible = false
        game.scene.add(this.marker)

        this.button = document.createElement('button')
        this.button.type = 'button'
        this.button.className = 'campus-primary'
        this.button.id = 'presentation-race-open'
        this.button.textContent = 'PRESENTATION RACE'
        this.button.onclick = () => this.start()
        learning.button.after(this.button)

        this.hud = document.createElement('aside')
        this.hud.className = 'presentation-race-hud'
        this.hud.hidden = true
        this.hud.innerHTML = '<div class="race-arrow" aria-hidden="true">↑</div><div><strong class="race-progress"></strong><div class="race-target" aria-live="polite"></div><small class="race-hint">Arah relatif mobil</small></div><button type="button" class="race-stop">Akhiri</button>'
        this.hud.querySelector('.race-stop').onclick = () => this.stop()
        this.arrow = this.hud.querySelector('.race-arrow')
        this.progress = this.hud.querySelector('.race-progress')
        this.targetLabel = this.hud.querySelector('.race-target')
        document.body.appendChild(this.hud)

        game.modals.items.get('learning').events.on('closed',()=>this.onChapterClosed())
        game.ticker.events.on('tick',()=>this.update(),15)
    }

    start() {
        if(this.active||this.manager.currentZone!=='main'||!this.manager.canInteract())return
        if(this.game.world.areas.circuit.state!==CircuitArea.STATE_PENDING)return
        this.chapter=0
        this.active=true
        this.chapterOpen=false
        this.learning.button.disabled=true
        this.manager.refresh()
        this.update()
    }

    stop(finished=false) {
        this.active=false
        this.chapterOpen=false
        this.learning.panel.setRaceChapter(false)
        if(this.learning.panel.visible)this.learning.panel.close()
        this.learning.button.disabled=false
        this.marker.visible=false
        this.hud.hidden=true
        this.manager.refresh(finished?'Presentation Race selesai · 6/6 chapter':'Presentation Race diakhiri')
    }

    openCheckpoint(index) {
        if(!this.active||index!==this.chapter||this.chapterOpen||
            this.manager.currentZone!==CHAPTERS[index].zone||!this.manager.canInteract())return
        const vehicle=this.game.physicalVehicle
        if(vehicle.wheels.inContactCount<2||Math.abs(vehicle.speed)>3.5){
            this.manager.refresh('Berhenti di lingkaran checkpoint, lalu tekan E.')
            return
        }
        if(index===PRESENTATION_SECTIONS.length){
            this.stop(true)
            return
        }
        this.chapterOpen=true
        this.learning.panel.setRaceChapter(true)
        this.learning.open(index)
    }

    onChapterClosed() {
        if(!this.active||!this.chapterOpen)return
        this.chapterOpen=false
        this.chapter++
        this.learning.panel.setRaceChapter(false)
        this.manager.refresh()
        this.update()
    }

    update() {
        const zone=this.manager.currentZone
        this.button.hidden=this.active||zone!=='main'
        if(!this.active)return
        this.hud.hidden=this.chapterOpen
        const chapter=CHAPTERS[this.chapter]
        const {areas}=this.game.world
        const onChapter=zone===chapter.zone
        let target=this.checkpoints.get(this.chapter)
        let instruction=chapter.title+' · berhenti lalu E'
        if(!onChapter&&zone==='main'){
            const destination=areas[chapter.zone]
            target=destination.entry.position
            instruction='Gerbang '+chapter.title
        }else if(!onChapter){
            target=areas[zone]?.exit?.position
            instruction='Gerbang kembali ke Main'
        }
        this.marker.visible=onChapter&&!this.chapterOpen
        if(this.marker.visible)
            this.marker.position.set(target.x, target.y - (this.chapter === 2 ? .95 : 1.45), target.z)
        const progress=this.chapter===6?'Finish · 6/6 chapter':`Chapter ${this.chapter+1}/6`
        if(this.progress.textContent!==progress)this.progress.textContent=progress
        if(this.targetLabel.textContent!==instruction)this.targetLabel.textContent=instruction
        if(!target)return
        const {position}=this.game.player,{forward}=this.game.physicalVehicle
        const heading=Math.atan2(target.z-position.z,target.x-position.x)-Math.atan2(forward.z,forward.x)
        const rotation=`rotate(${heading.toFixed(3)}rad)`
        if(this.arrow.style.transform!==rotation)this.arrow.style.transform=rotation
    }
}
