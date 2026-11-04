# CLOUD OPS — Scheduling Adventure

> **Tugas Kelompok Strategi Optimasi Komputasi Awan (SOKA) | Demo Week 10**  
> **Status proyek: M0 dan M2 selesai — fondasi Bruno serta shared game extension diuji; konten edukasi masih direncanakan.**
> **Repository:** https://github.com/Arkanzahir/Soka-cloud-ops-scheduling-adventure

## 1. Tentang proyek

**CLOUD OPS** adalah rancangan presentasi HTML interaktif dalam bentuk game mobil 3D. Pemain mengendarai mobil, mengeksplorasi lingkungan, memasuki area pembelajaran, lalu mempelajari dan menjalankan **Ant Colony Optimization (ACO)** serta **Grey Wolf Optimizer (GWO)** untuk menyelesaikan kasus **Cloud Task Scheduling**.

Berbeda dengan PowerPoint konvensional, penjelasan algoritma tidak berhenti pada definisi dan gambar. Pemain dapat mengubah jumlah task, kemampuan Virtual Machine (VM), parameter algoritma, kemudian menjalankan kode JavaScript dan melihat bagaimana jadwal serta metrik evaluasinya berubah.

**Prinsip proyek:** game 3D adalah cara *menyampaikan* materi. Nilai akademik utamanya tetap terletak pada paper, penjelasan algoritma, studi kasus task→algoritma→solusi, dan visualisasi hasil perhitungan yang benar.

### Istilah penting:

| Istilah | Penjelasan singkat |
|---|---|
| Task | Pekerjaan komputasi yang perlu dieksekusi. |
| VM / Virtual Machine | Sumber daya komputasi yang menjalankan task. |
| Cloud Task Scheduling (CTS) | Menentukan VM yang digunakan untuk mengerjakan tiap task. |
| Makespan | Waktu penyelesaian seluruh task; pada model ini sama dengan beban waktu VM paling akhir selesai. |
| ACO | Metaheuristik terinspirasi semut dan feromon untuk membangun solusi. |
| GWO | Metaheuristik terinspirasi hierarki dan perilaku kawanan serigala untuk memperbaiki solusi. |
| Visualization by code | Visualisasi dibuat dari data yang dihitung oleh kode algoritma, bukan animasi palsu atau gambar statis. |

## 2. Instruksi Demo Week 10 yang menjadi dasar

Berdasarkan foto papan tulis dan catatan tugas dari kelompok:

1. Gunakan **dua algoritma metaheuristik**: kelompok memilih ACO dan GWO.
2. Sertakan **referensi/riset paper ilmiah** yang relevan.
3. Jelaskan **cara kerja** dan tahapan umum masing-masing algoritma.
4. Buat **studi kasus Cloud Task Scheduling** dengan alur *task → algoritma → solusi*.
5. Bahas metrik **makespan, cost, resource utilization** dengan asumsi dan rumus jelas.
6. Presentasikan melalui **HTML interaktif**, dengan visualisasi yang membantu audiens memahami proses algoritma.
7. Gunakan **visualisasi berbasis kode** dan targetkan publikasi melalui GitHub Pages.

**Catatan:** mobil, tiga mini-world, portal `E`, dan mode presentasi seperti slide merupakan keputusan desain kelompok — **bukan** instruksi eksplisit dosen.

## 3. Ide gameplay dan isi world

Ada **satu game** dengan **mobil yang sama**. Main World menjadi tempat eksplorasi dan tiga mini-world menjadi area pembelajaran, bukan tiga permainan terpisah.

```text
                   MAIN WORLD
            (mobil + jalan + objek 3D)
                  /    |    \
             [CLOUD] [ACO] [GWO]
                  \    |    /
              RESULTS & RESEARCH
```

