# M1 Academic Final — Cloud Ops (2026-11-04)

**Status:** spesifikasi akademik MVP final untuk implementasi **baseline ACO + baseline GWO diskret**. Belum berarti engine sudah dikodekan, hasil paper direplikasi, atau pilihan varian disetujui dosen.

## Keputusan dan referensi

- **ACO 2024:** Hongtao Wang, *Research on Task Scheduling Model of Ant Colony Optimization Cloud Computing Platform for Online Practical Customer-training Application*, *IEIE Transactions on Smart Processing & Computing*, 13(3), 243–253. DOI https://doi.org/10.5573/IEIESPC.2024.13.3.243; full text https://ieiespc.org/ieiespc/XmlViewer/f430268. Meneliti **OACC**, bukan ACO baseline persis.
- **GWO 2025:** Hongbo Wang, Jinyu Zhang, Jingkun Fan, Chiyiduo Zhang, Bo Deng, Wentao Zhao, *An improved grey wolf optimizer with flexible crossover and mutation for cluster task scheduling*, *Information Sciences*, 704, 121943. DOI https://doi.org/10.1016/j.ins.2025.121943. Meneliti **GWO_C/M**, bukan baseline.
- **Konsep GWO dasar:** Seyedali Mirjalili, Seyed Mohammad Mirjalili, Andrew Lewis, *Grey Wolf Optimizer*, *Advances in Engineering Software*, 69, 46–61 (2014), https://doi.org/10.1016/j.advengsoft.2013.12.007.
- **DBpia semula:** https://www.dbpia.co.kr/journal/articleDetail?nodeId=NODE11826229 belum dapat diverifikasi. Untuk MVP gunakan paper ACO 2024 yang sudah terverifikasi; jangan mengarang data paper DBpia.
- Pernyataan demo: **“Implementasi edukatif ini menggunakan baseline ACO dan GWO untuk alokasi task→VM, sedangkan paper improved menjadi referensi ilmiah, bukan hasil yang kami replikasi identik.”**

## Dataset dan evaluator

Task length MI: `[1200,2400,1800,3200,2100,1500,2700,3600]`.
VM speed MIPS: `[600,1000,1500]`.
VM cost per second (unit simulasi): `[0.0010,0.0015,0.0025]`.

Asumsi: 8 task independen, satu task pada satu VM, tugas di tiap VM berurutan, tiga VM paralel; abaikan transfer, network, dependency, startup dan billing minimum. **Objective tunggal: minimum makespan**, sedangkan cost dan utilization adalah metrik keluaran.

- `ET[i,j] = taskLengthMI[i] / vmMips[j]`
- `load[j] = sum(ET[i,j] untuk assignment[i] == j)`
- `makespan = max(load)` (detik)
- `cost = sum(load[j] * costPerSecond[j])` (unit simulasi, bukan harga cloud nyata)
- `utilizationProxy[j] = load[j] / makespan`; `meanUtilizationProxy = sum(utilizationProxy) / vmCount`. Ini proxy waktu sibuk, **bukan CPU utilization aktual**.

## Test oracle yang dihitung untuk M4

**Round Robin**, assignment VM indeks 0-based `[0,1,2,0,1,2,0,1]`:
- VM1 menjalankan T1,T4,T7: `7100/600 = 11.833333333` detik.
- VM2 menjalankan T2,T5,T8: `8100/1000 = 8.1` detik.
- VM3 menjalankan T3,T6: `3300/1500 = 2.2` detik.
- **Makespan = 11.833333333 s**; **cost = 0.029483333** unit simulasi.
- **Utilization proxy = [1, 0.684507042, 0.185915493]**, rerata **0.623474178**.

**Optimum pada dataset 8×3** dengan enumerasi menyeluruh **3^8 = 6.561 assignment**: minimum **makespan 6.0 detik**, terdapat **9 assignment optimal**. Contoh assignment 0-based `[2,2,1,2,2,1,1,0]`:
- VM1: T8 → `6.0 s`; VM2: T3,T6,T7 → `6.0 s`; VM3: T1,T2,T4,T5 → `5.933333333 s`.
- Cost contoh optimum ini `0.029833333` unit; mean utilization proxy `0.996296296`.
- Lower bound kapasitas: `18500/(600+1000+1500)=5.967741935 s`. Optimum **6 s** terbukti dari pemeriksaan kombinasi, bukan membulatkan lower bound.
- **Trade-off:** cost contoh optimum > cost Round Robin. Jangan klaim makespan lebih baik otomatis cost lebih baik.
- Enumerasi hanya **oracle pengujian**, bukan cara tersembunyi menyelesaikan ACO/GWO; metaheuristik tidak dijamin selalu mencapai 6 s.

## Kontrak implementasi M4

- Evaluator dan RNG seeded terpisah dari Three.js; semua baseline, ACO, GWO, tabel dan grafik memakai evaluator yang sama.
- ACO: `tau[task][VM]`, probabilitas pilihan VM berdasar pheromone×heuristic, assignment lengkap per semut, evaporasi/deposit, trace `probabilities, selectedVM, pheromoneSnapshot, bestFitness`.
- GWO: satu wolf = satu vektor **assignment lengkap** dalam ruang kontinu lalu di-decode ke indeks VM; identifikasi alpha/beta/delta, update posisi GWO dasar, trace assignment/leader/fitness. Jangan menyebut crossover/mutation jika belum diterapkan.
- Parameter demo awal (bisa disesuaikan, bukan hasil paper): seed 42; ACO 12 semut × 50 iterasi, alpha 1, beta 2, rho 0.2, Q 1; GWO 12 wolf × 50 iterasi.
- Tes: known oracle di atas (toleransi angka floating-point), satu task 1200 MI di VM 600 MIPS → 2 s dan cost 0.002 jika rate 0.001/s; input invalid ditolak; assignment feasible; zero NaN/Infinity; reproducible seed; best-so-far nonincreasing; event/UI/3D konsisten.
- Jika membandingkan keunggulan, gunakan beberapa seed (misal 42, 73, 101, 202, 303), laporkan rata-rata/variasi dan budget komputasi, jangan satu run saja.

## Handoff dan batasan

- **M1 final untuk baseline edukatif**, siap sebagai acuan M4; M0/M2 sudah selesai di branch pengembangan lain.
- **Belum selesai dan bukan bagian M1:** coding algoritma, animasi semut/serigala berbasis trace, world, hasil eksperimen nyata, persetujuan dosen atas pilihan baseline atau kewajiban improved paper.
- Konfirmasi dari dosen diperlukan **jika** tugas mewajibkan replikasi persis OACC/GWO_C/M atau paper DBpia asli. Sampai ada instruksi demikian, jangan membuat klaim lebih dari baseline.
