# Baseline test report — M0

Tanggal: 2026-11-04. Status: **PASS M0**, berhenti sebelum M1.

- Upstream Bruno: `41046b57eeed8d156d9c3fd7fa259900baef7816`.
- Base destination: `d3abd9b`; branch `development/m0-m1-foundation`.
- Windows, Node 22.17.0, Chrome 156.0.8078.74 headless, WebGPU, quality 0, viewport 1440×900. Tidak mewakili seluruh perangkat/browser.

## Perbaikan world kosong

Run awal target tidak memiliki `.env`, sehingga `parseInt(import.meta.env.VITE_WHISPERS_COUNT)` menghasilkan NaN untuk ukuran storage buffer `World/Whispers.js`. Menyalin `.env.example` memulihkan render dan gameplay. Tambahkan fallback 30 untuk nilai hilang/tidak valid/negatif sehingga clone baru tidak menghasilkan buffer NaN. Sistem world, mobil, kamera, physics dan material lainnya dipertahankan.

Konfirmasi: run browser target dengan **`.env` tidak ada**, `whispersCount=30`, geometri terlihat, kontrol/interaksi lulus. Screenshot diperiksa visual; pemeriksaan variasi warna di tengah canvas juga mendeteksi world kosong. Ini tes smoke render, bukan pembuktian visual pixel-identical.

## Hasil aktual

| Perintah / bukti | Hasil |
|---|---|
| Upstream `npm.cmd install --force` | PASS; 402 packages. Konflik peer Vite/restart serta 30 vulnerabilities tercatat. |
| Upstream `npm.cmd run build` | PASS; `evidence/original-build.log`. |
| Upstream browser | PASS 14 checks; `evidence/original-browser.json`. |
| Target `npm.cmd install --force` (+ Playwright devDependency) | PASS; `evidence/foundation-install.log`. |
| Target `npm.cmd test` | PASS 3 tests: 15 core/license files, 957 upstream static assets, entrypoint/manifest paths. |
| Target browser dengan `.env` | PASS 14 checks; `evidence/foundation-dev-browser.json`. |
| Target browser **tanpa `.env`** setelah fallback | PASS 16 checks; `evidence/foundation-no-env-browser.json`. |
| Target `npm.cmd run build` | PASS; `evidence/foundation-build.log`. |
| Target `npm.cmd run test:build` | PASS; seluruh **958 aset dist** SHA-256 identik terhadap static target; HTML relatif dan Rapier WASM tersedia. |
| Production preview subpath repo | PASS 5 checks; `evidence/foundation-production-browser.json`. |

Browser target tanpa env memeriksa buffer finite, render terlihat, gerak keyboard, kamera mengikuti, steering, brake finite, R respawn grounded, moveTo zero velocity, **E dan Enter** membuka map serta Esc mengembalikan kategori driving; 0 page errors/HTTP errors/local request failures. Setup pengujian memakai moveTo untuk mendekati kiosk; ini bukan klaim navigasi manual seluruh world.

Produksi dibuka pada `http://127.0.0.1:4173/Soka-cloud-ops-scheduling-adventure/`: world terlihat, menu keyboard bekerja, 0 page errors/local asset failures. Ini preview lokal produksi, **bukan deployment GitHub Pages**. Aset yang belum dikunjungi di browser tetap dicakup pemeriksaan hash build.

## Screenshot

- [Main World original](evidence/original-main-world.png)
- [Main World target tanpa env](evidence/foundation-no-env-main-world.png)
- [Map E / Esc target](evidence/foundation-no-env-map-interaction.png)
- [Main World produksi subpath](evidence/foundation-production-main-world.png)

Dev A/B: day=.1, year=.25, camera/quality/viewport sama. Screenshot produksi menggunakan cycle asli yang berjalan; perbedaan pencahayaan bukan perubahan material. Tidak menambah desain neon/cyberpunk/floating island.

## Batasan yang masih terbuka

- Google Fonts eksternal gagal di jaringan lingkungan uji (`ERR_NETWORK_ACCESS_DENIED`); fallback font bekerja. Tidak mengklaim offline penuh atau tipografi eksternal terverifikasi.
- npm melaporkan 30 vulnerabilities bawaan (6 low/9 moderate/14 high/1 critical). Belum upgrade dependensi karena menjaga baseline.
- Build memberi warning font path, eval vm-browserify dan bundle >500 kB; runtime aset lokal tidak gagal. Ukuran static ~202.6 MB.
- Clearance lisensi SFX dan Pally belum selesai; catatan [ASSET_CATALOG](ASSET_CATALOG.md). Raw resources/sounds dan backup Blender tidak di-commit. Repo Private; tidak ada Pages/publication.
- Blender viewport/export round-trip, WebGL fallback, mobile, gamepad dan layanan online belum diuji. Audit Blender berdasarkan file sumber, metadata GLB dan pipeline.
- Frame sample 89 frame headless: median 6.1 ms, p95 12 ms; bukan benchmark stabil laptop/proyektor atau janji FPS.

## Reproduksi

```powershell
Copy-Item .env.example .env
npm.cmd install --force
npm.cmd test
npm.cmd run build
npm.cmd run test:build
npm.cmd run dev -- --port 1235 --strictPort
# Terminal kedua:
npm.cmd run test:browser -- http://127.0.0.1:1235/ foundation-dev
# Produksi:
npm.cmd run preview -- --host 127.0.0.1 --port 4173 --base /Soka-cloud-ops-scheduling-adventure/
npm.cmd run test:browser -- http://127.0.0.1:4173/Soka-cloud-ops-scheduling-adventure/ foundation-production --production
```

Untuk mengulang regression missing-env, simpan `.env` di luar nama yang dimuat Vite, restart dev server dan jalankan label `foundation-no-env`. Screenshot/JSON ditulis per label. Playwright memakai Chrome yang sudah terpasang; `BROWSER_CHANNEL` dapat diganti sesuai instalasi. Jangan mengulang audit source tanpa alasan perubahan upstream.
