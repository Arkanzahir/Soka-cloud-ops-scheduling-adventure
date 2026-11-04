# ACO World integration

Branch: feature/aco-world. Base: 54681c41d4fdef15b46068ad68604008040f5826.

Run `npm install --force`, `npm run dev`, then open `/?aco-preview`, complete the original intro with Enter. Original car: WASD/arrows, brake B, reset R. Research: approach the board and press E/Enter; Esc closes the panel. Preview animation is explicitly DUMMY.

## Modules and ownership

`sources/CloudOps/aco/AcoWorld.js` contains editable procedural Three.js source assets (anthill, articulated ant silhouette, signs, task blocks, VM podiums, paths, boundary and planting). No Blender was used and no GLB export is required. Original oak GLB/foliage and slab texture are reused through Bruno's Trees and MeshDefaultMaterial. Root MIT and existing notices remain intact. No downloaded assets or new audio/fonts.

`preview.js` waits for the original game, mounts the world, adds an isolated spawn and research dialog. The only shared edit is a query-gated dynamic import in `sources/index.js`. Without the query the main game runs unchanged. No transition engine or algorithm is implemented.

This independent preview uses a grounded paved test courtyard centered at (220,0,0), outside the original map to avoid original landmarks. Its fixed ground and boundary colliders are local additions; the main terrain, vehicle, physics engine and camera are unchanged. This is a preview location, NOT an approved final map parcel. The lead should mount the world at a validated anchor and replace the preview courtyard boundary/ground with the approved terrain placement when M2 is ready. The current layout has a wide driveable perimeter around the research installations.

## Runtime contract

`new AcoWorld(game, originVector3)` after game resources/physics/interactions exist. Mount once per game; full scene unload/disposal is not implemented. The world uses the existing ticker and can be integrated with area lifecycle later.

`world.onResearch = callback` provides the shared simulator hook. Preview installs its own accessible native dialog and restores wandering input on close. Replace with the lead's shared station/modal adapter for final integration.

`world.applyEvent({ selectedVM: 0|1|2, task, probabilities, pheromone: [tau0,tau1,tau2] })` disables dummy playback and moves one ant along the selected branch. Optional pheromone changes path thickness using normalized real values. Other event fields are retained in `world.event` for a simulator inspector. The world does not calculate probabilities, pheromone, fitness or schedules. The current geometry is the requested eight-task/three-VM educational installation; arbitrary VM counts and a full step/replay UI belong to future integration.

## Verification

`npm test`, `npm run build`, `npm run test:build`; `node scripts/test-aco-world-browser.mjs URL` tests driving, grounded reset, E interaction, Esc and event input, and writes screenshots/report to docs/evidence/aco. URL can be dev or production preview with `?aco-preview`.

Review screenshots before final visual acceptance. Current limitations: isolated paved preview rather than integrated natural Main World parcel; no full ACO engine; no streaming/disposal; no WebGL/mobile coverage; existing dependency/font/audio clearance issues from M0 remain. This contribution does not publish the game or change repository visibility.

Verified 2026-11-04: three integrity tests PASS; production build PASS; 958 asset SHA-256 build checks PASS; Chrome headless development and production subpath browser checks PASS with zero page errors. Screenshots in docs/evidence/aco were captured from production with day=.1/year=.25. Existing font-path and bundle-size build warnings remain. No claim of WebGL/mobile or sustained FPS validation.
