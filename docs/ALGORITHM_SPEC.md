# ALGORITHM SPEC — Cloud Task Scheduling (ACO & GWO)

**Status:** desain algoritma ajar (baseline), **bukan** klaim reproduksi eksak salah satu paper. Validasi full-text paper dan konfirmasi metode masih diperlukan sebelum laporan final.

## 1. Tujuan akademik

Demonstrasikan solusi untuk *independent non-preemptive task scheduling* pada `m` virtual machine heterogen. Tiap task ditugaskan ke tepat satu VM. Bandingkan hasil ACO dan GWO dengan data yang sama dan sajikan trace per iterasi, bukan animasi acak.

**Batasan model:** tidak mensimulasikan jaringan, VM startup, dependency antar-task, migrasi, deadline, data transfer, energy, multitenancy, ataupun overhead CloudSim. Tuliskan jelas bahwa ini model sederhana berbasis MI/MIPS, bukan simulasi cloud nyata penuh.

## 2. Referensi paper dan status sumber

### Paper pilihan kelompok

**GWO:** Hongbo Wang, Jinyu Zhang, Jingkun Fan, ChiYiDuo Zhang, Bo Deng, WenTao Zhao (2025), *An improved grey wolf optimizer with flexible crossover and mutation for cluster task scheduling*, *Information Sciences*, vol. 704, 121943. DOI: https://doi.org/10.1016/j.ins.2025.121943

- Relevan dengan task scheduling; membahas **GWO_C/M** (crossover dan mutation), dibandingkan dengan model lain dan diuji dengan CloudSim/Alibaba trace.
- **Jangan menyebut baseline GWO sebagai implementasi GWO_C/M.** Bila ingin mereplikasi varian tersebut, wajib membaca persamaan dan prosedur lengkap paper lalu membuat modul tambahan dengan pengujian.

**ACO dari screenshot kelompok:** https://www.dbpia.co.kr/journal/articleDetail?nodeId=NODE11826229

- Link tercatat dari pengguna tetapi **judul, penulis, tahun, full-text, dan relevansi CTS belum berhasil diverifikasi** karena akses halaman gagal pada pengecekan ini.
- **Hentikan klaim** yang mengasumsikan paper tersebut tentang CTS sampai paper dapat dibuka. Jangan mengarang metadata atau algoritma.

### Alternatif ACO yang sudah ditemukan dan relevan

1. Hongtao Wang (2024), *Research on Task Scheduling Model of Ant Colony Optimization Cloud Computing Platform for Online Practical Customer-training Application*, *IEIE Transactions on Smart Processing & Computing*, 13(3), 243–253. DOI: https://doi.org/10.5573/IEIESPC.2024.13.3.243. Fokus pada ACO untuk task scheduling cloud; varian optimized ACO, bukan otomatis baseline standar.
2. *Research on cloud computing adaptive task scheduling based on ant colony algorithm* (2022), *Optik*, 258, 168677. DOI: https://doi.org/10.1016/j.ijleo.2022.168677. Fokus pada pembaruan feromon adaptif serta tujuan waktu, biaya, dan keseimbangan beban. **Perlu pemeriksaan full-text untuk detail implementasi.**

### Referensi prinsip dasar

Seyedali Mirjalili, Seyed Mohammad Mirjalili, Andrew Lewis (2014), *Grey Wolf Optimizer*, *Advances in Engineering Software*, 69, 46–61. DOI: https://doi.org/10.1016/j.advengsoft.2013.12.007. Dipakai untuk menguraikan GWO standar; tidak menggantikan paper terbaru pilihan kelompok.

### Keputusan implementasi yang perlu disetujui tim

**MVP:** ACO diskret dan GWO standar yang didiskretisasi untuk CTS. Paper ilmiah memberi konteks, bukti penelitian, dan opsi pengembangan. Tampilkan label: `Our educational implementation: baseline ACO / baseline GWO; not exact reproduction of improved paper variants`.

**Opsional pengayaan:** implementasi GWO_C/M dan ACO improved sesuai paper terpilih, tetapi hanya setelah memperoleh full-text, membuat spesifikasi formula, dan menguji kesesuaiannya.

## 3. Model input / output

### Struktur data

```ts
type Task = { id: string; lengthMI: number };
type VM = { id: string; mips: number; costPerSecond: number };
type SchedulingProblem = { tasks: Task[]; vms: VM[] };
type Assignment = number[]; // assignment[i] = VM index untuk task i
```

Validasi: panjang task > 0; VM speed > 0; biaya >= 0; minimal satu task dan satu VM; indeks assignment integer `0..m-1`. Tidak boleh ada task hilang, duplikat, atau VM negatif.

### Dataset awal **contoh**, bukan data dari paper

| Task | Length (MI) |
|---|---:|
| T1 | 1200 |
| T2 | 2400 |
| T3 | 1800 |
| T4 | 3200 |
| T5 | 2100 |
| T6 | 1500 |
| T7 | 2700 |
| T8 | 3600 |

