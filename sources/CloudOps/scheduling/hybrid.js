import { DEFAULT_PROBLEM, evaluateAssignment, validateProblem } from './problem.js'
import { createRng } from './random.js'

export const HYBRID_MODES = Object.freeze({
    aco: { title: 'Max-Min → ACO', heuristic: 'Max-Min' },
    ga: { title: 'Min-Min → GA', heuristic: 'Min-Min' }
})

function heuristic(problem, mode, times, emit)
{
    const assignment = problem.tasks.map(() => -1)
    const loads = problem.vms.map(() => 0)
    for(let remaining = problem.tasks.length; remaining > 0; remaining--)
    {
        const completion = times.map((row, index) =>
            assignment[index] === -1 ? row.map((time, vm) => time + loads[vm]) : null)
        const minima = completion.map(row => row ? Math.min(...row) : null)
        const pending = minima.flatMap((time, index) => time === null ? [] : [index])
        const taskIndex = pending.reduce((best, index) =>
            (mode === 'aco' ? minima[index] > minima[best] : minima[index] < minima[best]) ? index : best)
        const vmIndex = completion[taskIndex].indexOf(minima[taskIndex])
        assignment[taskIndex] = vmIndex
        loads[vmIndex] += times[taskIndex][vmIndex]
        emit('allocation', {
            taskIndex, vmIndex, completion, minima,
            assignment: [...assignment], loads: [...loads]
        })
    }
    return { assignment, metrics: evaluateAssignment(problem, assignment) }
}

function makeCandidate(problem, assignment)
{
    return { assignment, metrics: evaluateAssignment(problem, assignment) }
}

const isBetter = (candidate, best) => candidate.metrics.makespan < best.metrics.makespan
const snapshotSteps = [1, 5, 15, 30, 50]

function roulette(row, draw)
{
    let cumulative = 0
    const weights = row.reduce((sum, weight) => sum + weight, 0)
    for(const [index, weight] of row.entries())
    {
        cumulative += weight / weights
        if(draw <= cumulative) return index
    }
    return row.length - 1
}

function optimizeACO(problem, times, seed, random, emit)
{
    let best = seed
    const ants = 25, iterations = 50
    let pheromone = times.map((row, task) => row.map((_, vm) => seed.assignment[task] === vm ? 3 : 1))
    emit('pheromone-seed', { ...seed, pheromone })
    for(let iteration = 1; iteration <= iterations; iteration++)
    {
        const weights = times.map((row, task) =>
            row.map((time, vm) => pheromone[task][vm] * (1 / (time + 1e-6)) ** 2))
        for(let ant = 0; ant < ants; ant++)
        {
            const assignment = weights.map(row => roulette(row, random()))
            const candidate = makeCandidate(problem, assignment)
            if(iteration === 1 && ant === 0) emit('ant', { ...candidate, pheromone, iteration })
            if(isBetter(candidate, best)) best = candidate
        }
        const deposit = 100 / best.metrics.makespan
        pheromone = pheromone.map((row, task) => row.map((value, vm) =>
            Math.max(.01, value * .8) + (best.assignment[task] === vm ? deposit : 0)))
        if(snapshotSteps.includes(iteration)) emit('pheromone-update', { ...best, pheromone, iteration })
    }
    return best
}

function tournament(population, random)
{
    let winner = population[Math.floor(random() * population.length)]
    for(let i = 1; i < 3; i++)
    {
        const candidate = population[Math.floor(random() * population.length)]
        if(isBetter(candidate, winner)) winner = candidate
    }
    return winner
}

function optimizeGA(problem, seed, random, emit)
{
    const size = 30, generations = 50, vmCount = problem.vms.length
    const randomVM = () => Math.floor(random() * vmCount)
    let population = [seed, ...Array.from({ length: size - 1 }, () =>
        makeCandidate(problem, problem.tasks.map(randomVM)))]
    let best = seed
    emit('chromosome-seed', seed)
    for(let iteration = 1; iteration <= generations; iteration++)
    {
        const next = [best]
        for(let childIndex = 1; childIndex < size; childIndex++)
        {
            const left = tournament(population, random)
            const right = tournament(population, random)
            const point = random() < .8 ? Math.floor(random() * problem.tasks.length) : null
            const crossed = left.assignment.map((vm, task) =>
                point !== null && task >= point ? right.assignment[task] : vm)
            const mutations = []
            const assignment = crossed.map((vm, task) => {
                if(random() >= .05) return vm
                const newVM = randomVM()
                if(newVM !== vm) mutations.push(task)
                return newVM
            })
            const candidate = makeCandidate(problem, assignment)
            if(iteration === 1 && childIndex === 1)
            {
                emit('selection', { ...left, parents: [left.assignment, right.assignment], iteration })
                emit('crossover', { assignment: crossed, parents: [left.assignment, right.assignment], point, iteration })
                emit('mutation', { ...candidate, mutations, iteration })
            }
            if(isBetter(candidate, best)) best = candidate
            next.push(candidate)
        }
        population = next
        if(snapshotSteps.includes(iteration)) emit('generation', { ...best, iteration })
    }
    return best
}

/** Educational hybrid algorithms based on the group's Hybrid Scheduling Lab. */
export function runHybrid(problem = DEFAULT_PROBLEM, { mode = 'aco', seed = 42 } = {})
{
    validateProblem(problem)
    if(!Object.hasOwn(HYBRID_MODES, mode)) throw new RangeError('Unknown hybrid mode')
    const random = createRng(seed)
    const events = []
    const emit = (type, data) => events.push({ ...data, type, mode })
    const times = problem.tasks.map(task => problem.vms.map(vm => task.lengthMI / vm.mips))
    const initial = heuristic(problem, mode, times, emit)
    const best = mode === 'aco'
        ? optimizeACO(problem, times, initial, random, emit)
        : optimizeGA(problem, initial, random, emit)
    emit('hybrid-result', { ...best, initialMakespan: initial.metrics.makespan })
    return { mode, seed, initial, best, events }
}
