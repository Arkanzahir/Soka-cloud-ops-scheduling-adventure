import * as THREE from 'three/webgpu'
import { Area } from '../Game/World/Areas/Area.js'

export class TestArea extends Area
{
    constructor(center, radius)
    {
        const model = new THREE.Group()
        model.name = 'cloudOpsTest'
        for(const name of ['refZoneBounding', 'refZoneFrustum'])
        {
            const reference = new THREE.Object3D()
            reference.name = name
            reference.position.set(center[0], 0, center[1])
            reference.scale.setScalar(radius)
            reference.userData.preventAutoAdd = true
            model.add(reference)
        }
        super(model)
    }

    addBench(x, z)
    {
        const model = this.game.world.benches.instancedGroup.group.clone(true)
        model.position.set(0, 0, 0)
        model.quaternion.identity()
        const bounds = new THREE.Box3().setFromObject(model)
        const size = bounds.getSize(new THREE.Vector3())
        const center = bounds.getCenter(new THREE.Vector3())
        const object = this.game.objects.add(
            { model, updateMaterials: false },
            {
                type: 'fixed', position: { x, y: -bounds.min.y, z }, friction: 0.7,
                colliders: [{ shape: 'cuboid', parameters: [size.x / 2, size.y / 2, size.z / 2], position: center, category: 'object' }]
            }
        )
        this.objects.items.push(object)
        this.objects.hideable.push(model)
        return object
    }
}
