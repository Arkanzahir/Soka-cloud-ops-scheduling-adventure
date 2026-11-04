# M7 integrated demo — 2026-11-04

Branch: `integration/m7-demo`; base: M6 `4397d34`. Existing GWO, ACO and Cloud Final histories merged; Cloud Backup excluded. Main/PR branches are unchanged.

## Delivered

- One original Bruno game/vehicle/renderer/physics, four production zones Main/Cloud/ACO/GWO. Old M2 test sector is opt-in dev `?test-zone` and absent from the normal demo route.
- GWO: real M5 top-five candidates from twelve, original IDs/fitness and dynamic leaders; neutral reset. Regression test first reproduced raw contract failure, then passed with the compatibility adapter.
- ACO: M2 gates/spawn/exit plus existing research point, original ants/environment; real choice and iteration pheromone events; neutral reset and deterministic seek. Independent preview bootstrap removed from integrated entrypoint to avoid double mounting.
- Cloud Final: original reservation [-65,-35], eight task actors/three VMs, real RR allocations/reset/snapshot API; load-bar anchor corrected. Rejected visualization events do not advance LessonPlayer, and M6 catches errors and pauses.
- One embedded M6 LearningPanel through native modal lifecycle. All research stations open the right lesson; Enter focus no longer immediately activates Close. Esc, Close, Play/Pause/Step/Reset, serialized Next/Previous and Opening→Cloud→ACO→GWO→Results→Paper work.
- All algorithms/evaluator preserved. Short lessons use four iterations; comparison uses 50 iterations, seed 42, twelve ants/wolves and disclosed unequal evaluation counts. Baselines are not exact paper variants.

## Verification actually executed

| Check | Result |
|---|---|
| `npm test` | 33/33 PASS, `evidence/m7-unit-tests.log` |
| Dev integrated game | 22 checks PASS, `evidence/m7-integrated.json` |
| Production subpath integrated game | 28 checks PASS, `evidence/m7-production.json` |
| Production release without debug exposure | 6 checks PASS, `evidence/m7-release-browser.json` |
| Listener stability | PASS after three presentation round trips, `evidence/m7-listeners.json` |
| Production build | PASS, `evidence/m7-release-build.log` |
| Static output integrity | 958 asset SHA-256 matches, `evidence/m7-assets.log` |

Full production test covers Main→Cloud→ACO→GWO, native entrances/exits for all three worlds, camera/driving/R, research E/Enter and Esc, playback/pause/reset/seek, Next/Previous, results/papers, return Main and stable actor counts. Test setup uses physics placement near station/gate, then actual keyboard/button input; this is not a claim of manual driving every road. Original baseline core/license integrity tests still pass.

Test introspection uses upstream `VITE_GAME_PUBLIC=1`. Final release rebuilt without it and separately smoke-tested. Chrome headless/Windows/WebGPU, 1440×900; not a mobile/WebGL/performance matrix. No deployment performed.

Initial release smoke attempt entered before the intro was ready; the test now waits for the presentation control. Retry passed all six checks. Listener measurement first included the original one-shot intro handler; after completing intro before measuring, window/document keyboard and native modal listener counts remain identical after three round trips. No remaining failed check in the recorded final runs.

## Real integrated screenshots

[Main](evidence/m7-production-main.png), [Cloud allocation](evidence/m7-production-cloud.png), [ACO pheromone](evidence/m7-production-aco.png), [GWO real leaders](evidence/m7-production-gwo-leaders.png), [M6 panel](evidence/m7-production-panel.png), [comparison](evidence/m7-production-results.png).

## Run / reproduce

`npm install --force`, `npm run dev`; start original intro and use **Presentasi** at top-left or drive to a world gate. Research E/Enter opens M6, Esc returns driving, R resets within the zone. No query is needed for ACO.

Automated: set `VITE_GAME_PUBLIC=1` in the server/build process, then `node scripts/test-m7.mjs URL evidence-label`. For production testing serve `/Soka-cloud-ops-scheduling-adventure/`. Build final release with empty/unset debug flag. Legacy M2 test route is available only in dev with `?test-zone`.

## Remaining limitations

No known blocker in the tested desktop journey. Google Fonts requests are restricted in this environment (fallback fonts render); existing dependency vulnerabilities, audio/font clearance, sustained FPS, mobile/WebGL/gamepad and deployed URL remain unverified/unresolved. Preview assets/layout are retained; visual polishing by other developers is not merged in this integration. Existing build warnings about fonts/eval/bundle size remain. This is a tested local/production-preview demo, not an approved public release.
