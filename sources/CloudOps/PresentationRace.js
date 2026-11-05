import { BoxGeometry, Group, Vector3 } from 'three/webgpu'
import { CircuitArea } from '../Game/World/Areas/CircuitArea.js'
import { YardKit } from './cloud/YardKit.js'
import './presentation-race.css'

// The stop is on the drivable verge. The display sits beyond it, away from the timed lane.
const STOPS = [
    { title: 'Pembukaan', stop: [-5, -13], sign: [1, -16] },
    { title: 'Cloud Compute Yard', stop: [54, -62], sign: [48, -59], world: 'cloud', label: 'Cloud',
      exhibit: [44, -63], origin: [-65, -35], scale: .62, deck: [10.8, 9.4] },
    { title: 'Ant Research Park', stop: [-12, -64], sign: [-6.3, -59], world: 'aco', label: 'ACO',
      exhibit: [-2.6, -64], origin: [4, -4], scale: .50, deck: [11, 6.6] },
    { title: 'Wolf Field Research', stop: [-76, -55], sign: [-70, -64], world: 'gwo', label: 'GWO',
      exhibit: [-64, -57], origin: [-61, 66], scale: .59, rotation: Math.PI / 2, deck: [13, 13] },
    { title: 'Hasil', stop: [-75, 48], sign: [-69, 50] },
    { title: 'Paper dan kesimpulan', stop: [-27, 55], sign: [-36, 54] }
]

export class PresentationRace
{
    constructor(game, manager, learning)
    {
        this.game = game
        this.manager = manager
        this.learning = learning
        this.circuit = game.world.areas.circuit
        this.active = false
        this.placing = false
        this.ready = false
        this.viewed = new Set()
        this.root = new Group()
        this.root.visible = false
        game.scene.add(this.root)

        this.hud = document.createElement('aside')
        this.hud.className = 'presentation-race-hud'
        this.hud.hidden = true
        this.hud.innerHTML = '<div><strong class="race-progress"></strong><div class="race-target" aria-live="polite"></div></div><button type="button" class="race-stop">Akhiri</button>'
        this.cancel = this.hud.querySelector('.race-stop')
        this.cancel.onclick = () => this.stop()
        this.progress = this.hud.querySelector('.race-progress')
        this.hint = this.hud.querySelector('.race-target')
        document.body.appendChild(this.hud)

        const kit = new YardKit({ game, objects: { hideable: [] } })
        const padGeometry = new BoxGeometry(2.2, .025, .14)
        game.modals.items.get('learning').events.on('closed', () => {
            if(this.ready) this.showDrivingHint()
        })
        this.stops = STOPS.map((stop, index) => {
            const [x,z] = stop.stop
            const [signX,signZ] = stop.sign
            const sign = new Group()
            sign.position.set(signX, 0, signZ)
            sign.rotation.y = Math.PI / 4
            this.root.add(sign)
            for(const side of [-1, 1])
                kit.rounded(side * 2, 1.12, 0, .18, 2.25, .18, 'wood', sign)
            kit.rounded(0, 2.1, 0, 5.2, 1.12, .22, 'wood', sign)
            sign.add(kit.label(`POS ${index + 1} · ${stop.title.toUpperCase()}`, 0, 2.28, .13, 4.9, .45).mesh)
            sign.add(kit.label('MENEPI · E / ENTER', 0, 1.88, .13, 3.6, .30).mesh)
            for(const side of [-1, 1])
                kit.mesh(padGeometry, 'cream', new Vector3(x, .075, z + side * 1.45), this.root)
            const station = manager.createStation({
                zone: 'main',
                category: 'racing',
                label: `Pos ${index + 1} · ${stop.label || stop.title}`,
                position: [x, 1.35, z],
                isAvailable: () => this.ready,
                onInteract: () => this.openStop(index)
            })
            if(!stop.world) return { station }

            const world = game.world.areas[stop.world]
            const stand = new Group()
            const display = new Group()
            const [originX,originZ] = stop.origin
            const [displayX,displayZ] = stop.exhibit
            const [width,depth] = stop.deck
            kit.rounded(displayX, .11, displayZ, width, .82, depth, 'wood', this.root)
            stand.position.set(displayX, .52, displayZ)
            stand.scale.setScalar(stop.scale)
            stand.rotation.y = stop.rotation || 0
            display.position.set(-originX, 0, -originZ)
            stand.add(display)
            this.root.add(stand)
            return { station, world, display, focus: new Vector3(displayX, 0, displayZ) }
        })
        // Player updates tracking at 6; View consumes it at 7.
        game.ticker.events.on('tick', () => this.frameParkedExhibit(), 6)
    }

