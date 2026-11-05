import { NodeIO, VertexLayout } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'
import { prune } from '@gltf-transform/functions'
import draco from 'draco3dgltf'
import sharp from 'sharp'

// Rapier collider creation reads the position buffer as tightly packed XYZ.
const io = new NodeIO().setVertexLayout(VertexLayout.SEPARATE).registerExtensions(ALL_EXTENSIONS).registerDependencies({
    'draco3d.decoder': await draco.createDecoderModule(),
    'draco3d.encoder': await draco.createEncoderModule()
})
const retiredLogos = /^(bluesky|discord|github|linkedin|onlyfans|twitch|x|youtube)PhysicalDynamic/i
const labels = {
    circuitBrand: 'CLOUD OPS',
    circuitLogoThreejs: 'CLOUD OPS',
    circuitLogoWebgl: 'WEBGL',
    circuitLogoWebgpu: 'WEBGPU'
}

for(const path of ['static/areas/areas.glb', 'static/areas/areas-compressed.glb']) {
    const document = await io.read(path)
    const root = document.getRoot()
    for(const node of root.listNodes()) {
        if(retiredLogos.test(node.getName())) node.dispose()
    }
    for(const texture of root.listTextures()) {
        const label = labels[texture.getName()]
        if(!label) continue
        const artwork = `<svg width="512" height="128" xmlns="http://www.w3.org/2000/svg">
            <rect width="512" height="128" fill="#383039"/>
            <path d="M18 16h476M18 112h476" stroke="#5b9a92" stroke-width="8"/>
            <text x="256" y="81" text-anchor="middle" font-family="sans-serif" font-size="50" font-weight="bold" fill="#fff0bf">${label}</text>
        </svg>`
        texture.setImage(await sharp(Buffer.from(artwork)).png().toBuffer()).setMimeType('image/png')
    }
    await document.transform(prune({ keepLeaves: true, keepAttributes: true, keepSolidTextures: true, keepExtras: true }))
    await io.write(path, document)
}
