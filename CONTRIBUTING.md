# Panduan Kontribusi Kelompok — Cloud Ops

Dokumen ini menjelaskan cara seluruh anggota mengerjakan proyek tanpa merusak sistem world, algoritma, dan presentasi yang sedang dikembangkan.

## Sebelum mulai

1. Baca `README.md`, `docs/PRD.md`, `docs/GDD.md`, serta dokumen yang relevan dengan tugasmu.
2. Pahami bahwa **basis 3D adalah proyek open-source yang diadaptasi**, sedangkan komponen akademik dan dunia pembelajaran dikerjakan kelompok. Selalu berikan kredit dan patuhi lisensi.
3. Ambil satu task yang jelas (misalnya Cloud Zone signage, evaluator makespan, atau panel GWO), bukan mengubah banyak subsistem sekaligus.
4. Jika membutuhkan aset eksternal, catat URL, author, lisensi, tanggal akses, dan lokasi file dalam asset catalog.

## Branch dan pull request

- `main`: hanya untuk dokumen atau fitur stabil dan telah direview.
- `feature/cloud-world`, `feature/aco-engine`, `feature/gwo-engine`, `feature/presentation-mode`: contoh nama branch yang dapat digunakan.
- Pull request harus menyebut **tujuan, file diubah, alasan, test yang dijalankan, screenshot untuk perubahan visual, risiko, dan cara mengecek hasil**.
- Minimal satu orang lain membaca perubahan penting sebelum merge jika memungkinkan.
- Jangan memaksa merge ketika build gagal atau simulator menghasilkan output invalid.

## Standar kode

- Beradaptasi dengan struktur `sources/`, `static/` dan konvensi repo original setelah audit.
- Pisahkan perhitungan ACO/GWO dari Three.js dan input UI. Kode akademik harus dapat dites tanpa membuka game.
- Gunakan seeded RNG agar perbandingan algoritma dapat direproduksi.
- Jangan masukkan password/API key/secrets ke repository atau HTML frontend.
- Jangan menghapus fungsi kendaraan, physics, rendering, atau lighting original tanpa bukti pengujian.
- Animasi semut/serigala harus membaca trace dari engine; angka grafik dan tabel harus berasal dari hasil run yang sama.

## Standar aset dan desain

1. Audit lalu gunakan kembali aset resmi bila lisensinya mengizinkan.
2. Bila aset tidak ada, kitbash komponen original untuk menjaga konsistensi.
3. Model custom di Blender perlu memakai skala, material/palette, proporsi, texel density dan render pipeline yang disepakati.
4. Sertakan minimal satu screenshot perbandingan Main World dan mini-world dalam pencahayaan yang setara.
5. Hindari objek low-poly generik dengan style berbeda atau efek neon berlebihan.
6. Batasi polygon, texture, collider, draw calls; profiling sebelum mengklaim performa stabil.

## Standar akademik

- Setiap metode didokumentasikan dengan rumus, objektif, asumsi, parameter, dan sumber.
- Paper GWO_C/M tidak sama dengan GWO standar. Paper ACO OACC juga tidak sama dengan ACO baseline.
- Tulis `baseline` bila memang baseline; jangan mengklaim mengimplementasikan metode paper secara identik.
- Untuk makespan, lakukan uji evaluator pada kasus manual; untuk ACO/GWO lakukan uji deterministik dan validitas assignment.
- Perbandingan harus memakai input dan anggaran evaluasi yang sebanding; jangan mengklaim satu algoritma unggul dari satu seed.

## Checklist sebelum menandai task selesai

- [ ] Perubahan sesuai PRD/GDD dan tidak menambah scope yang tidak perlu.
- [ ] File yang relevan punya dokumentasi singkat.
- [ ] Lulus tes yang sesuai dan tidak ada error kritis di console.
- [ ] Tidak ada nilai output algoritma yang di-hardcode untuk terlihat bagus.
- [ ] Lisensi/kredit aset eksternal dicatat.
- [ ] Screenshots/rekaman dan hasil test disertakan bila visual/gameplay berubah.
- [ ] Ketika fitur belum bisa dijalankan, status tetap `Planned`/`In Progress`.

## Jika muncul konflik

- Masalah **matematis** → rujuk `docs/ALGORITHM_SPEC.md`, verifikasi rumus dan evaluator.
- Masalah **design world** → rujuk `docs/WORLD_DESIGN_SPEC.md` dan baseline screenshot.
- Masalah **scope** → rujuk `docs/PRD.md` dan diskusikan perubahan kecil sebelum implementasi.
- Masalah **license** → hentikan distribusi aset terkait sampai izin jelas.
- Masalah **deadline** → sederhanakan dekorasi/portal dulu, jangan mengorbankan presentasi HTML, paper, visualisasi kode, dan hasil CTS.