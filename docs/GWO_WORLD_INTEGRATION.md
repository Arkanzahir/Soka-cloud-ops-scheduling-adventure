# GWO World — Phase 1

Base: development/m2-shared-game-extension. Working branch: feature/gwo-world. PR target: development/m2-shared-game-extension. P0 checkpoint: 35bae38c8e1e2770a38779642c375c370b759a0d (pushed and verified remotely).

## Run

`npm install --force`, `npm run dev`. Complete original intro. Main gate “Wolf Field Research” is near the landing area; its position is selected by M2 findReturnCheckpoint around [39,50]. Stop, press E/Enter. In GWO: original drive controls; R uses M2 reset; Research at [-65,70], exit at [-65,75]. Esc closes the native M2 modal.

## Integration

GwoWorld extends original Area with bounding/frustum markers. It mounts after ZoneManager in World.step(2). Only shared edits are that import/initialization and the static `gwo-research` modal HTML (discovered by Bruno before game init). No new keyboard listeners, physics, rendering, camera or vehicle controller. No ACO/Cloud code changed.

Terrain, grass, trees, rocks, track/path, lighting and palette family come from the original sector around [-65,65]. This shares the M2 demonstration sector intentionally for Phase 1; the M2 benches and test registrations remain untouched. The circuit segment is the driveable route. Spawn [-65,65] is checked with M2 safeSpawn after placement; every wolf/entrance location is ray-tested for dry level ground. New wolf/sign geometry is procedural editable source in GwoWorld.js; no Blender or external assets were used. Benches reuse original geometry/material. License and attribution retained.

## Visual API

`game.world.areas.gwo.applyState(state, {preview:false})` accepts iteration, exactly five candidates `{id, assignment:[eight integers 0..2], fitness}`, distinct leader IDs `{alpha,beta,delta}`, bestAssignment, bestMakespan. Validation is renderer-independent in state.js and input is cloned. Caller supplies actual computed state; no optimization/evaluation is performed here.

Labels, fitness, board iteration/best value, and smooth orientation reflect events. Wolf orientation indicates ranking only; positions do not imply distance to VM. Each wolf is one full schedule. Assignments appear in the research panel. Repeated events reuse the same five actors and label textures, adding no listeners/meshes. `resetVisualization()` restores deterministic DEMO/PREVIEW values and orientation. Demo fitness values are synthetic, explicitly labeled, and not claims of computed makespan.

## Tests and evidence

`npm test` (four tests), `npm run build`, `node scripts/test-gwo.mjs` with dev server port 1245 and VITE_GAME_PUBLIC=1. Browser test uses original #skip and test setup physics placement to reach gates, then actual keyboard E/Enter/Esc/R and a driving segment. This is targeted smoke coverage, not manual traversal of every route.

Runtime screenshots: docs/evidence/gwo/overview.png, pack.png, research.png. Browser JSON records pass/errors. Existing font-path/bundle warnings remain. Mobile/WebGL/gamepad and sustained performance not verified. Full optimizer, dashboard, scene disposal/streaming and final exclusive map parcel are outside Phase 1. The area uses original scenery rather than replacing terrain or modifying original assets.
