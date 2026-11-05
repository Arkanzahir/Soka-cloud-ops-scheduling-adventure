import test from 'node:test'
import assert from 'node:assert/strict'
import { createLesson, createWorldAdapter, LessonPlayer, compareAlgorithms } from '../sources/CloudOps/simulation/SimulationBridge.js'

test('Cloud lesson explains each of eight real Round Robin assignments', () => {
    const lesson = createLesson('cloud')
    assert.equal(lesson.timeline.length, 8)
    assert.equal(lesson.timeline[0].source.selectedVM, 0)
    assert.equal(lesson.timeline[7].source.selectedVM, 1)
    const calls = []
    const adapter = createWorldAdapter('cloud', { applyAllocation: x => calls.push(x) })
    for(const step of lesson.timeline) adapter.apply(step)
    assert.deepEqual(calls.at(-1).vmLoads, lesson.run.metrics.vmLoads)
    assert.deepEqual(calls.at(-1).partialAssignment, lesson.run.bestAssignment)
})

test('ACO sampled ant choices come directly from M4, pheromone is real task row', () => {
    const lesson = createLesson('aco', { seed: 42, ants: 4, iterations: 3, sampledAnt: 2 })
    assert.equal(lesson.timeline.length, 3 * (8 + 1))
    const actual = lesson.run.events.filter(e => e.type === 'aco-choice' && e.ant === 2)
    assert.equal(actual.length, 24)
    const calls = [], changes = []
    const adapter = createWorldAdapter('aco', { applyEvent: x => calls.push(x), applyIteration: x => changes.push(x) })
    for(const step of lesson.timeline) adapter.apply(step)
    assert.equal(calls.length, 24)
    assert.equal(changes.length, 3)
    for(let i = 0; i < calls.length; i++) {
        assert.equal(calls[i].selectedVM, actual[i].selectedVM)
        assert.deepEqual(calls[i].pheromone, actual[i].pheromone)
        assert.deepEqual(calls[i].probabilities, actual[i].probabilities)
    }
})

test('ACO adapter works with actual AcoWorld surface (only applyEvent)', () => {
    const lesson = createLesson('aco', { ants: 4, iterations: 1 })
    const received = []
    const adapter = createWorldAdapter('aco', { applyEvent: x => received.push(x) })
    for(const step of lesson.timeline) adapter.apply(step)
    assert.equal(received.length, 8)
    assert.equal(received[0].task, 0)
    assert.equal(received.at(-1).task, 7)
})

test('GWO adapter preserves actual ranking, continuous wolves and final fitness', () => {
    const lesson = createLesson('gwo', { seed: 42, wolves: 4, iterations: 4 })
    assert.equal(lesson.timeline.length, 4)
    const calls = []
    const adapter = createWorldAdapter('gwo', { applyState: x => calls.push(x) })
    for(const step of lesson.timeline) adapter.apply(step)
    assert.equal(calls.length, 4)
    assert.deepEqual(calls[0].leaders, lesson.run.history[0].leaders)
    assert.deepEqual(calls.at(-1).bestAssignment, lesson.run.history.at(-1).bestAssignment)
    assert.equal(calls.at(-1).bestMakespan, lesson.run.metrics.makespan)
})

test('Player step, reset, seek and finished maintain deterministic cursor', () => {
    const lesson = createLesson('cloud'), applied = [], reset = []
    const adapter = { apply: e => applied.push(e), reset: () => reset.push(true) }
    const player = new LessonPlayer(lesson, { adapter })
    assert.equal(player.snapshot().status, 'ready')
    player.step()
    assert.equal(player.snapshot().cursor, 1)
    assert.equal(player.snapshot().status, 'paused')
    player.seek(3)
    assert.equal(player.snapshot().cursor, 3)
    assert.equal(reset.length, 1)
    assert.equal(applied.length, 4)
    player.reset()
    assert.equal(player.snapshot().cursor, 0)
    for(let i = 0; i < 8; i++) player.step()
    assert.equal(player.snapshot().status, 'finished')
    assert.equal(player.step(), null)
    assert.throws(() => player.seek(100))
})

test('Player Play/Pause uses injected timer, never advances after pause', () => {
    const lesson = createLesson('cloud')
    const timers = new Map(), scheduler = {
        setInterval: (fn, ms) => { const id = timers.size + 1; timers.set(id, fn); return id },
        clearInterval: id => timers.delete(id)
    }
    const p = new LessonPlayer(lesson, { scheduler })
    p.play(50)
    assert.equal(p.snapshot().status, 'playing')
    timers.values().next().value()
    assert.equal(p.snapshot().cursor, 1)
    p.pause()
    assert.equal(timers.size, 0)
    assert.equal(p.snapshot().status, 'paused')
    assert.throws(() => p.play(10))
})

test('Reject adapter mismatch and invalid sampled ant, unknown lesson', () => {
    assert.throws(() => createLesson('invalid'))
    assert.throws(() => createLesson('aco', { sampledAnt: 50, ants: 4 }))
    const lesson = createLesson('cloud')
    assert.throws(() => createWorldAdapter('cloud', {}).apply(lesson.timeline[0]))
    assert.throws(() => createWorldAdapter('gwo', {}).apply(lesson.timeline[0]))
    assert.throws(() => createWorldAdapter('aco', null))
})

test('Comparison uses actual engine results and aligned iteration series', () => {
    const result = compareAlgorithms(undefined, { seed: 42, iterations: 6, ants: 4, wolves: 4 })
    assert.ok(Math.abs(result.baseline.metrics.makespan - 11.833333333333334) < 1e-9)
    assert.equal(result.charts.aco.length, 6)
    assert.equal(result.charts.gwo.length, 6)
    assert.deepEqual(result.charts.aco.map(x=>x.bestSoFar), result.aco.history.map(x=>x.bestSoFar))
    assert.equal(result.aco.fitnessEvaluations, 24)
    assert.equal(result.gwo.fitnessEvaluations, 28)
})
