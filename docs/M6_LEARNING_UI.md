# M6 — Learning UI and Presentation Mode (stage 1)

**Status: UI component, six-section learning script, real-engine charts, paper panel, and dev-only standalone preview are implemented. Not yet mounted in the merged Bruno game.** Source branch `feature/m6-learning-ui` is based on M5 and must stay separate until the teammate's ACO/Cloud/GWO world changes are integrated.

## Why this design

The 3D **mini-world remains the main teaching medium**. A narrow side panel (width <= 440px desktop) adds the academic explanation and playback controls without covering the world. Colors approximate Bruno's warm playful palette; it is not a new cyberpunk dashboard. Browser on mobile uses a bottom sheet.

Sections: **Pembukaan → Cloud → ACO → GWO → Hasil → Paper**. Each section poses an understandable question and ends with a concise takeaway. The presenter can skip among six sections using native buttons. Section→zone mapping: `main`, `cloud`, `aco`, `gwo`, then results/paper without a separate world.

### What works now

- `sources/CloudOps/learning/PresentationContent.js`: six learning sections, verified paper metadata/DOI, explanation of a single scheduling step from **actual** M5/M4 trace, shared-run comparison data, SVG plot coordinates.
- `sources/CloudOps/learning/LearningPanel.js`: DOM overlay with Step, Play, Pause, Reset, previous/next, result cards, convergence chart, assignment table, paper references. Uses `textContent` for untrusted dynamic task/VM labels instead of HTML injection. Keyboard Escape can close a standalone overlay.
- `sources/CloudOps/learning/learning-panel.css`: namespaced `.co-learning` styles, readable on 1440x900 proyector, keeps canvas visible. No external JS/CSS library needed.
- `sources/CloudOps/learning/preview.html`: developer-only, single-page stand-alone preview without Bruno game. It uses real M4/M5 engine computations but a **non-3D placeholder backdrop**. Under Vite `sources/` root, dev URL is `/CloudOps/learning/preview.html`; it is not automatically bundled into the normal production `index.html`.
- `tests/m6-learning.test.mjs`: 7 Node tests of section order, reproducibility, metrics, chart mapping, ACO/GWO explanations and papers.

### Academic distinctions

- `createLesson('aco', { iterations:4, ants:12, sampledAnt:1 })` shows ONE sampled ant's 8 VM choices per iteration and a truthful full-population pheromone summary. This is a **short teaching demo**, not the 50-iteration experiment.
- `createLesson('gwo', { iterations:4, wolves:12 })` displays leader scores from engine history. 3D wolves represent complete candidates; continuous coordinates are an abstraction.
- Results use `compareAlgorithms(problem,{seed:42,iterations:50,ants:12,wolves:12})`, dataset 8 tasks / 3 VMs. Makespan is the only optimization objective; cost and utilization proxy are secondary metrics. ACO 600 evals, GWO 612 evals, Round Robin 1. **Single-seed results are illustrative, not statistical superiority.**
- Paper panel states that the code is educational *baseline* ACO and discretized GWO, **not the improved variants** OACC or GWO_C/M in the cited papers.

## Hook into M2 and real 3D worlds later (integrator's job)

The final game import must bring in the CSS as well as the panel class:

```js
import './CloudOps/learning/learning-panel.css'
import { LearningPanel } from './CloudOps/learning/LearningPanel.js'

const panel = new LearningPanel({
  mount: document.body,
  worlds: { cloud: cloudWorld, aco: acoWorld, gwo: gwoWorld },
  navigate: zone => zoneManager.presentation.goTo(zone),
  onOpen: () => { /* host locks vehicle input and camera via M2 before showing */ },
  onClose: () => { /* host restores camera/input and returns DRIVING state */ }
})
// Hook station E/Enter through ZoneManager.createStation onInteract:
// panel.open(1) for Cloud; panel.open(2) for ACO; panel.open(3) for GWO.
// DO NOT start playback while driving; pause on modal closed/zone change.
```

**Do not blindly call both `ZoneManager.openPanel()` and the standalone overlay open()**: M2 owns vehicle lock/modal lifetime. EITHER mount `LearningPanel({ embedded: true, escapeCloses:false })` inside an existing registered native Bruno modal, OR wire `onOpen/onClose` into M2 lock/restore. The final integrator must follow actual M2 lifecycle; this stage intentionally avoids modifying it. A native M2 modal is the preferred final integration.

If `navigate()` is not installed or zones are not available, slides still work; the UI explicitly reports that the world is not connected, never fakes driving transitions.

### Adapter interface expectations

- `cloudWorld.applyAllocation({taskIndex, taskId, vmIndex, vmLoads, ...})`
- `acoWorld.applyEvent({task, selectedVM, probabilities, pheromone, ...})` (**already exists in ACO prototype**)
- `gwoWorld.applyState({iteration, candidates, leaders, ...})`
- `world.resetVisualization()` recommended on all worlds for reliable Reset/Seek.

ACO `applyIteration` and `resetVisualization` are still absent in the teammate's 2026-11-04 ACO prototype; that requires a small update before truly accurate 3D reset/iteration highlighting. Cloud/GWO APIs should be inspected once those branches are pushed.

## Verification and scope of tests

- Local Node 22 `npm test`: **25 tests pass** (10 M4 + 8 M5 + 7 M6).
- Chromium headless was tested using a same-document module preview because direct local/file URL navigation is blocked in the execution sandbox. Verified six buttons/sections, Cloud/ACO/GWO Step, real probability/leader text, three result cards, 8 assignment table rows, three paper cards, close, **no JavaScript page errors**. Screenshots include M6 opening, ACO and results. This is valid UI component/browser behavior testing, NOT a browser test of the merged Bruno Three.js game or deployment.
- Not yet tested: Vite production build of complete repo, original car input/modals with panel, full 3D world integration, projector/browser device-specific performance, production routes. These are integration/M7 tasks after world branches are available.

## Project status and next step

1. Keep M6 PR in draft targeting M5, M5 targeting M4, M4 targeting M2.
2. Await teammate's `feature/gwo-world` and `feature/cloud-world-visual`, and reconcile ACO PR #1 onto M2-compatible branch.
3. Merge all into **separate integration branch**; use native M2 modal lifecycle, register worlds and station callbacks, then test live game in Chromium and production Vite build. Avoid direct merges into main before approval.
4. Finish M7: world reset/cleanup and visualization parity, GitHub Pages deployment, final rehearsal, paper clearance and attribution check.
