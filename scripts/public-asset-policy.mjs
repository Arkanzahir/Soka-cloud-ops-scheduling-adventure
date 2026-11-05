export function isRetiredAsset(relativePath) {
    const path = relativePath.replaceAll('\\', '/')
    return /^fonts\/Pally-/i.test(path) ||
        /^(projects\/images|lab\/images|career|timeMachine)\//i.test(path) ||
        path === 'social/share-image.png' ||
        /^sounds\/(?!musics\/|cloud-ops\/)/i.test(path)
}
