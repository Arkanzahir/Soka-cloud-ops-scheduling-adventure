# Cloud Ops Campus — Kelompok 8 / 2026-11-05

Branch: `feature/group8-mainworld-branding`. Base/target: tested `release/m7-final` @ `bc1d0dd2fa51a26b58a8287f02d31a71266b932c`. Independent worktree; original release/integration worktree and branch heads preserved. Draft PR review only; no main merge, deployment or visibility change.

## Delivered identity and interaction changes

| Surface | Replaced / repurposed |
|---|---|
| Browser, Home, console | Group 8 title/description/OG/Twitter/app name, Indonesian course introduction, original SVG favicon/preview, actual group repository. Removed personal homepage copy, dynamic Bruno tab title and promotional console links. No invented deployed/canonical/share-image URL. |
| Social | Removed X, Bluesky, YouTube, email, Twitch, personal GitHub, LinkedIn and personal Discord destinations. Actual group repo, existing Credits menu and M6 presentation now use native points. Verified account-logo props/OnlyFans wordmark retired; fan toy relabeled server cooling. |
| Projects + Lab | Personal client/project cards, images, URL/raycast/cinematic/input handlers are not initialized. Data replaced with campus records. Native points open shared M6; existing area instances/references, oven/anvil/candles/cauldron scenery, audio reference dependencies, close/state contracts and achievement IDs retained. |
| Career | Six existing stone exhibits now show CTS lessons with cached canvas masks; year 2026 replaces a personal employment timeline. Original meshes, colliders and reveal behavior retained. |
| Time Machine | External 2019 portfolio callback replaced with Credits. TV uses one cached Cloud Ops graphic instead of personal portfolio/game imagery. |
| Map | Neutral campus SVG schematic and repurposed area names. Fast travel closes the map and returns through M2 before Main respawn, including from GWO; no stale mini-world zone state. |

Main landmark uses actual extruded CLOUD OPS lettering from the existing Pally font, warm original-material colors, subtitle and Group 8 badge. Three consistent ground-mounted destination signs identify Cloud (8 Tasks / 3 VMs), Ant Research Park and Wolf Field Research. Main CTA and Home CTA both call the existing M6 host; no second presentation framework. Reused box geometry, one-time canvas textures, frozen static matrices, main-only group visibility; no decorative colliders or per-frame texture generation. Ten personal letter bodies and nine social/logo bodies are disabled through the original object API and kept invisible through native reset. No upstream asset bytes deleted or edited except the app manifest.

## Transparent attribution

Existing Credits menu (behindTheScene ID retained) states Bruno Simon / Folio 2025 foundation vs actual Group 8 worlds/algorithms/adapters/UI modifications, with source repository link and explicit non-endorsement. Full original MIT copyright/permission text is available in-menu and as a byte-identical local download. Root license.md is unchanged. THIRD_PARTY_NOTICES.md and its served copy preserve music/font/model/SFX acknowledgments; stale Private/future-work wording corrected. Legacy Discord modal ID safely displays campus help without contact URLs. GitHub metadata reported Public on this date; this task did not alter visibility.

## Performance: reuse measured release baseline

Same Chrome 156, Windows, hardware NVIDIA/ampere WebGPU (`isFallbackAdapter:false`, RTX 3050 reported by CDP), 1366×768 CSS, DPR2, five-second samples. Stored release baseline reused rather than rerunning its full audit. Same script/scenarios; live weather, cache/thermal/background activity remain uncontrolled. Headless hardware-backed throughput is not a foreground or weak-laptop guarantee.

| Scenario | High FPS release → branding | Low FPS release → branding | Branding Low p95 ms |
|---|---:|---:|---:|
| main | 128.6 → 123.1 | 141.5 → 151.3 | 7.4 |
| cloud | 115.7 → 102.1 | 125.1 → 127.0 | 8.8 |
| aco | 90.1 → 82.7 | 102.5 → 101.4 | 10.8 |
| gwo | 110.3 → 109.1 | 114.1 → 119.1 | 9.3 |
| panel-gwo-play | 112.2 → 115.1 | 118.1 → 120.0 | 9.2 |

Main High draw calls ~270→261; triangles ~483k→493k (+2.1%). Warm scene mesh count 1182→1122, unique scene geometries 1021→1015. GPU-cached geometry count 912→926, textures 156→140; all stable through twenty resets/seek cycles per lesson. ACO still reuses the same three path geometry IDs. Heap after GC ~44.5–44.7 MiB, a small bounded increase over ~43 MiB release samples. No short-test growth observed; not proof of long-session leak freedom.

