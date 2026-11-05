import { DEFAULT_PROBLEM, runRoundRobin, runACO, runGWO } from '../scheduling/index.js'

/** M5 bridge: deterministic algorithm trace -> one explained visual step.
 * No renderer/DOM import; 3D world objects are injected by the final integrator.
 */
export function createLesson(algorithm, { problem = DEFAULT_PROBLEM, sampledAnt = 1, ...config } = {})
{
    if(!['cloud', 'aco', 'gwo'].includes(algorithm)) throw new RangeError('Unknown lesson')
    const run = algorithm === 'cloud' ? runRoundRobin(problem) :
        algorithm === 'aco' ? runACO(problem, { ...config, trace: true }) :
        runGWO(problem, { ...config, trace: true })
    if(algorithm === 'aco' && (!Number.isInteger(sampledAnt) || sampledAnt < 1 || sampledAnt > run.config.ants))
        throw new RangeError('sampledAnt must identify a real ant')
    const timeline = []
    for(const event of run.events)
    {
        if(algorithm === 'cloud')
        {
            timeline.push({ algorithm, kind: 'allocation', source: event,
                title: `${event.taskId} → ${event.vmId}`,
                explanation: `Round Robin menugaskan ${event.taskId} ke ${event.vmId}; beban VM tersebut bertambah ${event.executionTime.toFixed(2)} detik.` })
        }
        else if(algorithm === 'aco' && event.type === 'aco-choice' && event.ant === sampledAnt)
        {
            timeline.push({ algorithm, kind: 'ant-choice', source: event,
                title: `Iterasi ${event.iteration}: ${event.taskId} → ${event.vmId}`,
                explanation: `Semut ${event.ant} memilih ${event.vmId} berdasarkan probabilitas feromon dan estimasi beban. Ini satu keputusan dari jadwal lengkap.` })
        }
        else if(algorithm === 'aco' && event.type === 'aco-pheromone')
        {
            timeline.push({ algorithm, kind: 'pheromone-update', source: event,
                title: `Iterasi ${event.iteration}: feromon diperbarui`,
                explanation: `Semua ${run.config.ants} semut telah dievaluasi. Feromon menguap dan ditambah berdasarkan jadwal terbaik; makespan terbaik sejauh ini ${event.bestSoFar.toFixed(2)} detik.` })
        }
        else if(algorithm === 'gwo' && event.type === 'gwo-iteration')
        {
            timeline.push({ algorithm, kind: 'wolf-iteration', source: event,
                title: `Iterasi ${event.iteration}: Alpha, Beta, Delta`,
                explanation: `Kandidat diperbarui berdasarkan tiga pemimpin, lalu assignment task→VM dievaluasi. Makespan terbaik ${event.bestSoFar.toFixed(2)} detik.` })
        }
    }
    return { algorithm, problem, run, timeline, sampledAnt: algorithm === 'aco' ? sampledAnt : null }
}

/** Adapt exactly the event payloads expected by existing AcoWorld and upcoming worlds. */
export function createWorldAdapter(algorithm, world)
{
    if(!world || typeof world !== 'object') throw new TypeError('World instance is required')
    const call = (method, data) => {
        if(typeof world[method] !== 'function') throw new Error(`${algorithm} world requires ${method}()`)
        if(world[method](data) === false) throw new Error(`${algorithm} visualization rejected the event`)
    }
    return {
        apply(step)
        {
            if(!step || step.algorithm !== algorithm) throw new TypeError('Wrong lesson step for adapter')
            const e = step.source
            if(algorithm === 'cloud')
                call('applyAllocation', {
                    taskIndex: e.taskIndex, taskId: e.taskId, vmIndex: e.selectedVM,
                    selectedVM: e.selectedVM, executionTime: e.executionTime,
                    vmLoads: [...e.vmLoads], step: e.step,
                    partialAssignment: [...e.partialAssignment]
                })
            else if(algorithm === 'aco' && step.kind === 'ant-choice')
                call('applyEvent', {
                    iteration: e.iteration, ant: e.ant, task: e.taskIndex,
                    taskId: e.taskId, selectedVM: e.selectedVM,
                    probabilities: [...e.probabilities], pheromone: [...e.pheromone],
                    partialAssignment: [...e.partialAssignment], bestFitness: e.bestFitness
                })
            else if(algorithm === 'aco' && step.kind === 'pheromone-update')
            {
                // Existing AcoWorld only accepts VM choices; do not fake one at iteration end.
                if(typeof world.applyIteration === 'function') world.applyIteration(e)
            }
            else if(algorithm === 'gwo')
                call(typeof world.applyOptimizerState === 'function' ? 'applyOptimizerState' : 'applyState', {
                    iteration: e.iteration, candidates: e.wolves,
                    leaders: e.leaders, guides: e.guides,
                    bestAssignment: [...e.bestAssignment],
                    bestMakespan: e.bestSoFar, bestFitness: e.bestSoFar,
                    iterationBest: e.iterationBest
                })
        },
        reset()
        {
            if(typeof world.resetVisualization === 'function') world.resetVisualization()
        }
    }
}

