# Group repository / handoff paths

- **Destination:** https://github.com/Arkanzahir/Soka-cloud-ops-scheduling-adventure
- **Source foundation:** https://github.com/brunosimon/folio-2025
- **Read first:** `README.md`, `AGENTS.md`, `docs/MASTER_PROMPT.md`, `docs/PAPER_REVIEW.md`.
- **Status terbaru:** M0/M2 selesai; M3 tahap 1 selesai pada `feature/cloud-world`. Baca `M3_CLOUD_FOUNDATION.md` dan checkpoint terakhir. M1 belum dikerjakan; catatan jeda di bawah adalah riwayat.

# WORK HANDOFF — ringkasan untuk sesi baru

## Proyek

**CLOUD OPS: Scheduling Adventure** adalah adaptasi game mobil 3D Bruno Simon Folio 2025 menjadi presentasi HTML interaktif untuk tugas **Demo Week 10 (SOKA)**. Algoritma: **ACO + GWO** untuk Cloud Task Scheduling; menampilkan paper, langkah algoritma, task→VM allocation, makespan, cost, utilization proxy, serta visualisasi code-based.

## Desain yang disepakati

- Menggunakan **source code & aset asli** Bruno (bukan remake visual dari screenshot).
- World original tetap. Ada 3 mini-zone *Cloud / ACO / GWO* dengan same visual language; Research/Results sebagai stasiun.
- Mobil tetap seperti Bruno dan playable di setiap area; `E` pada gate masuk zone, `E` pada station buka materi, `Esc` tutup; kompatibilitas `Enter` original perlu ditangani.
- Dua mode: **Explore** (bebas mengemudi) dan **Presentation** (urutan bab + teleport/Next/Previous).
- Simulasi JS murni dan visualisasi sinkron; tidak memakai animasi pseudo.
- GitHub Pages setelah build static lulus test; lisensi MIT & atribusi wajib.

## Sumber diverifikasi

- Source: https://github.com/brunosimon/folio-2025
- License: https://github.com/brunosimon/folio-2025/blob/main/license.md
- Paper GWO: https://doi.org/10.1016/j.ins.2025.121943 — **GWO_C/M variant**, bukan GWO standar.
- Paper ACO kiriman tim: https://www.dbpia.co.kr/journal/articleDetail?nodeId=NODE11826229 — **belum berhasil diverifikasi**.
- Alternatif ACO 2024: https://doi.org/10.5573/IEIESPC.2024.13.3.243
- GitHub Pages via Vite: https://vite.dev/guide/static-deploy

## Kondisi saat handoff

Dokumen desain telah disusun, tetapi **repo Bruno belum dikloning, belum ada audit material tingkat-file, belum ada aset baru, simulasi game, build, atau deploy** dalam paket ini. Jangan mengklaim sudah terimplementasi.

## Kerjakan pertama

Baca `MASTER_PROMPT.md`, lalu lakukan M0 (audit + run baseline original) saja. Setelah ada screenshot dan audit, pilih desain aset Cloud mini-world yang konkret sebagai vertical slice. Selanjutnya rujuk `IMPLEMENTATION_PLAN.md`.

## Pertanyaan yang perlu diputuskan kemudian (tidak menghalangi audit)

1. Paper ACO DBpia benar-benar membahas CTS atau perlu pakai alternatif terverifikasi?
2. Dosen mengizinkan adaptasi source code open-source dengan atribusi?
3. Apakah tim perlu mereplikasi GWO_C/M atau cukup GWO baseline dengan paper sebagai pembanding/rujukan?
4. Batas waktu presentasi, device/browser target, dan default dataset final?

Gunakan jawaban default minimal: desktop browser 16:9; demo berurutan tetapi zone bisa lompat; baseline ACO dan GWO; dataset 8 tasks/3 VMs contoh; jangan memalsukan paper.
## Checkpoint jeda — 2026-11-04 (permintaan pemilik)

