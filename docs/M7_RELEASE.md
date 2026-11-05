# M7 final release candidate — 2026-11-04

Branch: `release/m7-final`; rollback checkpoint: `integration/m7-demo` @ `084893f5ca462b425e64b9283ce40bf56a2c32d4`. Main and PR #9 target remain unchanged. No deployment.

## Measured performance

Windows, Chrome 156 headless, 1366×768 CSS viewport, device scale factor 2, same browser/scenario/hardware before and after. Five-second windows after two seconds of settling per scenario. CDP lists NVIDIA GeForce RTX 3050 Laptop GPU; WebGPU reports nvidia/ampere and `isFallbackAdapter: false`, not SwiftShader. These are hardware-backed headless throughput samples, not a foreground/weak-laptop/long-duration benchmark. Live weather, shader/OS caches and background activity can vary.

| Scenario | High FPS before → final | Low FPS before → final | Low p95 ms before → final | Final High draw calls / triangles |
|---|---:|---:|---:|---:|
| main | 126.8 → 128.6 | 127.0 → 141.5 | 9.1 → 7.9 | 270 / 483178 |
| cloud | 119.2 → 115.7 | 119.3 → 125.1 | 9.4 → 9.0 | 376 / 458542 |
| aco | 96.4 → 90.1 | 93.9 → 102.5 | 12.1 → 10.7 | 494 / 390887 |
| gwo | 113.2 → 110.3 | 112.2 → 114.1 | 9.9 → 10.0 | 410 / 442757 |
| panel-gwo-play | 114.5 → 112.2 | 105.1 → 118.1 | 11.6 → 9.4 | 407 / 442691 |

All sampled scenarios exceed 30 FPS on this laptop. High has no consistent gain (including slower final ACO/GWO/panel samples); do not generalize or hide that variation. Low reduces the HiDPI canvas from 2732×1536 to 1366×768: 75% fewer rendered pixels, with higher measured FPS in these Low samples. At DPR 1 it keeps native resolution.

Local startup to game instance with intro skipped: 18.08 s before, 17.59 s final. No material loading-time improvement claimed. Final run requested 153 local resources, 23.17 MB decoded / 18.95 MB encoded; largest were Boy.mp3 (6.51 MB) and entry JS (~4.96 MB decoded). This is localhost, not a bandwidth-throttled internet test. Assets/music were not replaced.

CDP TaskDuration remains about 99–100% of each uncapped throughput window; ScriptDuration and heap samples are recorded per scenario in JSON. This shows a busy main thread, not a demonstrated reduction in CPU utilization. GPU elapsed timestamps are zero/uncollected and are **not** valid GPU timings; no GPU-ms or VRAM-utilization claim. Draw calls, triangle counts and pixel budget are observable pressure indicators.

## Targeted changes

- Native Quality Low now caps DPR at 1 on startup, toggle and resize, and persists the choice. High retains the original DPR cap 2 and rendering pipeline. Small Quality/Viewport/Game glue changes; no physics/renderer rewrite.
- ACO pheromone buffers reuse geometry, normals and centerline while changing radius; unit regression compares positions against fresh Three.js TubeGeometry. Inactive ACO visual group/animation is skipped, hidden/finished ants are skipped, explicit vector scratch objects reused. Actual M4/M5 events and numerical values are unchanged.
- Presentation button returns to Main before opening the native modal, fixing a reproduced open/close race on reopening from GWO. No independent panel/input framework.
- Existing computed utilization proxy is now visible beside cost/evaluation count in comparison cards. Six-section layout preserved; no redesign.

Twenty ACO seek/reset cycles: 66.2 → 26.8 ms synchronous burst; distinct path geometry IDs 60 → 3 (the same three reused). Before and after retain 1182 scene meshes / 1021 unique scene geometries, and warmed renderer counts 912 geometries / 156 textures. GC-forced final heap after each lesson stress is ~43 MiB. No growth observed in these short reset tests; this fixes churn, not a previously proven leak.