| Lokasi | Desain dunia | Yang dilakukan pemain | Pembelajaran |
|---|---|---|---|
| **Main World** | Lingkungan mobil 3D low-poly yang dipertahankan dari basis proyek | Mengemudi, menjelajah, memilih checkpoint | Navigasi dan pembukaan |
| **Cloud World / Compute Yard** | Jalan dan vegetasi konsisten dengan Main World, ditambah server, podium VM, dan kotak task | Melihat task masuk ke VM dan menjalankan baseline scheduling | Task, VM, MI/MIPS, beban VM, makespan |
| **ACO World / Ant Research Park** | Sarang semut dan jalur bercabang dalam lingkungan yang sama gayanya | Menjalankan semut virtual, melihat probabilitas pemilihan VM dan pembaruan feromon | Konstruksi solusi ACO dan iterasi |
| **GWO World / Wolf Field** | Pepohonan dan batuan konsisten, dengan figur kawanan serigala | Mengamati kandidat solusi, alpha/beta/delta, serta perubahan fitness | Update kandidat dan diskretisasi solusi GWO |
| **Results & Research Station** | Papan/podium penelitian dalam world yang sama | Membandingkan grafik dan membaca paper | Analisis metrik, temuan, batasan, dan kesimpulan |

### Mengapa desain antarworld harus konsisten?

Mini-world **tidak boleh** menggunakan gaya baru seperti cyberpunk, floating islands, portal sci-fi/neon, atau aset 3D dari paket yang warna/materialnya bertabrakan. Semua area dibuat sebagai *perpanjangan Main World* melalui **reuse → kitbash → model baru** setelah audit model, material, pencahayaan, vegetasi, jalan, skala, dan pipeline Blender dari basis game.

Lihat [`docs/WORLD_DESIGN_SPEC.md`](docs/WORLD_DESIGN_SPEC.md) untuk aturan visual dan quality gate.

## 4. Bagaimana cara memainkan game?

### Mengemudi dan berpindah area

1. Pemain membuka halaman game dan mobil berada di **Main World**.
2. Pemain mengemudi menuju salah satu **gerbang pembelajaran** (Cloud, ACO, GWO).
3. Muncul petunjuk `Press E to Enter` setelah kendaraan berada pada radius yang aman.
4. Tekan **E**: input kendaraan dibekukan sementara, transisi kamera/fade berjalan, mobil dipindah ke titik awal mini-world, lalu kontrol aktif lagi.
5. Pemain **tetap mengendarai mobil** di mini-world tersebut untuk mencapai objek pelajaran.
6. Di dekat objek/stasiun simulasi, tekan **E** lagi untuk membuka panel/animasi penjelasan. Kendaraan berhenti sementara.
7. Tekan **Esc** untuk menutup panel dan kembali mengemudi. Untuk keluar mini-world, menuju gerbang keluar lalu tekan **E**.

> Audit M0: commit Bruno yang digunakan sudah mendukung **Enter, E, dan F** untuk interaksi. Kontrol asli dipertahankan.

### Dua mode bermain

- **Explore Mode:** bebas mengendarai mobil dan mengunjungi area mana pun. Tidak perlu menyelesaikan semua misi secara berurutan.
- **Presentation Mode:** seperti PPT. Ada `Previous`, `Next`, progres section, teleport ke checkpoint aman dan kamera terarah. Presenter **tidak perlu menyetir jauh** jika waktunya terbatas atau mobil tersangkut.

### Urutan presentasi yang dirancang

| Bagian | World/stasiun | Isi saat presentasi |
|---|---|---|
| 1. Opening | Main World | Tujuan proyek, masalah CTS, pengenalan game |
| 2. Problem Definition | Cloud World | Task, VM, baseline, makespan |
| 3. ACO Concept + Demo | ACO World | Probabilitas, feromon, konstruksi jadwal, iterasi |
| 4. GWO Concept + Demo | GWO World | Kandidat, alpha/beta/delta, diskretisasi, iterasi |
| 5. Comparison | Results Station | Jadwal tiap VM, makespan, cost, utilization proxy, grafik konvergensi |
| 6. Papers & Conclusion | Research Station | Referensi ilmiah, hubungan paper dan implementasi, temuan dan keterbatasan |

Mode presentasi bukan fitur wajib dosen, tetapi dirancang sebagai pengaman ketika demonstrasi di depan kelas. Lihat [`docs/PRESENTATION_GUIDE.md`](docs/PRESENTATION_GUIDE.md).

## 5. Studi kasus Cloud Task Scheduling

Untuk versi pendidikan awal, kita menggunakan **task independen, non-preemptive, dan VM heterogen**. Contoh input awal: **8 task dan 3 VM** (bisa diubah pengguna). Setiap task mendapat tepat satu VM.

**Model evaluasi:**

