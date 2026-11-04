import { DEFAULT_PROBLEM, validateProblem, evaluateAssignment } from './problem.js'
import { createRng, roulette, normalizeWeights } from './random.js'

const DEFAULTS = Object.freeze({
    seed: 42, ants: 12, iterations: 50, alpha: 1, beta: 2,
    rho: 0.2, Q: 1, initialPheromone: 1, tauMin: 0.01, tauMax: 10,
    globalBestWeight: 0.5, trace: true
})

function configure(options)
{
    const config = { ...DEFAULTS, ...options }
    for(const key of ['ants', 'iterations'])
        if(!Number.isSafeInteger(config[key]) || config[key] < 1 || config[key] > 1000)
            throw new RangeError(`${key} must be an integer in [1,1000]`)
    for(const key of ['alpha', 'beta', 'Q', 'globalBestWeight'])
        if(!Number.isFinite(config[key]) || config[key] < 0)
            throw new RangeError(`${key} must be finite and nonnegative`)
    if(!Number.isFinite(config.rho) || config.rho <= 0 || config.rho >= 1)
        throw new RangeError('rho must be between zero and one')
    if(!Number.isFinite(config.tauMin) || config.tauMin <= 0 ||
        !Number.isFinite(config.tauMax) || config.tauMax < config.tauMin ||
        !Number.isFinite(config.initialPheromone) || config.initialPheromone < config.tauMin ||
        config.initialPheromone > config.tauMax)
        throw new RangeError('Pheromone limits or initial value are invalid')
    if(typeof config.trace !== 'boolean') throw new TypeError('trace must be boolean')
    createRng(config.seed)
    return config
}

/** Baseline discrete ACO for independent task -> VM assignments (makespan minimization). */
export function runACO(problem = DEFAULT_PROBLEM, options = {})
{
    validateProblem(problem)
    const config = configure(options)
    const rng = createRng(config.seed)
    const n = problem.tasks.length, m = problem.vms.length
    const pheromone = Array.from({ length: n }, () => Array(m).fill(config.initialPheromone))
    const history = [], events = []
    let globalBest = null

    for(let iteration = 1; iteration <= config.iterations; iteration++)
    {
        let iterationBest = null, iterationSum = 0
        for(let ant = 1; ant <= config.ants; ant++)
        {
            const assignment = []
            const vmLoads = Array(m).fill(0)
            for(let taskIndex = 0; taskIndex < n; taskIndex++)
            {
                const durations = problem.vms.map(vm => problem.tasks[taskIndex].lengthMI / vm.mips)
                const weights = durations.map((time, vm) =>
                    Math.pow(pheromone[taskIndex][vm], config.alpha) *
                    Math.pow(1 / (1e-9 + vmLoads[vm] + time), config.beta))
                const probabilities = normalizeWeights(weights)
                const selectedVM = roulette(probabilities, rng)
                assignment.push(selectedVM)
                vmLoads[selectedVM] += durations[selectedVM]
                if(config.trace)
                    events.push({
                        type: 'aco-choice', iteration, ant, taskIndex,
                        taskId: problem.tasks[taskIndex].id,
                        candidateVMs: problem.vms.map(vm => vm.id),
                        probabilities, selectedVM, vmIndex: selectedVM,
                        vmId: problem.vms[selectedVM].id,
                        pheromone: [...pheromone[taskIndex]],
                        partialAssignment: [...assignment], loadByVM: [...vmLoads],
                        bestFitness: globalBest?.metrics.makespan ?? null
                    })
            }
            const metrics = evaluateAssignment(problem, assignment)
            const candidate = { assignment: [...assignment], metrics }
            iterationSum += metrics.makespan
            if(!iterationBest || metrics.makespan < iterationBest.metrics.makespan) iterationBest = candidate
            if(!globalBest || metrics.makespan < globalBest.metrics.makespan) globalBest = candidate
        }

        // Explicit elitist rule: evaporate all trails; deposit iteration-best plus
        // global-best weighted by globalBestWeight; clamp to [tauMin,tauMax].
        for(let task = 0; task < n; task++)
            for(let vm = 0; vm < m; vm++)
                pheromone[task][vm] = Math.max(config.tauMin, pheromone[task][vm] * (1 - config.rho))
        for(const [candidate, weight] of [[iterationBest, 1], [globalBest, config.globalBestWeight]])
        {
            const deposit = (config.Q * weight) / candidate.metrics.makespan
            for(let task = 0; task < n; task++)
                pheromone[task][candidate.assignment[task]] += deposit
        }
        for(let task = 0; task < n; task++)
            for(let vm = 0; vm < m; vm++)
                pheromone[task][vm] = Math.max(config.tauMin, Math.min(config.tauMax, pheromone[task][vm]))

        const snapshot = pheromone.map(row => [...row])
        const record = {
            iteration,
            iterationBest: iterationBest.metrics.makespan,
            meanFitness: iterationSum / config.ants,
            bestSoFar: globalBest.metrics.makespan,
            bestFitness: globalBest.metrics.makespan,
            iterationBestAssignment: [...iterationBest.assignment],
            bestAssignment: [...globalBest.assignment],
            pheromoneSnapshot: snapshot
        }
        history.push(record)
        if(config.trace) events.push({ type: 'aco-pheromone', ...record })
    }

    return {
        algorithm: 'aco', seed: config.seed, config, bestAssignment: [...globalBest.assignment],
        metrics: evaluateAssignment(problem, globalBest.assignment), history, events,
        fitnessEvaluations: config.ants * config.iterations
    }
}
