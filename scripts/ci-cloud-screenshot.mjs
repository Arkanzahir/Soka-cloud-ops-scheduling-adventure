import fs from 'node:fs'
import path from 'node:path'
import { chromium } from 'playwright'

const out = 'docs/evidence/cloud-ci'
fs.mkdirSync(out, { recursive: true })
const browser = await chromium.launch({
  headless: true,
  args: ['--disable-features=WebGPU', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']
})
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
// CI runner has no physical GPU: force Three.js WebGL2 backend instead of unstable SwiftShader WebGPU.
await page.addInitScript(() => { try { Object.defineProperty(navigator, 'gpu', { configurable: true, value: undefined }) } catch {} })
const report = { checks: [], consoleErrors: [], errors: [], requests: [] }
page.on('pageerror', e => report.errors.push(e.message))
page.on('console', m => { if(m.type() === 'error') report.consoleErrors.push(m.text()) })
page.on('response', r => { if(r.status() >= 400) report.requests.push({ url:r.url(),status:r.status() }) })
const snap = async name => page.screenshot({ path: path.join(out, name + '.png'), timeout: 30000 })
const verify = async (name, condition) => {
  const ok = await page.evaluate(condition).catch(() => false)
  report.checks.push({ name, ok })
  console.log((ok ? 'PASS ' : 'FAIL ') + name)
  return ok
}
let status = 0
try {
  await page.goto('http://127.0.0.1:1240/#skip', { waitUntil: 'domcontentloaded', timeout: 120000 })
  await page.waitForFunction(() => window.game && game.reveal && game.world?.cloudComputeYard && game.world?.cloudOps, null, { timeout: 120000 })
  if(await page.evaluate(() => game.reveal.step !== 2)) {
    await page.keyboard.press('Enter')
    await page.waitForFunction(() => game.reveal.step === 2, null, { timeout: 60000 })
  }
  await page.evaluate(() => {
    for(const [cycle, value] of [[game.dayCycles, .1], [game.yearCycles, .25]]) {
      cycle.newAbsoluteProgressBinding.manual = true
      cycle.newAbsoluteProgressBinding.manualValue = value
      cycle.update(true)
    }
  })
  await verify('CloudWorld and all tasks/VMs mounted', () => game.world.cloudComputeYard.world.tasks.length === 8 && game.world.cloudComputeYard.world.vms.length === 3)
  // Prefer real M2 transition; never fake screenshot with static geometry.
  const entered = await page.evaluate(async () => game.world.cloudOps.enter('cloud', true))
  report.entered = entered
  if(!entered) throw Error('M2 cloud zone transition failed')
  await page.waitForTimeout(2500)
  await verify('Main car moved into Cloud zone', () => game.world.cloudOps.currentZone === 'cloud' && game.physicalVehicle.wheels.inContactCount >= 2)
  await snap('cloud-world-overview')
  // Open M6 panel and step real M4 Round Robin assignment.
  await page.evaluate(() => game.world.cloudComputeYard.panel.open(1))
  await page.waitForTimeout(1200)
  const stepsDone = await page.evaluate(() => {
    const p = game.world.cloudComputeYard.panel
    if(!p.player) return false
    p.player.step()
    p.player.step()
    p.player.step()
    return p.player.snapshot().cursor === 3
  })
  report.threeStepsWorked = stepsDone
  await page.waitForTimeout(900)
  await snap('cloud-world-panel-and-tasks')
  report.noPageErrors = report.errors.length === 0
  if(!report.noPageErrors || !stepsDone) throw Error('Page errors or M6 lesson steps failed')
} catch(e) {
  status = 1
  report.failure = String(e.stack || e)
  await snap('cloud-world-failure').catch(() => {})
  console.error(report.failure)
} finally {
  fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report,null,2))
  await browser.close()
}
process.exitCode = status