- `executionTime(task i, VM j) = lengthMI[i] / mips[j]`.
- `load[j] = jumlah executionTime task yang ditempatkan di VM j`.
- `makespan = max(load[0], ..., load[m-1])`.
- `computeCost = jumlah load[j] × biaya-per-detik[j]` *(harga simulasi, bukan tagihan cloud nyata)*.
- `meanUtilizationProxy = jumlah load[j] / (jumlah VM × makespan)` *(proksi penggunaan relatif pada model sederhana, bukan CPU utilization nyata)*.

**Objektif utama MVP:** meminimalkan **makespan**. Cost dan utilization ditampilkan sebagai metrik sekunder; tidak boleh diklaim ikut dioptimalkan bila tidak ada fungsi objektif yang melakukannya.

### Contoh keluaran yang diharapkan

Pengguna memasukkan task dan VM → memilih ACO atau GWO → menekan `Run` atau `Step` → engine JavaScript menghasilkan alokasi task → visualisasi 3D membaca jejak iterasi dari engine → tabel/grafik menampilkan solusi dan makespan. Semua angka dihasilkan dari kode yang dapat diuji, **bukan nilai hardcoded**.

### Bedanya ACO dan GWO dalam visualisasi

- **ACO:** setiap semut membangun kandidat assignment. Panel menunjukkan probabilitas task→VM berdasarkan feromon dan heuristik, kemudian proses evaporasi/deposit serta best-so-far.
- **GWO:** setiap serigala mewakili satu kandidat jadwal, bukan satu task. Kandidat terbaik menjadi alpha, beta, delta. Posisi kandidat diperbarui, dipetakan ke VM diskret, lalu dievaluasi kembali.

Baca [`docs/ALGORITHM_SPEC.md`](docs/ALGORITHM_SPEC.md) untuk pseudocode, parameter, trace events, asumsi, serta unit test.

## 6. Paper ilmiah dan kejujuran metodologi

### Paper ACO cadangan yang **sudah terverifikasi**

**Hongtao Wang (2024).** *Research on Task Scheduling Model of Ant Colony Optimization Cloud Computing Platform for Online Practical Customer-training Application*. **IEIE Transactions on Smart Processing & Computing**, 13(3), 243–253. DOI: https://doi.org/10.5573/IEIESPC.2024.13.3.243

Paper ACO yang semula dikirim anggota melalui DBpia (`NODE11826229`) **belum dapat diverifikasi** judul dan metode lengkapnya. Jika paper asli dapat diakses kemudian dan memang relevan, dokumentasi perlu diperbarui.

### Paper GWO pilihan kelompok yang **sudah terverifikasi**

**Hongbo Wang et al. (2025).** *An improved grey wolf optimizer with flexible crossover and mutation for cluster task scheduling*. **Information Sciences**, 704, 121943. DOI: https://doi.org/10.1016/j.ins.2025.121943

**PENTING:** kedua penelitian membahas bentuk *improved* ACO/GWO. Implementasi awal aplikasi dirancang sebagai **baseline ACO diskret dan baseline GWO yang didiskretisasi**, **bukan** klaim reproduksi persis algoritma OACC atau GWO_C/M. Replikasi varian paper hanya boleh diklaim setelah persamaan/prosedur diperiksa dan diuji.

Baca [`docs/PAPER_REVIEW.md`](docs/PAPER_REVIEW.md) untuk status bukti, isi ilmiah dan keterbatasan sumber.

## 7. Teknologi dan sumber dasar game

- **Three.js** — rendering 3D di browser.
- **Rapier** — fisika kendaraan/tumbukan (mengikuti stack proyek awal).
- **JavaScript/TypeScript sesuai repo dasar** — engine ACO, GWO, state machine dan interaksi.
- **HTML/CSS** — panel materi, HUD dan mode presentasi.
- **Blender/GLB** — modifikasi/pembuatan aset 3D sesuai pipeline basis.
- **Vite dan GitHub Actions** — bundling dan deployment statis ke GitHub Pages.

Game menggunakan **basis open-source Bruno Simon Folio 2025** sebagai fondasi 3D dan kendaraan. Komponen tersebut bukan diklaim dibuat seluruhnya dari nol oleh kelompok. Kontribusi kelompok diarahkan pada integrasi akademik, zona baru, aset edukasi, visualisasi dan engine ACO/GWO. Lisensi dan atribusi harus dipertahankan. Rincian: [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).

