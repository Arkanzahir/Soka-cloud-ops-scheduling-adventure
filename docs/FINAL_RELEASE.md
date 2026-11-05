> Historical checkpoint report. Latest urgent UX/audio work and current release gate: [URGENT_RELEASE.md](URGENT_RELEASE.md). Astra work was unavailable; owner authorized takeover.

# Final integration, QA dan persetujuan rilis — 5 November 2026

## Riwayat integrasi yang terverifikasi

| Tahap | Hasil |
| --- | --- |
| PR #12 → branding | **Merged**, commit `e8e9850837eaeb864ef8041f751fb34d206922e7`; head awal11267c9 dan tree hasil merge identik. |
| PR #11 → release | **Merged**, commit `65f5e45e35b37a460001fa9bf0b514920e33df86`; mencakup branding dan mini-world readability. |
| Regresi langsung setelah PR #11 | **37 unit + 32 gameplay** lulus pada checkout release terpisah; [unit](evidence/post-merge-branding-unit.log), [build](evidence/post-merge-branding-build.log), [browser](evidence/post-merge-branding.json). |
| Checkpoint GWO sebelum feature freeze | `7bcb21b89d473b26901effe05762f2949c596ac2`; papan jadwal nyata yang sudah dikembangkan sebelum instruksi final, bukan fitur baru selama finalisasi. |
| PR #10 → main | Tetap **open, belum merged**. SHA head akhir harus diverifikasi setelah follow-up dokumentasi/QA masuk release. |

Branch kerja follow-up `feature/gwo-schedule-explainer` sudah membawa ancestry release terbaru melalui merge lokal `84e6388cf71e74f7565002526731e6ee9c67c771`. Tidak ada cherry-pick/merge ulang world lama, Cloud Backup, force push, perubahan protection/visibility, atau deployment. Checkout `cloud-ops` dan `group8-branding` milik sesi lain tidak ditimpa.

## Isi rilis

Fondasi Bruno (kendaraan, kamera, terrain, physics dan rendering), empat zona produksi unik, Cloud Final8 task/3VM, ACO trace/feromon, GWO5 kandidat nyata dari12, M4 numerical engine, M5 adapters, M6 enam bagian/presentasi/results/paper, optimasi Low DPR1 dan geometry reuse tetap dipertahankan.

PR12 mengecilkan/memindah papan ACO, mempertahankan8 paket Cloud dengan1 tekstur antrean statis, dan memperjelas tiga label pemimpin GWO. Checkpoint GWO terpisah menampilkan delapan assignment/fitness/peran per kandidat pada satu papan event-driven; [laporan GWO](GWO_SCHEDULE_EXPLAINER.md). M4/M5/M6 tidak diubah terhadap release teruji `bc1d0dd`; perbaikan M6/Low mode yang sudah ada pada release tetap dibawa.

README root kini merupakan landing page Bahasa Indonesia dengan screenshot asli, overview CTS, fitur, representasi solusi, dataset/rumus/contoh hasil evaluator, kontrol, perintah lokal, teknologi aktual, tiga referensi lengkap, Kelompok8 tanpa nama rekaan, kredit dan status publikasi yang jujur. README lama disimpan pada [arsip](history/README_BEFORE_FINAL_RELEASE.md). Paper2025 dilengkapi seluruh penulis dari metadata DOI resmi; tidak mengklaim replikasi OACC/GWO_C/M atau menerima tugas akademik atas nama dosen.

Instalasi default sebelumnya gagal `ERESOLVE`: peer range `vite-plugin-restart@0.4.1` belum mencakup Vite7. `.npmrc` proyek memakai `legacy-peer-deps=true`; resolusi manifest tersalin lulus tanpa upgrade paket atau mengubah node_modules sesi lain. [Kegagalan terkonfirmasi](evidence/final-install-online.log), [uji kompatibilitas](evidence/final-install-projectrc.log). Dry-run resolusi bukan klaim instalasi bersih penuh. Pemeriksaan offline awal `ENOTCACHED` merupakan keterbatasan cache, bukan bukti regresi game.

## Matriks QA final

