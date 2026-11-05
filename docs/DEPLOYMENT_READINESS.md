# Kesiapan deployment dan fallback demo

Paket Pages mengganti atau mengeluarkan aset yang sebelumnya tertahan. Status penerbitan mengikuti workflow GitHub dan URL yang berhasil diverifikasi.

## Infrastruktur

- GitHub Pages sudah menerbitkan build `117e151` melalui [run 41982238561](https://github.com/Arkanzahir/Soka-cloud-ops-scheduling-adventure/actions/runs/41982238561). Workflow `Verified Pages release` berjalan manual dari `main`. Input `rights_verified` secara bawaan bernilai `false`.
- Vite membangun `sources/` ke `dist/`, menyalin `static/`, dan memakai `base: './'`. Preview diuji pada subpath `/Soka-cloud-ops-scheduling-adventure/`; HTML, GLB/texture/audio, credit download dan Rapier WASM memakai jalur relatif.
- WebGPU memerlukan HTTPS/localhost. Chrome desktop/WebGPU diuji; fallback WebGL dari fondasi renderer belum diterima melalui matriks browser/perangkat proyek. Google Fonts adalah request eksternal; fallback UI lokal diperiksa terpisah dengan request eksternal diblokir.
- `VITE_SERVER_URL` dan `VITE_GAME_PUBLIC` harus kosong pada build publik. Backend tidak dibutuhkan. Flag Game publik hanya dipakai untuk introspeksi tes, lalu dibersihkan pada build normal.

## Aset yang ditangani

| Aset lama | Tindakan paket Pages |
| --- | --- |
| `static/fonts/Pally-*` | Dikeluarkan. Arsip resmi ITF FFL mengizinkan self-hosting dengan batas redistribusi. Nunito dan Amatic SC resmi disertakan bersama lisensi OFL. |
| `static/sounds/` di luar `musics/` | Rekaman lama dikeluarkan karena izin tiap rekaman tidak terverifikasi. WAV sintetis original menggantikan cue. |
| `static/{projects,lab}/images/`, `static/career/`, `static/timeMachine/`, `static/social/share-image.png` | Dikeluarkan karena tidak diperlukan oleh game adaptasi. |
| `static/areas/areas.glb` dan `static/areas/areas-compressed.glb` | Mengeluarkan delapan mesh logo sosial nonaktif, collider terkait dan geometri tak terpakai. Empat bitmap papan sirkuit diganti dengan artwork teks original. |

Model lingkungan dan kode Folio 2025 mengikuti atribusi MIT Bruno Simon. Musik Kounine tetap CC0. Lihat [third-party notices](../THIRD_PARTY_NOTICES.md) untuk sumber. Daftar inventaris M0 mencatat aset historis. Pengujian membandingkan hash aset yang dipertahankan dan menolak kategori aset yang dikeluarkan bila muncul kembali di paket.

### Pemeriksaan paket Classic Race — 6 November 2026

`npm run test:build` memverifikasi 745 aset di `dist/`, menolak Pally, kategori rekaman lama, dan gambar portofolio yang dikeluarkan, lalu memeriksa jalur HTML serta Rapier WASM. Dibanding build Pages `117e151`, perubahan paket hanya mencakup pembaruan kredit dan lima aset berikut.

| Aset | Bukti izin redistribusi |
| --- | --- |
| `campus/animals/ant.glb` | ANT oleh MAXDESIGN-3D, CC BY 4.0 menurut [API Sketchfab](https://api.sketchfab.com/v3/models/dab7080251674ef98fc83b7604be2ffc). |
| `campus/animals/wolf.glb` | Model oleh iRahulRajput, CC BY 4.0 menurut [API Sketchfab](https://api.sketchfab.com/v3/models/fdf0a7577fbf4d91b12f820b81f375ec). |
| `sounds/cloud-ops/gwo-howl.mp3` | Rekaman Sacha.Julien, CC0 pada [halaman Freesound](https://freesound.org/people/Sacha.Julien/sounds/753896/). |
| `sounds/cloud-ops/waves.wav` | Efek sintetis asli, dibuat oleh [generator proyek](../scripts/generate-release-sfx.mjs) dan dicakup lisensi MIT proyek. |
| `sounds/musics/Sky Blue Street.ogg` | Musik MintoDog, CC0 pada [unggahan OpenGameArt](https://opengameart.org/node/170985). |

Paket menyertakan [kredit kreator dan catatan modifikasi](../static/credits/THIRD_PARTY_NOTICES.md) serta [lisensi MIT Folio 2025](../static/credits/folio-2025-license.txt). Catatan pembatasan Pally dan aset lama berlaku untuk file historis yang sudah dikeluarkan dari paket.

## Demo lokal

Pada laptop yang sudah memiliki dependency dan build terverifikasi:

```bash
npm test
npm run build -- --base /Soka-cloud-ops-scheduling-adventure/
npm run test:build
npm run preview -- --host 127.0.0.1 --port 4173 --strictPort --base /Soka-cloud-ops-scheduling-adventure/
```

Buka `http://127.0.0.1:4173/Soka-cloud-ops-scheduling-adventure/`. Pilih Low, tunggu pemuatan, lalu MULAI PRESENTASI. Pastikan enam bagian, Step/Play/Pause/Reset dan Esc berfungsi sebelum giliran kelas. Jangan membuka dist melalui `file://`; module/WASM membutuhkan server HTTP. Tidak memerlukan backend. `.npmrc` menyelesaikan resolusi peer dependency upstream tanpa upgrade paket; fresh install tidak disamakan dengan dry-run resolusi.

Uji khusus `test-group8-release.mjs URL final-local-offline --block-external` memblokir HTTP(S) di luar origin localhost dan memeriksa alur UI normal. Hasil final tercantum di FINAL_RELEASE.md; ini membuktikan fallback presentasi pada mesin uji, bukan performa laptop lain atau sesi panjang. Muat game sebelum presentasi; startup ~21 detik sebelumnya belum boleh diklaim telah diperbaiki.

Revisi GWO lulus 41 tes unit dan build dengan 963 aset terverifikasi. Chrome menjalankan build pada subpath dengan koneksi luar diblokir. Empat langkah GWO, Reset, Esc dan buka ulang dengan L lulus. JavaScript, CSS, WASM, GLB, WebP, TTF dan MP3 termuat tanpa error lokal pada alur ini.

## Memperbarui GitHub Pages

1. Verifikasi izin aset pada commit yang akan diterbitkan.
2. Di GitHub, buka **Actions → Verified Pages release → Run workflow**, pilih `main`, lalu centang `rights_verified` setelah verifikasi.
3. Tunggu job **build** dan **deploy** selesai. Workflow memasang dependensi, menjalankan tes, membangun subpath Pages, memeriksa integritas aset, dan mengunggah `dist/`.
4. Buka URL dari job **deploy** dan periksa bahwa game serta aset versi terbaru dapat dimuat.