## 8. Struktur repository (target; belum semua ada)

```text
Soka-cloud-ops-scheduling-adventure/
├── README.md                    # Panduan utama untuk kelompok
├── CONTRIBUTING.md              # Aturan kerja dan kolaborasi
├── THIRD_PARTY_NOTICES.md       # Atribusi & pemeriksaan lisensi
├── AGENTS.md                    # Petunjuk coding agent / AI
├── docs/
│   ├── PRD.md                   # Kebutuhan produk
│   ├── GDD.md                   # Desain gameplay dan zona
│   ├── ALGORITHM_SPEC.md        # Model CTS, ACO, GWO, metrik
│   ├── PAPER_REVIEW.md          # Status dan ringkasan paper
│   ├── WORLD_DESIGN_SPEC.md     # Pedoman visual dan aset
│   ├── IMPLEMENTATION_PLAN.md   # Milestones dan pengujian
│   ├── PRESENTATION_GUIDE.md    # Script demo untuk kelompok
│   ├── MASTER_PROMPT.md         # Prompt eksekusi di Work
│   └── WORK_HANDOFF.md          # Status dan tugas sesi berikutnya
├── sources/                     # Source game Bruno, fondasi M0
├── static/                      # Aset runtime asli
├── resources/                   # Sumber Blender/texture
├── scripts/                     # Pipeline aset dan pengujian browser
├── tests/                       # Integritas fondasi/aset/path
└── package.json                 # Vite dan perintah pengujian
```

**Jangan membuat folder `src/public` secara asal** sebelum memeriksa struktur aktual repositori dasar; source resmi memakai `sources/`, `static/`, `resources/`, `scripts/`.

## 9. Cara menjalankan proyek

Jalankan dari root checkout (Node.js 22.17.0 digunakan pada pengujian M0):

```bash
cp .env.example .env
npm install --force
npm run dev
npm test
npm run build
npm run test:build
npm run preview
```

PowerShell: gunakan `Copy-Item .env.example .env` dan `npm.cmd` bila diperlukan. Server dev menampilkan URL localhost; `VITE_SERVER_URL` kosong menjalankan core game tanpa backend. Uji browser memerlukan Chrome: `npm run test:browser -- URL foundation-dev`. Bukti, pengujian produksi subpath, keterbatasan dan screenshot: [`docs/BASELINE_TEST_REPORT.md`](docs/BASELINE_TEST_REPORT.md). README Bruno asli: [`docs/upstream/BRUNO_README.md`](docs/upstream/BRUNO_README.md).

**M2:** dekati marker **Zona Uji M2** di depan tulisan Bruno, dekat bangku tambahan pada area awal. E/Enter masuk; di zona uji, E/Enter membuka panel atau kembali melalui gerbang, Esc menutup panel, R mereset kendaraan ke spawn zona. Panduan, API reusable dan bukti pengujian: [`docs/M2_SHARED_GAME_EXTENSION.md`](docs/M2_SHARED_GAME_EXTENSION.md).

## 10. Roadmap status

| Milestone | Fokus | Status saat dokumen dibuat |
|---|---|---|
| M0 | Audit source Bruno, lisensi, aset, build dan visual baseline | SELESAI — bukti pada BASELINE_TEST_REPORT; clearance SFX/font sebelum publikasi |
| M1 | Finalisasi detail paper dan spesifikasi algoritma | DRAFT / paper GWO terverifikasi, ACO DBpia belum |
| M2 | Sistem zona, tombol E/Enter, kamera, respawn | SELESAI — Main↔satu zona uji, panel, safety reset; laporan M2 tersedia |
| M3 | Cloud Mini-World sebagai vertical slice | TAHAP 1 selesai: kerangka CloudArea, 1 stasiun, 3 VM placeholder; M3 penuh belum selesai |
| M4 | Engine ACO & GWO, seeded RNG, unit tests | BELUM DIMULAI |
| M5 | ACO/GWO worlds dan animasi dari trace nyata | BELUM DIMULAI |
| M6 | Results, paper station, Presentation Mode | BELUM DIMULAI |
| M7 | Production QA dan deployment GitHub Pages | BELUM DIMULAI |

