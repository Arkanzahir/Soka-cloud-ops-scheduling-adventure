# Cloud Compute Yard — emergency MVP world (2026-11-04)

**Status: code committed; JS syntax checks PASS; NOT YET VERIFIED in a real Bruno browser/physics runtime.** This is a backup implementation to avoid missing the Week 10 demo deadline. Do not merge into main until inspected in Chromium.

## Purpose and ownership

- The teammate owns final environment polish / GWO world. Original ACO world is in PR #1. This branch exists separately so it does **not overwrite** the unpushed local M3 CloudArea commit `d1742f39...` or teammate branches.
- Base: `feature/m6-learning-ui`, which includes M4 engine, M5 SimulationBridge and M6 LearningPanel; this base is intentional for demonstrating Cloud allocations immediately.
- Two new files: `sources/CloudOps/cloud/CloudWorld.js` and `registerCloudWorld.js`. One minimal edit to `sources/Game/World/World.js` to register the area after `ZoneManager`.
- No ACO/GWO models or core vehicle, camera, physics, materials or engine files modified.

## What it does

- Adds a grounded courtyard centered at world (128, -36), with a physical floor, rectangular driveable ring, Bruno-colored vegetation/paving, a Cloud Compute Yard gate and low-poly server display.
- Creates 8 task blocks labeled T1–T8 with exact academic MI values, and 3 VM podiums labeled 600 / 1000 / 1500 MIPS.
- Registers a separate `cloud` zone with M2 `ZoneManager`; main entrance near (35, 36), exit in the Cloud area, safe vehicle spawn (128, -22). These are **candidate coordinates** and must pass physics validation in browser; do not assume they work merely from reading the code.
- E/Enter near the Cloud learning station opens M6 `LearningPanel` directly. `onOpen/onClose` lock/unlock the original vehicle with M2 `CarTransitionController`. M6 uses real Round Robin trace and displays Step/Play/Pause/Reset. On first opening it defaults to Cloud slide.
- `CloudWorld.applyAllocation({taskIndex, taskId, vmIndex/selectedVM, vmLoads, step, partialAssignment})` is compatible with M5 `createWorldAdapter('cloud', world)`. Task cube moves to selected VM, real loads update, VM selected highlights.
- `CloudWorld.applySchedule({assignments, vmLoads, makespan})` is for displaying an entire schedule; `resetVisualization()` restores all tasks, and `setPreviewMode(enabled)` is optional. There are no fabricated results: all numbers come from the injected M4/M5 state.
- M6's navigation between slides works, but other 3D zones are **not yet mounted**; don't claim the full six-chapter camera tour is connected.

## Test after checkout

```sh
npm install
npm test
npm run build
npm run dev
```

In the browser complete the Bruno intro, then:
1. Drive near main gate (35, 36), stop on ground, press E/Enter.
2. Confirm M2 safeSpawn / floor collision and the same red car/camera transfer into Cloud yard.
3. Check 8 task boxes and 3 VM labels on a 16:9 screen; drive around the loop.
4. Approach the Learning station around (144, -27.5), press E/Enter. Check original vehicle stops, M6 panel opens to Cloud.
5. Press Step eight times; task cubes should move to VM1/VM2/VM3 according to RR [0,1,2,0,1,2,0,1] and VM loads finish 11.833333/8.1/2.2 seconds.
6. Press Reset, inspect task initial positions and cleared load labels. Esc should close panel and release vehicle.
7. Drive near exit (128,-20); E/Enter should return to main; verify R resets car.
8. Check browser console, shader warnings, collision, terrain, car follow, startup time and performance.

**If spawn fails:** first inspect physical raycast, ground collider category, vehicle footprint, input filters and actual terrain geometry. Don't force the teleport or invent a pass. Retest spawn and interaction coordinates rather than rewriting M2.

## Known limitations

- No production Chromium run has been performed on this repository copy; 3D appearance, spawn, camera and WebGPU integration are **not verified**. JS source syntax is checked, not a substitute for build or driving tests.
- A small independent ground slab is used because this preview sits outside the default terrain. Artist should replace/reconcile it with approved final terrain and roadside layout.
- This branch was created from M6, not teammate's unpublished M3. Once M3 is pushed, compare modules and choose one source of truth; never mount two Cloud areas simultaneously.
- Full six-zone presentation, ACO/GWO live world state, PR integration and release tests belong to M7. `main` is not modified.
