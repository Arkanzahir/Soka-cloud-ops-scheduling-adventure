# Paper Review — SOKA Cloud Ops

**Status: ringkasan referensi dan keputusan awal, bukan reproduksi metode.** Catatan ini digunakan bersama `ALGORITHM_SPEC.md`.

## 1. Persyaratan paper

Demo Week 10 meminta dua metaheuristik, sumber penelitian, cara kerja, studi kasus task → algoritma → solusi, metrik, HTML interaktif, dan visualisasi melalui kode. Di bagian Research Station, jelaskan **judul, tahun, masalah, metode, metrik, dan hubungan dengan implementasi kelompok**, bukan hanya tautannya.

## 2. GWO — paper kelompok (terverifikasi)

- **Wang, H., Zhang, J., Fan, J., Zhang, C., Deng, B., & Zhao, W. (2025)** — *An improved grey wolf optimizer with flexible crossover and mutation for cluster task scheduling*. *Information Sciences*, 704, 121943. Daftar penulis diverifikasi melalui metadata registrasi DOI Crossref pada 5 November 2026; full-text publisher tetap memiliki keterbatasan akses.
- DOI: https://doi.org/10.1016/j.ins.2025.121943
- Publisher: https://www.sciencedirect.com/science/article/pii/S0020025525000751

Paper ini mengusulkan **GWO_C/M**, yaitu pendekatan GWO yang diperbaiki dengan crossover dan mutation. Ini **bukan** GWO standar. Bila kode kita hanya menjalankan representasi GWO dasar dan memetakan posisi kontinu menjadi pilihan VM, sebut secara jelas **educational baseline GWO**. Jangan mengklaim hasil game mereplikasi hasil paper.

## 3. ACO — tautan asli kelompok (perlu verifikasi)

- DBpia: https://www.dbpia.co.kr/journal/articleDetail?nodeId=NODE11826229
- **Belum dapat dipastikan** judul, penulis, tahun, persamaan, relevansi CTS, dan detail full-text dari halaman yang dikirim. Metadata yang tidak diketahui tidak boleh diisi dengan tebakan.
- Tindak lanjut: anggota kelompok yang punya akses mengirim PDF atau minimal halaman pertama dan metode sehingga bisa diverifikasi.

## 4. ACO — referensi alternatif yang dapat diverifikasi

- **Hongtao Wang (2024)** — *Research on Task Scheduling Model of Ant Colony Optimization Cloud Computing Platform for Online Practical Customer-training Application*.
- *IEIE Transactions on Smart Processing & Computing*, 13(3), 243–253.
- DOI: https://doi.org/10.5573/IEIESPC.2024.13.3.243
- Artikel: https://ieiespc.org/ieiespc/XmlViewer/f430268

Paper ini meneliti **OACC**, pengembangan ACO untuk task scheduling di cloud. Artikel memberikan konteks penelitian yang relevan; tetapi simulator **baseline ACO** yang dirancang di `ALGORITHM_SPEC.md` bukan otomatis implementasi OACC. Jika membutuhkan replikasi OACC, baca seluruh prosedur dan implementasikan rumus yang sesuai.

## 5. Referensi GWO dasar

- Mirjalili, S., Mirjalili, S. M., Lewis, A. (2014). *Grey Wolf Optimizer*. *Advances in Engineering Software*, 69, 46–61.
- DOI: https://doi.org/10.1016/j.advengsoft.2013.12.007

Digunakan untuk menjelaskan konsep GWO standar. Paper 2025 digunakan untuk topik pengembangan algoritma dan penerapannya pada task scheduling.

## 6. Hubungan studi kasus dan paper

| Komponen | Dilakukan game | Batasan klaim |
|---|---|---|
| Task scheduling | Task MI, VM MIPS, assignment diskret | Model edukatif, bukan CloudSim penuh |
| ACO | Feromon, probabilitas, evaporasi, update, best solution | ACO baseline, bukan OACC persis |
| GWO | Populasi, alpha/beta/delta, update vektor, discretization | GWO baseline, bukan GWO_C/M |
| Metrics | Makespan utama; cost dan utilization proxy sekunder | Tidak otomatis multiobjective |
| Eksperimen | Seed tetap, dataset sama, trace per iterasi | Bukan hasil eksperimen paper |

## 7. Tindakan wajib sebelum final demo

- [ ] Validasi full-text paper ACO kelompok (DBpia) atau sepakati menggunakan paper alternatif terverifikasi.
- [ ] Tetapkan apakah dosen meminta mereplikasi algoritma *improved* paper secara tepat atau cukup menjelaskan paper dan mengimplementasikan baseline.
- [x] Grafik berasal dari engine dan label menyatakan baseline edukatif; verified M4/M5/M6 dan regresi integrasi.
- [x] Evaluator/seed diuji; tiga DOI tersedia pada bagian Paper M6. Bukti pengujian final ada pada FINAL_RELEASE.md.
