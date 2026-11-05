# Cloud Ops: Scheduling Adventure

**Kelompok 8 — Strategi Optimasi Komputasi Awan (SOKA)**

Jelajahi kampus dengan mobil 3D, kirim task ke virtual machine, dan amati bagaimana **Round Robin, Ant Colony Optimization, serta Grey Wolf Optimizer** menyusun jadwal. Alokasi, nilai, dan grafik berasal dari engine JavaScript nyata yang dapat diuji.

![Cloud Ops Campus dan kendaraan](docs/evidence/final-branding-main.png)

**Status:** kandidat rilis di `release/m7-final`; PR #10 ke `main` belum merged. Revisi Astra tidak tersedia; pekerjaan dilanjutkan pada branch `feature/final-ux-aco-gwo-audio`. Status dan bukti terbaru: [urgent release](docs/URGENT_RELEASE.md). **Belum ada deployment publik; izin sebagian aset belum tuntas.** [Hasil QA dan batasan rilis](docs/FINAL_RELEASE.md).

<details>
<summary>Pratinjau world, presentasi, dan hasil</summary>

| Cloud Compute Yard | Ant Research Park |
| --- | --- |
| ![Delapan task dan tiga VM](docs/evidence/final-gameplay-cloud-yard.png) | ![Semut dan jalur feromon](docs/evidence/final-readability-aco-live.png) |

| Wolf Field Research | Presentation Mode |
| --- | --- |
| ![Lima kandidat serigala](docs/evidence/final-gameplay-gwo-leaders.png) | ![Panel pembelajaran](docs/evidence/final-gameplay-panel.png) |

![Perbandingan hasil dan konvergensi](docs/evidence/final-normal-ui-results.png)

Screenshot browser asli dari game terintegrasi, bukan mockup. Bukti lengkap tersedia pada laporan QA.

</details>

## Tentang proyek

Cloud Task Scheduling menentukan **task mana dijalankan pada VM mana**. Task memiliki beban kerja berbeda; VM memiliki kecepatan berbeda. Pembagian jumlah task yang merata belum tentu memberi waktu selesai tercepat.

Game memperagakan pencarian jadwal dengan **makespan minimum**: waktu sampai seluruh task selesai. ACO membangun solusi melalui pilihan probabilistik dan feromon; GWO memperbarui populasi solusi dengan panduan tiga pemimpin. Keduanya dibandingkan dengan Round Robin pada data yang sama.

## Fitur utama

- Mobil, kamera, terrain, pencahayaan, dan fisika dari fondasi Bruno Simon.
- **Cloud Ops Campus:** identitas Kelompok 8, tiga tujuan pembelajaran, dan Credits transparan.
- **Cloud Compute Yard:** delapan paket task, tiga VM, animasi alokasi nyata, beban VM, dan penanda antrean.
- **Ant Research Park:** semut contoh mengikuti pilihan VM nyata; jalur feromon membaca pembaruan engine.
- **Wolf Field Research:** lima kandidat terpilih dari populasi 12, Alpha/Beta/Delta, fitness, serta papan pembagian task per kandidat.
- **Step / Play / Pause / Reset**, tabel assignment, makespan, biaya simulasi, utilization proxy, dan grafik konvergensi.
- Enam bagian presentasi dengan **Next/Previous**, perpindahan zona aman, dan kendaraan terkunci selama panel terbuka.
- Grafis **Low/High** yang tersimpan. Low membatasi DPR ke 1; High mempertahankan batas DPR 2.

## Algoritma dan representasi solusi

| Metode | Alur inti | Visualisasi |
| --- | --- | --- |
| **Round Robin** | Membagi task bergiliran ke VM1 → VM2 → VM3. | Paket berpindah ke VM dan beban terakumulasi. |
| **ACO baseline** | Tiap semut menyusun jadwal dengan feromon dan heuristik beban; evaluasi diikuti evaporasi/deposit. | Satu semut contoh, keputusan task→VM, probabilitas, dan pembaruan feromon nyata. |
| **GWO baseline** | Alpha/Beta/Delta memandu pembaruan vektor kandidat; koordinat didiskretisasi menjadi indeks VM lalu dievaluasi. | Lima jadwal, ID/peran/fitness, VM tujuan setiap task, dan perubahan assignment per ID. |

Satu kandidat adalah delapan pilihan VM, misalnya `[0,1,2,0,1,2,0,1]` pada engine; tampilan memakai VM1–VM3. **Satu serigala mewakili satu jadwal lengkap, bukan satu task.** Pencarian terjadi pada solusi pembagian task, bukan jarak berjalan menuju VM. [Cara membaca papan GWO](docs/GWO_SCHEDULE_EXPLAINER.md).

Implementasi adalah **baseline edukatif**, bukan reproduksi identik OACC atau GWO_C/M dari paper. Objektif utamanya makespan; biaya dan utilization proxy adalah metrik sekunder. Satu seed/dataset tidak membuktikan algoritma selalu unggul.