Startup to game instance on localhost increased 17.59→21.04 s; no loading-speed improvement claim. Some High samples (Cloud/ACO) are slower. All sampled worlds exceed 30 FPS on the tested GPU, but there is no universal speedup claim. Main-thread TaskDuration remains high in uncapped headless sampling; GPU elapsed/VRAM utilization are not measured. Full CPU/heap/draw/triangle/transition/resource data: [baseline](evidence/release-final-profile.json), [branding](evidence/group8-profile.json).

Release Low/High behavior is preserved: Low DPR1 and reduced original effects, High original DPR2 cap; persistence/resize tests pass. No new Medium level was added to the original two-level engine contracts. No renderer/physics/algorithm rewrite.

## Verification actually run

- **37 unit tests PASS**: original protected vehicle/camera/physics/material/license bytes and runtime asset integrity, M4/M5/M6 contracts, pooled pheromone equivalence, plus public URL/branding/served-license regressions.
- **22 branding browser checks PASS**: actual 3D text, unique campus/zone registry, retired props, Home/credits, 1366/1920 CTA reachability, native Projects/Lab/Social interactions, real repository destination, native reset, drive/R, safe map return and zero JS/local HTTP errors.
- **32 production M7 E2E checks PASS**: all three physical gate round trips, car/camera/spawn, E/Enter/Esc/R, real assignments/loads/pheromone/leaders, Step/Play/Pause/Reset, Next/Previous, results and paper.
- **28 UI/quality checks PASS** at 1366×768 and 1920×1080; **listener stability PASS** after three presentation round trips. Existing release reports were not overwritten (new group8-* evidence).
- **Normal release build PASS; 963 copied assets hash-match; 6 subpath smoke checks PASS.** Final dist built with VITE_GAME_PUBLIC unset/empty.
- **15 extra normal-release UI checks PASS without debug Game**: real-menu MIT license, native presentation traversal, Step/Play/Pause/Reset for Cloud/ACO/GWO, three metrics/two curves/eight assignments, three papers and close; zero JS/local HTTP errors.

Screenshots were visually inspected. Test setup positions the original vehicle at selected stops; no free-camera renderer or generated mock screenshots. Full gameplay E2E uses upstream introspection flag; the final normal-release UI test does not.

## Findings / failures retained

- First placement was occluded by the cherry tree; moved to the freed letter bed so all branding and the original car remain visible from default follow camera. No road colliders were added.
- Home subtitle/chips initially had poor contrast against the native dark menu; colors corrected and screenshots checked again.
- Initial dev warmup encountered a transient optimized-module fetch error while Vite dependencies/HMR changed. Worktree now uses isolated .cache/vite, protecting other sessions; production reruns have no local fetch errors.
- First branding test read a native Vector2 point as x/z, feeding a non-finite test teleport and causing AudioParam errors. Corrected test setup to x/y (world x/z), added a finite-coordinate guard, preserved the expected group URL. First-attempt JSON/PNG retained; fresh-browser final runs pass.
- A network Git check hit Windows sandbox/user ownership separation; scoped `git -c safe.directory=<this-worktree>` used for network operations, with no global trust/config change. No force push/history rewrite.

## Fresh integrated screenshots

[Main + car](evidence/group8-main.png) · [Low Main](evidence/group8-profile-main-low.png) · [navigation](evidence/group8-navigation.png) · [Home](evidence/group8-home-1366.png) · [Credits](evidence/group8-credits.png) · [MIT in normal release](evidence/group8-release-license.png) · [Cloud](evidence/group8-production-cloud-yard.png) · [ACO](evidence/group8-production-aco.png) · [GWO](evidence/group8-production-gwo-leaders.png) · [presentation](evidence/group8-production-panel.png) · [comparison](evidence/group8-production-results.png) · [convergence](evidence/group8-convergence-1366.png).

## Integration / remaining limits

**Safe to integrate into release/m7-final after review**, based on the tested desktop journey. Main, release and integration branch heads were not changed. Merge this draft PR into release only after approval; the separate release→main PR remains a separate decision. No deployment.

Cold startup is slower in the recorded sample and High performance is not consistently improved. Weak laptops, WebGL/mobile/gamepad and long sessions remain unverified. The map is explicitly schematic. Original dependency/font/eval/chunk warnings and pending SFX/font/paper acceptance notes remain from the release baseline. Social preview titles/descriptions are rebranded; deployed canonical/share-image URLs are intentionally unset until a real deployment exists. Original scenery/source assets remain credited; Group 8 does not claim authorship of the entire engine.

Reproduce with the existing npm test/build/test:build scripts, test-group8.mjs, test-m7.mjs URL group8-production, test-release-ui.mjs URL group8, test-m7-listeners.mjs URL group8-listeners and profile-release.mjs URL group8-profile --capture-low. Clear VITE_GAME_PUBLIC, rebuild, run test-browser.mjs URL group8-normal --production and test-group8-release.mjs for final normal release.
