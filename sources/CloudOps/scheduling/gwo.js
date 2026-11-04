import { DEFAULT_PROBLEM, validateProblem, evaluateAssignment } from './problem.js'
import { createRng } from './random.js'

const DEFAULTS = Object.freeze({ seed: 42, wolves: 12, iterations: 50, trace: true })

function configure(options)
{
    const config = { ...DEFAULTS, ...options }
    if(!Number.isSafeInteger(config.wolves) || config.wolves < 4 || config.wolves > 1000)
        throw new RangeError('wolves must be an integer in [4,1000]')
    if(!Number.isSafeInteger(config.iterations) || config.iterations < 1 || config.iterations > 1000)
        throw new RangeError('iterations must be an integer in [1,1000]')
    if(typeof config.trace !== 'boolean') throw new TypeError('trace must be boolean')
    createRng(config.seed)
    return config
}

/** Continuous wolf coordinates are decoded as floor(x) => 0-based VM indices. */
export function decodeWolf(position, vmCount)
{
    if(!Number.isSafeInteger(vmCount) || vmCount < 1 || !Array.isArray(position) ||
        position.length < 1 || position.some(value => !Number.isFinite(value)))
        throw new RangeError('Invalid wolf position or VM count')
    return position.map(value => Math.max(0, Math.min(vmCount - 1, Math.floor(value))))
}

function snapshot(wolf)
{
    return {
        id: wolf.id, position: [...wolf.position], assignment: [...wolf.assignment],
        fitness: wolf.metrics.makespan, vmLoads: [...wolf.metrics.vmLoads]
    }
}

function ranking(wolves)
{
    return [...wolves].sort((a, b) => a.metrics.makespan - b.metrics.makespan || a.id.localeCompare(b.id))
}

/** Standard GWO encircling update, clipped + discretized for VM assignments. */
export function runGWO(problem = DEFAULT_PROBLEM, options = {})
{
    validateProblem(problem)
    const config = configure(options)
    const rng = createRng(config.seed)
    const n = problem.tasks.length, m = problem.vms.length
    const makeWolf = (id, position) =>
    {
        const assignment = decodeWolf(position, m)
        return { id, position, assignment, metrics: evaluateAssignment(problem, assignment) }
    }
    let wolves = Array.from({ length: config.wolves }, (_, i) =>
        makeWolf(`wolf-${String(i + 1).padStart(3, '0')}`, Array.from({ length: n }, () => rng() * m)))
    let globalBest = ranking(wolves)[0]
    const history = [], events = []

    for(let iteration = 1; iteration <= config.iterations; iteration++)
    {
        const guides = ranking(wolves).slice(0, 3)
        const before = guides.map(snapshot)
        // a decreases linearly 2 -> 0, including the endpoints for multi-iteration runs.
        const a = config.iterations === 1 ? 0 : 2 * (1 - (iteration - 1) / (config.iterations - 1))
        wolves = wolves.map(wolf =>
        {
            const next = wolf.position.map((x, taskIndex) =>
            {
                let total = 0
                for(const leader of guides)
                {
                    const r1 = rng(), r2 = rng()
                    const A = 2 * a * r1 - a
                    const C = 2 * r2
                    const distance = Math.abs(C * leader.position[taskIndex] - x)
                    total += leader.position[taskIndex] - A * distance
                }
                return Math.max(0, Math.min(m - 1e-9, total / 3))
            })
            return makeWolf(wolf.id, next)
        })
        const ranked = ranking(wolves)
        const iterationBest = ranked[0]
        if(iterationBest.metrics.makespan < globalBest.metrics.makespan) globalBest = iterationBest
        const leaders = { alpha: snapshot(ranked[0]), beta: snapshot(ranked[1]), delta: snapshot(ranked[2]) }
        const record = {
            iteration, a, leaders, guides: { alpha: before[0], beta: before[1], delta: before[2] },
            iterationBest: iterationBest.metrics.makespan,
            bestSoFar: globalBest.metrics.makespan, bestFitness: globalBest.metrics.makespan,
            bestAssignment: [...globalBest.assignment],
            wolves: ranked.map(snapshot)
        }
        history.push(record)
        if(config.trace) events.push({ type: 'gwo-iteration', ...record })
    }
    return {
        algorithm: 'gwo', seed: config.seed, config,
        bestAssignment: [...globalBest.assignment],
        metrics: evaluateAssignment(problem, globalBest.assignment),
        history, events, fitnessEvaluations: config.wolves * (config.iterations + 1)
    }
}
