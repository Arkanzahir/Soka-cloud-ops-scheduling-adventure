# Group repository / handoff paths

- **Destination:** https://github.com/Arkanzahir/Soka-cloud-ops-scheduling-adventure
- **Source foundation:** https://github.com/brunosimon/folio-2025
- **Read first:** `README.md`, `AGENTS.md`, `docs/MASTER_PROMPT.md`, `docs/PAPER_REVIEW.md`.
- **Status terbaru:** M0 selesai; lihat bagian Penutupan M0 dan `BASELINE_TEST_REPORT.md`. Catatan jeda di bawah disimpan sebagai riwayat. M1 belum dikerjakan.

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
