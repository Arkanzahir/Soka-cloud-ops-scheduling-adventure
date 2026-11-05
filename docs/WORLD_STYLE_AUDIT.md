# World style audit — M0

Sumber SHA dan arsitektur: [ARCHITECTURE_AUDIT](ARCHITECTURE_AUDIT.md). Bukti utama: [Main World asli](evidence/original-main-world.png), [interaksi peta](evidence/original-map-interaction.png). Screenshot runtime, bukan concept art.

## Acuan terukur

- Kamera high 25° perspective, phi .31π/theta .25π; 1440×900, quality 0. Tes dev mengunci cycle binding day=.1/year=.25; weather, particles dan timing tidak sepenuhnya deterministik. Render A/B bukan perbandingan pixel identik.
- Bentuk: mobil merah beratap kotak, roda besar, bench/pagar kayu modular, lampu kotak, batu berbidang, rumput segitiga rapat, tajuk pohon dari kumpulan plane. Jalan tanah/slab hangat, air turquoise; cahaya dan bayangan berwarna. Hindari menafsirkan 'low poly' sebagai izin paket aset acak.
- `Terrain.js`: size 192, subdivision 128; grass `#b8b62e`; gradient tanah/air `#ffa94e`, `#5bc2b9`, `#13375f`.
- `World/Floor.js`: cell 1.5; slab `#ffcf8b`/`#a87762`; RGB terrain: R slab, G grass/tracks, B depth/water; displacement -1.5×B. Heightfield fisika berasal dari terrain GLB.
- `Materials.js` + `Materials/MeshDefaultMaterial.js`: palette texture dan custom **Lambert node** dengan core/drop shadow, bounce, fog, water/reveal. Bukan PBR roughness/metalness generik. Material GLB dipetakan berdasarkan nama; reuse `palette` dan `Materials.updateObject`.
- `Ligthing.js` (ejaan file asli): directional light, map 2048 high/512 low, bias -.001, normalBias .1; bounce `#82487f`; warna/intensitas berubah menurut day cycles. Jangan mengganti rig lampu per mini-world.
- Chassis utama lebar 1.7, panjang 2.6 world units, bumper 3×1.8; roda radius .4. Ini ukuran collider, bukan bounding box mesh atau bukti unit meter Blender. Jadikan mobil acuan skala.
- Foliage: 80 plane .8×.8 per cluster dasar (`World/Foliage.js`), instancing dan seeded sampling. Props dan tajuk memakai keluarga yang sama.
- UI: Nunito/Amatic SC eksternal, Pally lokal; diamond prompt dan papan asli. Jangan mengganti dengan HUD cyberpunk.

## Pipeline yang diaudit

`resources/folio-2025.blend` (16,074,344 bytes), `resources/models/bruno-sudo.blend`, `resources/palette.png`, `resources/terrain.psd`, `resources/slabs.sbs`. GLB names/materials/extras dibaca dari binary JSON; inventory mencatat meshes, nodes, extensions. **Blender UI, export preset internal dan round-trip export belum diuji**; jangan mengklaim telah inspeksi viewport Blender.

README Bruno: mute palette texture node, pilih preset ekspor sesuai objek, GLB tanpa compression. `scripts/compress.js`: gltf-transform ETC1S quality 255; toktx preset per-texture (R linear untuk mask, RGB sRGB default), Sharp WebP UI. Output asli dan `-compressed`/KTX tersedia. `ResourcesLoader.js` memakai GLTFLoader + Draco + KTX2, decoder relatif `./draco/`, `./basis/`. Tidak perlu regenerate aset untuk M0.

## Standar mini-world / quality gate

1. Reuse terrain, floor, pohon, rumput, pagar, bench, lighting dan palette. Kitbash papan/podium sebelum model custom.
2. Jalan mengitari instalasi; rancangan clearance minimal 2×lebar bumper (~3.6 units), **usulan desain**, harus diuji manuver/kolisi. Jangan menganggap ukuran jalan asli telah diukur.
3. Server, ant, wolf harus memakai silhouette sederhana dan material registry asli. Emissive asli mobil/lampu dipertahankan, tanpa tambahan portal neon, cyberpunk, floating island.
4. Bandingkan Main vs zona pada viewport, camera, quality, day/year sama; nilai silhouette, scale, density, bayangan, kontras label. Aset tidak boleh melayang/menembus collider.
5. Rekam FPS/frame time di perangkat nyata; jangan menjanjikan 60 FPS. Screenshot bukan bukti performa atau shader parity WebGL.
6. Buat Cloud saja setelah gate M0; ACO/GWO menunggu vertical slice dan trace numerik teruji.

## Usulan Cloud Compute Yard (belum dibangun)

Satu instalasi di lahan datar terhubung jalan Main World; pertahankan terrain/collider asli. Susun 3 podium VM di sisi jalur putar, 8 kotak task di papan tengah, kiosk simulator di tepi dengan safe-stop. Gunakan `LandingArea` kiosk sebagai pola interaksi, bukan menimpa landmark Bruno. Tentukan koordinat setelah uji ruang kosong/collision; belum ada koordinat spawn yang disahkan.

| Original → reuse | Kebutuhan baru |
|---|---|
| `static/areas/areas.glb` kiosk/boards; `benches`, `fences` | Label akademik dan podium VM kitbash |
| `terrain`, `floor`, `birchTrees`, `oakTrees`, `cherryTrees`, `bushes` | Tidak ada pengganti lingkungan |
| `palette.png`, shared Lambert, directional lighting | Server sederhana mengikuti palette; nanti ant/wolf custom |
| `InteractivePoints`, `Modals`, `Player.respawn` | Adapter learning station dan transisi pada M2 |
