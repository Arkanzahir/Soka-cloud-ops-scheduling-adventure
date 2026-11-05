import { AnimationMixer, Box3, Group, Vector3 } from 'three/webgpu'
import { clone } from 'three/addons/utils/SkeletonUtils.js'

export function mountAntModels(ants, { scene, animations })
{
    const clip = animations[0]
    if(!clip) return
    const palette = new Map()
    for(const ant of ants)
    {
        const model = clone(scene)
        const mixer = new AnimationMixer(model)
        mixer.clipAction(clip).play()
        mixer.setTime(.08)
        const bounds = new Box3().setFromObject(model, true)
        const center = bounds.getCenter(new Vector3())
        const size = bounds.getSize(new Vector3())
        const mount = new Group()
        mount.scale.setScalar(1.54 / Math.max(size.x, size.z))
        model.position.set(-center.x, -bounds.min.y, -center.z)
        model.traverse(mesh =>
        {
            if(!mesh.isMesh) return
            const tint = ant.antId === 1 ? 0x965333 : 0x602333
            if(!palette.has(tint)) palette.set(tint, mesh.material.clone())
            mesh.material = palette.get(tint)
            mesh.material.color.setHex(tint)
            mesh.castShadow = false
            // Bind bounds don't cover the full range of the author's leg animation.
            mesh.computeBoundingSphere()
            mesh.boundingSphere.radius *= 1.5
        })
        mount.add(model)
        for(const part of ant.mesh.children) part.visible = false
        ant.mesh.add(mount)
        ant.walkMixer = mixer
    }
}
