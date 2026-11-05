# M2 — Shared Game Extension

Basis: M0 `54681c41d4fdef15b46068ad68604008040f5826`.
Branch: `development/m2-shared-game-extension`.
Lingkup: satu zona uji pada world/terrain asli. M1 sengaja tidak dikerjakan sesuai instruksi pemilik; belum ada Cloud/ACO/GWO mini-world atau engine numerik.

## Implementasi

| File | Tanggung jawab |
|---|---|
| `sources/CloudOps/ZoneManager.js` | Registry zona, state DRIVING/TRANSITION/LEARNING_UI, titik kembali, boundary recovery, panel registry. |
| `CarTransitionController.js` | Validasi footprint Rapier, lock input/chassis saat fade, moveTo/reset velocity, camera target, tunggu roda menyentuh tanah, rollback bila gagal. |
| `InteractiveStation.js` | Adapter `Zones.create` + `InteractivePoints.create` untuk gate/station. Radius 2.5; menolak klik jauh dan zona tidak aktif. |
| `TestArea.js` | Subclass `Area`, reference bounding/frustum asli; clone geometry/material bench original dan collider fixed sederhana melalui `Objects`. |
| `PresentationController.js` | Adapter programmatic goTo/next/previous melalui transisi yang sama. Belum ada UI/isi Presentation Mode M6. |
| `sources/Game/World/World.js` | Dua baris integrasi: import + inisialisasi extension pada step 2 setelah reveal. |
| `sources/index.html`, `sources/style/index.styl` | Satu native modal dan status/control hint. |

Tidak mengubah Player, PhysicsVehicle, View, Physics, material, lighting atau asset GLB. `npm test` mempertahankan hash 15 file core/license dan 957 aset upstream; manifest favicon sudah diperbaiki pada M0. Tidak ada loader/renderer/vehicle kedua.

## Cara mencoba

1. Mulai game dari Main World. Dekati diamond **Zona Uji M2** di dekat bangku tambahan pada area awal (sekitar x=43,z=43).
2. Hentikan mobil di tanah, tekan **E atau Enter**. Fade asli Bruno memindahkan mobil ke zona uji.
3. Berkendara menggunakan kontrol asli. Dekati **Panel Uji M2**, tekan E/Enter; Esc/tombol tutup kembali mengemudi.
4. **R** di zona uji melakukan reset ke spawn zona, termasuk saat bergerak. Penjaga batas mengembalikan mobil jika keluar sektor uji.
5. Dekati **Kembali ke Main**, tekan E/Enter. Mobil kembali dekat lokasi masuk pada footprint yang tervalidasi.

Zona uji memakai sektor terrain/circuit asli sekitar `[-65,65]`, radius 18, bukan world baru dari nol. Dua bench original menandai sektor, satu bench menandai gerbang Main. Layout ini hanya sarana validasi shared extension, bukan desain final Cloud Zone. Bench memakai collider cuboid konservatif, bukan collider produksi mini-world.

## Kontrak reusable

- `manager.register({id,name,spawn:{position:[x,z],rotation},center:[x,z],radius})`: id unik, koordinat finite, boundary opsional.
- `manager.createStation({zone,label,position:[x,y,z],onInteract})`: callback hanya aktif di zona terkait, dalam trigger native, pada state driving.
- `manager.enter(id)` untuk gate; `enter(id,true)` untuk reset/akses checkpoint terarah. Permintaan bersamaan ditolak.
- `manager.openPanel(name)` mendaftarkan lifecycle modal asli; konten modal perlu ada pada HTML sebelum Game init. Chassis/input dibekukan hingga event `closed`.
- `manager.presentation.goTo(id)/next()/previous()`: daftar section default main/test; perlu diperluas bersama registry untuk world berikutnya. Batas first/last dan id tidak dikenal ditolak.
- `game.world.areas.cloudOpsTest` memakai lifecycle Area/zone/frustum asli. Future area harus tetap mewarisi Area dan memakai pipeline aset asli.

R tetap action asli Bruno. Listener order 0 mengarahkan reset zona sebelum listener default order 1; Main tetap memakai reset asli. Tidak menghapus Enter/F atau menambah listener keyboard global.

## Keputusan safety hasil pengujian

