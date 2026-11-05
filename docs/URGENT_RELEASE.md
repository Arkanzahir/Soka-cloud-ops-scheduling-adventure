# Urgent UX release — 5 November 2026

Base: release a8890c0 (PR13 verified merged). Work branch feature/final-ux-aco-gwo-audio. Unpublished Astra work is unavailable; no other branch overwritten.

## Implemented
- Full-size native M6 dashboard: Pointer Events header dragging, viewport clamp/resize, reset position; position survives lesson changes. Native modal/vehicle locking remains; moving the surface never touches LessonPlayer.
- L or Buka Dashboard opens the current Cloud/ACO/GWO lesson at the current vehicle position. L/Esc closes; E/Enter stations remain. Main presentation uses existing host and six sections. Former L mute shortcut moves to M, including Controls copy.
- ACO retains 9 existing actors (one sampled ant displayed), recognizable3-part body/six legs/two antennae. Event-driven selected path/probability/assignment board, real post-update pheromone row; no per-frame CanvasTexture redraw. Six legs walk along the actual selected-VM path; antenna motion is decorative.
- Existing faceted GWO models preserved. Small breathing/head/tail animation, short in-place step only when real candidate assignment/fitness changes. Real five-of-twelve candidate board, Alpha/Beta/Delta, iteration/fitness/best/guides preserved. Physical movement does not calculate makespan.
- Existing Howler/Kounine playlist starts after game interaction; low0.12 default, On/Off and0–0.3 volume controls,25% ducking in learning modal and restoration, existing global mute/focus behavior retained. No new audio/model/font assets downloaded. Playlist avoids overlapping play calls.
- PR13 Settings campus illustration remains unchanged. One actual browser screenshot maximum.

## QA and failures
40 unit tests pass. Targeted actual-Chrome test script: scripts/test-final-ux.mjs; final results urgent-browser.json. Cold Vite optimizer invalidated Rapier URL on first attempt; warmup failure retained. Next run found campus overlay intercepted navigation after dragging left; learning modal z-index fixed; failed evidence urgent-overlay-attempt.json retained. Only affected verification is repeated. Final build uses explicit Pages subpath, no debug Game; asset verifier now resolves prefixed HTML URLs safely.

## Publication gate
User authorized main merge and Pages only after critical tests AND redistribution rights verified. That condition is NOT satisfied: Pally font files (e.g. static/fonts/Pally-Bold.woff2), nonmusic SFX (e.g. static/sounds/birdTweets/24074 small bird tweet calling-full-1.mp3) and retained third-party static material lack complete per-file redistribution evidence. Root MIT and music CC0 file remain; neither is treated as a blanket asset license. Existing CC0 music Kounine is reused, no new rights claim.

Manual-only .github/workflows/pages.yml is prepared with official actions, npm ci/test/build/integrity and explicit project subpath; main-only plus rights_verified false by default. It is not run or used to publish blocked assets. Pages remains inactive until clearance. No live URL is claimed. License gap is an absent provenance ledger, not a conclusion that all upstream assets are prohibited.

Local fallback: npm run preview -- --host 127.0.0.1 --port 4194 --base /Soka-cloud-ops-scheduling-adventure/. Use localhost URL, Low, preload before presentation. Source/build already contains all local assets; no backend needed. Full deployment plan remains in DEPLOYMENT_READINESS.md.

Final actual Chrome/Low run: **33/33 passed**, no page/local HTTP errors. First z-index-only attempt did not escape the original interface stacking context; campus card is now hidden only while learning modal is displayed. Both failure reports retained. Single urgent-final.png inspected: full-size panel fits resized viewport; night camera view limits model-detail evidence. No new FPS benchmark or blanket performance claim; previous81–143FPS measurements describe the older checkpoint, not this change. Geometry/listener scope is bounded, inactive GWO update returns early; actual weak-device/long-session FPS remains unverified.

Final verification: **40 unit +33 targeted browser checks +7 normal-production subpath/UI checks**, production build and**963** copied asset hashes pass. Actual normal release exposes no Game/debug object; music checkbox/volume controls and L reopening tested through real UI. No final page/local HTTP errors. Build was repeated only after confirmed UI stacking regression; font-path/eval/chunk warnings remain.

README conflict remedy: incorporate origin/main70b804a as merge ancestry, retain improved accurate release README. The only new main change removed one punctuation mark from superseded old copy; no meaningful feature/documentation/license content is discarded. Main itself is not merged into or deployed until rights condition is fulfilled.
