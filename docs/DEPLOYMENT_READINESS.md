# Kesiapan deployment dan fallback demo — 5 November 2026

**Tidak ada deployment pada tugas ini.** Merge PR #10 ke main memerlukan persetujuan akhir pemilik. Deployment publik juga memerlukan persetujuan dan penyelesaian izin aset; izin merge bukan clearance aset.

## Infrastruktur

- Metadata API repository diverifikasi: visibility **Public**, `has_pages=false`, homepage kosong. Sesi ini tidak mengubah visibility atau Settings Pages.
- Tidak ada `.github/workflows` pada kandidat. Status commit dan review GitHub tidak memuat pemeriksaan CI/review penolakan; QA otomatis dijalankan lokal dan log disimpan, bukan CI hijau yang dikarang.
- Vite membangun `sources/` ke `dist/`, menyalin `static/`, dan memakai `base: './'`. Preview diuji pada subpath `/Soka-cloud-ops-scheduling-adventure/`; HTML, GLB/texture/audio, credit download dan Rapier WASM memakai jalur relatif.
- WebGPU memerlukan HTTPS/localhost. Chrome desktop/WebGPU diuji; fallback WebGL dari fondasi renderer belum diterima melalui matriks browser/perangkat proyek. Google Fonts adalah request eksternal; fallback UI lokal diperiksa terpisah dengan request eksternal diblokir.
- File Pally WOFF/WOFF2/TTF memang ada di `static/fonts`; warning resolusi font saat bundling tidak boleh dianggap sebagai bukti clearance lisensi. Tidak ada resource lokal gagal pada alur browser final yang dinyatakan lulus.
- `VITE_SERVER_URL` dan `VITE_GAME_PUBLIC` harus kosong pada build publik. Backend tidak dibutuhkan. Flag Game publik hanya dipakai untuk introspeksi tes, lalu dibersihkan pada build normal.

## Izin aset: deployment masih diblokir

| Materi | Bukti saat ini | Keputusan |
| --- | --- | --- |
| Kode/fondasi Folio 2025 | MIT root, copyright ©2025 Bruno Simon; license asli dan salinan Credits identik | Pertahankan notice dan attribution. |
| Musik Kounine | Kredit CC0 upstream tersimpan di game/notices | Pertahankan kredit; jangan ekstrapolasi ke audio lain. |
| SFX selain musik | Tidak ada ledger izin per rekaman yang lengkap | **Needs review; jangan deploy dahulu.** |
| Pally | Berkas font ada; file/bukti izin redistribusi belum lengkap di bundle | **Needs review; jangan deploy dahulu.** |
| Logo, gambar portofolio dan materi pihak ketiga lain | Scenery/asset asli dipertahankan; interaksi pribadi dinonaktifkan | Review terpisah sebelum redistribusi; file unused tetap ikut disalin dari static ke dist. |
| Materi kelompok/papan/ikon/visual scheduling | Source prosedural/Canvas/SVG proyek, tanpa paket aset baru | Catat sebagai modifikasi kelompok, tetap bedakan fondasi Bruno. |

Inventaris/hashes: [ASSET_CATALOG.md](ASSET_CATALOG.md), [inventory](evidence/asset-inventory.json), [third-party notices](../THIRD_PARTY_NOTICES.md). MIT kode tidak otomatis menjadi bukti izin semua rekaman/font/gambar. Jangan menghapus aset massal atau mengganti engine saat feature freeze untuk menyiasati gate ini.

## Demo lokal

Pada laptop yang sudah memiliki dependency dan build terverifikasi:

```bash
npm test
npm run build
npm run test:build
npm run preview -- --host 127.0.0.1 --port 4173 --strictPort --base /Soka-cloud-ops-scheduling-adventure/
```

Buka `http://127.0.0.1:4173/Soka-cloud-ops-scheduling-adventure/`. Pilih Low, tunggu pemuatan, lalu MULAI PRESENTASI. Pastikan enam bagian, Step/Play/Pause/Reset dan Esc berfungsi sebelum giliran kelas. Jangan membuka dist melalui `file://`; module/WASM membutuhkan server HTTP. Tidak memerlukan backend. `.npmrc` menyelesaikan resolusi peer dependency upstream tanpa upgrade paket; fresh install tidak disamakan dengan dry-run resolusi.

Uji khusus `test-group8-release.mjs URL final-local-offline --block-external` memblokir HTTP(S) di luar origin localhost dan memeriksa alur UI normal. Hasil final tercantum di FINAL_RELEASE.md; ini membuktikan fallback presentasi pada mesin uji, bukan performa laptop lain atau sesi panjang. Muat game sebelum presentasi; startup ~21 detik sebelumnya belum boleh diklaim telah diperbaiki.

## Setelah persetujuan dan clearance

1. Selesaikan ledger sumber/izin aset yang belum jelas; bila perlu perubahan aset, lakukan PR terpisah dan uji ulang.
2. Minta persetujuan eksplisit untuk merge PR #10 dan deployment; periksa bahwa SHA release masih sama dengan hasil QA final.
3. Sesudah izin terpenuhi, konfigurasi Pages melalui GitHub Actions dan tambahkan workflow release yang direview. Tidak ada workflow auto-deploy aktif yang ditambahkan pada tugas ini.
4. Build dari commit yang disetujui dengan Node22.17, `npm ci` (membaca `.npmrc`), env rilis normal, unit/build/integritas; unggah hanya dist.
5. Gunakan URL yang benar-benar dilaporkan Pages. Uji HTTPS, resource/subpath, native input, semua world, presentasi dan Credits pada URL tersebut sebelum menyebutnya live.
6. Jika hosting/izin belum siap, gunakan fallback localhost dan simpan release checkpoint; jangan mengarang URL publik.
