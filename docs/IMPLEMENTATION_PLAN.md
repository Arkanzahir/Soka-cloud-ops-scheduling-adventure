# IMPLEMENTATION PLAN — Cloud Ops

## 1. Prinsip eksekusi

**Jangan langsung membuat tiga mini-world.** Kerjakan *vertical slice* Cloud pertama agar semua risiko visual, fisika, interaksi, dan deployment muncul awal. Setiap milestone harus memiliki artefak, pengujian, dan bukti bahwa fungsinya bekerja. Gunakan cabang/clone terpisah agar basis asli aman.

## 2. Milestones dengan exit gate

### M0 — Repository & baseline audit (wajib paling awal)

**Kerjakan:** clone/fork dari repo resmi, review lisensi, `npm install` sesuai petunjuk repo, `npm run dev`, dokumentasi struktur source dan model/GLB/Blender, snapshot visual & benchmark hardware, `npm run build` baseline, cek dependensi `.env`, server-only features.

**Deliverables:** audit arsitektur, inventaris aset, screenshot baseline, build log, daftar risiko dan path file yang akan diedit.  
**Gate:** world asli berjalan lokal, mobil bisa dikendarai, dan basis asset path dikenali. Jika gagal, jangan membuat mini-world.

### M1 — Dokumen final akademik

**Kerjakan:** validasi paper ACO DBpia, fulltext GWO_C/M, menentukan baseline vs improved, unit rumus scheduling, dataset, acceptance dan narasi presentasi.  
**Deliverables:** `ALGORITHM_SPEC.md` direview, citation metadata valid, cost units, test cases evaluator.  
**Gate:** tidak ada klaim paper yang belum terverifikasi.

### M2 — Shared game extension

**Kerjakan:** prototipe `ZoneManager`, `InteractiveStation`, `CarTransitionController`, `PresentationController`. Pelajari API existing `Zones/InteractivePoints`; integrasikan daripada membuat controller kedua jika dapat dipakai ulang. Tambahkan safety reset dan trigger radius.

**Gate:** transit Main↔single blank-zone lancar, mobil/kamera/reset E/Esc/R bekerja, original gameplay tidak rusak.

### M3 — Cloud Zone visual prototype

**Kerjakan:** reuse original terrain/trees/roads/lighting, tambah podium 3 VM, kotak task, papan; tampilkan baseline round robin dengan animasi berbasis data.

**Gate:** user menyetir ke Cloud Zone dan merasakan world yang sama; visual A/B review lulus; tidak ada floating mesh/physics bug.

### M4 — Scheduling algorithm engine

**Kerjakan:** model, evaluator, seeded RNG, unit tests, baseline, ACO, GWO, event trace. Tidak ada dependensi Three.js di engine. Buat UI HTML sederhana untuk debug algos terlebih dahulu.

**Gate:** semua unit test lulus, run menghasilkan assignment dan metrik valid, seed reproduktif, chart vs tabel konsisten.

### M5 — ACO dan GWO environments

**Kerjakan:** buat asset custom mengikuti style audit (sarang semut + wolf pack), hubungkan event trace dari engine ke anima. Reuse station UI dan transition controller. Jangan masukkan ratusan objek tanpa profiling.

**Gate:** semua state interaksi bekerja dan animation-step bisa dirunut ke event log nyata.

### M6 — Results, paper & Presentation Mode

**Kerjakan:** graph convergence, assignment comparison, paper citations, acknowledgment; Next/Prev section/teleport, proyektor-friendly UI, demo script 8–12 menit (dapat disesuaikan). Dua mode Explore & Presentation.

**Gate:** semua materi disampaikan tanpa mengemudi dan tanpa server; bisa diuji oleh orang baru.

### M7 — Production quality / deployment

**Kerjakan:** `npm run build`, `npm run preview`, Vite base path, asset-path check, GitHub Actions Pages, FPS/load benchmark, browser matrix, attribution, fallback quality, backup demo recording.

**Gate:** produksi benar-benar terbuka via GitHub Pages, GLB/KTX/audio/JS tidak 404, video dan checklist demo lolos.

## 3. Arsitektur yang diusulkan (adaptif setelah audit)

```
[Existing Bruno Renderer / World / Vehicle / Physics]
             |                         |
    [Zone & Interact Adapters]     [Presentation UI]
             |
    [Learning Stations / Mini Worlds]
             |
   [Visualization Event Adapters]
             |
    [Scheduling Engine - pure JS]
        |                 |
       ACO               GWO
             |
       [Metrics & History]
```

