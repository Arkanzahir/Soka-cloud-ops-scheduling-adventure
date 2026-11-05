import test from 'node:test'
import assert from 'node:assert/strict'
import {
    DEFAULT_PROBLEM, validateProblem, validateAssignment, executionTime,
    evaluateAssignment, runRoundRobin, runACO, runGWO, decodeWolf, createRng
} from '../sources/CloudOps/scheduling/index.js'

const close = (actual, expected, epsilon = 1e-9) => assert.ok(
    Math.abs(actual - expected) <= epsilon, `${actual} != ${expected}`)
const feasible = (assignment, problem) => {
    assert.equal(assignment.length, problem.tasks.length)
    for(const vm of assignment) assert.ok(Number.isInteger(vm) && vm >= 0 && vm < problem.vms.length)
}
const monotone = history => {
    for(let i = 1; i < history.length; i++)
        assert.ok(history[i].bestSoFar <= history[i - 1].bestSoFar + 1e-10)
}

test('Round Robin oracle: 8 tasks / 3 VMs, makespan, cost and utilization proxy', () => {
    const r = runRoundRobin()
    assert.deepEqual(r.bestAssignment, [0, 1, 2, 0, 1, 2, 0, 1])
    close(r.metrics.vmLoads[0], 11.833333333333334)
    close(r.metrics.vmLoads[1], 8.1)
    close(r.metrics.vmLoads[2], 2.2)
    close(r.metrics.makespan, 11.833333333333334)
    close(r.metrics.cost, 0.029483333333333334)
    close(r.metrics.meanUtilizationProxy, 0.6234741784037558)
    assert.equal(r.events.length, 8)
    assert.deepEqual(r.events.at(-1).vmLoads, r.metrics.vmLoads)
    assert.deepEqual(r.events.at(-1).partialAssignment, r.bestAssignment)
})

test('Manual calculation: 1 task, 1 VM', () => {
    const problem = { tasks: [{ id: 'T1', lengthMI: 1200 }], vms: [{ id: 'VM1', mips: 600, costPerSecond: 0.001 }] }
    assert.equal(executionTime(problem, 0, 0), 2)
    const m = evaluateAssignment(problem, [0])
    assert.deepEqual(m.vmLoads, [2])
    assert.equal(m.makespan, 2)
    assert.equal(m.cost, 0.002)
    assert.deepEqual(m.utilizationProxy, [1])
    assert.equal(runRoundRobin(problem).metrics.makespan, 2)
    assert.equal(runACO(problem, { ants: 2, iterations: 3 }).metrics.makespan, 2)
    assert.equal(runGWO(problem, { wolves: 4, iterations: 3 }).metrics.makespan, 2)
})

test('Known globally optimal assignment from exhaustive 3^8 oracle', () => {
    const m = evaluateAssignment(DEFAULT_PROBLEM, [2, 2, 1, 2, 2, 1, 1, 0])
    close(m.makespan, 6)
    close(m.cost, 0.029833333333333333)
    close(m.meanUtilizationProxy, 0.9962962962962963)
})

test('Exhaustive oracle proves optimum 6 sec and exactly 9 optimal schedules', () => {
    const n = DEFAULT_PROBLEM.tasks.length, base = DEFAULT_PROBLEM.vms.length
    let best = Infinity, count = 0
    for(let code = 0; code < base ** n; code++) {
        let value = code
        const assignment = Array.from({ length: n }, () => { const r = value % base; value = Math.floor(value / base); return r })
        const result = evaluateAssignment(DEFAULT_PROBLEM, assignment)
        if(result.makespan < best - 1e-9) { best = result.makespan; count = 1 }
        else if(Math.abs(result.makespan - best) < 1e-9) count++
    }
    close(best, 6)
    assert.equal(count, 9)
})

test('Reject invalid problem, assignment, seed, and algorithm parameters', () => {
    assert.throws(() => validateProblem({ tasks: [], vms: [] }))
    assert.throws(() => validateProblem({ tasks: [{ id: 'T', lengthMI: -1 }], vms: DEFAULT_PROBLEM.vms }))
    assert.throws(() => validateProblem({ tasks: DEFAULT_PROBLEM.tasks, vms: [{ id: 'VM', mips: 0, costPerSecond: 1 }] }))
    assert.throws(() => validateProblem({ tasks: DEFAULT_PROBLEM.tasks, vms: [{ id: 'VM', mips: 1, costPerSecond: -1 }] }))
    assert.throws(() => validateAssignment(DEFAULT_PROBLEM, [0, 1]))
    assert.throws(() => validateAssignment(DEFAULT_PROBLEM, [0, 1, 2, 0, 1, 2, 0, 3]))
    assert.throws(() => validateAssignment(DEFAULT_PROBLEM, [0, 1, 2, 0, 1, 2, 0, 1.5]))
    assert.throws(() => createRng(-1))
    assert.throws(() => createRng(2 ** 32))
    assert.throws(() => runACO(DEFAULT_PROBLEM, { rho: 1 }))
    assert.throws(() => runACO(DEFAULT_PROBLEM, { ants: 0 }))
    assert.throws(() => runGWO(DEFAULT_PROBLEM, { wolves: 3 }))
    assert.throws(() => runGWO(DEFAULT_PROBLEM, { iterations: 0 }))
    assert.throws(() => decodeWolf([NaN], 3))
})