Checkpoint sebelum revisi Astra: 40 unit; 22 branding, 15 readability, 32 gameplay, 13 GWO, 28 UI, 1 listener-stability dan 7 ACO-motion checks lulus (118 browser checks). Build introspeksi memakai `VITE_GAME_PUBLIC=1` hanya untuk tes; build akhir membersihkannya. Tiap skrip menggunakan label `final-*` agar bukti lama tetap utuh. Hasil ini tidak membuktikan revisi Astra yang belum dipublikasikan.

| Pemeriksaan | Bukti |
| --- | --- |
| Unit/integritas/evaluator/seed/M5/M6/GWO data-view | [final-unit.log](evidence/final-unit.log) |
| Branding, Home, landmark, personal links, Credits, kendaraan/peta | [final-branding-branding.json](evidence/final-branding-branding.json) |
| Readability, actual events, Low, repeated reset/re-entry | [final-readability.json](evidence/final-readability.json) |
| Gameplay penuh semua world dan presentasi | [final-gameplay.json](evidence/final-gameplay.json) |
| Papan GWO actual assignments/guides/fitness, reset, resource reuse | [final-gwo.json](evidence/final-gwo.json) |
| Low/High, resize/persistence, M6 1366×768 dan1920×1080 | [final-ui.json](evidence/final-ui.json) |
| Listener keyboard/modal tiga roundtrip | [final-listeners.json](evidence/final-listeners.json) |
| Gerak semut menuju VM dari event M4, feromon dan reuse geometry | [final-aco-motion.json](evidence/final-aco-motion.json) |
| Normal release build | [final-release-build.log](evidence/final-release-build.log) |
| Integritas963 aset/path/WASM | [final-assets.log](evidence/final-assets.log) |
| Normal release subpath tanpa Game publik | [final-normal-browser.json](evidence/final-normal-browser.json) |
| UI normal semua Step/Play/Pause/Reset, results/paper/MIT | [final-normal-ui.json](evidence/final-normal-ui.json) |
| Fallback localhost dengan request luar origin diblokir | [final-local-offline.json](evidence/final-local-offline.json) |

Contoh numerik README diperiksa terhadap [output evaluator asli](evidence/final-model-example.json). Tidak ada hasil algoritma diubah demi screenshot. Review CI/review GitHub dilakukan terpisah: tidak adanya workflow/status bukan CI hijau; bukti otomatis di sini berasal dari eksekusi lokal.

Reproduksi: `npm test`; build produksi dengan flag introspeksi untuk skrip test-group8, test-mini-world-readability, test-m7, test-gwo-explainer, test-release-ui dan test-m7-listeners (URL preview subpath). Kemudian kosongkan flag, `npm run build`, `npm run test:build`, test-browser --production, test-group8-release dan opsi --block-external. Lihat package.json untuk script npm yang benar-benar tersedia.

## Screenshot final

Seluruhnya capture browser dari game terintegrasi, bukan gambar buatan/komposit. Sudut gameplay asli dan kondisi UI yang dinyatakan dipakai; gambar diperiksa langsung.

[Main/car](evidence/final-branding-main.png) · [Cloud](evidence/final-gameplay-cloud-yard.png) · [ACO/feromon](evidence/final-readability-aco-live.png) · [GWO/pemimpin](evidence/final-gameplay-gwo-leaders.png) · [Presentasi](evidence/final-gameplay-panel.png) · [Perbandingan/konvergensi](evidence/final-normal-ui-results.png) · [Credits](evidence/final-branding-credits.png) · [Assignment GWO](evidence/final-gwo-changed-panel.png).

## Performa dan batas penerimaan

Profil final: [raw JSON](evidence/final-profile.json), Chrome156 headless, WebGPU hardware NVIDIA RTX3050, 1366×768 CSS/DPR2, lima detik per skenario. Low menggunakan render DPR1; High DPR2.

| Skenario | High FPS / p95 ms | Low FPS / p95 ms |
| --- | --- | --- |
| Main | 136,7 / 8,3 | 142,5 / 8,4 |
| Cloud | 101,9 / 14,2 | 125,9 / 9,3 |
| ACO | 96,3 / 11,8 | 81,1 / 14,9 |
| GWO | 113,2 / 10,1 | 106,6 / 10,3 |
| GWO panel playback | 112,7 / 10,0 | 117,1 / 9,6 |

