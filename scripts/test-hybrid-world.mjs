import assert from 'node:assert/strict'
import { join } from 'node:path'
import { chromium } from 'playwright'

const browser = await chromium.launch({
    channel: process.env.BROWSER_CHANNEL || 'chrome',
    headless: true,
    args: ['--enable-unsafe-webgpu']
})
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const url = new URL(process.argv[2] || 'http://127.0.0.1:1263/#skip')
const errors = []
page.on('pageerror', error => errors.push(error.message))
page.on('response', response => {
    if(new URL(response.url()).origin === url.origin && response.status() >= 400)
        errors.push(`${response.status()} ${response.url()}`)
})
const wait = (fn, arg, timeout = 25000) => page.waitForFunction(fn,arg,{ timeout })
const action = name => page.locator(`.co-learning [data-action="${name}"]`)
const save = async name => {
    if(process.env.HYBRID_SCREENSHOTS)
    {
        await page.waitForTimeout(950)
        await page.screenshot({path: join(process.env.HYBRID_SCREENSHOTS,name)})
    }
}
async function parkAt(kind)
{
    await page.evaluate(kind => {
        const { cloudOps, areas, presentationRace } = game.world
        const station = kind === 'race' ? presentationRace.stops[4].station : areas.hybrid[kind]
        const { x,z } = station.position
        const rotation = Math.PI/2
        for(const [dx,dz] of [[0,0],[-1,0],[1,0],[0,-1],[0,1]])
        {
            try
            {
                const spawn = cloudOps.transitions.safeSpawn({position:[x+dx,z+dz],rotation})
                cloudOps.transitions.place(spawn,rotation)
                return
            }
            catch {}
        }
        throw new Error(`No safe parking at ${kind}`)
    },kind)
    await wait(kind => {
        const station = kind === 'race' ? game.world.presentationRace.stops[4].station : game.world.areas.hybrid[kind]
        return game.physicalVehicle.wheels.inContactCount >= 2 && station.trigger.isIn &&
            game.interactivePoints.activeItem === station.point && station.point.state === 4
    },kind)
}

try
{
    await page.goto(url.href)
    await wait(() => window.game?.world?.learning && game.world.cloudOps.canInteract(),null,120000)
    if(process.env.HYBRID_SCREENSHOTS)
        await page.evaluate(() => {
            for(const [cycle,progress] of [[game.dayCycles,.10],[game.yearCycles,.25]])
            {
                cycle.newAbsoluteProgressBinding.manual = true
                cycle.newAbsoluteProgressBinding.manualValue = progress
                cycle.update(true)
            }
        })
    await parkAt('entry')
    await page.keyboard.press('e')
    await wait(() => game.world.cloudOps.currentZone === 'hybrid' && game.world.cloudOps.canInteract())
    await wait(() => game.world.areas.hybrid.ant.walkMixer)
    await wait(() => Math.abs(game.view.zoom.smoothedRatio - .1) < .02)
    if(process.env.HYBRID_SCREENSHOTS)
        await page.waitForTimeout(4800)
    await save('hybrid-world.png')
    await page.keyboard.press('l')
    await wait(() => game.world.learning.panel.slide === 4 && game.modals.state === 1)
    await action('step').click()
    assert.equal(await page.locator('.co-hybrid-matrix [data-selected]').count(),1)
    await wait(() => {
        const world = game.world.areas.hybrid
        const step = game.world.learning.panel.player.snapshot().step.source
        const crate = world.tasks[step.taskIndex]
        return crate.group.position.distanceTo(crate.target) < .05 && world.pads[step.vmIndex].active.visible
    })
    if(process.env.HYBRID_SCREENSHOTS)
        await page.locator('.co-simulation').evaluate(element => element.scrollIntoView({block:'start'}))
    await save('hybrid-max-min.png')
    await page.evaluate(() => game.world.learning.panel.player.seek(10))
    await wait(() => {
        const world = game.world.areas.hybrid
        return world.ant.mesh.position.distanceTo(world.antHome) > 1
    })
    await action('hybrid-mode').filter({ hasText:'Min-Min → GA' }).click()
    await page.evaluate(() => game.world.learning.panel.player.seek(11))
    assert.match(await page.locator('.co-step-title').innerText(),/gabungkan/i)
    assert.ok(await page.evaluate(() => {
        const world = game.world.areas.hybrid
        const event = game.world.learning.panel.player.snapshot().step.source
        const {materials} = world.kit
        const vmColors = [materials.blue,materials.coral,materials.sage]
        const rows = [...event.parents,event.assignment]
        return world.chromosome.every((row,index) => row.cells.every((cell,task) =>
            cell.material === vmColors[rows[index][task]]))
    }))
    await save('hybrid-ga.png')
    await page.evaluate(() => {
        const { player } = game.world.learning.panel
        player.seek(player.lesson.timeline.length)
    })
    assert.match(await page.locator('.co-step-summary').innerText(),/7,50.*6,33/)
    await page.keyboard.press('Escape')
    await wait(() => game.world.cloudOps.canInteract())
    await parkAt('exit')
    await page.keyboard.press('e')
    await wait(() => game.world.cloudOps.currentZone === 'main' && game.world.cloudOps.canInteract())
    console.log('PASS Free Drive, transfer task, matrix, pheromone, GA and exit')

    await page.locator('#presentation-open').click()
    await wait(() => game.world.presentationRace.active &&
        game.interactivePoints.activeItem === game.world.areas.circuit.interactivePoint &&
        game.interactivePoints.activeItem.state === 4)
    await page.keyboard.press('e')
    await wait(() => game.world.presentationRace.ready,null,35000)
    await parkAt('race')
    assert.ok(await page.evaluate(() => {
        const { areas, presentationRace } = game.world
        const exhibit = presentationRace.root.getObjectByName('hybrid-trackside-exhibit')
        const sign = presentationRace.root.getObjectByName('hybrid-trackside-sign')
        return presentationRace.root.visible && exhibit?.children.length > 0 && !!sign?.parent &&
            !areas.hybrid.group.visible && areas.hybrid.tasks.every(task => task.group.parent === areas.hybrid.group)
    }))
    const parked = await page.evaluate(() => game.player.position.toArray())
    await save('hybrid-race-checkpoint.png')
    await page.keyboard.press('e')
    await wait(() => game.world.cloudOps.currentZone === 'hybrid' && game.world.learning.panel.visible)
    await page.keyboard.press('Escape')
    await wait(() => game.world.cloudOps.canInteract('racing'))
    await parkAt('exit')
    await page.keyboard.press('e')
    await wait(() => game.world.cloudOps.currentZone === 'main' && game.world.cloudOps.canInteract('racing'))
    assert.ok(await page.evaluate(([x,,z]) => Math.hypot(game.player.position.x-x,game.player.position.z-z)<.2,parked))
    assert.ok(await page.evaluate(() => game.world.presentationRace.viewed.has(4) && game.world.areas.circuit.timer.running))
    assert.deepEqual(errors,[])
    console.log('PASS Presentation Race Hybrid entry, dashboard, return to original parking spot and active timer')
}
catch(error)
{
    console.log('Game errors',errors)
    await save('hybrid-browser-error.png')
    throw error
}
finally { await browser.close() }
