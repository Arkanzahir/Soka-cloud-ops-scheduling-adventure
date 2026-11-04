# WORLD DESIGN SPEC — Bruno-Consistent 3D Art Direction

**Status:** style specification and audit checklist. **Bukan hasil audit visual lengkap** atas file Blender, shader, dan GLB original. Work harus mengukurnya dari repo/run pertama sebelum menetapkan nilai teknis final.

## 1. Prinsip desain yang tidak boleh dilanggar

World baru harus tampak sebagai perpanjangan alami proyek Bruno Simon Folio 2025, bukan redesign artistik. Gunakan **model, pipeline, material, pencahayaan, ground, vegetasi, kamera, dan skala asli sebagai acuan terukur**. Hindari low-poly generik dari website asset store jika berbeda palet atau proporsinya.

**Yang tidak diinginkan:** floating islands, portal neon, HUD sci-fi berlebihan, server cyberpunk, ilustrasi anime, bumi futuristik, shader menyala tanpa dukungan style original, environment terpisah yang terasa seperti game lain.

**Yang diinginkan:** diorama outdoor playful, jalan ramah mobil, props edukatif sebagai instalasi mainan/sculpture, bentuk sederhana dan konsisten dengan keluarga mesh/material Bruno.

## 2. Temuan yang SUDAH terkonfirmasi dari README proyek

Repo: https://github.com/brunosimon/folio-2025

- `sources/`, `static/`, `resources/`, `scripts/` ada.
- Subsystems pada game loop termasuk `PhysicalVehicle`, `VisualVehicle`, `Zones`, `InteractivePoints`, `Foliage`, `Terrain`, `Floor`, `Grass`, `Lighting`, `Weather`, `Objects`, `Fences`, `Benches`, `Lanterns`.
- Blender export memakai palette texture yang diatur di Three.js material; tersedia pipeline kompres GLB/tekstur.
- `npm run dev` dan `npm run build` tercantum pada README.
- Lisensi MIT untuk repository; audit lisensi sumber aset pihak ketiga saat memilih objek/musik.

**Belum dibuktikan:** nilai warna/material/shader persis, unit world, skala kendaraan, ukuran jalan, sistem asset streaming, FPS baseline, klasifikasi lisensi setiap aset.

## 3. Audit yang harus dilakukan Work SEBELUM mengkreasi aset

| Item | Yang diukur/diambil | Bukti |
|---|---|---|
| World scale | ukuran mobil, lebar jalan, tinggi karakter/props, satuan Blender→Three.js | scene screenshot + file/transform |
| Ground | texture/color variation, terrain geometry, pengulangan | file sumber + render |
| Vegetasi | jenis pohon, grass, bushes, distribusi/instancing | object library + screenshot |
| Material | palet, roughness, metalness, texture mapping, vertex colors | sampler code/material diagram |
| Lighting | sky, time-of-day, shadows, tone mapping, fog | config + same-angle render |
| Geometry | silhouette, bevel/faceting, detail level, polygon budget | contoh mesh GLB/Blender |
| World props | fence, bench, sign, lamp, buildings, interaction cue | asset paths + contact sheet |
| Physics | collider/material/friction and vehicle spawn safe zone | code + replay test |
| UI typography | fonts, prompt styles, panel spacing, icons | CSS screenshot |
| Performance | desktop FPS, draw calls, load, texture memory | measurement + device description |

Output audit wajib: `WORLD_STYLE_AUDIT.md`, `ASSET_CATALOG.md`, `BASELINE_SCREENSHOTS/`, dan satu tabel mapping `(original asset → reused in zone → new custom asset)`.

## 4. Strategy asset: reuse → kitbash → create

1. **Reuse**: gunakan terrain, grass, foliage, fence, rocks, signage, object material dari repo apabila sah secara lisensi.
2. **Kitbash**: susun objek original menjadi diorama edukatif (mis. papan + pedestal + kotak modular) tanpa membuat style baru.
3. **Create**: baru buat ant/wolf/server model custom di Blender mengikuti palet asli; lebih baik bahan dasar sederhana dipoles daripada model sangat detail dari sumber berbeda.
4. Jika memakai aset dari luar: cek lisensi per aset, author, atribusi, redistribution rights, kemudian adaptasi material/mesh agar konsisten.

**Larangan kerja:** menghasilkan seluruh mini-world hanya dengan prompt gambar. Concept art tidak menghasilkan model 3D siap interaksi, collider, atau shader.

