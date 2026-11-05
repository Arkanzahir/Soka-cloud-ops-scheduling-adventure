# Selective mini-world readability polish — 2026-11-05

Branch `feature/mini-world-readability` starts at tested Group 8 branding `154574e`, which includes release `bc1d0dd`. Review against `feature/group8-mainworld-branding` first (dependency PR #11). Release/main and other worktrees remain unchanged. No automatic merge/deployment.

## Scope

- `sources/CloudOps/aco/AcoWorld.js`: move the 11-unit entrance board from the driving foreground to the left courtyard verge; reduce it to 6 units. Its two existing post colliders follow their visible posts. Research station, gate/spawn coordinates, table, ants and pheromone paths remain unchanged.
- `sources/CloudOps/CloudArea.js`: retain all eight existing packages, homes, labels and allocation destinations. Paint eight numbered parking outlines on the existing dock using **one static canvas texture / plane (two triangles)**. Empty dock now reads as an evacuated task queue; no duplicate packages, actors, colliders, listeners or animation loops.
- `sources/CloudOps/gwo/GwoWorld.js`: raise compact cream nameplates 0.7 units, split actual leader role and fitness onto two lines, disable shadow modulation on these labels. Show only three real leader labels; all five original wolves/candidate states remain. Clear labels on reset. Existing algorithm/adapter APIs and live role/fitness values remain intact.

No numerical algorithm, dataset, SimulationBridge, ZoneManager/registration, M6 dashboard, camera/vehicle/physics source, renderer or Low-mode settings changed. Credits/licenses untouched.

## Visual review

Genuine Chrome screenshots use the original **gameplay follow camera**, 1366×768 CSS, device DPR2 and actual **Low rendering DPR1**. Same car positions, day/year controls and simulation steps before/after; no free camera or screenshot compositing. Weather/wind and background system load remain uncontrolled.

| View | Before | After |
| --- | --- | --- |
| ACO arrival, car at (220,8) | [Before](evidence/mini-polish-before-aco-arrival.png) | [After](evidence/mini-polish-after-aco-arrival.png) |
| ACO research panel, car at (211,7) | [Before](evidence/mini-polish-before-aco-live-panel.png) | [After](evidence/mini-polish-after-aco-live-panel.png) |
| Cloud after eight real allocations, car at (-65,-25) | [Before](evidence/mini-polish-before-cloud-live.png) | [After](evidence/mini-polish-after-cloud-live.png) |
| Cloud reset, same eight packages | [Before](evidence/mini-polish-before-cloud-reset.png) | [After](evidence/mini-polish-after-cloud-reset.png) |
| GWO real leaders, car at (-57,65) | [Before](evidence/mini-polish-before-gwo-live.png) | [After](evidence/mini-polish-after-gwo-live.png) |

ACO's car is now unobstructed at arrival. The unchanged right-hand M6 panel still covers the right-hand simulation from the research-station pose; close it with Esc to inspect the whole 3D table. This limited polish does **not** claim to solve that layout constraint by moving navigation, simulation or dashboard. One nonleader GWO wolf is still partly behind an existing tree from this angle; no scenery/world redesign attempted.

The first wider, camera-facing GWO label trial overlapped a neighboring wolf. Final labels retain original width/orientation, use smaller two-line plates and omit nonleader plates. Initial browser capture was interrupted before results because its test inspection flag was unset; enabled only for inspection/test builds, removed for normal release.

## Verification and measurements

Low-mode measurements use the same dev build configuration, Chrome 156 headless WebGPU on Windows (CDP lists RTX 3050 Laptop GPU), original camera and five-second windows. These are observed samples, **not** real presentation-device acceptance or a statistically established performance gain. No GPU elapsed-time/VRAM measurement, weaker-laptop or long-session claim.

| World | Before FPS / p95 ms | After FPS / p95 ms |
| --- | --- | --- |
| ACO | 102.6 / 10.8 | 102.9 / 10.6 |
| Cloud | 131.7 / 8.5 | 127.2 / 8.9 |
| GWO | 120.2 / 9.4 | 118.2 / 9.4 |

Cloud's observed FPS drops 3.4%, GWO 1.7%; do not describe this as a speed improvement. All samples remain above the 30 FPS target on this tested setup. Main renderer, quality, DPR/resize and post-processing are unchanged. The only new rendered geometry is the two-triangle dock paint; its texture is created once. GWO reuses five existing label textures, now 768×256 instead of 1536×192 each, with only three leader plates visible. Five static culling holder groups preserve child visibility on frustum re-entry, without new listeners or per-frame allocation.

Fifteen dedicated browser checks pass. All three worlds retain mesh/geometry/texture counts across twenty warmed seek/reset loops; GWO labels clear and stay cleared after Main→GWO re-entry. Post-GC heap samples are 50.6→50.1 MiB, not a memory-leak proof. Raw [before](evidence/mini-polish-before.json) / [after](evidence/mini-polish-after.json) retain timings, camera/car positions, GPU inventory and checks.

Reproduction: `npm test`, `npm run build`, `npm run test:build`; browser scripts `test-mini-world-readability.mjs`, `test-m7.mjs`, `test-release-ui.mjs`, and normal-release `test-browser.mjs --production`. Test builds alone use `VITE_GAME_PUBLIC=1`; final release clears it. Evidence uses the `mini-polish-` prefix, leaving prior reports intact. Final production regression results follow below.

| Final verification | Result / evidence |
| --- | --- |
| Unit/core/asset/algorithm contracts | **37 passed**, [log](evidence/mini-polish-unit.log) |
| Selective Low visual/real events/resource reuse/re-entry | **15 passed**, [JSON](evidence/mini-polish-after.json) |
| Production-subpath integrated gameplay | **32 passed**, [JSON](evidence/mini-polish-production.json) |
| Low/High, persistence/resize, 1366×768 and 1920×1080 M6 | **28 passed**, [JSON](evidence/mini-polish-ui-ui.json) |
| Final normal build without debug Game | **Passed**, [log](evidence/mini-polish-release-build.log) |
| Output assets / relative paths / Rapier WASM | **963 SHA-256 matches**, [log](evidence/mini-polish-assets.log) |
| Normal-release subpath rendering/menu/error smoke | **6 passed**, [JSON](evidence/mini-polish-normal-browser.json) |
| Normal-release public UI, all three Step/Play/Pause/Reset, comparison/papers/MIT | **15 passed**, [JSON](evidence/mini-polish-normal-ui.json) |

Integrated checks include physical entrances/exits Main↔Cloud/ACO/GWO, vehicle/follow camera/ground contact, E/Enter/Esc/R, real RR allocations/makespan, real ACO choices/pheromone iteration, five real GWO candidates/leader IDs/role accents, neutral reset, Next/Previous, comparison and references. Final runs report no JavaScript or local HTTP errors. The normal-release helper now accepts an optional evidence label; default behavior is preserved so old Group 8 reports are not overwritten.

**Ready for review as a small dependent PR**, not automatically released. Review this against the branding branch, then carry the approved branding and polish together into release. Main/release/branding/integration heads were not modified. Known limits: the unchanged panel/ACO sightline and GWO tree occlusion described above; no weaker-device/long-session acceptance; existing upstream font-path/eval/chunk warnings and prior licensing/paper-acceptance limits remain. No deployment or algorithm claim added.
