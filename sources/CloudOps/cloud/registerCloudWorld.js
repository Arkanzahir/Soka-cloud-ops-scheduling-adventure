import '../learning/learning-panel.css'
import { LearningPanel } from '../learning/LearningPanel.js'
import { CloudWorld } from './CloudWorld.js'

/** Register a playable Cloud zone and attach its real scheduling lesson.
 * The world is isolated from the teammate's unpushed M3 branch.
 */
export function registerCloudWorld(game, zoneManager)
{
    if(zoneManager.zones.has('cloud')) throw new Error('Cloud zone already registered; reconcile M3 before mounting')
    const world = new CloudWorld(game, { center: [128, -36] })
    zoneManager.register({
        id: 'cloud',
        name: 'Cloud Compute Yard',
        center: [128, -36],
        radius: 29,
        spawn: { position: [128, -22], rotation: Math.PI }
    })

    const panel = new LearningPanel({
        mount: document.body,
        worlds: { cloud: world },
        onOpen: () =>
        {
            zoneManager.state = 'LEARNING_UI'
            zoneManager.transitions.lock()
            zoneManager.refresh('Cloud Task Scheduling · panel pembelajaran aktif')
        },
        onClose: () =>
        {
            zoneManager.transitions.unlock()
            zoneManager.state = 'DRIVING'
            zoneManager.refresh()
        }
    })

    zoneManager.createStation({
        zone: 'main',
        label: 'CLOUD COMPUTE YARD',
        position: [35, 1.5, 36],
        onInteract: () => zoneManager.enter('cloud')
    })
    zoneManager.createStation({
        zone: 'cloud',
        label: 'Back to Main World',
        position: [128, 1.5, -20],
        onInteract: () => zoneManager.enter('main')
    })
    zoneManager.createStation({
        zone: 'cloud',
        label: 'Learn Cloud Scheduling',
        position: [144, 1.5, -27.5],
        onInteract: () => panel.open(1)
    })
    return { world, panel }
}