- Gate menolak kendaraan airborne atau speed absolut >3.5. R/recovery tidak mensyaratkan grounded agar bisa menyelamatkan mobil.
- Checkpoint diuji dengan lima ray Rapier pada footprint, slope/height variation, dan overlap cuboid terhadap collider. Bukan sekadar memindahkan visual mesh.
- Lokasi berdiri dekat gate dapat aman untuk mobil saat ini namun tidak aman untuk spawn ulang karena props. Saat menyimpan/kembali, cari footprint aman paling dekat pada radius 0/2/4/6; checkpoint landing asli menjadi fallback pencarian. Jika semua gagal, batalkan perpindahan dengan hint.
- Input dan collision chassis dinonaktifkan selama blackout; velocity/forces/torques dihapus, pose kamera direset di balik fade. Setelah roda grounded, fade selesai sebelum input dipulihkan.
- Panel menghentikan physics chassis dan memakai filter modal asli; held input tidak bocor saat menutup. Permintaan transisi berulang tidak menimpa fade.
- Batas zona dan y<-2 menggunakan reset yang sama. Bila checkpoint gagal, simpan error dan hentikan retry otomatis sampai ada permintaan berikutnya.

## Pengujian dan reproduksi

Chrome terpasang, Node 22.17.0. Test M2 memakai flag debug **asli Bruno** untuk mengamati state; build rilis normal tidak perlu mengekspos Game.

```powershell
$env:VITE_GAME_PUBLIC='1'
npm.cmd run dev -- --port 1241 --strictPort
# Terminal kedua:
npm.cmd run test:m2 -- http://127.0.0.1:1241/ m2-dev
# Production test build, terminal terpisah:
$env:VITE_GAME_PUBLIC='1'
npm.cmd run build
npm.cmd run preview -- --host 127.0.0.1 --port 4180 --base /Soka-cloud-ops-scheduling-adventure/
# Terminal pengujian:
npm.cmd run test:m2 -- http://127.0.0.1:4180/Soka-cloud-ops-scheduling-adventure/ m2-production
# Build rilis tanpa flag debug (terminal baru atau Remove-Item Env:\VITE_GAME_PUBLIC):
npm.cmd test
npm.cmd run build
npm.cmd run test:build
```

Bukti browser menyimpan snapshot posisi/kamera, velocity/angular velocity, contact count, input filter dan body enabled. Setup tes mendekatkan mobil ke marker via API physics, lalu menjalankan interaksi keyboard sebenarnya; bukan klaim telah mengemudi manual seluruh jalur. Screenshot terkunci day=.1/year=.25 pada tes M2; simulasi tetap live. Jangan mengulang audit M0.

Hasil final, screenshot dan batasan dicatat setelah pengujian selesai di bagian penutupan di bawah.

## Penutupan M2 — 2026-11-04

**PASS.** Berhenti setelah M2; M1 dan mini-world edukasi belum dikerjakan.

| Pemeriksaan | Hasil / bukti |
|---|---|
| Browser dev | 27 checks PASS, `evidence/m2-dev.json` (sebelum tambahan adapter navigation; adapter diuji pada produksi). |
| Browser production subpath | **30 checks PASS**, `evidence/m2-production.json`, termasuk adapter goTo/next/previous. |
| Release normal tanpa debug Game | **6 smoke checks PASS**, `evidence/m2-release-browser.json`. |
| `npm test` | **3 tests PASS**, `evidence/m2-integrity.log`; core/license serta aset tetap identik. |
| `npm run build` | PASS test build + release normal; `evidence/m2-test-build.log`, `m2-release-build.log`. |
| `npm run test:build` | **958 aset dist** SHA-256 cocok; HTML subpath dan Rapier WASM valid, `evidence/m2-build-integrity.log`. |

Chrome 156.0.8078.74 headless, Windows/Node 22.17.0, viewport 1440×900. Test build memakai debug flag asli Bruno; release normal dibangun ulang dan dipastikan `window.game` tidak diekspos. Preview lokal memakai `/Soka-cloud-ops-scheduling-adventure/`, bukan deploy Pages.

Browser/physics mencakup E dan Enter dua arah, airborne gate refusal, checkpoint di luar terrain/terhalang bench, zero velocity saat teleport, finite pose/speed/spin setelah grounded, kamera mengikuti, held input saat fade/panel, R berulang, boundary recovery, original map/Esc regression, dan no page/local HTTP errors. Snapshot detail ada pada JSON; tidak mengklaim browser/gamepad/mobile matrix atau performa stabil.

Screenshot runtime yang sudah diperiksa:

- [Main World / gerbang](evidence/m2-production-main-gate.png)
- [Sektor uji / kendaraan](evidence/m2-production-test-zone.png)
- [Panel uji native](evidence/m2-production-panel.png)
- [Release normal](evidence/m2-release-main-world.png)

Kendala terbuka diwarisi M0: Google Fonts eksternal diblok jaringan lingkungan uji; laporan npm sebelumnya 30 vulnerabilities belum diperbaiki; clearance SFX/Pally sebelum publikasi; WebGL fallback/mobile/gamepad belum diuji. Collider bench tambahan memakai bounding cuboid konservatif. Tidak ada blocker M2 yang tersisa pada pengujian ini. Repo tetap Private, tanpa merge ke main atau deployment.
