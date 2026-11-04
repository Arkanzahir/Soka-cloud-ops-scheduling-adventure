# GAME DESIGN DOCUMENT (GDD)

## 1. Pitch

**Cloud Ops: Scheduling Adventure** — pengalaman mengendarai mobil 3D ala Bruno Simon untuk mempelajari dan mencoba metode optimasi alokasi task ke VM. Nuansa permainan tetap seperti world Bruno asli; zona edukasi tidak boleh tampak seperti dunia cyberpunk atau game lain.

## 2. Fantasi pemain dan loop utama

Pemain adalah cloud optimization engineer yang mengendarai mobil kecil mengunjungi instalasi pembelajaran, melihat kondisi scheduling, mencoba ACO/GWO, dan membandingkan hasilnya.

**Loop:** Drive → arrive → `E` enter zone → drive around installations → `E` learn/simulate → exit with `Esc` → return Main World → next station.

**Bukan** permainan balapan dengan kompetisi, level kesulitan, atau loot. Driving adalah navigasi interaktif yang membantu presentasi, bukan pengganti penjelasan algoritma.

## 3. Topologi world — keputusan desain

Gunakan **satu game, satu kendaraan, dan satu sistem rendering/fisika**. World dapat dipecah secara spatial atau scene streaming; Work memilih setelah memeriksa struktur repo. Prioritas adalah konsistensi lighting/material dan meminimalkan loading/perpindahan state.

```
       [Main World — Bruno original]
             |   |   |
       [Cloud] [ACO] [GWO]
             \   |   /
             [Results / Research Station]
```

- **Main World:** dipertahankan, hanya diberi signage/checkpoint secukupnya.
- **Cloud Zone:** *outdoor cloud worksite*: jalan, rumput, server diorama, task cubes, VM pedestals. Tidak membangun gedung sci-fi menyala.
- **ACO Zone:** *ant research park*: sarang semut, jalur cabang, node task/VM, papan sederhana. Ants adalah indikator alokasi, bukan pengganti perhitungan.
- **GWO Zone:** *wolf exploration grove*: hutan kecil, area lapang, patung/model kawanan serigala; alpha/beta/delta diidentifikasi tanpa mengklaim hewan virtual mengerjakan rumus.
- **Results / Paper:** pos penelitian yang tetap menyatu dengan world, tanpa perlu mini-world keempat; dapat juga diakses melalui navigasi presentasi.

### Visual cue (bukan tema warna baru)
Cloud: objek server. ACO: jalur semut. GWO: figur serigala. Semua memakai material dan pencahayaan yang kompatibel dengan yang asli.

## 4. Aturan kendaraan dan kontrol

- Kendaraan dan kamera mengikuti sistem original; jangan rewrite sebelum audit.
- Kontrol dasar bergerak W/A/S/D atau arrows; `Shift` boost; `Space` jump bila tersedia.
- **Perhatikan:** website Bruno original menggunakan `Enter` untuk Interact. Kita mengusulkan `E`; tambahkan sebagai alias atau konfigurasi tanpa menghilangkan Enter sebelum memastikan konflik tombol.
- `E/Enter` pada gerbang: transport ke zona tujuan.
- `E/Enter` di stasiun: membuka overlay materi dan simulator.
- `Esc`: menutup overlay, bukan mengeluarkan dari mini-world secara mendadak.
- `M`: map/quick section list jika tidak berkonflik dengan kode original.
- `R`: reset mobil ke spawn aman terdekat.

### State machine

```
DRIVING_MAIN ──(E at gate)──> TRANSITION ──> DRIVING_ZONE
DRIVING_ZONE ──(E at station)──> LEARNING_UI
LEARNING_UI ──(Esc/Close)──> DRIVING_ZONE
DRIVING_ZONE ──(E at exit)──> TRANSITION ──> DRIVING_MAIN
ANY_DRIVING ──(Presentation Next)──> CAMERA_TRANSITION ──> RELEVANT_CHECKPOINT
```

Perpindahan kendaraan:
1. Hindari teleport saat berada di udara/bertabrakan; opsional minta kendaraan melambat.
2. Disable input kendaraan dan collision sementara selama transisi.
3. Simpan posisi kembali (return location) dan zona asal.
4. Teleport chassis ke spawn zone yang valid + orientasi jalan, reset linear/angular velocities.
5. Update camera target, physics state, zone collisions/assets dan HUD; re-enable kontrol.
6. Tampilkan label zona 1–2 detik dan minimap/exit point; jangan membuat pemain kehilangan orientasi.
7. Bila terjadi fail, aktifkan safe respawn.

## 5. Desain zona lebih rinci

