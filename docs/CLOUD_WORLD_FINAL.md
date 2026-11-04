# Cloud Compute Yard — Phase 2 integration

Base: feature/cloud-world @ d1742f39e928e2c5d7a876a05e5dbcfa4b965a49. Branch: feature/cloud-world-final. PR target: development/m2-shared-game-extension.

## Spatial reservation

Cloud relocated from [-50,70] to center [-65,-35], radius 20, spawn [-65,-25]. Exit [-55,-25], research safe stop [-76,-30]. Main gate [49,34.5] retains tested M3 placement. M2/GWO center [-65,65], radius 18: center distance 100 > combined radii 38. ACO current preview center [220,0] is distant. No GWO/ACO source merged or modified. Source branches were inspected read-only. Lead must preserve these reserved envelopes when relocating any world.

The location was selected after an actual browser/Rapier safeSpawn grid probe on the original terrain. Spawn is checked before and after props are created, and grounded driving/reset tested in-browser. Local slab paths use the original slab texture on top of existing dry terrain; no new floor/heightfield. Original circuit remains traversable. Added trees reuse original oak model/Foliage; VM bodies retain M3 brick geometry/materials. New signs, server details and task crates use Bruno MeshDefaultMaterial shading. No Blender or external asset pack.

## Ownership and hooks

CloudArea extends original Area and keeps M3 entry/exit/station and M2 panel/transition/reset contracts. Modifications are confined to CloudArea, cloud helpers, Cloud-specific modal text, tests and this document. No M4/M5/M6 changes. `game.world.areas.cloud` is the world instance. Optional `world.onLearn = callback` lets the final integrator open M6 instead of the M3 fallback panel. The callback should use shared station locking/modal lifecycle.

Eight crates show workload MI (not seconds); three VM installations show speed MIPS and accumulated execution load seconds. Makespan is the longest load. The perimeter route is kept separate from display pads. Queue/VM props use fixed simple colliders; decorative task actors are visual-only to avoid rigid-body animation conflicts.

## Run and evidence

`npm run dev`; enter the Cloud gate near original controls checkpoint with E/Enter. R resets inside Cloud; research E/Enter opens native M2 panel; Esc returns driving; exit returns Main.

Test mode: VITE_GAME_PUBLIC=1, dev port 1247, `node scripts/test-cloud-final.mjs`. Test-only physics placement approaches stations; actual keyboard drives interactions and a driving segment. Screenshots are browser captures with day=.1/year=.25. This is not a claim of manual traversal of every route or full browser/device performance coverage.
