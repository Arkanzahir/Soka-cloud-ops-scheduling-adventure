import { DEFAULT_PROBLEM } from '../scheduling/index.js'

/** Fixed-size visual pools: 8 task actors and 3 VM destinations.
 * The experiment activates a subset of those actors without rebuilding the world.
 */
export const EXPERIMENT_DEFAULTS=Object.freeze({taskCount:8,vmCount:3,iterations:50,seed:42})
export const EXPERIMENT_CHOICES=Object.freeze({
 taskCount:Object.freeze([4,6,8]),
 vmCount:Object.freeze([2,3]),
 iterations:Object.freeze([10,25,50])
})
export function validateExperimentConfig(config){
 if(!config||!EXPERIMENT_CHOICES.taskCount.includes(config.taskCount)||!EXPERIMENT_CHOICES.vmCount.includes(config.vmCount)||!EXPERIMENT_CHOICES.iterations.includes(config.iterations))throw new RangeError('Unsupported ACO experiment configuration')
 if(!Number.isSafeInteger(config.seed)||config.seed<0||config.seed>0xffffffff)throw new RangeError('Invalid experiment seed')
 return Object.freeze({...config})
}
export function createExperimentProblem(config=EXPERIMENT_DEFAULTS){
 const {taskCount,vmCount}=validateExperimentConfig(config)
 return {tasks:DEFAULT_PROBLEM.tasks.slice(0,taskCount),vms:DEFAULT_PROBLEM.vms.slice(0,vmCount)}
}
