import { DEFAULT_PROBLEM, validateProblem, evaluateAssignment } from './problem.js'

/** Round Robin is a scheduling baseline, not a metaheuristic optimization. */
export function runRoundRobin(problem = DEFAULT_PROBLEM)
{
    validateProblem(problem)
    const bestAssignment = problem.tasks.map((_, i) => i % problem.vms.length)
    const metrics = evaluateAssignment(problem, bestAssignment)
    const vmLoads = problem.vms.map(() => 0)
    const partialAssignment = []
    const events = bestAssignment.map((selectedVM, taskIndex) =>
    {
        const duration = metrics.taskDurations[taskIndex]
        partialAssignment.push(selectedVM)
        vmLoads[selectedVM] += duration
        return {
            type: 'allocation', algorithm: 'round-robin', step: taskIndex + 1,
            taskIndex, taskId: problem.tasks[taskIndex].id,
            vmIndex: selectedVM, selectedVM, vmId: problem.vms[selectedVM].id,
            executionTime: duration, vmLoads: [...vmLoads],
            partialAssignment: [...partialAssignment]
        }
    })
    return {
        algorithm: 'round-robin', bestAssignment, metrics, events,
        history: [{ iteration: 0, bestSoFar: metrics.makespan, bestFitness: metrics.makespan }],
        fitnessEvaluations: 1
    }
}