## Dataset dan model matematis

Demo memakai **8 task independen, non-preemptive** dan **3 VM heterogen**. Setiap task mendapat tepat satu VM, dengan eksekusi berurutan pada VM tersebut. Model tidak memasukkan transfer jaringan, kedatangan dinamis, kegagalan, atau overhead virtualisasi. Dataset UI tetap; konfigurasi tambahan tersedia melalui API pengembang.

| Task | T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Beban (MI) | 1200 | 2400 | 1800 | 3200 | 2100 | 1500 | 2700 | 3600 |

| VM | Kecepatan (MIPS) | Biaya simulasi / detik |
| --- | ---: | ---: |
| VM1 | 600 | 0,0010 |
| VM2 | 1000 | 0,0015 |
| VM3 | 1500 | 0,0025 |

MI = *million instructions*; MIPS = *million instructions per second*.

```text
durasi(i,j)       = MI[i] / MIPS[j]
load[j]          = jumlah durasi task pada VM j
makespan         = max(load[j])
cost             = jumlah load[j] × costPerSecond[j]
utilizationProxy = jumlah load[j] / (jumlah VM × makespan)
```

Contoh terverifikasi: T1 pada VM1 membutuhkan **1200/600 = 2 detik**. Round Robin menghasilkan beban **[11,833333; 8,1; 2,2] detik**, makespan **11,833333 detik**, biaya **0,029483333 unit simulasi**, dan mean utilization proxy **62,35%**. Biaya bukan tarif cloud nyata; proxy bukan pengukuran CPU utilization.

Perbandingan memakai dataset sama, seed **42**, **50 iterasi** untuk metaheuristik, dan populasi **12**. Demo Step menggunakan trace pelajaran singkat. Anggaran evaluasi antaralgoritma berbeda. [Spesifikasi model dan pengujian](docs/ALGORITHM_SPEC.md).

## Cara bermain dan presentasi

| Kontrol | Fungsi |
| --- | --- |
| **WASD / tombol panah** | Mengemudi dan membelokkan mobil. |
| **B / Shift** | Rem / boost. |
| **E / Enter** | Berinteraksi dengan gerbang atau stasiun terdekat. |
| **Esc** | Menutup panel/menu dan kembali mengemudi. |
| **R** | Reset kendaraan ke titik aman zona aktif. |
| **M** | Membuka peta kampus. |

Datangi gerbang Cloud, ACO, atau GWO, lalu tekan E/Enter. Di dalam zona, gunakan stasiun riset untuk membuka pelajaran. Gerbang **Kembali ke Main** membawa mobil pulang.

Untuk demo kelas, klik **MULAI PRESENTASI**:

**Pembukaan → Cloud → ACO → GWO → Hasil → Paper**.

**Langkah** menjalankan satu event; **Play/Pause** menjalankan/menahan trace; **Reset** mengulang. Next/Previous mengatur zona dan panel yang sama. Tutup panel dengan Esc untuk melihat seluruh meja ACO dari stasiunnya; overlap pada sudut tersebut masih menjadi batas tampilan yang didokumentasikan.

## Instalasi dan menjalankan lokal

Gunakan **Node.js 22.17.0** seperti lingkungan uji. Vite mensyaratkan Node 20.19+ atau 22.12+. Browser yang diuji adalah Google Chrome desktop dengan WebGPU. WebGPU membutuhkan HTTPS atau localhost. Fallback WebGL tersedia dari fondasi renderer, tetapi belum termasuk penerimaan perangkat proyek.

```bash
git clone --branch release/m7-final https://github.com/Arkanzahir/Soka-cloud-ops-scheduling-adventure.git
cd Soka-cloud-ops-scheduling-adventure
npm install
npm run dev
```

Buka URL localhost dari Vite. `.env` tidak wajib untuk demo lokal dan backend tidak diperlukan. Untuk pengaturan opsional, salin `.env.example` menjadi `.env`; pertahankan `VITE_SERVER_URL` dan `VITE_GAME_PUBLIC` kosong pada rilis normal. Jangan memasukkan credential ke repository.

`.npmrc` menggunakan `legacy-peer-deps=true` untuk plugin upstream lama yang peer range-nya belum mencakup Vite 7. Versi dependency tidak di-upgrade pada finalisasi ini. Di PowerShell, gunakan `npm.cmd` bila diperlukan.

Verifikasi dan preview produksi:

```bash
npm test
npm run build
npm run test:build
npm run preview
```

Output berada di `dist/`. Vite `base: './'` menjaga aset relatif. Pemeriksaan subpath repository:

```bash
npm run preview -- --host 127.0.0.1 --port 4173 --base /Soka-cloud-ops-scheduling-adventure/
```

Buka `http://127.0.0.1:4173/Soka-cloud-ops-scheduling-adventure/`. Tes browser otomatis memerlukan Chrome dan Playwright; perintah serta hasilnya ada di [laporan QA final](docs/FINAL_RELEASE.md).