| VM | Speed (MIPS) | Cost per second (unit simulasi) |
|---|---:|---:|
| VM1 | 600 | 0.0010 |
| VM2 | 1000 | 0.0015 |
| VM3 | 1500 | 0.0025 |

Harga tersebut adalah angka simulasi hipotetis, **bukan harga layanan cloud sungguhan**.

### Rumus

- Waktu task i di VM j: `ET[i,j] = lengthMI[i] / mips[j]` (detik).
- Beban VM j: `load[j] = Σ_{i: assignment[i]=j} ET[i,j]` (detik).
- **Makespan:** `max(load[j])` (detik), asumsi VM menjalankan task yang dialokasikan secara sekuensial dan beberapa VM berjalan paralel.
- **Total compute cost:** `Σ_j load[j] * costPerSecond[j]` (unit biaya simulasi). Untuk model billing cloud nyata, tambahkan billing granularity dan overhead sebagai fitur terpisah.
- **Utilization proxy VM j:** `load[j] / makespan` jika makespan > 0, bernilai 0–1.
- **Mean utilization proxy:** `Σ_j load[j] / (m * makespan)`; istilah *proxy* wajib dicantumkan karena bukan pengukuran CPU sebenarnya.
- Makespan **minimization** adalah objektif dasar eksperimen. `cost` dan `utilization` adalah metrik keluaran sekunder dan tidak boleh diklaim otomatis dioptimalkan.

Jika nanti memakai multi-objective, definisikan terpisah scalarization/pareto, normalisasi, bobot, dan konsekuensinya. Jangan mengubah fungsi objektif diam-diam di antara ACO dan GWO.

### Baseline pembanding

Round-robin `assignment[i] = i % m` dan opsi Min-Min heuristic. Baseline harus disimpan sebagai output numerik yang dapat diverifikasi, bukan angka hard-coded. Contoh round-robin dataset awal memiliki beban VM sekitar `[11.8333, 8.1, 2.2]` detik, makespan `11.8333` detik; hitung ulang dari fungsi evaluator saat testing.

## 4. Arsitektur engine (harus independen dari Three.js)

```
app/scheduling/
  model.ts       // input, validation, evaluation
  rng.ts         // seeded deterministic pseudo-random generator
  baseline.ts    // round robin, min-min optional
  aco.ts         // ACO search
  gwo.ts         // GWO search
  traces.ts      // event schema / iteration log
  tests/*.test.ts
app/visualization/
  acoAdapter.ts  // data -> ants/path highlights
  gwoAdapter.ts  // data -> wolf/leader status
  cloudAdapter.ts
  charts.ts
```

`runACO(problem, config)` dan `runGWO(problem, config)` mengembalikan `bestAssignment`, `metrics`, `history`, `events`, `seed`, `config`, `runtimeMs` (runtimeMs bukan bagian dari fitness). Renderer membaca trace, tidak menghitung ulang hasil ilmiah.

## 5. ACO diskret — algoritma baseline

**Representasi:** setiap ant membuat satu assignment lengkap, memilih VM untuk setiap task. Pheromone `tau[i][j]` menyatakan preferensi task i ditempatkan pada VM j. Heuristic `eta` memperkirakan beban jika task i ditambahkan ke VM j, misalnya `eta = 1/(epsilon + currentLoad[j] + ET[i,j])`.

Untuk task i, kemungkinan memilih VM j:

`P(i,j) = tau[i][j]^alpha * eta[i][j]^beta / Σ_k (tau[i][k]^alpha * eta[i][k]^beta)`.

Tahapan:
1. Validasi input, tetapkan seed, populasi semut, iterasi, alpha, beta, rho, Q.
2. Inisialisasi tau positif seragam.
3. Untuk tiap iterasi dan ant, bentuk jadwal satu task demi satu task dengan *roulette-wheel sampling* berdasar probabilitas, perbarui current VM load.
4. Hitung makespan dengan evaluator bersama; simpan best iteration dan global best.
5. Evaporasi: `tau = max(tauMin, (1-rho)*tau)`.
6. Deposit pada assignment solusi terpilih: contoh `tau[i][assignment[i]] += Q / (epsilon + makespan)`. Definisikan jelas apakah dari semua semut atau elite/best-only; pilih satu aturan konsisten (MVP: iteration-best + global-best dengan bobot terdokumentasi).
7. Clamp tau ke `[tauMin, tauMax]`, simpan event trace; ulangi.
8. Keluarkan best assignment, metrik, history.

**Wajib log event:** `iteration`, `ant`, `task`, `candidateVMs`, `probabilities`, `selectedVM`, `partialAssignment`, `loadByVM`, `bestFitness`, `pheromoneSnapshot` (sampling snapshot jika ukuran data besar).