Semua *UI graph* harus membaca satu hasil run dari engine yang sama dengan animator. Jangan hitung fitness dua kali dengan implementasi yang berbeda.

## 4. GitHub Pages

**Kemungkinan:** Vite menghasilkan folder `dist`; GitHub Pages bisa melayani static content. Main website Bruno menyebut server source tidak dipublikasikan tetapi portfolio dapat bekerja tanpa server; pastikan fitur yang dibutuhkan game tidak bergantung server.

Langkah deploy (setelah audit):
1. Buat repository milik tim berisi *adapted project*, pertahankan lisensi/atribusi.
2. Untuk repo `https://username.github.io/REPO/`, set `base: '/REPO/'` di `vite.config.js`; untuk user root site pakai `/`.
3. Audit `fetch('/asset...')`/hardcoded absolute URLs karena dapat gagal di subpath. Gunakan `import.meta.env.BASE_URL` atau bundler asset URL sesuai pola repo.
4. Gunakan GitHub Actions workflow: checkout → Node setup → install → build → configure Pages → upload `dist` → deploy. Gunakan versi action yang berlaku dan tes, jangan mengunci ke versi kuno tanpa verifikasi.
5. Test URL final via desktop browser, Console/Network tab dan *production preview*.
6. Test reload, asset GLB, WASM/Rapier loading, shader/browser support, base path dan mode fallback.

Sumber: https://vite.dev/guide/static-deploy dan https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages

## 5. Kualitas dan testing

### Test matrix

| Kelompok uji | Yang diuji |
|---|---|
| Pure algorithm unit | assignment feasible, makespan, costs, utilization proxy, seed, convergence |
| Interaction integration | E context, Esc, panel open/close, reset physics |
| World regression | kendaraan, camera follow, shadows/lighting, original props |
| Visual A/B | screenshot main vs zone, palet, props/scale, common materials |
| Browser perf | FPS, first-load time, frame spikes, memory, GC, asset count |
| Production smoke | GitHub Pages path, asset 404, scene load, import paths, navigation |
| Presentation rehearsal | semua section, chart, paper, backup navigation |

### Performance objective (bukan janji)

Target rencana: pengalaman nyaman pada laptop desktop kelas mahasiswa. Benchmark *real* menentukan keputusan seperti LOD/instancing/quality. Jangan mengklaim 60 FPS stabil tanpa uji pada perangkat aktual. Jika frame drop, kurangi dekorasi dulu sebelum mengurangi kualitas animasi ilmiah.

## 6. Risiko dan prioritas

- **P0:** build source asli gagal → selesaikan dulu; jangan membangun di atas fondasi rusak.
- **P0:** konten paper tidak sesuai implementasi → label baseline, ganti metode atau baca full text.
- **P0:** algo tidak benar → engine test + known-case evaluation sebelum 3D.
- **P1:** visual mini-world melenceng → reusable materials/props + A/B render.
- **P1:** teleporter mengacaukan physics → state-machine, reset velocities & safe respawn.
- **P1:** GitHub Pages static → cek `base` dan server-only functionality.
- **P2:** tambahan estetika/sound → tunda sampai demo inti teruji.

## 7. Strategi hemat token/model

- Jalankan audit repositori **sekali**; simpan path, arsitektur, screenshot, dan temuan di `.md`.
- Per milestone hanya baca dokumen global dan file terkait; hindari menyertakan seluruh proyek di setiap prompt.
- Model reasoning mahal untuk audit/masalah kompleks dan review kritis; model yang lebih hemat untuk pekerjaan rutin sesuai akses tersedia.
- Gunakan commit terpisah per fitur; kirim ke reviewer hanya diff, hasil test, serta screenshot.
- Output agent singkat: **files changed, tests run, verified, blockers, next task**.
- Jangan menghemat konteks sampai melewatkan dependency yang memang diperlukan.

## 8. Rencana fallback jika deadline mepet

Urutan pengurangan lingkup:
1. Hilangkan cinematic tambahan dan objek dekorasi ekstra.
2. Jadikan zona ACO/GWO instalasi pada Main World tanpa teleport scene berat.
3. Simpan 3D sebagai navigasi + gunakan visualisasi 2D interaktif di dalam zona untuk penjelasan tiap iterasi.
4. Jangan hilangkan paper, cara kerja step-by-step, studi kasus, dan hasil algoritma, karena ini inti instruksi dosen.

**Definition of Ready untuk mulai coding:** M0 audit beres, file algorithm spec disetujui, input dataset dipilih, lisensi terbaca, dan demonstrasi gameplay disepakati.