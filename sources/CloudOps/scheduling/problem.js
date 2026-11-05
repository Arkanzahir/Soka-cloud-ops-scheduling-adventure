/** Pure, independent-task scheduling model. Indices in assignments are 0-based. */
export const DEFAULT_PROBLEM = Object.freeze({
    tasks: Object.freeze([1200, 2400, 1800, 3200, 2100, 1500, 2700, 3600]
        .map((lengthMI, i) => Object.freeze({ id: `T${i + 1}`, lengthMI }))),
    vms: Object.freeze([
        Object.freeze({ id: 'VM1', mips: 600, costPerSecond: 0.001 }),
        Object.freeze({ id: 'VM2', mips: 1000, costPerSecond: 0.0015 }),
        Object.freeze({ id: 'VM3', mips: 1500, costPerSecond: 0.0025 })
    ])
})

export function validateProblem(problem)
{
    if(!problem || !Array.isArray(problem.tasks) || !Array.isArray(problem.vms) ||
        problem.tasks.length < 1 || problem.vms.length < 1)
        throw new RangeError('Problem needs at least one task and one VM')

    for(const [kind, items] of [['task', problem.tasks], ['VM', problem.vms]])
    {
        const ids = new Set()
        for(const item of items)
        {
            if(!item || typeof item.id !== 'string' || !item.id.trim() || ids.has(item.id))
                throw new TypeError(`${kind} IDs must be unique nonempty strings`)
            ids.add(item.id)
        }
    }
    for(const task of problem.tasks)
        if(!Number.isFinite(task.lengthMI) || task.lengthMI <= 0)
            throw new RangeError('Task lengthMI must be finite and positive')
    for(const vm of problem.vms)
        if(!Number.isFinite(vm.mips) || vm.mips <= 0 ||
            !Number.isFinite(vm.costPerSecond) || vm.costPerSecond < 0)
            throw new RangeError('VM mips must be positive and costPerSecond nonnegative')
    return problem
}

export function validateAssignment(problem, assignment)
{
    validateProblem(problem)
    if(!Array.isArray(assignment) || assignment.length !== problem.tasks.length ||
        !assignment.every(vm => Number.isInteger(vm) && vm >= 0 && vm < problem.vms.length))
        throw new RangeError('Assignment must contain one valid 0-based VM index for each task')
    return assignment
}

export function executionTime(problem, taskIndex, vmIndex)
{
    validateProblem(problem)
    if(!Number.isInteger(taskIndex) || taskIndex < 0 || taskIndex >= problem.tasks.length ||
        !Number.isInteger(vmIndex) || vmIndex < 0 || vmIndex >= problem.vms.length)
        throw new RangeError('Invalid task or VM index')
    const result = problem.tasks[taskIndex].lengthMI / problem.vms[vmIndex].mips
    if(!Number.isFinite(result) || result <= 0) throw new RangeError('Execution time overflow')
    return result
}

export function evaluateAssignment(problem, assignment)
{
    validateAssignment(problem, assignment)
    const vmLoads = problem.vms.map(() => 0)
    const vmTaskIds = problem.vms.map(() => [])
    const taskDurations = []
    for(let i = 0; i < assignment.length; i++)
    {
        const vm = assignment[i]
        const duration = problem.tasks[i].lengthMI / problem.vms[vm].mips
        if(!Number.isFinite(duration) || duration <= 0) throw new RangeError('Execution time overflow')
        vmLoads[vm] += duration
        vmTaskIds[vm].push(problem.tasks[i].id)
        taskDurations.push(duration)
    }
    const makespan = Math.max(...vmLoads)
    const cost = vmLoads.reduce((sum, load, j) => sum + load * problem.vms[j].costPerSecond, 0)
    if(!Number.isFinite(makespan) || makespan <= 0 || !Number.isFinite(cost))
        throw new RangeError('Scheduling metrics overflow')
    const utilizationProxy = vmLoads.map(load => load / makespan)
    return {
        assignment: [...assignment], vmLoads, vmTaskIds, taskDurations, makespan, cost,
        utilizationProxy,
        meanUtilizationProxy: utilizationProxy.reduce((sum, value) => sum + value, 0) / problem.vms.length
    }
}