Full metrics, CPU/heap/resource/transition timing: [before](evidence/release-before.json), [final](evidence/release-final-profile.json). Earlier intermediate optimized run is retained as release-after.json.

## Final verification

- 34/34 unit tests, including unchanged protected Bruno core/static asset hashes and reusable-geometry regression: evidence/release-unit-tests.log.
- 32 production gameplay checks PASS: evidence/release-production.json. Main→Cloud→ACO→GWO→Results→Paper→Main; physical entrances/exits, contacts/spawn, drive/camera/R, E/Enter/Esc, real algorithm roles/pheromone/loads, Step/Play/Pause/Reset, Next/Previous and stable actors. Setup positions the actual vehicle near gates/stations; not a claim of manually driving every road.
- 28 UI/quality checks PASS: evidence/release-ui.json. Both 1366×768 and 1920×1080, all six sections, scroll/reachable controls, chart/tables/metrics, native High/Low toggle, persistence/resize and Low driving/R.
- Native listener stability PASS over three presentation round trips: evidence/release-listeners.json.
- Final normal release build, 958 asset hash verification and 6 non-debug subpath smoke checks PASS: evidence/release-build.log, release-assets.log and release-normal-browser.json. Introspection E2E/profile builds use VITE_GAME_PUBLIC=1; final release was rebuilt without it and verified not to expose Game. No remaining failed final check.

## Failures found and resolved

UI first attempt timed out reopening Presentation from GWO: native modal was closed while its opening RAF/transition was pending. Fixed in LearningHost.startPresentation by returning while modal is closed. Same UI assertions rerun; first-attempt JSON/PNG retained. A later Low reset check used a fixed 2.5 s delay, shorter than the original 2 s show + 4 s hide overlay. Test now awaits overlay completion and the unchanged >=2 ground-contact requirement (15 s bound); respawn-attempt JSON/PNG retained. No expected numerical algorithm result or core hash was changed. Final JSON/log evidence determines acceptance.

## New integrated screenshots

[Main](evidence/release-production-main.png) · [Cloud](evidence/release-production-cloud-yard.png) · [ACO](evidence/release-production-aco.png) · [GWO](evidence/release-production-gwo-leaders.png) · [panel 1366](evidence/release-panel-1366.png) · [panel 1920](evidence/release-panel-1920.png) · [comparison](evidence/release-production-results.png) · [convergence 1366](evidence/release-convergence-1366.png) · [convergence 1920](evidence/release-convergence-1920.png). These are fresh integrated-game captures, not standalone world evidence.

## Review / limitations

Release PR must target main and include the complete game from the main ancestry, not only an M6 diff. Do not merge PR #1–#8 separately, import Cloud Backup, retarget PR #9 or deploy. Keep the integration rollback head intact; never force push.

**Technical recommendation: READY TO MERGE after owner review/approval.** Main merge and deployment have not been performed. This is technical readiness, not a claim of completed academic acceptance or public-release clearance.

Technical readiness is limited to the tested Chrome/WebGPU laptop. Weak presentation hardware, mobile/WebGL/gamepad, long-session performance and deployed networking remain unverified. Existing build font/eval/chunk warnings and dependency vulnerabilities remain; external Google Fonts is blocked in this environment and fallback fonts render. Original attribution/license files remain. Pending SFX/font clearance and academic acceptance of baseline algorithms / alternative ACO paper are not resolved by this technical release. Papers and UI disclose baseline vs improved variants.

Reproduce: VITE_GAME_PUBLIC=1 → npm run build → preview at the repository subpath → profile-release/test-m7/test-release-ui/test-m7-listeners scripts. Then unset VITE_GAME_PUBLIC → npm run build → npm run test:build → test-browser.mjs URL release-normal --production. Node 22.17 and Chrome installed are used. Menu → Options → Quality toggles Low; E/Enter interacts, Esc closes, R resets.
