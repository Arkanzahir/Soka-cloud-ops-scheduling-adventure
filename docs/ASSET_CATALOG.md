# Asset catalog — M0

Source: https://github.com/brunosimon/folio-2025/tree/41046b57eeed8d156d9c3fd7fa259900baef7816

[Inventory JSON](evidence/asset-inventory.json): **1,070 files**, **361,463,187 bytes**, **66 GLB** dalam static+resources upstream; SHA-256 per file, GLB node/mesh/material/extension metadata. Static: 958 files / 202,641,686 bytes. Inventory mencakup file sumber yang sengaja tidak di-commit (backup dan raw audio), bukan daftar isi deploy.

| Kelompok | Path exact | Reuse / izin |
|---|---|---|
| Kendaraan | `static/vehicle/default.glb`, `default-compressed.glb` | Original, 24 nodes/18 meshes; palette, redGradient, darkGray dan emissive asli. MIT root; tidak dimodifikasi. |
| Main areas | `static/areas/areas.glb`, `areas-compressed.glb` | 737 nodes/266 meshes; kiosk, boards, props, collider/reference extras. MIT root; merek/logo embedded perlu review sebelum public. |
| Terrain | `static/terrain/terrain.glb`, `terrain.png`, `terrain.ktx` | Satu mesh heightfield; jangan diganti. |
| Slab/palette | `static/floor/slabs.png`, `slabs.ktx`, `static/palette.png`, `palette.ktx` | Shared runtime shading. |
| Trees | `static/birchTrees/birchTreesVisual.glb`, `birchTreesReferences.glb`; oakTrees/cherryTrees pola sama | Reuse visual dan placement references; pasangan compressed tersedia. |
| Furniture | `static/benches/benches.glb`, `static/fences/fences.glb`, `static/bricks/bricks.glb`, `static/lanterns/lanterns.glb` | Kitbash sesuai scale; physics/instancing asli. |
| Scenery | `static/scenery/scenery.glb`, `static/bushes/bushesReferences.glb`, `static/flowers/flowersReferences.glb` | Reuse sesuai registry asli. |
| Respawn | `static/respawns/respawnsReferences.glb` | Named marker, bukan hardcode koordinat baru. |
| Editable | `resources/folio-2025.blend`, `resources/models/bruno-sudo.blend`, `resources/terrain.psd`, `resources/palette.png` | Disimpan; Blender round-trip belum diuji. `.blend1` tidak di-commit. |
| Compressors | `scripts/compress.js`, `static/draco/`, `static/basis/` | Preserve vendored notices; tooling dependencies punya lisensi masing-masing. |
| Music | `static/sounds/music/` | Kredit upstream `sources/index.html` menyebut karya Kounine CC0. Periksa path actual; tautan upstream 'musics' salah bentuk plural. |
| SFX | `static/sounds/` selain music | Tidak ditemukan ledger izin per rekaman. Jangan mengekstrapolasi CC0 music ke SFX. Local private audit saja sampai review. |
| Raw audio | `resources/sounds/` | Nama sampel pihak ketiga termasuk Daft_Punk...; **tidak di-commit**, tetap di clone audit upstream. Tidak diperlukan runtime. |
| Fonts | `static/fonts/Pally-*`, Google Fonts Nunito/Amatic SC | Pally license file tidak ditemukan di bundle. Perlu konfirmasi redistribusi; Google Fonts masih request jaringan. |

Lisensi repository `license.md`: MIT, Copyright (c) 2025 Bruno Simon. Metadata npm upstream mengatakan ISC; tidak menggantikan license root. Root MIT bukan bukti clearance setiap rekaman/font/merek eksternal. Tidak ada publikasi/deploy; isu izin aset masih gate sebelum distribusi. Semua pemberitahuan/kredit yang tersedia dipertahankan.

Regenerasi inventory dari clone SHA yang sama: `node scripts/audit-assets.mjs ../bruno-baseline`. Tes `npm test` memverifikasi byte seluruh runtime asset (kecuali manifest favicon yang path-nya diperbaiki) dan 15 file core/license. Jangan regenerasi hash untuk menyembunyikan perubahan world.
