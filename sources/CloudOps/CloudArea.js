import * as THREE from 'three/webgpu'
import { texture, uv, vec2 } from 'three/tsl'
import { Area } from '../Game/World/Areas/Area.js'
import { TextCanvas } from '../Game/TextCanvas.js'

export class CloudArea extends Area
{
    constructor(manager)
    {
        const center = [-50, 70]
        const model = new THREE.Group()
        model.name = 'cloudArea'
        for(const name of ['refZoneBounding', 'refZoneFrustum'])
        {
            const reference = new THREE.Object3D()
            reference.name = name
            reference.position.set(center[0], 0, center[1])
            reference.scale.setScalar(12)
            reference.userData.preventAutoAdd = true
            model.add(reference)
        }
        super(model)
        this.vms = [-54, -50, -46].map((x, index) => this.addVM(`VM ${index + 1}`, x, 76))
        manager.register({ id: 'cloud', name: 'Cloud · Kerangka', center, radius: 12, spawn: { position: center, rotation: 0 } })
        this.entry = manager.createStation({ zone: 'main', label: 'Cloud', position: [49, 1.5, 34.5], onInteract: () => manager.enter('cloud') })
        this.exit = manager.createStation({ zone: 'cloud', label: 'Kembali ke Main', position: [-44, 1.5, 70], onInteract: () => manager.enter('main') })
        this.station = manager.createStation({ zone: 'cloud', label: 'Stasiun Cloud', position: [-50, 1.5, 73], onInteract: () => manager.openPanel('cloud-foundation') })
        manager.registerPanel('cloud-foundation')
    }

    addVM(name, x, z)
    {
        const brick = this.game.world.bricks.instancedGroup.group.clone(true)
        brick.position.set(0, 0, 0)
        brick.quaternion.identity()
        const originalSize = new THREE.Box3().setFromObject(brick).getSize(new THREE.Vector3())
        brick.scale.multiply(new THREE.Vector3(1.5 / originalSize.x, 1.8 / originalSize.y, 1.5 / originalSize.z))
        const bounds = new THREE.Box3().setFromObject(brick)
        const center = bounds.getCenter(new THREE.Vector3())
        brick.position.set(-center.x, -bounds.min.y, -center.z)
        const group = new THREE.Group()
        group.name = `cloud-${name.replace(' ', '-').toLowerCase()}`
        group.add(brick)
        const text = new TextCanvas('Pally-Medium', '500', 48, 192, 80)
        text.updateText(name)
        const material = new THREE.MeshBasicNodeMaterial()
        material.colorNode = texture(text.texture, vec2(uv().x, uv().y.oneMinus())).rgb
        const label = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.75), material)
        label.position.y = 2.4
        label.rotation.set(-Math.PI * 0.15, Math.PI * 0.25, 0, 'YXZ')
        group.add(label)
        const object = this.game.objects.add(
            { model: group, updateMaterials: false },
            { type: 'fixed', position: { x, y: 0, z }, friction: 0.7,
                colliders: [{ shape: 'cuboid', parameters: [0.75, 0.9, 0.75], position: { x: 0, y: 0.9, z: 0 }, category: 'object' }] }
        )
        this.objects.items.push(object)
        this.objects.hideable.push(group)
        return object
    }
}
