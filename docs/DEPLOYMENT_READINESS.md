# Kesiapan deployment dan fallback demo — 5 November 2026

**Deployment belum dilakukan.** Instruksi urgent memberi izin merge main/Pages bersyarat: tes kritis lulus dan seluruh izin redistribusi yang diperlukan terverifikasi. Syarat izin belum terpenuhi; main/deployment tetap ditahan. Lihat URGENT_RELEASE.md.

## Infrastruktur

- Metadata API repository diverifikasi: visibility **Public**, `has_pages=false`, homepage kosong. Sesi ini tidak mengubah visibility atau Settings Pages.
- Workflow Pages manual kini disiapkan; tanpa trigger push dan rights_verified default false. Belum dijalankan. Pada checkpoint sebelumnya tidak ada workflow. Status commit dan review GitHub tidak memuat pemeriksaan CI/review penolakan; QA otomatis dijalankan lokal dan log disimpan, bukan CI hijau yang dikarang.
- Vite membangun `sources/` ke `dist/`, menyalin `static/`, dan memakai `base: './'`. Preview diuji pada subpath `/Soka-cloud-ops-scheduling-adventure/`; HTML, GLB/texture/audio, credit download dan Rapier WASM memakai jalur relatif.
- WebGPU memerlukan HTTPS/localhost. Chrome desktop/WebGPU diuji; fallback WebGL dari fondasi renderer belum diterima melalui matriks browser/perangkat proyek. Google Fonts adalah request eksternal; fallback UI lokal diperiksa terpisah dengan request eksternal diblokir.
- File Pally WOFF/WOFF2/TTF memang ada di `static/fonts`; warning resolusi font saat bundling tidak boleh dianggap sebagai bukti clearance lisensi. Tidak ada resource lokal gagal pada alur browser final yang dinyatakan lulus.
- `VITE_SERVER_URL` dan `VITE_GAME_PUBLIC` harus kosong pada build publik. Backend tidak dibutuhkan. Flag Game publik hanya dipakai untuk introspeksi tes, lalu dibersihkan pada build normal.

## Izin aset: deployment masih diblokir

| Materi | Bukti saat ini | Keputusan |
| --- | --- | --- |
| Kode/fondasi Folio 2025 | MIT root, copyright ©2025 Bruno Simon; license asli dan salinan Credits identik | Pertahankan notice dan attribution. |
| Musik Kounine | Kredit CC0 upstream tersimpan di game/notices | Pertahankan kredit; jangan ekstrapolasi ke audio lain. |
| SFX selain musik | 85 berkas di `static/sounds` di luar `musics`. Contoh yang izin per rekamannya belum terverifikasi: `birdTweets/24074 small bird tweet calling-full-1.mp3` dan `wind/13582-wind-in-forest-loop.mp3`. | **Tahan publikasi** sampai sumber dan izin terkonfirmasi, atau audio diganti dengan alternatif berlisensi jelas. |
| Pally | [Arsip resmi Fontshare](https://api.fontshare.com/v2/fonts/download/pally) memuat ITF FFL 2.0 (17 Agustus 2026). Bagian 01 mengizinkan self-hosting untuk situs sendiri. Bagian 02 membatasi redistribusi font di luar penggunaan yang diizinkan, termasuk lewat repositori. Hash bobot statis yang dipakai game berbeda dari arsip terkini. | Izin self-hosting paket resmi tidak menyelesaikan verifikasi berkas lama atau redistribusi melalui repositori publik. |
| Logo, gambar portofolio dan materi pihak ketiga lain | Misalnya `static/projects/images/scout-1.png` dan versi KTX ikut masuk ke `dist`, meskipun galeri portofolio dinonaktifkan. | Verifikasi izin atau keluarkan aset yang tak diperlukan dari paket publik. |
| Materi kelompok/papan/ikon/visual scheduling | Source prosedural/Canvas/SVG proyek, tanpa paket aset baru | Catat sebagai modifikasi kelompok, tetap bedakan fondasi Bruno. |

Inventaris/hashes: [ASSET_CATALOG.md](ASSET_CATALOG.md), [inventory](evidence/asset-inventory.json), [third-party notices](../THIRD_PARTY_NOTICES.md). MIT kode tidak otomatis menjadi bukti izin semua rekaman/font/gambar. Jangan menghapus aset massal atau mengganti engine saat feature freeze untuk menyiasati gate ini.

Penggantian font saja masih menyisakan SFX dan gambar tanpa izin terverifikasi. Paket demo lokal mempertahankan asetnya agar alur game tetap dapat diuji. Paket publik perlu menuntaskan seluruh kategori di atas.

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

## Setelah persetujuan dan clearance

1. Selesaikan ledger sumber/izin aset yang belum jelas; bila perlu perubahan aset, lakukan PR terpisah dan uji ulang.
2. Persetujuan merge PR #10 sudah diberikan dengan syarat tes kritis lulus dan izin aset terverifikasi. Pastikan SHA release sama dengan hasil QA final.
3. Sesudah izin terpenuhi, pilih GitHub Actions sebagai sumber di Settings → Pages dan jalankan workflow manual `Verified Pages release` dari main dengan `rights_verified=true`.
4. Build dari commit yang disetujui dengan Node22.17, `npm ci` (membaca `.npmrc`), env rilis normal, unit/build/integritas; unggah hanya dist.
5. Gunakan URL yang benar-benar dilaporkan Pages. Uji HTTPS, resource/subpath, native input, semua world, presentasi dan Credits pada URL tersebut sebelum menyebutnya live.
6. Jika hosting/izin belum siap, gunakan fallback localhost dan simpan release checkpoint; jangan mengarang URL publik.