## 5. Konsep area berbasis aset, bukan estetika yang melenceng

### Cloud Zone — 'Compute Yard'

- Jalan dan terrain menggunakan kit lingkungan original.
- 3 server stand merupakan props low-poly pada podium mirip objek dekoratif di world asal; jangan mengkilap atau bercahaya berlebihan.
- Task adalah kotak sederhana bernomor; bisa bergeser menuju VM saat animasi.
- Papan explanation, baseline map load dan terminal simulator berada di tepi jalan.
- Jalur mobil dapat mengitari instalasi tanpa memasuki ruang tertutup.
- Warna dan skala harus diambil dari audit, bukan dikunci sekarang.

### ACO Zone — 'Ant Research Park'

- Gunakan pohon/rumput/batu asli di sekitar area.
- Sarang semut adalah landmark sebagai patung/diorama sederhana, bukan dunia fantasi terpisah.
- Jalur konstruksi solusi berformat node task→VM bisa dianimasikan pada sebuah board tanah/podium.
- Semut low-poly bergerak di atas jalur yang mengikuti event `selectedVM`.
- Ketebalan/penekanan jalur terikat pada `tau[i][j]` yang sebenarnya.
- Sebagian instalasi tetap terlihat saat player berkendara melewati area, tetapi simulator yang lebih detail ditampilkan di stasiun interaksi.

### GWO Zone — 'Wolf Field Research'

- Lahan lapang/hutan kecil menggunakan foliage asli; hindari realisme/horror.
- Figur wolves low-poly dengan silhouette selaras prop di Bruno; gunakan alpha/beta/delta markers yang sederhana.
- Jangan membuat serigala berperan seolah melacak posisi fisik VM; setiap serigala merepresentasikan satu kandidat vector scheduling.
- Arena leader ranking dan step-inspector menggunakan struktur object interaction yang sama seperti Cloud dan ACO.

## 6. Konvensi pipeline Blender→GLB→Three.js

- Simpan file editable (Blender) dan hasil export GLB dengan penamaan jelas.
- Ikuti *export presets* repo setelah diinspeksi; matikan palette node bila dijelaskan README, lalu aplikasikan material via proyek sesuai sistem Bruno.
- Gunakan optimasi yang memang kompatibel (gltf-transform/KTX) setelah lulus uji visual; simpan sumber uncompressed.
- Cek pivot/origin, scale, forward axis, LOD, collision mesh, UV, normal, animasi, dan licensing.
- Hindari membangun collider superdetail untuk semut/serigala kecil; gunakan primitive collider bila sesuai.
- Buat asset registry, tidak memasukkan URL hotlink runtime yang mungkin mati.

## 7. Quality gate visual untuk setiap zona

- Render **Main World vs Cloud/ACO/GWO** pada kamera yang setara dan jam/weather yang sama.
- Periksa: silhouette, density detail, roughness, kontras, saturasi, skala vehicle vs objek, vegetasi, terrain, bayangan.
- Bandingkan *in-engine*, bukan hanya concept art dua gambar.
- Tunjukkan screenshot/video reviewer; catat perbedaan dan revisi satu per satu.
- Jangan mendeklarasikan `100% identical` tanpa inspeksi dan review; targetnya satu identitas visual yang kredibel.

## 8. Akses dan performa

- Pertahankan sistem instancing/area culling dari repo jika tersedia.
- Aktifkan hanya objek interaktif aktif dan mesh di radius relevan; animasi semut/serigala dibatasi jumlahnya.
- Material/texture atlas reuse; hindari duplikasi geometry pada ribuan props.
- Semua poin interaksi harus dapat diakses mobil dan dilengkapi safe-stop/collider.
- Kualitas low/high bersifat opsional; catat hasil FPS pada perangkat real.

## 9. Acceptance visual

**Pass** jika user dapat mengendarai mobil dari Main World ke Cloud/ACO/GWO tanpa perubahan style yang mengganggu, UI/papan masih terbaca, mesh tidak melayang/menembus tanah, tidak ada glitch, dan reviewer dapat menunjukkan kesamaan aset/material berdasarkan audit.

**Fail** jika area terlihat seperti game sci-fi/asset store yang ditempel, collider tidak sesuai bentuk, perspektif/scale tidak masuk akal, atau zona dianggap sama hanya karena sama-sama 'low-poly'.