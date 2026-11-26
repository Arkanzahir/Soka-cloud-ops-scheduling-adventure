import assert from 'node:assert/strict'
import test from 'node:test'
import { createHybridLesson } from '../sources/CloudOps/hybrid/HybridLesson.js'
import { runHybrid } from '../sources/CloudOps/scheduling/hybrid.js'

test('Max-Min picks the largest row minimum and Min-Min picks the smallest', () => {
    const max = runHybrid().events[0]
    const min = runHybrid(undefined,{mode:'ga'}).events[0]
    assert.equal(max.taskIndex,7)
    assert.equal(max.minima[max.taskIndex],Math.max(...max.minima))
    assert.equal(min.taskIndex,0)
    assert.equal(min.minima[min.taskIndex],Math.min(...min.minima))
    for(const allocation of [max,min])
        assert.equal(allocation.completion[allocation.taskIndex][allocation.vmIndex],allocation.minima[allocation.taskIndex])
})

test('both hybrid lessons retain the heuristic seed and reproduce reference lab results', () => {
    for(const [mode, initial, final, best] of [
        ['aco',6.4,6.4,[0,0,2,1,1,2,2,2]],
        ['ga',7.5,6.333333333333333,[2,2,0,2,1,0,2,1]]
    ])
    {
        const lesson = createHybridLesson(mode)
        const { run, timeline } = lesson
        assert.equal(run.initial.metrics.makespan,initial)
        assert.equal(run.best.metrics.makespan,final)
        assert.deepEqual(run.best.assignment,best)
        assert.deepEqual(lesson,createHybridLesson(mode))
        const allocations = timeline.filter(step => step.kind==='allocation')
        assert.equal(new Set(allocations.map(step => step.source.taskIndex)).size,8)
        assert.deepEqual(allocations.at(-1).source.assignment,run.initial.assignment)
        assert.deepEqual(timeline.at(-1).source.assignment,run.best.assignment)
        assert.ok(timeline.every(step => step.title && step.explanation))
    }
})

test('optimizer phases receive the heuristic schedule and expose real operator choices', () => {
    const aco = runHybrid()
    const seed = aco.events.find(event => event.type==='pheromone-seed')
    seed.pheromone.forEach((row,task) => {
        row.forEach((value,vm) => assert.equal(value,vm===seed.assignment[task] ? 3 : 1))
    })
    const last = aco.events.filter(event => event.type==='pheromone-update').at(-1)
    assert.equal(last.iteration,50)
    assert.deepEqual(last.assignment,aco.best.assignment)

    const ga = runHybrid(undefined,{mode:'ga'})
    assert.deepEqual(ga.events.find(event => event.type==='chromosome-seed').assignment,ga.initial.assignment)
    const crossed = ga.events.find(event => event.type==='crossover')
    assert.deepEqual(crossed.assignment,crossed.parents[0].map((vm,task) =>
        crossed.point !== null && task >= crossed.point ? crossed.parents[1][task] : vm))
    const mutation = ga.events.find(event => event.type==='mutation')
    assert.deepEqual(mutation.mutations,mutation.assignment.flatMap((vm,task) => vm===crossed.assignment[task] ? [] : [task]))
})
