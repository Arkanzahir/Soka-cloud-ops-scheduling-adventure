import * as THREE from 'three/webgpu'
import { Player } from '../Game/Player.js'

export class CarTransitionController
{
    constructor(game)
    {
        this.game = game
        this.busy = false
        this.lastTeleport = null
    }

    get body() { return this.game.physicalVehicle.chassis.physical.body }

    clearInputs()
    {
        for(const action of this.game.inputs.actions.values())
            for(const key of [...action.activeKeys])
                this.game.inputs.end(key)
    }

    lock()
    {
        this.game.player.state = Player.STATE_LOCKED
        this.clearInputs()
        Object.assign(this.game.player, { accelerating: 0, steering: 0, boosting: 0, braking: 1 })
        this.body.setLinvel({ x: 0, y: 0, z: 0 }, true)
        this.body.setAngvel({ x: 0, y: 0, z: 0 }, true)
        this.body.resetForces(true)
        this.body.resetTorques(true)
        this.body.setEnabled(false)
    }

    unlock()
    {
        this.clearInputs()
        this.body.setEnabled(true)
        this.game.player.state = Player.STATE_DEFAULT
    }

    safeSpawn(checkpoint)
    {
        const { RAPIER, physics } = this.game
        const [x, z] = checkpoint.position
        const samples = [[0, 0], [1.7, 1], [1.7, -1], [-1.7, 1], [-1.7, -1]]
        const heights = samples.map(([dx, dz]) =>
        {
            const ray = new RAPIER.Ray({ x: x + dx, y: 15, z: z + dz }, { x: 0, y: -1, z: 0 })
            const hit = physics.world.castRayAndGetNormal(ray, 30, true, undefined, undefined, undefined, this.body)
            if(!hit || hit.normal.y < 0.97 || 15 - hit.timeOfImpact < -0.1)
                throw new Error('Checkpoint needs dry, level ground')
            return 15 - hit.timeOfImpact
        })
        if(Math.max(...heights) - Math.min(...heights) > 0.15)
            throw new Error('Checkpoint ground is uneven')
        const ground = Math.max(...heights)
        const rotation = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), checkpoint.rotation)
        let blocked = false
        physics.world.intersectionsWithShape(
            { x, y: ground + 1, z }, rotation, new RAPIER.Cuboid(1.65, 0.7, 1.05),
            collider => { if(collider.parent()?.handle !== this.body.handle) blocked = true; return !blocked },
            undefined, undefined, undefined, this.body
        )
        if(blocked) throw new Error('Checkpoint is obstructed')
        return new THREE.Vector3(x, ground + 1.7, z)
    }

    place(position, rotation)
    {
        this.game.physicalVehicle.moveTo(position, rotation)
        this.body.resetForces(true)
        this.body.resetTorques(true)
        this.lastTeleport = { position: position.toArray(), linear: { ...this.body.linvel() }, angular: { ...this.body.angvel() } }
        const player = this.game.player
        player.position.copy(position)
        player.basePosition.copy(position)
        player.position2.set(position.x, position.z)
        const view = this.game.view
        view.setMode(1)
        view.cinematic.progress = 0
        view.focusPoint.isTracking = true
        view.focusPoint.magnet.active = false
        for(const key of ['trackedPosition', 'position', 'smoothedPosition'])
            view.focusPoint[key].set(position.x, 0, position.z)
        view.update()
    }

    waitForGround()
    {
        return new Promise((resolve, reject) =>
        {
            const started = performance.now()
            const test = () =>
            {
                if(this.game.physicalVehicle.wheels.inContactCount >= 2)
                {
                    this.game.ticker.events.off('tick', test)
                    resolve()
                }
                else if(performance.now() - started > 5000)
                {
                    this.game.ticker.events.off('tick', test)
                    reject(new Error('Vehicle did not settle on checkpoint'))
                }
            }
            this.game.ticker.events.on('tick', test, 8)
        })
    }

    async travel(checkpoint, onPlaced)
    {
        if(this.busy) return false
        const target = this.safeSpawn(checkpoint)
        const previous = this.body.translation()
        const rollback = new THREE.Vector3(previous.x, previous.y + 0.2, previous.z)
        const previousRotation = this.game.physicalVehicle.yRotation
        this.busy = true
        this.lock()
        this.game.inputs.filters.clear()
        this.game.inputs.filters.add('cloudOpsTransition')
        try
        {
            await new Promise(resolve => this.game.overlay.show(resolve))
            this.place(target, checkpoint.rotation)
            this.body.setEnabled(true)
            await this.waitForGround()
            onPlaced()
            await new Promise(resolve => this.game.overlay.hide(resolve))
            return true
        }
        catch(error)
        {
            this.place(rollback, previousRotation)
            this.body.setEnabled(true)
            await new Promise(resolve => this.game.overlay.hide(resolve))
            throw error
        }
        finally
        {
            this.unlock()
            this.game.inputs.filters.clear()
            this.game.inputs.filters.add('wandering')
            this.busy = false
        }
    }
}
