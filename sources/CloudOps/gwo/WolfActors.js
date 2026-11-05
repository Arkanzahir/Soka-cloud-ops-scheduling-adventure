import { clone } from 'three/addons/utils/SkeletonUtils.js'

const LEGS = ['FrontLeft', 'FrontRight', 'RearLeft', 'RearRight']

export function mountWolfModels(wolves, { scene })
{
    for(const wolf of wolves)
    {
        const model = clone(scene)
        const head = model.getObjectByName('WolfHead')
        const tail = model.getObjectByName('WolfTail')
        const legs = LEGS.map(name => model.getObjectByName(name))
        if(!head || !tail || legs.some(leg => !leg)) return
        model.traverse(mesh =>
        {
            if(mesh.isSkinnedMesh)
            {
                mesh.castShadow = false
                mesh.computeBoundingSphere()
                mesh.boundingSphere.radius *= 1.4
            }
        })
        const body = wolf.mesh.userData.body
        for(const part of body.children) part.visible = false
        body.add(model)
        wolf.rig = { head, tail, legs }
    }
}

export function poseWolf(wolf, time, moving, howling)
{
    if(!wolf.rig) return
    const { head, tail, legs } = wolf.rig
    const phase = time * 18
    for(let i = 0; i < legs.length; i++)
        legs[i].rotation.z = moving ? Math.sin(phase + (i === 1 || i === 2 ? Math.PI : 0)) * .31 : 0
    head.rotation.z = howling * .28 + Math.sin(time * 2) * .022
    tail.rotation.y = Math.sin(time * (moving ? 9 : 2)) * .12
}
