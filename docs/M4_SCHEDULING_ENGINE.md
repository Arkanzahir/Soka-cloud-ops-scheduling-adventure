# M4 — Scheduling Engine: ACO & Discretized GWO

**Status:** Pure JavaScript implementation of educational baseline ACO and discretized standard GWO, plus Round Robin. No world, renderer, camera, physics, or UI files were changed.

## Model

- Eight independent tasks: MI = [1200,2400,1800,3200,2100,1500,2700,3600].
- Three heterogeneous VMs: MIPS = [600,1000,1500], simulated cost/sec = [0.001,0.0015,0.0025].
- Each task is assigned to exactly one VM; VMs run tasks sequentially, VMs operate in parallel.
- Execution time = task MI / VM MIPS, VM load = sum of assigned task times, makespan = max(VM loads).
- Cost = sum(VM load × simulated rate), utilizationProxy = VM load / makespan.
- **Only makespan is minimized.** Cost is not a real cloud price; utilization is not actual CPU utilization.
- No transfer/network costs, task dependencies, VM setup times, or billing minimum.
- **Educational baseline algorithms only:** not exact replications of paper OACC (2024) or GWO_C/M (2025).

## Engine usage

```js
import {
  DEFAULT_PROBLEM, runRoundRobin, runACO, runGWO,
  evaluateAssignment
} from './sources/CloudOps/scheduling/index.js'

const rr = runRoundRobin(DEFAULT_PROBLEM)
const aco = runACO(DEFAULT_PROBLEM, { seed: 42, ants: 12, iterations: 50 })
const gwo = runGWO(DEFAULT_PROBLEM, { seed: 42, wolves: 12, iterations: 50 })
console.log(rr.metrics, aco.metrics, gwo.metrics)
```

Return shape: `{ algorithm, bestAssignment, metrics, history, events, fitnessEvaluations, seed?, config? }`. Assignment indices are zero-based; `metrics` has `vmLoads, vmTaskIds, taskDurations, makespan, cost, utilizationProxy, meanUtilizationProxy`.

## Interfaces for 3D world adapters (M5)

**Cloud** — `runRoundRobin().events`: one `type: 'allocation'` event per task, with `taskIndex, taskId, vmIndex, selectedVM, executionTime, vmLoads, partialAssignment`. Animate the task cube moving to the specified VM.

**ACO** — `runACO().events`: `type: 'aco-choice'` contains `iteration, ant, taskIndex, taskId, candidateVMs, probabilities, selectedVM, pheromone, partialAssignment, loadByVM, bestFitness`; `pheromone` is the **per-task tau row**, not an average of all tasks. After each iteration, `type: 'aco-pheromone'` gives `pheromoneSnapshot` (full matrix), `bestAssignment`, and `bestFitness`. Move ants using the engine's actual `selectedVM`, never a second random selection.

**GWO** — `runGWO().events`: `type: 'gwo-iteration'` contains `iteration, a, guides, leaders, wolves, bestAssignment, bestSoFar`. Wolf objects have `id, position, assignment, fitness, vmLoads`; `guides` are alpha/beta/delta **before** the update, `leaders` are winners **after** it. Each wolf represents one complete task-to-VM assignment, not an individual task or physical VM location.

**Chart** — use `history.map(row => ({iteration:row.iteration, bestSoFar:row.bestSoFar, iterationBest:row.iterationBest}))`. Use the **same run** for charts, tables and animations. `trace:false` omits animation events but keeps iteration history.

## ACO implementation

Tau matrix indexed [task][VM]. At each task: probability proportional to `tau^alpha × eta^beta`, where `eta=1/(1e-9+currentVMLoad+executionTime)`; seeded roulette chooses VM. After constructing schedules with 12 ants, evaporate by `1-rho`, deposit `Q/makespan` from iteration-best plus `globalBestWeight × Q/makespan` from global-best, clamp pheromone in [tauMin,tauMax]. Default 50 iterations, alpha=1, beta=2, rho=0.2, Q=1, globalBestWeight=0.5, tauMin=0.01, tauMax=10.

## GWO implementation

12 wolves are continuous vectors with one dimension per task in [0,numVM). Decode via floor and clamp to valid VM indexes, evaluate makespan, rank alpha/beta/delta. For each dimension compute original GWO `A`, `C`, `D` coefficients against three leader positions, average updated coordinates, clamp and decode again. The exploration factor decreases linearly 2 to 0. **No crossover/mutation** is implemented; do not label this GWO_C/M.

## Seed-42 reference results (from this code)

| Algorithm | Makespan (seconds) | Cost (simulated units) | Best assignment | Fitness evaluations |
|---|---:|---:|---|---:|
| Round Robin | 11.833333 | 0.029483333 | [0,1,2,0,1,2,0,1] | 1 |
| ACO | 6.0 | 0.029833333 | [2,1,2,2,0,0,2,1] | 600 |
| GWO | 6.5 | 0.029983333 | [1,1,0,2,0,1,2,2] | 612 |

Do not generalize superiority based on these single-seed results. Budgets differ; repeat across several seeds for scientific comparisons.

## Tests and oracle

```bash
npm test
```

`tests/m4-scheduling.test.mjs` includes 10 tests: exact Round Robin/manual results, exhaustive oracle over all 3^8=6,561 schedules, known optimal makespan 6 sec (9 optimum schedules), input rejection, repeatable RNG, feasible ACO/GWO results, probabilities/pheromone bounds, leader ranking, best-so-far monotonicity, event data consistency and heterogeneous VMs.

The oracle validates the evaluator **only**; it is not injected into ACO or GWO. Core algorithms and automated tests run locally; full merged Three.js integration and browser tests are **not** part of M4.
