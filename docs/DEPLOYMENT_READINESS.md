# Kesiapan deployment dan fallback demo — 5 November 2026

Paket Pages mengganti atau mengeluarkan aset yang sebelumnya tertahan. Status penerbitan mengikuti workflow GitHub dan URL yang berhasil diverifikasi.

## Infrastruktur

- Metadata API repository diverifikasi: visibility **Public**, `has_pages=false`, homepage kosong. Sesi ini tidak mengubah visibility atau Settings Pages.
- Workflow Pages manual kini disiapkan; tanpa trigger push dan rights_verified default false. Belum dijalankan. Pada checkpoint sebelumnya tidak ada workflow. Status commit dan review GitHub tidak memuat pemeriksaan CI/review penolakan; QA otomatis dijalankan lokal dan log disimpan, bukan CI hijau yang dikarang.
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
2. Persetujuan merge PR #10 diberikan dengan syarat tes kritis lulus dan paket publik tidak membawa aset yang izinnya belum terverifikasi.
3. Sesudah izin terpenuhi, pilih GitHub Actions sebagai sumber di Settings → Pages dan jalankan workflow manual `Verified Pages release` dari main dengan `rights_verified=true`.
4. Build dari commit yang disetujui dengan Node22.17, `npm ci` (membaca `.npmrc`), env rilis normal, unit/build/integritas; unggah hanya dist.
5. Gunakan URL yang benar-benar dilaporkan Pages. Uji HTTPS, resource/subpath, native input, semua world, presentasi dan Credits pada URL tersebut sebelum menyebutnya live.
6. Jika hosting/izin belum siap, gunakan fallback localhost dan simpan release checkpoint; jangan mengarang URL publik.