### Cloud Zone — Teaching the problem
- Papan: `CLOUD TASK SCHEDULING`.
- Objek 3D: kumpulan 8–12 task bernomor T1..Tn, 3 VM berbeda kapasitas; petunjuk lama eksekusi.
- Interaksi: baseline Round Robin, hasil makespan dan perubahan beban tiap VM.
- Pemain memahami bahwa task lebih besar memerlukan waktu lebih lama dan VM punya kecepatan berbeda.
- Zona bukan interior terpisah; mobil bisa mengitarinya untuk sudut pandang 3D.

### ACO Zone — Building assignments with pheromones
- Jalur ACO tidak sekadar jalan terpendek; setiap langkah visualisasi memilih **VM untuk task i**.
- Stasiun Step: `task i → pilihan VM → probabilitas → semut memilih → partial assignment`.
- Pada akhir satu ant: jadwal, makespan, kualitas.
- Pada akhir iterasi: evaporation, deposit pheromone, global best, grafik.
- Warna/node highlight hanya menjelaskan status; nilai asli juga selalu tertulis.

### GWO Zone — Population candidate search
- Serigala = satu kandidat vektor penjadwalan, bukan satu task atau satu VM.
- Tiga pemimpin alpha, beta, delta diberi label dengan fitness terkini.
- Langkah simulasi: kandidat continuous → decode ke VM → evaluate makespan → update leaders → update vector → evaluate.
- Animasi serigala menggambarkan ranking/iterasi, sedangkan representasi sebenarnya terlihat di panel.
- Hindari gerakan serigala menuju satu lokasi yang mengesankan algoritma mencari jarak fisik minimun.

### Results / Research Station
- Perbandingan membuat dataset sama, seed terlapor, iterasi/populasi ditampilkan.
- Grafik: per iterasi best-so-far (makespan), tabel mapping T→VM, load VM.
- Cost dan utilization sebagai metrik sekunder; rumus dan asumsi ditampilkan.
- Paper: sumber, judul, tahun, ringkasan metode, apa yang diimplementasikan vs tidak.

## 6. Dua mode user journey

### Explore Mode (free roam)
Tidak ada penguncian zona. Mobil bebas mengeksplorasi, menabrak objek yang aman, dan memilih zona urutan apapun. HUD minimal dengan mini map + prompt interaksi.

### Presentation Mode (untuk dosen)
Mirip PPT, tetapi kamera/world tetap live:

| Section | Visual utama | Apa yang dibicarakan | Interaksi |
|---|---|---|---|
| 1. Opening | Mobil di Main World | Judul, tujuan demo | Start |
| 2. Problem | Cloud Zone | CTS, task, VM, baseline | Step baseline |
| 3. ACO | ACO Zone | Semut, feromon, konstruksi solusi | Step/Run |
| 4. GWO | GWO Zone | Alpha-beta-delta dan update | Step/Run |
| 5. Comparison | Results Station | Makespan/cost/utilization | Change dataset & compare |
| 6. Paper/Conclusion | Research Station | Metodologi dan sumber | Open reference |

Shortcut `Next/Previous` memindahkan mobil ke checkpoint presentasi yang aman; presenter dapat memilih `Auto-camera` atau menyetir sendiri. Progress sections seperti slide. Tidak ada misi wajib yang bisa mengunci presenter.

## 7. UI behavior

- Saat mengemudi: HUD tipis, kontrol, minimap, judul checkpoint.
- Saat materi dibuka: kendaraan berhenti, kamera fokus obyek diorama, *overlay* terbaca; world tetap terlihat sebagai konteks.
- Simulasi: input panel (tasks/VM/seed/iterations), step inspector, chart, `Play/Pause/Reset`, `Back to car`.
- `Esc` selalu kembali ke state sebelumnya dengan aman.
- Indikator `LIVE CODE RESULT` bukan klaim runtime sampai benar terhubung dengan output engine.

## 8. Audio, performa, dan akses

Audio opsional/mute; jangan bergantung pada sound untuk menjelaskan. Perlu preset kualitas LOW/MED/HIGH dan camera speed; proyektor 16:9 menjadi target utama. Tambahkan pilihan tabel teks untuk visualisasi; jangan hanya mengandalkan gerak serigala atau warna feromon.

## 9. Kriteria desain berhasil

Seorang pemain yang mengenal Bruno tetap mengenali bahasa visual world asal; berpindah zona tidak terasa pindah game; presenter dapat berpindah bagian tanpa kehilangan mobil; dosen bisa menjelaskan satu iterasi ACO/GWO berdasarkan apa yang ditampilkan di layar.