Untuk presentasi, mulai dari **Menu → Options → Quality: Low** dan muat game sebelum giliran demo. Startup sebelumnya sekitar **21 detik** pada lingkungan uji; hasil headless RTX 3050 bukan jaminan performa semua laptop. Uji foreground pada perangkat presentasi dan siapkan localhost sebagai fallback.

## Teknologi

**JavaScript, HTML/CSS, Three.js/TSL, WebGPURenderer, Rapier 3D, Vite, GLB/Blender**, CanvasTexture dan SVG. Evaluator/algoritma terpisah dari renderer; M5 meneruskan trace ke world dan M6 menyajikan pembelajaran serta perbandingan.

## Referensi ilmiah

1. **Wang, H. (2024).** Research on Task Scheduling Model of Ant Colony Optimization Cloud Computing Platform for Online Practical Customer-training Application. *IEIE Transactions on Smart Processing & Computing*, **13**(3), 243–253. [DOI: 10.5573/IEIESPC.2024.13.3.243](https://doi.org/10.5573/IEIESPC.2024.13.3.243).
2. **Wang, H., Zhang, J., Fan, J., Zhang, C., Deng, B., & Zhao, W. (2025).** An improved grey wolf optimizer with flexible crossover and mutation for cluster task scheduling. *Information Sciences*, **704**, 121943. [DOI: 10.1016/j.ins.2025.121943](https://doi.org/10.1016/j.ins.2025.121943).
3. **Mirjalili, S., Mirjalili, S. M., & Lewis, A. (2014).** Grey Wolf Optimizer. *Advances in Engineering Software*, **69**, 46–61. [DOI: 10.1016/j.advengsoft.2013.12.007](https://doi.org/10.1016/j.advengsoft.2013.12.007).

Paper pertama membahas improved ACO/OACC; paper kedua membahas GWO_C/M dengan crossover/mutation; paper ketiga menjelaskan GWO standar. Game **tidak mengklaim mereplikasi hasil eksperimen paper**. Paper ACO DBpia semula belum terverifikasi; referensi ACO di atas adalah alternatif terverifikasi. [Kajian dan batas akademik](docs/PAPER_REVIEW.md).

## Kontributor, kredit, dan lisensi

**Kelompok 8** mengadaptasi world Cloud/ACO/GWO, engine scheduling, bridge simulasi, panel pembelajaran/presentasi, perbandingan, branding kampus, dokumentasi, dan integrasi. Nama/pembagian individu tidak dicantumkan karena belum tersedia catatan terverifikasi.

Fondasi teknis dan visual berasal dari **[Folio 2025 karya Bruno Simon](https://github.com/brunosimon/folio-2025)**: kendaraan, kamera, physics, terrain, renderer, aset dan interaksi. Copyright **© 2025 Bruno Simon** dan [lisensi MIT](license.md) dipertahankan. Proyek ini tidak menyatakan endorsement Bruno Simon.

Musik dikreditkan kepada **Kounine** sesuai keterangan CC0 upstream. Lisensi kode tidak otomatis mencakup setiap aset: izin redistribusi **SFX, font Pally, dan materi pihak ketiga yang belum tuntas** tetap menjadi gate publikasi. [Third-party notices](THIRD_PARTY_NOTICES.md) · [Inventaris aset](docs/ASSET_CATALOG.md) · [Kesiapan deployment dan demo lokal](docs/DEPLOYMENT_READINESS.md). Credits tersedia melalui menu **Tentang Proyek** di game.

## Dokumentasi lanjutan

[QA final](docs/FINAL_RELEASE.md) · [Panduan presentasi](docs/PRESENTATION_GUIDE.md) · [Model algoritma](docs/ALGORITHM_SPEC.md) · [Arsitektur fondasi](docs/ARCHITECTURE_AUDIT.md) · [Aturan kontribusi](CONTRIBUTING.md) · [Riwayat README/milestone](docs/history/README_BEFORE_FINAL_RELEASE.md).

### Dashboard dan musik

Di Cloud/ACO/GWO tekan **L** atau **Buka Dashboard** tanpa mendekati stasiun; posisi mobil dipertahankan. **Esc/L** menutup dan mengembalikan kontrol mobil. E/Enter di stasiun tetap tersedia. Seret header dashboard untuk memindah panel penuh; **↺ Posisi** mengembalikan posisi awal. Posisi bertahan saat berganti materi dan dibatasi viewport.

Settings menyediakan Musik latar On/Off dan volume; **M** mute seluruh audio. Musik Kounine yang sudah tersedia diputar setelah interaksi, mengecil menjadi25% saat dashboard terbuka, lalu kembali ke volume pilihan. ACO menampilkan ant/Task/VM/probabilitas/feromon dari event nyata; GWO mempertahankan papan assignment5 kandidat dari12 dengan animasi ringan ketika kandidat berubah. Gerak dekoratif tidak menentukan makespan.
