/** M4 public API: pure scheduling engine, no Three.js, DOM or game-state dependencies. */
export { DEFAULT_PROBLEM, validateProblem, validateAssignment, executionTime, evaluateAssignment } from './problem.js'
export { createRng } from './random.js'
export { runRoundRobin } from './baseline.js'
export { runACO } from './aco.js'
export { runGWO, decodeWolf } from './gwo.js'