    frameParkedExhibit()
    {
        if(!this.ready || Math.abs(this.game.physicalVehicle.speed) > 2) return
        const {position} = this.game.player
        const stop = this.stops.find(({station,focus}) => focus &&
            Math.hypot(position.x - station.position.x, position.z - station.position.z) < 2.5)
        if(stop) this.game.view.focusPoint.trackedPosition.lerp(stop.focus, .4)
    }

    async start()
    {
        if(this.active || this.placing || this.circuit.state !== CircuitArea.STATE_PENDING ||
            this.manager.currentZone !== 'main' || !this.manager.canInteract()) return
        this.placing = true
        this.learning.button.disabled = true
        try
        {
            const start = this.circuit.startPosition
            const prompt = this.circuit.interactivePoint.position
            // Park on the start grid inside the native Start Race interaction radius.
            await this.manager.transitions.travel({
                position: [(start.position.x + prompt.x) / 2, (start.position.z + prompt.y) / 2],
                rotation: start.rotation
            }, () => {})
            this.active = true
            this.viewed.clear()
            this.mountExhibits()
            this.game.audio.raceMusic.load()
            this.show('Tekan E untuk mulai. Temukan 6 pos materi di sisi lintasan.')
            this.manager.refresh()
        }
        catch(error)
        {
            this.manager.refresh(`Garis start belum siap: ${error.message}`)
        }
        finally
        {
            this.placing = false
            this.learning.button.disabled = this.active
        }
    }

    mountExhibits()
    {
        for(const {world,display} of this.stops)
        {
            if(!world) continue
            world.trackside = true
            if(world.objects)
            {
                const exhibit = new Set(world.raceVisuals)
                world.objects.hideable = world.objects.hideable.filter(node => !exhibit.has(node))
            }
            for(const node of world.raceVisuals)
            {
                display.add(node)
                // Cloud/GWO area culling hides roots. Their dynamic children keep their own visibility.
                if(world.objects) node.visible = true
            }
        }
        this.game.world.areas.cloud.refreshExperimentVisibility()
        this.game.world.areas.cloud.vms.forEach(vm => { vm.selection.visible = false })
        this.root.visible = true
    }

    restoreExhibits()
    {
        this.root.visible = false
        for(const {world} of this.stops)
        {
            if(!world) continue
            world.trackside = false
            for(const node of world.raceVisuals) (world.group || this.game.scene).add(node)
            if(world.objects)
            {
                world.objects.hideable.push(...world.raceVisuals)
                world.frustum.isIn = null
                world.frustum.test()
            }
        }
    }

    show(hint)
    {
        this.hud.hidden = false
        this.progress.textContent = `Presentation Race · ${this.viewed.size}/${STOPS.length} pos`
        this.hint.textContent = hint
    }

    onCountdown()
    {
        if(!this.active) return
        this.ready = false
        this.cancel.disabled = true
        this.game.audio.setRaceMusic(false)
        this.manager.refresh()
        this.show('Bersiap. Mulai mengemudi saat lampu hijau.')
    }

    onGreen()
    {
        if(!this.active) return
        this.ready = true
        this.cancel.disabled = false
        this.game.audio.setRaceMusic(true)
        this.manager.refresh()
        this.showDrivingHint()
    }

    showDrivingHint()
    {
        this.show('Ikuti checkpoint balap. Menepi di marka pos, lalu tekan E.')
    }

    openStop(index)
    {
        if(!this.ready) return
        const vehicle = this.game.physicalVehicle
        if(vehicle.wheels.inContactCount < 2 || Math.abs(vehicle.speed) > 2)
        {
            this.show('Berhenti di marka pos, lalu tekan E.')
            return
        }

        this.learning.panel.setRaceChapter(true)
        if(this.learning.open(index, 'racing'))
        {
            this.viewed.add(index)
            this.show('Esc untuk kembali mengemudi. Timer balap terus berjalan.')
        }
        else this.learning.panel.setRaceChapter(false)
    }

    stop()
    {
        if(this.ready) this.circuit.finish(true)
        else if(this.circuit.state === CircuitArea.STATE_PENDING) this.onFinish(true)
    }

    onFinish(forced)
    {
        if(!this.active) return
        this.active = false
        this.ready = false
        this.learning.panel.close()
        this.learning.panel.pauseLesson()
        this.learning.panel.setRaceChapter(false)
        this.learning.button.disabled = false
        this.cancel.disabled = false
        this.hud.hidden = true
        this.game.audio.setRaceMusic(false)
        this.restoreExhibits()
        this.manager.refresh(forced ? 'Presentation Race diakhiri' :
            `Finis · ${this.viewed.size}/${STOPS.length} pos materi dikunjungi`)
    }
}
