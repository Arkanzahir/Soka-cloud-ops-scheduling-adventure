# Task Tracker — Cloud Ops

**M0 dan M2 selesai:** bukti di [BASELINE_TEST_REPORT.md](BASELINE_TEST_REPORT.md) dan [M2_SHARED_GAME_EXTENSION.md](M2_SHARED_GAME_EXTENSION.md). M1 final untuk baseline edukatif, dengan keputusan dan test oracle di [M1_ACADEMIC_FINAL.md](M1_ACADEMIC_FINAL.md); M2 diminta langsung oleh pemilik.

## Persiapan

- [x] Repository target GitHub dibuat.
- [x] README dan panduan kolaborasi kelompok disusun.
- [x] PRD, GDD, World Design Spec dan rencana implementasi disusun.
- [x] Rancangan ACO/GWO baseline dan model CTS dirumuskan.
- [x] Paper GWO 2025 dan referensi alternatif ACO 2024 diidentifikasi.
- [ ] Paper ACO DBpia dipastikan metadata dan metodenya dari PDF/full-text (opsional jika dosen mensyaratkan paper awal; MVP memakai paper ACO 2024 terverifikasi).
- [ ] Izin/kebijakan dosen tentang penggunaan fondasi open-source dipastikan.

## Milestone implementasi

- [x] **M0:** audit dan run original Bruno, screenshot baseline, inventaris lisensi/aset; clearance SFX/font tetap gate sebelum publikasi.
- [x] **M1:** spesifikasi akademik final untuk baseline ACO dan GWO, paper ACO alternatif 2024/GWO 2025, model dan oracle dataset; belum merupakan replikasi improved paper atau konfirmasi dosen.
- [x] **M2:** reusable zone/interaction/vehicle transition; Main↔satu zona uji, panel, E/Enter/Esc/R, browser/physics/production tests.
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

M0/M2 sudah lolos. Gunakan `docs/M1_ACADEMIC_FINAL.md` sebagai landasan M4. Pengembangan berikutnya M3 Cloud World dari branch M2; ACO World dikerjakan anggota kelompok di branch terpisah.

## Hasil M0 yang berlaku (2026-11-04)

M0 selesai dengan [laporan pengujian](BASELINE_TEST_REPORT.md). Checkpoint jeda di atas adalah riwayat. Lanjut milestone berikutnya hanya saat diminta; sesi ini berhenti setelah M0.
