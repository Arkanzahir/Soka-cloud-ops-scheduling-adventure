/** Route inherited effect cues to original synthesized clips. Music uses its own playlist. */
export function effectSource(path, loop) {
    if(!path.startsWith('sounds/') || path.startsWith('sounds/musics/')) return path

    let clip = 'click'
    if(path.startsWith('sounds/vehicle/honk/')) clip = 'horn'
    else if(path.startsWith('sounds/vehicle/engine/')) clip = 'engine'
    else if(loop) clip = 'ambience'
    else if(/^sounds\/(birdTweets|owl|rooster|wolf)\//.test(path)) clip = 'chirp'
    else if(/^sounds\/(hits|explosions|anvil|vehicle)\//.test(path)) clip = 'impact'
    else if(/^sounds\/(achievements|bell|ding|reveal|jukebox)\//.test(path)) clip = 'chime'

    return `sounds/cloud-ops/${clip}.wav`
}