test('RNG repeats exactly for the same seed and differs across seeds', () => {
    const a = createRng(42), b = createRng(42), c = createRng(43)
    const x = Array.from({ length: 10 }, a), y = Array.from({ length: 10 }, b)
    assert.deepEqual(x, y)
    assert.notDeepEqual(x, Array.from({ length: 10 }, c))
})

test('ACO reproducible with seeded choices, positive pheromone and monotone best', () => {
    const config = { seed: 42, iterations: 50, ants: 12 }
    const a = runACO(DEFAULT_PROBLEM, config), b = runACO(DEFAULT_PROBLEM, config)
    assert.deepEqual(a, b)
    feasible(a.bestAssignment, DEFAULT_PROBLEM)
    assert.equal(a.history.length, config.iterations)
    assert.equal(a.fitnessEvaluations, 600)
    monotone(a.history)
    assert.ok(a.metrics.makespan >= 6 - 1e-9)
    assert.equal(a.history.at(-1).bestSoFar, a.metrics.makespan)
    assert.equal(a.events.filter(e => e.type === 'aco-choice').length, 50 * 12 * 8)
    for(const e of a.events.filter(e => e.type === 'aco-choice')) {
        close(e.probabilities.reduce((sum, x) => sum + x, 0), 1, 1e-12)
        assert.ok(e.probabilities.every(x => Number.isFinite(x) && x >= 0 && x <= 1))
        assert.ok(e.selectedVM >= 0 && e.selectedVM < 3)
        assert.equal(e.partialAssignment.length, e.taskIndex + 1)
        assert.equal(e.partialAssignment.at(-1), e.selectedVM)
    }
    for(const e of a.events.filter(e => e.type === 'aco-pheromone')) {
        assert.ok(e.pheromoneSnapshot.flat().every(x => Number.isFinite(x) && x >= 0.01 && x <= 10))
    }
    assert.notDeepEqual(a.history[0].pheromoneSnapshot, Array.from({ length: 8 }, () => [1, 1, 1]))
})

test('GWO seeded reproducibility, leader validity, continuous update and discretization', () => {
    const config = { seed: 42, wolves: 12, iterations: 50 }
    const a = runGWO(DEFAULT_PROBLEM, config), b = runGWO(DEFAULT_PROBLEM, config)
    assert.deepEqual(a, b)
    feasible(a.bestAssignment, DEFAULT_PROBLEM)
    assert.equal(a.history.length, config.iterations)
    assert.equal(a.fitnessEvaluations, 12 * 51)
    monotone(a.history)
    assert.ok(a.metrics.makespan >= 6 - 1e-9)
    assert.equal(a.history.at(-1).bestSoFar, a.metrics.makespan)
    close(a.history[0].a, 2)
    close(a.history.at(-1).a, 0)
    for(const e of a.events) {
        assert.equal(e.type, 'gwo-iteration')
        assert.equal(e.wolves.length, 12)
        const leaders = [e.leaders.alpha, e.leaders.beta, e.leaders.delta]
        assert.ok(leaders[0].fitness <= leaders[1].fitness + 1e-10)
        assert.ok(leaders[1].fitness <= leaders[2].fitness + 1e-10)
        for(const wolf of e.wolves) {
            feasible(wolf.assignment, DEFAULT_PROBLEM)
            assert.deepEqual(wolf.assignment, decodeWolf(wolf.position, 3))
            assert.ok(wolf.position.every(x => x >= 0 && x < 3))
            close(wolf.fitness, evaluateAssignment(DEFAULT_PROBLEM, wolf.assignment).makespan)
        }
    }
})

test('ACO/GWO trace disabled still provides history and valid solution', () => {
    for(const r of [runACO(DEFAULT_PROBLEM, { seed: 73, ants: 4, iterations: 7, trace: false }),
        runGWO(DEFAULT_PROBLEM, { seed: 73, wolves: 4, iterations: 7, trace: false })]) {
        assert.deepEqual(r.events, [])
        assert.equal(r.history.length, 7)
        assert.equal(r.history.at(-1).bestSoFar, r.metrics.makespan)
        feasible(r.bestAssignment, DEFAULT_PROBLEM)
    }
})

test('Highly heterogeneous two VMs and extreme valid input never emit NaN', () => {
    const problem = {
        tasks: [1000, 750, 2000].map((lengthMI, i) => ({ id: `T${i}`, lengthMI })),
        vms: [{ id: 'slow', mips: 0.01, costPerSecond: 0 }, { id: 'fast', mips: 1e7, costPerSecond: 1e-6 }]
    }
    for(const r of [runRoundRobin(problem), runACO(problem, { iterations: 5, ants: 5 }),
        runGWO(problem, { iterations: 5, wolves: 5 })]) {
        assert.ok(Number.isFinite(r.metrics.makespan))
        assert.ok(Number.isFinite(r.metrics.cost))
        feasible(r.bestAssignment, problem)
    }
})
