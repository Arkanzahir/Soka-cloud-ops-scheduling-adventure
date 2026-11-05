# Third-party Sources & Attribution — Cloud Ops

**Status M0:** fondasi Bruno diimpor dari commit `41046b57eeed8d156d9c3fd7fa259900baef7816`. Lisensi MIT asli berada di [`license.md`](license.md); source, aset runtime dan sumber Blender dipertahankan. Inventaris file/hash dan pengecualian izin: [`docs/ASSET_CATALOG.md`](docs/ASSET_CATALOG.md). Kredit dalam game dan README upstream tetap disimpan. Kandidat rilis tersedia pada branch release; belum ada deployment. Visibility GitHub terverifikasi 5 November 2026: Public; sesi rebranding tidak mengubah visibility.

## 1. Game 3D dasar

- **Proyek:** Bruno Simon — Folio 2025
- **Sumber:** https://github.com/brunosimon/folio-2025
- **Website:** https://bruno-simon.com/
- **Lisensi yang tercantum pada repository sumber:** MIT
- **Dokumen lisensi:** https://github.com/brunosimon/folio-2025/blob/main/license.md
- **Penggunaan M0:** integrasi sistem world, mobil, kamera, rendering, fisika, props, dan pipeline aset sebagai fondasi presentasi edukasi.

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

Catat secara faktual tugas yang dikerjakan oleh setiap anggota melalui commit/PR atau tabel tugas. Kontribusi Kelompok 8 yang sudah diimplementasikan: integrasi world Cloud/ACO/GWO, simulator scheduling baseline, visualisasi trace, dokumentasi, mode presentasi, optimasi, dan rebranding kampus. Fondasi Bruno tetap dikreditkan terpisah.

## 5. Aset untuk paket Pages

- Font Pally dari checkpoint lama dikeluarkan. Penggantinya adalah Nunito dan Amatic SC dari [Google Fonts](https://github.com/google/fonts/tree/bbda7253fc363238b05d97515ca71f8ae49c4fa9/ofl). Copyright dan teks SIL OFL masing-masing ada di `static/fonts/Nunito-OFL.txt` dan `static/fonts/AmaticSC-OFL.txt`.
- Semua rekaman efek nonmusik lama dikeluarkan. Delapan WAV dibuat dari osilator dan noise oleh `scripts/generate-release-sfx.mjs`. Efek asli Cloud Ops ini tersedia di bawah lisensi MIT proyek. Musik Kounine tetap CC0 dengan lisensi di folder musik.
- Gambar galeri lama di `static/projects/images`, `static/lab/images`, `static/career` dan gambar layar Time Machine lama di `static/timeMachine/` serta gambar berbagi portofolio di `static/social/share-image.png` dikeluarkan. Kedua GLB area mengeluarkan mesh merek sosial yang sudah dinonaktifkan dan memakai artwork teks original pada papan sirkuit. Model world milik Folio 2025 tetap dikreditkan kepada Bruno Simon.
- [Draco](https://github.com/google/draco/blob/main/LICENSE) dan [Basis Universal](https://github.com/BinomialLLC/basis_universal/blob/master/LICENSE) menyertakan teks Apache 2.0 pada direktori masing-masing. Pemberitahuan lisensi MIT upstream tetap ada di game dan di paket Pages.

Rincian izin dan uji paket: [DEPLOYMENT_READINESS.md](docs/DEPLOYMENT_READINESS.md).
