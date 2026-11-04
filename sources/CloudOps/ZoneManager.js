import { CarTransitionController } from './CarTransitionController.js'
import { InteractiveStation } from './InteractiveStation.js'
import { TestArea } from './TestArea.js'
import { PresentationController } from './PresentationController.js'
import { CloudArea } from './CloudArea.js'

export class ZoneManager
{
    constructor(game)
    {
        this.game = game
        this.currentZone = 'main'
        this.state = 'DRIVING'
        this.lastError = null
        this.transitions = new CarTransitionController(game)
        this.zones = new Map()
        this.stations = []
        this.panels = new Set()
        this.presentation = new PresentationController(this)
        const landing = game.respawns.getDefault()
        this.register({ id: 'main', name: 'Main World', spawn: { position: [landing.position.x, landing.position.z], rotation: landing.rotation } })
        if(import.meta.env.DEV && new URLSearchParams(location.search).has('test-zone')) {
        this.register({ id: 'test', name: 'Zona Uji M2', center: [-65, 65], radius: 18, spawn: { position: [-65, 65], rotation: 0 } })
        const area = new TestArea([-65, 65], 18)
        game.world.areas.cloudOpsTest = area
        area.addBench(-68, 71)
        area.addBench(-68, 58)
        // One reused roadside bench marks the Main World gate.
        area.addBench(43, 46.5).visual.object3D.visible = true
        area.objects.hideable.pop()
        this.createStation({ zone: 'main', label: 'Zona Uji M2', position: [43, 1.5, 43], onInteract: () => this.enter('test') })
        this.createStation({ zone: 'test', label: 'Kembali ke Main', position: [-60, 1.5, 65], onInteract: () => this.enter('main') })
        this.createStation({ zone: 'test', label: 'Panel Uji M2', position: [-65, 1.5, 71], onInteract: () => this.openPanel() })
        this.registerPanel('cloud-ops-test')
        }
        game.world.areas.cloud = new CloudArea(this)
        this.status = document.querySelector('.js-cloud-ops-status')
        this.status.hidden = false
        // Before Bruno's default respawn listener; use the same R action.
        game.inputs.events.on('respawn', action =>
        {
            if(action.active && this.currentZone !== 'main' && this.state === 'DRIVING')
            {
                for(const key of [...action.activeKeys]) game.inputs.end(key)
                void this.enter(this.currentZone, true)
            }
        }, 0)
        game.ticker.events.on('tick', () =>
        {
            const zone = this.zones.get(this.currentZone)
            if(this.state === 'DRIVING' && !this.lastError && zone.center &&
                (Math.hypot(game.player.position.x - zone.center[0], game.player.position.z - zone.center[1]) > zone.radius || game.player.position.y < -2))
                void this.enter(this.currentZone, true)
        }, 8)
        this.refresh()
    }

    register(zone)
    {
        if(!zone.id || !zone.name || !Array.isArray(zone.spawn?.position) || zone.spawn.position.length !== 2 ||
            !zone.spawn.position.every(Number.isFinite) || !Number.isFinite(zone.spawn.rotation))
            throw new Error('Zone needs an id, name and finite checkpoint')
        if(zone.center && (!Array.isArray(zone.center) || zone.center.length !== 2 ||
            !zone.center.every(Number.isFinite) || !Number.isFinite(zone.radius) || zone.radius <= 0))
            throw new Error('Zone boundary is invalid')
        if(this.zones.has(zone.id)) throw new Error(`Duplicate zone: ${zone.id}`)
        this.zones.set(zone.id, zone)
    }

    createStation(definition)
    {
        const station = new InteractiveStation(this, definition)
        this.stations.push(station)
        return station
    }

    canInteract()
    {
        return this.state === 'DRIVING' && this.game.inputs.filters.has('wandering') && !this.transitions.busy
    }

    refresh(message = '')
    {
        for(const station of this.stations) station.update()
        this.status.textContent = message || `${this.zones.get(this.currentZone).name} · E/Enter: interaksi · R: reset · Esc: tutup panel`
        this.status.dataset.zone = this.currentZone
        this.status.dataset.state = this.state
    }

    findReturnCheckpoint(preferred)
    {
        const candidates = [preferred, this.zones.get('main').spawn]
        for(const center of candidates)
        {
            for(const radius of [0, 2, 4, 6])
            {
                for(let i = 0; i < (radius === 0 ? 1 : 8); i++)
                {
                    const candidate = {
                        position: [center.position[0] + Math.cos(i * Math.PI / 4) * radius, center.position[1] + Math.sin(i * Math.PI / 4) * radius],
                        rotation: center.rotation
                    }
                    try { this.transitions.safeSpawn(candidate); return candidate }
                    catch { /* Try the next nearby dry, unobstructed footprint. */ }
                }
            }
        }
        return null
    }

    async enter(id, reset = false)
    {
        if(!this.canInteract() || !this.zones.has(id)) return false
        const vehicle = this.game.physicalVehicle
        if(!reset && (vehicle.wheels.inContactCount < 2 || Math.abs(vehicle.speed) > 3.5))
        {
            this.refresh('Berhenti di tanah dekat gerbang, lalu tekan E/Enter.')
            return false
        }
        const previous = this.currentZone
        this.lastError = null
        let returnPoint = this.returnPoint
        if(previous === 'main' && id !== 'main')
        {
            returnPoint = { position: [this.game.player.position.x, this.game.player.position.z], rotation: vehicle.yRotation }
            returnPoint = this.findReturnCheckpoint(returnPoint)
        }
        if(id === 'main') returnPoint = this.findReturnCheckpoint(returnPoint || this.zones.get('main').spawn)
        if((previous === 'main' && id !== 'main' || id === 'main') && !returnPoint)
        {
            this.lastError = 'Tidak ada titik kembali yang aman dekat gerbang.'
            this.refresh(this.lastError)
            return false
        }
        const checkpoint = id === 'main' ? returnPoint : this.zones.get(id).spawn
        this.state = 'TRANSITION'
        this.refresh('Berpindah zona…')
        try
        {
            const completed = await this.transitions.travel(checkpoint, () =>
            {
                this.currentZone = id
                this.returnPoint = returnPoint
            })
            this.state = 'DRIVING'
            this.refresh()
            return completed
        }
        catch(error)
        {
            this.lastError = error.message
            this.currentZone = previous
            this.state = 'DRIVING'
            this.refresh(`Perpindahan dibatalkan: ${error.message}`)
            return false
        }
    }

    registerPanel(name)
    {
        const panel = this.game.modals.items.get(name)
        if(!panel) throw new Error(`Unknown panel: ${name}`)
        if(this.panels.has(name)) return
        this.panels.add(name)
        panel.events.on('closed', () =>
        {
            this.transitions.unlock()
            this.state = 'DRIVING'
            this.refresh()
            this.status.focus()
        })
    }

    openPanel(name = 'cloud-ops-test')
    {
        if(!this.canInteract()) return
        this.registerPanel(name)
        this.state = 'LEARNING_UI'
        this.transitions.lock()
        this.refresh()
        this.game.modals.open(name)
    }
}
