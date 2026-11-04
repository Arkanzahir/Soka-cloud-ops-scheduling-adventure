# Architecture audit — M0 (2026-11-04)

Basis: `brunosimon/folio-2025@41046b57eeed8d156d9c3fd7fa259900baef7816`.
Destination awal: `d3abd9b`, branch `development/m0-m1-foundation`. Repo GitHub terverifikasi Private; tidak mengaktifkan Pages atau mengubah visibility.

## Sistem yang dipertahankan

| Komponen | File aktual | Kontrak / keputusan |
|---|---|---|
| Bootstrap | `sources/index.js`, `sources/Game/Game.js` | Singleton Game; resource batch intro lalu world; Rapier dimuat async. Tidak membuat engine kedua. |
| Loop | `Ticker.js`, `Events.js` | Input 0, player pre 1, vehicle pre 2, physics 3, objects 4, vehicle post 5, player post 6, view 7, zones 8, interactive 9, area/environment 10, rendering 998. Pertahankan urutan. |
| Renderer | `Rendering.js`, `sources/threejs-override.js` | Three 0.183.2 WebGPURenderer/TSL, fallback WebGL; RenderPipeline, bloom 0.25/threshold 1, cheapDOF high quality. |
| Physics | `Physics/Physics.js` | Rapier 0.17.3, gravitasi (0,-9.81,0), collision groups floor/object/bumper. |
| Kendaraan | `Physics/PhysicsVehicle.js`, `World/VisualVehicle.js` | Raycast vehicle controller 4 roda. Steering 0.5, engine force 300, top speed 5/boost 40. Chassis cuboid half-extents 1.3/0.4/0.85, massa utama 2.5; wheel radius .4. Nilai game, jangan diklaim spesifikasi mobil nyata. |
| Kontrol | `Player.js:221-238`, `Inputs/Keyboard.js` | WASD/arrows; Shift boost; B/Ctrl brake; R respawn; Space suspensi tinggi; **Enter/E/F sudah interact**. Dokumentasi lama soal alias E perlu koreksi, bukan kode baru. |
| Respawn | `Respawns.js`, `Player.respawn`, `PhysicsVehicle.moveTo` | Marker GLB, spawn y=4; overlay; moveTo menghapus linear/angular velocity. Kandidat adapter M2; uji grounded spawn dan restore kamera/input sebelum zona baru. |
| Kamera | `View.js` | Perspective 25°, near .1/far 200, phi .31π high/.27π low, theta .25π, radius 15–30; eased tracked position, magnet, cinematic/free/map. |
| Area | `World/Areas/Areas.js`, `Area.js`, `References.js` | Area dari named children `areas.glb`; Blender extras/reference naming memandu visual, collider, zoneBounding/zoneFrustum. Frustum gating dan sleeping physics sudah tersedia. |
| Zona/interaksi | `Zones.js`, `InteractivePoints.js` | Cylinder/sphere enter/leave; nearest active interactive point, callbacks, temporaryHide/recover. Bukan scene-per-world. Gunakan satu world dan perluas API ini. |
| Panel | `Modals.js`, `Menu.js`, `ClosingManager.js` | Kategori input modal/menu/wandering; Esc prioritas menutup panel. Map kiosk `LandingArea.setKiosk` contoh integrasi. |
| Objects | `Objects.js`, `InstancedGroup.js` | addFromModel memakai extras serta shared materials; physics→visual; sleep di luar area kamera. |
| Terrain | `Terrain.js`, `World/Floor.js` | Data RGB, tracks, visual plane mengikuti view, terrain GLB untuk Rapier heightfield; bukan tanah baru. |
| Environment | `World/Foliage.js`, `Grass.js`, `Trees.js`, `Weather.js`, `Cycles/*` | Instancing, seeded foliage, angin/musim/jam; pertahankan semua untuk konsistensi. |

## Integrasi minimum M0

- `sources/`, `static/`, pipeline `scripts/compress.js`, sumber Blender dan texture diambil dari commit basis. README tim dipertahankan; README Bruno disimpan di `docs/upstream/BRUNO_README.md`.
- MIT `license.md` tidak diubah. Metadata package `ISC` bawaan bertentangan dengan license root; target memakai MIT dan `private: true` (ini mencegah npm publish, bukan pengaturan GitHub).
- HTML title menandai baseline CLOUD OPS; kredit, world, material, mobil tidak diganti. Hapus analytics hardcoded Bruno agar adaptasi tidak mengirim statistik ke pemilik basis.
- Favicon/preload menjadi relatif; manifest icon relatif terhadap lokasi manifest. Vite `base: './'` asli tetap; diuji di subpath repo.
- Hapus `import 'dotenv/config'` dari config: side effect memasukkan `.env` ke process.env sehingga menimpa `.env.local` saat Vite reload. Vite sendiri memuat env. Dev bind localhost dan tidak membuka tab otomatis.
- Tidak ada mini-world, teleporter baru, ACO/GWO engine, deploy workflow, atau pergantian desain.

## Batasan static/offline dan risiko

`Server.start()` tidak membuka WebSocket jika VITE_SERVER_URL kosong. Main game berjalan; score/whispers online bukan bagian demo. Google Fonts tetap eksternal; core static tanpa backend bukan berarti seluruhnya offline. Favicon/preload sebelumnya root-absolute. Build bundle JS sekitar 4.86 MB; aset static ~202.6 MB termasuk source/variant yang belum dipangkas. Optimasi jangan mengubah kualitas sebelum profiling.

Dependency install memerlukan `--force` menurut upstream karena vite-plugin-restart peer range berhenti di Vite 5 sedangkan runtime Vite 7.2.4. Audit npm melaporkan 30 vulnerabilities; tidak melakukan `audit fix --force`. Pekerjaan dependency maintenance dan lisensi audio/font harus selesai sebelum publikasi. Tidak mengklaim WebGL/mobile lulus dari tes WebGPU desktop.

## Titik sambung M2 (belum diimplementasikan)

Gunakan `Area` + `Zones.create` + `InteractivePoints.create`, serta kategori input/panel asli. Bungkus `Player.respawn`/`moveTo` dengan transisi terkontrol; validasi collider, kamera dan velocity. Engine numerik nanti di `sources/CloudOps/scheduling/`, tanpa import Three/Rapier; adapter visual terpisah. Jangan menciptakan ulang kendaraan, material atau scheduler event game.

## Penutupan M0

Whispers storage buffer membutuhkan jumlah finite: source target menambahkan fallback 30 ketika konfigurasi hilang/tidak valid/negatif. Diuji tanpa .env. Perubahan ini tidak mengganti renderer/world; laporan verifikasi: [BASELINE_TEST_REPORT](BASELINE_TEST_REPORT.md).