/** Player that can be wired to Step/Play/Pause/Reset without binding to UI or physics. */
export class LessonPlayer
{
    constructor(lesson, { adapter = null, onChange = () => {}, scheduler = globalThis } = {})
    {
        if(!lesson || !Array.isArray(lesson.timeline) || typeof onChange !== 'function')
            throw new TypeError('Lesson and onChange are required')
        this.lesson = lesson
        this.adapter = adapter
        this.onChange = onChange
        this.scheduler = scheduler
        this.cursor = 0
        this.timer = null
        this.status = 'ready'
    }
    snapshot()
    {
        return { cursor: this.cursor, total: this.lesson.timeline.length,
            status: this.status, step: this.lesson.timeline[this.cursor - 1] ?? null,
            result: this.lesson.run }
    }
    emit() { this.onChange(this.snapshot()) }
    step()
    {
        if(this.cursor >= this.lesson.timeline.length)
        {
            this.pause()
            this.status = 'finished'
            this.emit()
            return null
        }
        const event = this.lesson.timeline[this.cursor]
        this.adapter?.apply(event)
        this.cursor++
        if(this.cursor === this.lesson.timeline.length)
        {
            this.pause()
            this.status = 'finished'
        }
        else if(this.status !== 'playing') this.status = 'paused'
        this.emit()
        return event
    }
    pause()
    {
        if(this.timer !== null)
        {
            this.scheduler.clearInterval(this.timer)
            this.timer = null
        }
        if(this.status === 'playing') this.status = 'paused'
        this.emit()
    }
    play(intervalMs = 700)
    {
        if(!Number.isFinite(intervalMs) || intervalMs < 50) throw new RangeError('Invalid playback interval')
        if(this.cursor >= this.lesson.timeline.length) this.reset()
        this.pause()
        this.status = 'playing'
        this.timer = this.scheduler.setInterval(() => this.step(), intervalMs)
        this.emit()
    }
    reset()
    {
        this.pause()
        this.cursor = 0
        this.adapter?.reset()
        this.status = 'ready'
        this.emit()
    }
    /** Replays earlier steps from the start; visual adapters must be resettable for exact rewind. */
    seek(completedSteps)
    {
        if(!Number.isInteger(completedSteps) || completedSteps < 0 || completedSteps > this.lesson.timeline.length)
            throw new RangeError('Seek must be a valid completed-step count')
        this.reset()
        for(let i = 0; i < completedSteps; i++) this.step()
        return this.snapshot()
    }
    dispose() { this.pause() }
}

/** Comparison always uses one shared dataset, common evaluator and explicit seed. */
export function compareAlgorithms(problem = DEFAULT_PROBLEM, { seed = 42, iterations = 50, ants = 12, wolves = 12 } = {})
{
    const baseline = runRoundRobin(problem)
    const aco = runACO(problem, { seed, iterations, ants, trace: false })
    const gwo = runGWO(problem, { seed, iterations, wolves, trace: false })
    return { problem, seed, baseline, aco, gwo,
        charts: {
            aco: aco.history.map(h => ({ iteration: h.iteration, bestSoFar: h.bestSoFar })),
            gwo: gwo.history.map(h => ({ iteration: h.iteration, bestSoFar: h.bestSoFar }))
        },
        note: 'Makespan minimized; cost and utilization are secondary. Algorithms have different evaluation counts.' }
}
