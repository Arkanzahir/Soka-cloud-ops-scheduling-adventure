# GWO: memperjelas arti kandidat jadwal

Branch `feature/gwo-schedule-explainer`, dasar `feature/mini-world-readability` @ `11267c9`. Follow-up visual khusus GWO; PR review bergantung pada PR #12 dan branding #11. Tidak mengubah release/main, merge, deployment, atau matematika GWO.

## Cara membaca di game

Masuk Wolf Field Research, datangi GWO Research dan tekan E/Enter. Tekan **Langkah** atau **Play** pada M6 yang sudah ada.

- Satu baris papan = satu kandidat/serigala dari lima kandidat yang ditampilkan. Kolom T1–T8 = delapan task. Angka **1/2/3** dan warnanya menunjukkan VM tujuan, sesuai legenda VM.
- Peran Alpha/Beta/Delta serta makespan setiap baris berasal dari kandidat sesudah evaluasi. **REKOR** adalah best-so-far, sehingga dapat lebih kecil daripada makespan Alpha pada iterasi sekarang.
- Bingkai emas menunjukkan task yang berpindah VM untuk **ID kandidat yang sama** sejak iterasi sebelumnya yang ditampilkan. Baris bertanda **MASUK PILIHAN** tidak mempunyai pembanding dalam lima kandidat sebelumnya; tidak diberi perubahan palsu.
- Footer menampilkan ID tiga pemimpin **sebelum pembaruan** (`guides` asli M4), yang memandu iterasi tersebut. Ini berbeda dari pemimpin hasil evaluasi terbaru.
- Pause menahan tampilan; Reset mengosongkan baris menjadi tanda tunggu. Tidak ada assignment/fitness acak. Posisi fisik serigala tetap; pencarian terjadi pada kandidat pembagian task, bukan perjalanan fisik ke VM.

## Implementasi terbatas

`sources/CloudOps/gwo/CandidateBoard.js`: satu papan kayu di sisi stasiun (-69,75), menggunakan material kayu GWO yang sudah ada, 4 mesh / 38 triangle / 3 geometry unik, dua tiang berbagi geometry. Satu CanvasTexture **1024×512** dibuat sekali; gambar diperbarui hanya pada event simulasi/reset, tidak setiap frame. Transform statis dibekukan dan culling mengikuti Area asli. Tanpa collider, listener, input baru, atau instance dashboard tambahan.

`sources/CloudOps/gwo/candidateView.js`: view-only mapping memakai ID stabil, menyalin assignment, dan membedakan peran saat ini, guides, current makespan dan best-so-far. Tidak menghitung ulang atau mengubah hasil optimizer.

`GwoWorld.js`: membuat papan sekali, meneruskan guides yang sudah diberikan M5, menampilkan state tervalidasi, lalu membersihkan papan lewat reset yang sudah ada. API lama tetap kompatibel. Semua source algoritma/dataset, SimulationBridge, M6, ZoneManager/registrasi, Cloud/ACO, kendaraan, kamera, physics dan renderer tidak diubah. Lisensi/attribution tetap utuh.

## Screenshot dan pemeriksaan visual

Chrome, 1366×768 CSS, device DPR2 dengan **rendering Low DPR1**, kamera gameplay asli di titik stasiun (-65,70); bukan free camera atau gambar komposit.

| Sebelum | Sesudah |
| --- | --- |
| [Stasiun sebelum papan](evidence/gwo-explainer-before-gwo-live-panel.png) | [Iterasi 1](evidence/gwo-explainer-production-step-panel.png) |
| — | [Iterasi 2: assignment/peran/makespan berubah](evidence/gwo-explainer-production-changed-panel.png) |
| — | [Reset netral](evidence/gwo-explainer-production-reset-panel.png) |

Penempatan awal ditolak setelah screenshot menunjukkan crop, atap, atau pohon menutupi tabel; posisi sisi stasiun final diperiksa langsung dan lolos batas kamera. Perspektif membuat teks kecil tetap miring; detail numerik besar tersedia pada M6. Saat panel ditutup, prompt interaksi asli dapat menutupi tepi kanan papan dari pose tertentu. Navigasi/kamera/prompt asli tidak diganti.

Tes browser pertama juga salah menganggap progress bertahan setelah panel dibuka ulang; M6 memang mereset lesson. Urutan tes diperbaiki tanpa mengubah perilaku game. Catatan kegagalan disimpan pada `gwo-explainer-first-attempt.json` dan `gwo-explainer-placement-attempt.json`.

## Hasil tes dan performa

- **40 unit tests lulus**, termasuk replay event GWO nyata, perubahan per ID meskipun ranking bergeser, kandidat baru masuk lima pilihan, reset netral dan input tidak termutasi: [log](evidence/gwo-explainer-unit.log).
- **13 pemeriksaan browser produksi khusus GWO lulus**: data nyata/guides/makespan, kamera Low, perubahan task, Play/Pause/Reset, tidak menggambar canvas tiap frame, 20 seek/reset tanpa penambahan geometry/texture/aktor, R dan re-entry: [JSON](evidence/gwo-explainer-production.json).
- **32 regresi gameplay terintegrasi lulus**, termasuk semua entrance/exit, Cloud/ACO/GWO, kendaraan/kamera/kontrol, real events, Next/Previous, comparison dan paper: [JSON](evidence/gwo-explainer-regression.json).

Sampel produksi 5 detik di titik baca papan, iterasi 1 sedang pause, Low DPR1: **127.0 FPS**, **8.8 ms p95**, sekitar331 draw calls. Tidak ada baseline stasiun setara untuk klaim peningkatan FPS. Ini headless Chrome pada mesin uji; bukan bukti laptop lebih lemah/long-session. Tambahan dasar tekstur sekitar2 MiB sebelum mipmap, bukan pengukuran VRAM. Tidak ada growth jumlah resource selama 20 reset; ini bukan bukti bebas memory leak untuk semua durasi.

Rilis normal tanpa `VITE_GAME_PUBLIC` lulus build, **963 hash aset**, **6 smoke subpath** dan **15 uji UI normal** (Cloud/ACO/GWO Step/Play/Pause/Reset, comparison, paper dan MIT). Bukti `gwo-explainer-assets.log`, `gwo-explainer-release-build.log`, `gwo-explainer-normal-browser.json` dan `gwo-explainer-normal-ui.json`. Warning font-path/eval/chunk serta batas lisensi/paper/device sebelumnya tetap berlaku. Checkpoint ini dibekukan sebelum tugas integrasi final; tidak menambah fitur lagi saat release. Merge ke main/deploy tetap memerlukan persetujuan akhir.
