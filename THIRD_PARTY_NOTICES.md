# Third-party Sources & Attribution — Cloud Ops

**Status:** catatan sumber saat tahap dokumentasi. Belum ada kode atau aset pihak ketiga yang dimasukkan ke repository target pada saat penyusunan. Isi akan diperbarui setelah import dan audit file nyata.

## 1. Game 3D dasar

- **Proyek:** Bruno Simon — Folio 2025
- **Sumber:** https://github.com/brunosimon/folio-2025
- **Website:** https://bruno-simon.com/
- **Lisensi yang tercantum pada repository sumber:** MIT
- **Dokumen lisensi:** https://github.com/brunosimon/folio-2025/blob/main/license.md
- **Penggunaan yang direncanakan:** adaptasi sistem world, mobil, kamera, rendering, fisika, props, dan pipeline aset sebagai fondasi presentasi edukasi.

Saat menyalin sumber ke repo ini, **pertahankan** semua pemberitahuan copyright dan file MIT dari proyek asal; jangan menghapus catatan pembuat. Periksa item yang memiliki ketentuan tersendiri sebelum redistribusi. Jangan menyatakan seluruh proyek adalah kode original kelompok.

## 2. Musik, audio, font, dan model pihak ketiga

Website sumber menjelaskan musik dibuat oleh Kounine dan dirilis sebagai CC0. Namun **jangan berasumsi semua musik, font, model, gambar, dan texture lain berlisensi sama**. Lakukan audit per aset dan catat:

| Field | Contoh nilai yang harus diisi |
|---|---|
| File path | `static/models/custom-wolf.glb` |
| Source URL | Situs asal yang tepat |
| Creator | Nama author sesuai sumber |
| License | MIT / CC BY / CC0 / lisensi lain |
| Attribution | Keterangan yang diwajibkan |
| Redistribution permitted? | Yes/No/Needs Review |
| Modified by group? | Ya/tidak serta deskripsi modifikasi |

Jangan gunakan model dari hasil pencarian internet bila lisensinya belum jelas. Menggunakan merek/nama Bruno dalam kredit **tidak berarti** Bruno mendukung proyek kelompok ini.

## 3. Paper ilmiah

Paper digunakan sebagai **referensi ilmiah**, bukan sebagai sumber kode game. Kutip bibliografinya dan tautkan sumber resmi. Untuk gambar/diagram dari paper, periksa lisensi reproduksi; lebih baik menggambar ulang *visualisasi original berbasis data dan kode* sembari menyitir konsepnya.

## 4. Kontribusi kelompok

Catat secara faktual tugas yang dikerjakan oleh setiap anggota melalui commit/PR atau tabel tugas. Integrasi tiga mini-world, simulator CTS, visualisasi ACO/GWO, dokumentasi, dan mode presentasi akan menjadi kontribusi sendiri **hanya setelah benar-benar selesai**.