Silakan lihat [`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md). Jangan mengubah status menjadi **Completed** tanpa bukti test/build.

## 11. Pembagian kerja kelompok (disarankan; belum ditetapkan per orang)

| Role | Tanggung jawab | Bukti penyelesaian |
|---|---|---|
| Project Lead / Integrator | PRD, jadwal, review dan penyatuan fitur | Milestone, PR review, integrasi berhasil |
| 3D World & Vehicle | Audit world, asset pipeline, terrain, mini-world, physics | Screenshot perbandingan dan gameplay test |
| Algorithm Engineer | Model scheduling, ACO/GWO, RNG, tests | Unit tests, trace event, hasil terverifikasi |
| UI & Visualization | Panel edukasi, chart, presentasi, ilustrasi data | Grafik sinkron dengan engine |
| Research & Presenter | Paper, sitasi, narasi, uji demo di kelas | Paper matrix, script dan latihan presentasi |

Satu orang boleh menangani lebih dari satu role. Nama anggota dan pembagian final ditetapkan bersama; **jangan mengarang nama atau kontribusi**.

## 12. Aturan kerja bersama

- Kerjakan fitur di branch masing-masing, jangan push langsung ke `main` tanpa review.
- Tulis commit yang jelas, sertakan screenshot/video untuk perubahan world.
- Untuk algoritma, sertakan pengujian yang memperlihatkan hubungan input→output.
- Pisahkan klaim **sudah diuji** vs **baru direncanakan**.
- Baca [`CONTRIBUTING.md`](CONTRIBUTING.md) sebelum mengubah repository.
- Jangan mempublikasikan repo atau mengaktifkan Pages tanpa pemeriksaan lisensi dan keputusan kelompok.

## 13. GitHub Pages

Saat produk siap, Vite akan membangun output statis (`dist`), kemudian GitHub Actions dapat menerbitkan ke GitHub Pages. Karena target repo adalah `Soka-cloud-ops-scheduling-adventure`, path konfigurasi Vite perlu diuji untuk subpath `/Soka-cloud-ops-scheduling-adventure/` dan semua GLB, texture, WASM, serta asset fetch diperiksa agar tidak `404`.

Repository saat penulisan masih **Private**; perubahan ke Public direncanakan oleh pemilik repository setelah produk selesai dan lisensi diperiksa. **Belum ada URL game live.**

## 14. Dokumentasi yang perlu dibaca anggota

| Dokumen | Kapan dibaca? |
|---|---|
| [`docs/PRD.md`](docs/PRD.md) | Sebelum menyepakati fitur |
| [`docs/GDD.md`](docs/GDD.md) | Sebelum mengerjakan mobil, world, dan interaksi |
| [`docs/ALGORITHM_SPEC.md`](docs/ALGORITHM_SPEC.md) | Sebelum menulis ACO/GWO atau grafik |
| [`docs/PAPER_REVIEW.md`](docs/PAPER_REVIEW.md) | Saat menyusun materi akademik dan sitasi |
| [`docs/WORLD_DESIGN_SPEC.md`](docs/WORLD_DESIGN_SPEC.md) | Sebelum membuat atau mengunduh aset 3D |
| [`docs/PRESENTATION_GUIDE.md`](docs/PRESENTATION_GUIDE.md) | Saat latihan demo dan membagi narasi |
| [`docs/MASTER_PROMPT.md`](docs/MASTER_PROMPT.md) | Ketika memulai implementasi di ChatGPT Work/Codex |

## 15. Catatan lisensi & kontribusi

Proyek ini mengadaptasi fondasi open-source **Bruno Simon — Folio 2025** (MIT). Lisensi sumber dan pemberitahuan hak cipta wajib dipertahankan ketika kode/asetnya dimasukkan. Pihak ketiga dapat memiliki lisensi berbeda sehingga harus diperiksa sebelum redistribusi. Kontribusi karya kelompok harus dicatat dengan jelas, termasuk bagian yang dibangun sendiri dan yang merupakan adaptasi.

**Status klaim:** M0 dan shared extension M2 sudah diuji. Algoritma, mini-world edukasi, UI mode presentasi dan deployment masih rencana; materi desain kelompok dipertahankan. M1 tidak dikerjakan pada sesi M2 sesuai instruksi pemilik.