**Visualisasi valid:** semut mengikuti pilihan VM per task, ketebalan jalur mengikuti tau yang benar. Tidak menyatakan jarak fisik semut = makespan.

## 6. GWO standar → diskret scheduling

**Representasi:** satu wolf adalah vektor posisi riil `X` berdimensi `nTasks` yang di-decode menjadi assignment integer. Jika jumlah VM = m, batasi komponen posisi ke `[0, m)` lalu decode `floor(X[i])` dan clamp ke `0..m-1`. Kode harus punya batas atas yang jelas agar `floor(m)` tidak invalid.

Tahap tiap iterasi:
1. Inisialisasi populasi posisi dengan seeded RNG, decode dan evaluasi semua wolf.
2. Identifikasi alpha/beta/delta sebagai tiga kandidat terbaik (minimum populasi 4 disarankan).
3. `a` turun dari 2 ke 0 selama iterasi. Untuk tiap posisi dan setiap leader `L`, bentuk `A = 2*a*r1 - a`, `C = 2*r2`, `D = abs(C*L - X)`, `X_L = L - A*D`.
4. Update posisi `X_new = (X_alpha + X_beta + X_delta)/3`, clamp domain.
5. Decode schedule, evaluasi dengan evaluator sama, refresh global best, log trace.
6. Untuk menjaga eksplorasi diskret (banyak posisi decode identik), boleh tambahkan perturbasi/restart ringan **dengan label modifikasi eksplisit**, dibandingkan baseline tanpa modifikasi.
7. Berhenti di batas iterasi; keluarkan best assignment dan history.

**Wajib log:** leader fitness, continuous vectors yang dibutuhkan, decoded assignments, per-VM load, best-so-far.

**Visualisasi valid:** kawanan serigala menggambarkan kandidat/leader yang ditentukan evaluator, bukan jarak geografis server. Posisi dan perubahan skor bisa divisualisasikan melalui UI dan ikon.

**Penting:** implementasi GWO standar ini **bukan** GWO_C/M paper 2025. Jika mengklaim GWO_C/M, wajib menambah crossover/mutation sesuai teks paper dan membuktikan kesesuaiannya.

## 7. Interaksi simulasi yang harus tersedia

- Input: preset dan custom task lengths, VM MIPS, cost, iterations, population/ants, seed.
- `Run`: algoritma dijalankan, event trace bisa dianimasikan.
- `Step`: maju tepat satu event/konstruksi/iterasi; pilih level step jelas pada UI.
- `Pause`, `Resume`, `Speed x0.5/x1/x2`, `Reset`.
- `Compare`: jalankan ACO dan GWO pada problem identik, tampilkan seed/config.
- Grafik best-so-far vs iterasi; tabel assignment task→VM; bar load VM; cost dan utilization proxy.
- Sumber paper dan catatan ketidaksetaraan varian.

## 8. Pengujian wajib

1. **Unit evaluator:** contoh manual round-robin dan known assignment; waktu dan makespan harus tepat.
2. **Feasibility:** semua task tepat sekali, assignment valid, tidak ada NaN/Infinity.
3. **Seed:** menjalankan ulang dengan input dan seed sama menghasilkan output dan history sama (runtimeMs boleh berbeda).
4. **Edge cases:** 1 task/1 VM, semua task besar, MIPS sangat berbeda, invalid input.
5. **Monotonisitas best-so-far:** nilai makespan global terbaik tidak boleh meningkat ketika minimisasi.
6. **Consistency UI:** chart, 3D, tabel memakai trace dari hasil run yang sama.
7. **Repeat experiments:** bila membuat klaim lebih unggul, lakukan >1 seed dan laporkan mean/median/variasi; jangan menyimpulkan superioritas dari satu run acak.
8. **Time budget:** batasi ukuran eksperimen supaya tidak membekukan frame; gunakan worker bila perlu.

## 9. Jangan lakukan

- Mengambil grafik/angka hasil paper lalu mengklaim sebagai hasil program kita.
- Membuat animasi semut/serigala yang tidak berasal dari keputusan engine.
- Menggunakan `Math.random()` tersembunyi sehingga eksperimen tak bisa diulang.
- Mengubah fitness satu algoritma tanpa mengubah atau melaporkan pembanding.
- Mengklaim schedule ini mengoptimalkan cost dan utilization jika hanya makespan yang diminimalkan.

## 10. Yang harus dijelaskan saat demo

- Kenapa task scheduling sulit dan apa tujuan makespan.
- Data input dan asumsi MI/MIPS/biaya simulasi.
- Bagaimana ACO memutuskan task→VM dan memperbarui feromon.
- Bagaimana GWO merepresentasikan kandidat, menentukan alpha-beta-delta, memperbarui vektor, dan melakukan discretization.
- Tabel output yang dihitung, grafik konvergensi, dan batasan eksperimen.
- Paper dan apa hubungan implementation baseline dengan paper varian.