- Checkout: `../cloud-ops`, branch `development/m0-m1-foundation`, base `d3abd9b`. Remote Private. Belum commit/push hasil sesi.
- M0 IN PROGRESS; M1 belum dimulai. Bruno SHA `41046b57eeed8d156d9c3fd7fa259900baef7816`, clone `../bruno-baseline`.
- Audit tersimpan: ARCHITECTURE_AUDIT.md, ASSET_CATALOG.md, WORLD_STYLE_AUDIT.md, evidence/*. Jangan audit ulang seluruh repository.
- PASS: build asli; browser asli 14 checks (mobil, kamera, respawn, E/Enter map, Esc, local requests); build target; npm test 3 tes integritas core/aset/path.
- BELUM LULUS: browser target; screenshot foundation-dev-main-world.png menunjukkan world kosong. Setup .env target sebelumnya belum disalin; VITE_WHISPERS_COUNT dipakai tanpa default. .env.example sudah disalin ke .env sebelum jeda, BELUM diuji ulang. Penyebab/fix belum terverifikasi.
- Berikutnya: ulang build dan browser target setelah env; production smoke subpath; review screenshot; buat BASELINE_TEST_REPORT.md; update README/status/attribution; commit M0 setelah lolos. Baru M1.
- Perintah: npm.cmd run dev -- --port 1235; npm.cmd run test:browser -- http://127.0.0.1:1235/ foundation-dev; npm.cmd test; npm.cmd run build. Preview --host 127.0.0.1 --port 4173 --base /Soka-cloud-ops-scheduling-adventure/; test preview URL dengan label foundation-production --production.
- Fondasi asli diimpor; core world/mobil/material identik. Perubahan minimum: path relatif, hapus analytics, localhost dev, hapus dotenv side effect. AGENTS.md menyimpan caveman dan aturan satu agent.
- Belum mini-world/algoritma/deploy. Lisensi SFX/font belum tuntas; 30 vulnerability dependency tercatat. Request font eksternal original diblok jaringan; local assets lulus.
- Paper: alternatif ACO IEIESPC bisa dibaca; GWO publisher 403, DBpia tidak dapat diakses. M1 belum dikerjakan.
- Permintaan stop proses melalui session handle gagal karena handle sudah tidak dikenal; status proses OS belum dapat dikonfirmasi.

## Penutupan M0 — 2026-11-04 (menggantikan status checkpoint jeda)

**M0 selesai dan diuji; berhenti sebelum M1 sesuai instruksi pemilik.**

- Branch: `development/m0-m1-foundation`; identitas commit penutupan: `git log -1 --format=%H`. Tidak mengubah main/visibility/Pages.
- Root cause/fix: missing env memberi NaN pada Whispers storage buffer; fallback 30 kini bekerja tanpa .env. Setup .env.example tetap didokumentasikan.
- PASS: 3 integrity tests; 16 browser checks tanpa env; production build; hash 958 output assets; 5 production subpath checks. Rincian dan screenshot: [BASELINE_TEST_REPORT.md](BASELINE_TEST_REPORT.md).
- Source audit terdahulu tetap berlaku. Perubahan source baru terbatas pada Whispers fallback; core vehicle/camera/physics/material tidak berubah. README diperbarui pada status/setup, desain kelompok tetap dipertahankan.
- Sisa: dependency vulnerabilities, Google Fonts eksternal diblok lingkungan uji, clearance SFX/Pally; Blender round-trip/WebGL/mobile/gamepad belum diuji. Bukan blocker render baseline, tetap gate QA/publikasi terkait.
- Tidak mengerjakan paper/engine/M1 atau mini-world. Menunggu instruksi berikutnya setelah M0.

## Penutupan M2 — 2026-11-04

- **Selesai sesuai instruksi pemilik.** Branch `development/m2-shared-game-extension`, base M0 `54681c4`. Identitas commit penutupan: `git log -1 --format=%H` pada branch ini.
- Baca **hanya** [M2_SHARED_GAME_EXTENSION.md](M2_SHARED_GAME_EXTENSION.md) untuk melanjutkan, lalu source terkait. Audit M0 tidak perlu diulang.
- Reusable `ZoneManager`, `InteractiveStation`, `CarTransitionController`, `PresentationController`; `TestArea` mewarisi Area. Satu sektor uji memakai terrain/material/vehicle/physics asli; E/Enter gate dua arah, native panel/Esc, R zona, boundary recovery, safe return search.
- Integrasi world step 2; source Player/View/Physics/material tetap identik. Registry station/panel/checkpoint siap diperluas, tanpa Cloud/ACO/GWO engine atau tiga mini-world.
- PASS: browser dev 27 checks; production subpath 30; normal release 6; integritas 3; seluruh 958 aset dist cocok; build produksi. Screenshot/JSON/log di docs/evidence/m2-*.
- Hasil uji penting: footprint return dekat props tidak selalu aman; cari titik tervalidasi terdekat sebelum transit. Flag VITE_GAME_PUBLIC=1 hanya untuk tes introspeksi; release normal sudah diuji tanpa flag.
- Sisa M0 tetap: font eksternal diblok lingkungan uji, dependency vulnerabilities, clearance lisensi SFX/Pally; mobile/gamepad/WebGL belum diuji. Tidak merge/main/public/deploy.
- **Berhenti di M2.** M1 belum dikerjakan; milestone berikutnya menunggu permintaan pemilik.

## Checkpoint M3 tahap 1 — 2026-11-04

- Branch `feature/cloud-world`, base M2 `e6574eb`. Kerangka selesai; M3 penuh belum selesai.
- Baca [M3_CLOUD_FOUNDATION.md](M3_CLOUD_FOUNDATION.md), lalu `sources/CloudOps/CloudArea.js` bila melanjutkan. Tidak perlu audit ulang.
- CloudArea memakai Area + registry/station/transition/panel M2; 3 VM clone brick asli, satu stasiun sederhana, Main↔Cloud teruji. Tidak ada engine algoritma.
- PASS: 10 browser checks, 3 integrity tests, production build, 958 output asset hashes. Bukti `docs/evidence/m3-foundation-*`.
- Berhenti sesuai lingkup kecil pemilik. Berikutnya menunggu instruksi; tidak lanjut ke keseluruhan Cloud World.

Status sinkronisasi M3 tahap 1: commit tersedia lokal pada `feature/cloud-world` (`git log -1 --format=%H`). Dua percobaan push ditolak GitHub dengan `Internal Server Error` pada 2026-11-04. Belum tersinkron ke remote; retry `git push -u origin feature/cloud-world` saat layanan pulih. Pengujian dan source tidak terpengaruh.

## M7 implementation checkpoint — 2026-11-04

Branch `integration/m7-demo`, based on M6 `4397d34`, retains GWO/ACO/Cloud Final ancestry; never import Cloud Backup. See M7_INTEGRATION.md. GWO/ACO/Cloud and shared M6 host are integrated and checkpoints pushed incrementally (294d070, b83b3a6, abe0258, 3df389d). Final QA commit follows; use branch HEAD, not an old milestone SHA.

33 unit/contract tests, 22 dev E2E checks, 28 production-subpath E2E checks passed. Native physical gate round trips, real engine visualization, controls and presentation tested. Final release rebuilt without debug flag; all 6 release smoke checks and 958 asset hashes passed. Keyboard/modal listeners stay stable after three presentation round trips. See evidence/m7-release-browser.json, m7-listeners.json and m7-release-build.log. Screenshots are new integrated browser captures, not standalone evidence. Draft PR targets feature/m6-learning-ui, never main. No deploy/visibility change. Remaining limits documented in M7_INTEGRATION.md. Do not repeat the original audit.

Draft PR #9 created and verified open/draft/mergeable. Final GitHub metadata reports repository PUBLIC; session did not alter visibility. Owner must decide separately; do not silently change settings in future sessions.

M7 polish follow-up: selected four-file visual patches from PR #7 (32b0c59) and #8 (c8663a7) applied on integration/m7-demo, retaining real adapters/M6/input/zone registrations and neutral reset. See M7_INTEGRATION.md follow-up; do not merge the whole polish branches again. PASS: 33 unit, 32 production E2E, 4 Cloud API, 6 normal release, build and 958 asset hashes. New screenshots/evidence prefix m7-polish-. One asset verifier absolute-base path assertion failed; final relative-base release and subpath browser checks passed, failure log retained. Draft PR #9 targets M6 and receives the new checkpoint; main/deployment/visibility untouched.

## Final release candidate — 2026-11-04

Branch `release/m7-final` from verified integration `084893f`; rollback integration branch retained. Read **M7_RELEASE.md** and release-* evidence; do not repeat M7 integration/audit. Low quality DPR 1 persists across startup/toggle/resize; High original cap 2. ACO geometry/radius buffers and vectors reused, inactive animation skipped. Unit compares reused geometry with fresh Three.js tubes. Presentation reopen-from-GWO race fixed by returning Main before opening the modal; computed utilization proxy shown in comparison.

Final hardware-backed headless Chrome/RTX 3050 profile, 1366×768/DPR2: Low FPS 93.9–127.0 before → 102.5–141.5 final; High has no consistent gain and some samples are slower. CPU remains busy; GPU timing unavailable. ACO 20 seek/reset bursts 66.2→26.8 ms, path IDs 60→3; scene/renderer counts stable. Local startup ~18 s remains; no loading-speed or weak-device claim.

PASS: 34 unit, 32 production gameplay, 28 UI/quality (1366×768 + 1920×1080), three listener round trips, final non-debug build, 958 asset hashes and 6 normal-release subpath checks. Reproduced modal race and too-early respawn timing failures retained as first-attempt/respawn-attempt JSON/PNG; final runs pass without changing numerical expectations. Final dist is built without VITE_GAME_PUBLIC. README/attribution retained with current status/Low instructions. Separate release PR targets main; PR #9 remains aimed at M6. **Next: owner approval before merge; no automatic merge/deployment.** Academic paper/baseline acceptance, font/SFX clearance, dependency warnings and untested device matrix remain documented limits.


## Group 8 campus candidate — 2026-11-05

Independent worktree/branch feature/group8-mainworld-branding from tested release/m7-final @ bc1d0dd. Read GROUP8_MAINWORLD.md; do not repeat the Bruno/M7 audit. Main welcome landmark, 3 destination signs, Home/menu/title/metadata/icon/console rebranded. Personal social/account links and portfolio Projects/Lab handlers removed/replaced; career becomes six CTS lessons; Time Machine goes to Credits; map becomes campus schematic with M2-safe return. Preserve original scenery/areas/achievements and original MIT/third-party notices; root license untouched, local license download byte-identical. No new decorative colliders. All numerical algorithms, M5/M6, renderer/vehicle/camera/physics and release Low DPR1 optimizations retained.

PASS: 37 unit, 22 branding, 32 production gameplay, 28 UI/quality, listener round trips, 963 copied asset hashes, 6 normal smoke and 15 normal-release presentation checks without Game/debug. Genuine screenshots and full before/after measurements in group8-* evidence. On RTX3050 hardware-backed headless Chrome Low ~101–151 FPS; Main draw calls ~270→261 and textures 156→140, but High varies and startup ~17.6→21.0 s is slower. No universal performance claim. Initial occlusion/contrast, Vite warmup and Vector2 test-setup failures resolved/recorded.

Next: review branding draft PR targeting release/m7-final, then separately review release→main PR; no automatic merge/deploy. Release/integration heads retained as rollback. GitHub visibility verified Public; not changed by this session. Academic baseline/paper acceptance and licensing/device limitations remain.

## Selective mini-world readability — 2026-11-05

Independent worktree `mini-world-polish`, branch `feature/mini-world-readability`, starts at Group 8 branding `154574e` (release `bc1d0dd` ancestry). Read **MINI_WORLD_READABILITY.md**, not the original audit. Review PR targets `feature/group8-mainworld-branding` so only this small follow-up is shown; branding PR #11 is the release dependency. No changes to other worktrees/branches, no automatic merge/deploy.

Only three game source files changed: ACO title moved/shrunk to left verge, with matching existing post colliders; Cloud eight existing packages untouched plus one static dock-paint texture/plane; GWO compact two-line real Alpha/Beta/Delta labels raised 0.7, hidden for nonleaders/reset, with frustum holders preserving visibility. All five wolves remain. Numerical algorithms/datasets/M5/M6/navigation/camera/physics/renderer untouched. No extra actors/listeners/animation loops. Normal-release test helper accepts an optional output label to preserve prior evidence.

PASS: 37 unit, 15 selective Low browser/resource/re-entry checks, 32 production gameplay, 28 UI/quality, final non-debug build, 963 asset hashes, 6 normal subpath and 15 normal public UI checks. Genuine normal-camera before/after images and raw results use `mini-polish-` prefix. Low five-second dev samples before→after FPS: ACO102.6→102.9, Cloud131.7→127.2, GWO120.2→118.2; not a performance improvement claim or weak-laptop guarantee. Counts stable across20 warmed resets/world. Unchanged M6 panel still covers ACO simulation from station pose; close via Esc for full view. One nonleader wolf remains behind original tree. Prior release/academic/licensing/device limits remain.

## GWO explanation checkpoint / final feature freeze — 2026-11-05

Branch `feature/gwo-schedule-explainer` from11267c9: prior authorized GWO explanation improvement is complete and frozen. See GWO_SCHEDULE_EXPLAINER.md. One cached world board displays five real eight-task schedules, VM destinations, fitness/current roles, pre-update guide IDs and stable-ID task diffs; no algorithm/M5/M6/navigation changes. No new features after the owner's final-release instruction. PASS40 unit,13 targeted production,32 integrated,21 normal-release browser checks, production build and963 asset hashes. Native-camera screenshots inspected; initial crop/roof/tree placements rejected, final side-of-station table clear while M6 open. Low station paused sample127FPS/p95 8.8ms, no matched baseline/performance-gain claim. Preserve this checkpoint when preparing final release; requested PR12→PR11 dependency merges precede its release integration. Do not merge main/deploy before final approval.

## Final QA checkpoint resumed — 2026-11-05

Read FINAL_RELEASE.md and DEPLOYMENT_READINESS.md; do not repeat the audit. PR12/11 merged; release base65f5e45. Frozen GWO checkpoint7bcb21b included by ancestry via84e6388. Follow-up branch feature/final-release-qa contains final README/gallery, QA evidence, .npmrc peer-resolution fix, LF notices and confirmed Settings preview branding repair (reuse campus/preview.svg). Protected algorithms/M5/M6/physics/camera unchanged. PASS40unit,156 browser checks,963asset hashes, normal production build,58docs/retention checks. Real Settings/results screenshots visually inspected; local fallback passes with external requests blocked. Initial incorrectly configured preview had JS404; failure evidence retained. Low81–143FPS RTX3050/headless;17.488s startup sample is not proof startup fixed.

Owner reports Astra revisions still in progress: ACO/GWO/draggable and instant dashboard/assets/music. No final branch/PR available; do not implement or claim these features. Main independently advanced to70b804a (README punctuation); do not overwrite. PR10 remains OPEN, no main merge or deployment approval. Public Pages false; repository already public, no visibility change. SFX/Pally/third-party asset permissions unresolved; deployment BLOCKED. After Astra PR arrives: inspect exact diff/API/license provenance, integrate only tested changes, rerun relevant full browser QA, then request final approval.
