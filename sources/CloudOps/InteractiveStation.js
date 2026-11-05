import * as THREE from 'three/webgpu'
import { InteractivePoints } from '../Game/InteractivePoints.js'

export class InteractiveStation
{
    constructor(manager, { zone, label, position, onInteract, isAvailable = () => true })
    {
        this.manager = manager
        this.zone = zone
        this.enabled = null
        this.isAvailable = isAvailable
        const game = manager.game
        this.position = new THREE.Vector3(...position)
        this.trigger = game.zones.create('cylinder', this.position, 2.5)
        this.point = game.interactivePoints.create(
            this.position, label, InteractivePoints.ALIGN_RIGHT, InteractivePoints.STATE_HIDDEN,
            () =>
            {
                if(this.enabled && this.trigger.isIn && manager.canInteract() && Math.abs(game.player.position.y - this.position.y) < 3)
                    onInteract()
            },
            () => game.inputs.interactiveButtons.addItems(['interact']),
            () => game.inputs.interactiveButtons.removeItems(['interact']),
            () => game.inputs.interactiveButtons.removeItems(['interact'])
        )
    }

    update()
    {
        const enabled = this.manager.currentZone === this.zone && this.manager.state === 'DRIVING' && this.isAvailable()
        if(enabled === this.enabled) return
        this.enabled = enabled
        this.point.isIn = false
        if(enabled) this.point.show()
        else this.point.hide()
        this.manager.game.interactivePoints.needsTest = true
    }
}