Low ACO lebih lambat dari sampel sebelumnya dan High; tidak ada klaim speedup universal. Load-to-Game tercatat17,488 detik; cache/beban latar tidak dikontrol sehingga ini bukan bukti masalah startup ~21detik sudah diperbaiki. Semua sampel Low >30FPS pada mesin ini, bukan jaminan laptop lain/foreground/sesi panjang. GPU elapsed timing tidak tersedia.

Dua puluh seek/reset per world mempertahankan scene1127 mesh/1019 geometry, renderer931 geometry/140 texture. Tiga geometry jalur ACO tetap sama; heap setelah GC sekitar44,6–44,8MiB. Tidak ada pertumbuhan resource tak terkendali pada uji terbatas ini; bukan pembuktian bebas memory leak. Profile baseline sebelumnya tetap tersedia pada M7_RELEASE/GROUP8_MAINWORLD/MINI_WORLD_READABILITY.

Keterbatasan tetap: M6 menutupi sebagian meja ACO dari titik stasiun (Esc membuka pandangan), sebagian wolf dapat tertutup pohon pada sudut tertentu, teks papan mengikuti perspektif, startup cukup panjang, serta WebGL/mobile/gamepad/long-session belum seluruhnya diterima. Tidak dilakukan redesign kamera/UI atau optimasi renderer luas saat feature freeze. Warning upstream font-path/eval/chunk tidak disembunyikan.

## Gate keputusan

**main dan deployment tetap menunggu persetujuan.** Publikasi aset yang izinnya belum jelas tetap **BLOCKED**: SFX/font Pally serta materi pihak ketiga yang belum memiliki ledger lengkap. GitHub Pages terverifikasi belum aktif. MIT/code attribution dan semua notice dipertahankan; tidak ada clearance baru dikarang. [Rencana deployment dan fallback lokal](DEPLOYMENT_READINESS.md).

Revisi Astra (ACO/GWO/dashboard draggable/akses instan/aset/musik) masih dikerjakan menurut pemilik; belum ada branch/PR final pada pemeriksaan remote. Jangan mengklaim fitur tersebut sudah diuji atau mengerjakannya ulang. Final acceptance seluruh revisi menunggu PR dan QA integrasi berikutnya. Main kini `70b804af9e09bcb2c76b1c37bd69241d6b27a2bf`: perubahan tanda baca README oleh kolaborator, tidak ditimpa pada sesi ini. Release masih `65f5e45` sebelum follow-up ini.

Settings masih merujuk screenshot lama `ui/previews/options.webp` yang menampilkan tulisan BRUNO SIMON. Referensinya diganti ke `campus/preview.svg` yang sudah ada, tanpa mengganti file aset asli/copyright atau menyentuh pengaturan renderer. Ini perbaikan identitas UI terkonfirmasi, bukan redesign. Percobaan preview pertama salah tidak memakai `--base` subpath; JS404 dan timeout disimpan dalam `final-normal-preview-attempt.json`, bukan dihitung lulus.

Persetujuan merge tidak otomatis menghapus gate lisensi atau mengizinkan deployment aset yang belum cleared. PR10 harus tetap terbuka hingga revisi Astra selesai, integrasi diuji, dan pemilik memberi persetujuan.

## Checkpoint lanjutan, 5 November 2026

Perubahan lanjutan dipisahkan pada `feature/final-release-qa`, tidak mengubah branch kerja Astra. Build produksi normal dan963 hash aset lulus; smoke produksi6/6, UI normal16/16 dan fallback localhost dengan request eksternal diblokir16/16 lulus. Total156 browser checks,40 unit; seluruh ini hanya mencakup checkpoint saat ini, bukan revisi Astra mendatang. Pemeriksaan visual Settings pertama terambil saat transisi Home; penantian tab aktif/animasi diperbaiki dan capture diulang, tanpa mengubah perilaku menu.

`.gitattributes` menormalkan hanya dua salinan notices ke LF agar byte-identik pada Windows/Linux; lisensi asli dan hash aset terlindungi tidak diubah. Tidak ada versi dependency, dataset, matematika, M5, M6, navigasi atau renderer baru. Dokumentasi dan checkpoint GWO yang sudah selesai dibawa sebagai follow-up ke release setelah PR diperiksa; main/deployment tetap menunggu pemilik.
