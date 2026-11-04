# Task Tracker — Cloud Ops

**M0 selesai:** fondasi asli berjalan dan diuji; bukti di [BASELINE_TEST_REPORT.md](BASELINE_TEST_REPORT.md). Milestone berikutnya belum dikerjakan.

## Persiapan

- [x] Repository target GitHub dibuat.
- [x] README dan panduan kolaborasi kelompok disusun.
- [x] PRD, GDD, World Design Spec dan rencana implementasi disusun.
- [x] Rancangan ACO/GWO baseline dan model CTS dirumuskan.
- [x] Paper GWO 2025 dan referensi alternatif ACO 2024 diidentifikasi.
- [ ] Paper ACO DBpia dipastikan metadata dan metodenya dari PDF/full-text.
- [ ] Izin/kebijakan dosen tentang penggunaan fondasi open-source dipastikan.

## Milestone implementasi

- [x] **M0:** audit dan run original Bruno, screenshot baseline, inventaris lisensi/aset; clearance SFX/font tetap gate sebelum publikasi.
- [ ] **M1:** verifikasi akademik final dan keputusan baseline vs improved.
- [ ] **M2:** implementasi reusable zone/interaction/vehicle transition.
- [ ] **M3:** Cloud Mini-World proof of concept, render style check.
- [ ] **M4:** scheduling engine ACO/GWO, seeded RNG, unit tests.
- [ ] **M5:** ACO & GWO mini-world dan animasi dari trace.
- [ ] **M6:** Results, paper, Presentation Mode, latihan demo.
- [ ] **M7:** QA performa, production build, GitHub Pages deploy.

## Bukti minimal per milestone

- M0: SHA commit basis, screenshot Main World, build log, asset inventory.
- M3: screenshot perbandingan Main vs Cloud, mobil bisa masuk-keluar, fisika stabil.
- M4: unit tests dan log hasil scheduling terverifikasi.
- M5: perubahan animasi dapat ditelusuri ke event log ACO/GWO.
- M6: semua bagian dapat diakses tanpa berkendara lama.
- M7: URL live diuji di browser, file GLB/textures/shaders tidak 404.

## Urutan terdekat untuk Work

Baca `docs/MASTER_PROMPT.md`, lakukan **M0 saja** lebih dulu, dokumentasikan temuannya, dan jangan langsung membangun seluruh mini-world sebelum baseline game terbukti dapat dijalankan.

## Hasil M0 yang berlaku (2026-11-04)

M0 selesai dengan [laporan pengujian](BASELINE_TEST_REPORT.md). Checkpoint jeda di atas adalah riwayat. Lanjut milestone berikutnya hanya saat diminta; sesi ini berhenti setelah M0.
