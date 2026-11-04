# M5 — Simulation Bridge (stage 1, waiting for 3D integration)

**Status:** Runtime-independent adapter/playback controller is implemented, tests pass, and branch contains NO edits to the shared Bruno/M2/ACO/GWO/Cloud world code. **This is not yet an end-to-end browser integration.**

## What is implemented

- `sources/CloudOps/simulation/SimulationBridge.js`: one normalized learning timeline per algorithm.
- `createLesson('cloud' | 'aco' | 'gwo', config)`: invokes the actual M4 evaluator and builds Indonesian explanatory steps.
- `createWorldAdapter(algorithm, world)`: turns real M4 events into the correct calls expected by world visualizers.
- `LessonPlayer`: synchronous `step()`, `play(intervalMs)`, `pause()`, `reset()`, `seek(completedSteps)`, `dispose()`, and `snapshot()`. Uses an injected scheduler for tests. Does not own input, camera, physics, DOM, or Three.js objects.
- `compareAlgorithms(problem, config)`: returns real Round Robin/ACO/GWO runs and convergence series for the same data and seeded configuration; makespan is the ONLY objective.
- `tests/m5-simulation.test.mjs`: 8 mock-adapter/controller tests; 18 tests with M4 test suite total.

## Usage when 3D areas are merged

```js
import { createLesson, createWorldAdapter, LessonPlayer, compareAlgorithms } from './CloudOps/simulation/SimulationBridge.js'

// ACO world from feature/aco-world after it is integrated with M2:
const lesson = createLesson('aco', { seed: 42, ants: 12, iterations: 5, sampledAnt: 1 })
const adapter = createWorldAdapter('aco', acoWorldInstance)
const player = new LessonPlayer(lesson, {
  adapter,
  onChange: ({ step, cursor, total, status }) => {
    // Update overlay text using step?.title and step?.explanation.
    // Render only text from one actual run; never re-roll VM selection.
    console.log(cursor, total, status, step?.explanation)
  }
})
player.step()     // exactly one algorithm event -> move ant to selected VM
player.play(500)  // animate remaining events
player.pause()
player.reset()

const compared = compareAlgorithms(undefined, { seed: 42, iterations: 50, ants: 12, wolves: 12 })
console.log(compared.aco.metrics.makespan, compared.gwo.metrics.makespan)
```

For a short classroom demonstration, **use ACO iterations=3–5** in the timeline. For the scientific comparison use **50 iterations** and report both computation budgets; do not pretend the short preview run is the same 50-iteration experiment.

## Concrete 3D contracts

| World | Required method | Real M4 fields passed |
|---|---|---|
| Cloud (pending) | `world.applyAllocation(data)` | `taskIndex, taskId, vmIndex, selectedVM, executionTime, vmLoads, step, partialAssignment` |
| ACO (already prototyped) | `AcoWorld.applyEvent(data)` | `task, taskId, selectedVM, probabilities, pheromone, iteration, ant, partialAssignment, bestFitness` |
| GWO (pending) | `world.applyState(data)` | `iteration, candidates, leaders, guides, bestAssignment, bestMakespan, bestFitness, iterationBest` |
| All worlds (recommended) | `world.resetVisualization()` | restore pre-playback appearance, geometry state and labels |
| ACO (optional) | `world.applyIteration(data)` | full actual pheromone matrix `pheromoneSnapshot` at iteration end |

ACO displays **one sampled ant's decisions per iteration** plus a summary of the iteration's full 12-ant population. This is accurate because the sampled ant's choices originate in M4; the UI must not imply only one ant participates in optimization.

**ACO caveat:** current `feature/aco-world` AcoWorld has `applyEvent`, but has **no `resetVisualization` or `applyIteration`**. It can move an ant using real values after integration, but iteration-end full-matrix visual updates and exact reset/seek still require a small ACO world extension. The adapter deliberately does not invent a selectedVM at pheromone update time.

**GWO caveat:** `leaders` are top candidates AFTER a position update and `guides` were used BEFORE it; labels must distinguish these if showing an update formula. Wolf coordinates are abstract continuous solution vectors, not distances to physical VMs.

## Branch / integration rules

- Base: `feature/m4-scheduling-engine`.
- Branch: `feature/m5-simulation-bridge`.
- Open draft PR targeting **M4**, not `main`. When M4 is merged into the M2 integration line, retarget M5 accordingly.
- ACO PR #1 remains open; no direct merge has been performed. GWO/Cloud teammate branches were not available when this bridge was prepared.
- Future integrator: merge M4 and M5 into one integration branch along with M2 + the 3 worlds, resolve shared `sources/index.js`/zone registries, then mount each world instance into its respective adapter and UI.
- Do not run two timers or start playback during driving; open a learning panel through M2 and pause/stop playback on modal close/zone change.
- For reproducibility show dataset, seed, population, iterations, paper citation, and distinguish simulated rates/utilization proxy from real clouds.

## Verification / limits

Executed locally under Node 22: `node --test tests/m4-scheduling.test.mjs tests/m5-simulation.test.mjs`, **18/18 passing**. Remote source/test Git blob SHA checked against locally tested files.

**NOT YET TESTED:** merged Three.js rendering, driving transitions, generated Cloud/GWO world APIs, mobile/browser FPS, or actual game modal controls. Those require the teammate worlds to be pushed and merged into an integration branch. This PR is intentionally draft.
