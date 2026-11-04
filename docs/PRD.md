# PRODUCT REQUIREMENTS DOCUMENT (PRD)

## 0. Identitas

- Produk: **CLOUD OPS — Scheduling Adventure**
- Bentuk: game 3D browser sebagai presentasi HTML interaktif.
- Konteks: SOKA / Demo Week 10.
- Tema ilmiah: Cloud Task Scheduling dengan ACO dan GWO.
- Basis pengembangan: adaptasi Bruno Simon Folio 2025 (bukan rekreasi berdasar screenshot).
- Status dokumen: spesifikasi awal, menunggu audit teknis dan konfirmasi paper.

## 1. Masalah dan tujuan

Presentasi konvensional sulit memperlihatkan bagaimana algoritma metaheuristik mengubah *candidate schedule* selama iterasi. Produk ini menggabungkan eksplorasi mobil 3D dan demonstrasi kode agar mahasiswa dan dosen dapat melihat hubungan antara **input task dan VM → pencarian ACO/GWO → alokasi tugas → makespan dan metrik hasil**.

Tujuan utama:
1. Memenuhi butir tugas: dua algoritma metaheuristik, paper, cara kerja *step by step*, studi kasus CTS, metrik, presentasi HTML interaktif, dan visualisasi berbasis kode.
2. Mempertahankan identitas visual dan driving feel Bruno yang bersumber dari proyek asli.
3. Mendukung presentasi terarah tanpa navigasi mobil yang menghambat waktu.
4. Menjalankan ACO/GWO sesungguhnya di browser, hasil dapat direproduksi dan diverifikasi.
5. Dapat diakses via GitHub Pages tanpa server wajib.

## 2. Pemangku kepentingan & kebutuhan

| Pihak | Kebutuhan |
|---|---|
| Presenter | Pergantian materi cepat, tidak tersangkut, mudah menjelaskan kode. |
| Dosen/penonton | Lihat sumber paper, tahapan algoritma dan hasil numerik nyata. |
| Pengguna yang mencoba | Kontrol mobil jelas, bisa reset, pilihan eksplorasi bebas. |
| Tim pengembang | Modular, terdokumentasi, bisa diuji, minim regresi pada game Bruno. |

## 3. Instruksi dosen: apa yang terkonfirmasi?

**Didukung foto papan dan catatan pengguna:**
- Kelompok membahas **dua algoritma metaheuristik**: ACO dan GWO.
- Ada **referensi/riset paper**.
- Jelaskan **cara kerja langkah demi langkah**.
- Ada **studi kasus Cloud Task Scheduling (CTS)**: task → algoritma → solusi.
- Metrik ditulis di papan: **makespan, cost, resource utilization**.
- Presentasi dalam **HTML**, **interaktif**, **visualisasi by code**, dan **GitHub Pages**.
- Demo Week 10 menekankan visualisasi yang membuat audiens memahami cara kerja.

**Keputusan desain tim, bukan instruksi eksplisit dosen:** mobil, world Bruno, tiga mini-world, portal `E`, slide navigation, dan skenario 8–12 task.

## 4. Cakupan MVP wajib

### P0: Akademik
- [ ] Penjelasan cloud task scheduling, task length (MI), VM speed (MIPS), dan asumsi.
- [ ] Algoritma ACO dan GWO dieksekusi di JavaScript, dapat diuji secara terpisah dari 3D.
- [ ] Solusi berupa array `assignment[taskIndex] = vmIndex` dan metrik numerik terdefinisi.
- [ ] Visualisasi per langkah/iterasi **menggunakan log algoritma**, bukan animasi rekayasa.
- [ ] Input dapat diubah; contoh dataset reproducible menggunakan seed.
- [ ] Kedua algoritma dibandingkan dengan dataset, mesin, anggaran iterasi, dan seed yang dilaporkan.
- [ ] Paper ACO/GWO disertakan; metode implementasi diberi label *baseline* atau varian dengan jujur.
- [ ] Setiap metrik mempunyai rumus, satuan, dan asumsi.

### P0: Presentasi dan game
- [ ] Mobil dapat bergerak, berhenti, dan kamera mengikuti seperti baseline original.
- [ ] Main World masih berfungsi; ada checkpoint Cloud/ACO/GWO dan stasiun hasil/paper.
- [ ] `E` berinteraksi sesuai konteks dan tidak berbenturan dengan kontrol Bruno yang sudah ada.
- [ ] Transisi kamera/teleport tidak menyebabkan mobil jatuh/terjepit atau physics meledak.
- [ ] Mode presentasi: *Opening → CTS → ACO → GWO → eksperimen → paper/kesimpulan*; tombol Next/Previous/teleport.
- [ ] Panel simulasi bisa dibuka/tutup tanpa kehilangan progress.
- [ ] Build statis berjalan di GitHub Pages dan semua aset berhasil dimuat.

### P1: Kualitas visual dan aksesibilitas
- [ ] Material, lighting, terrain, vegetasi, skala, objek baru konsisten dengan Bruno.
- [ ] Papan dan panel terbaca pada proyektor; pengaturan audio, kualitas grafis, sensitivitas.
- [ ] Kontrol mouse/keyboard, petunjuk jelas, tombol `Reset Car` dan `Skip to Section`.
- [ ] Grafik konvergensi dan hasil dapat dibaca sebagai tabel, tidak hanya warna.

### P2: Opsional jika waktu memungkinkan
- [ ] Multiple preset study case; ekspor CSV hasil; benchmark beberapa seed.
- [ ] Detail ambient audio, camera cinematics, hidden objects dan mini quiz.
- [ ] Mobile controls sederhana, **hanya jika** tidak mengganggu tujuan desktop.

## 5. Di luar lingkup awal

- Multiplayer, login, leaderboard online, akun, database, backend.
- Simulasi CloudSim penuh; implementasi ini **model diskret sederhana** di browser dengan asumsi eksplisit.
- 3D world identik 100% tanpa pekerjaan audit aset.
- Rekonstruksi semua fitur server Bruno (termasuk pesan publik/score online).
- Evaluasi ilmiah skala riset yang mengklaim setara hasil paper.

## 6. User stories

- Sebagai presenter, saya dapat lompat ke ACO tanpa harus berkendara berlama-lama.
- Sebagai penonton, saya bisa melihat task dialokasikan ke VM dan alasan makespan berubah.
- Sebagai penonton, saya bisa membedakan prinsip semut/feromon dengan pemimpin alpha-beta-delta.
- Sebagai pengguna, saya bisa mengubah jumlah task, jumlah VM, iterasi, lalu menjalankan simulasi.
- Sebagai penguji, saya bisa menekan Step/Pause/Reset dan memeriksa hasil numerik.
- Sebagai dosen, saya bisa membuka paper dan melihat dengan jelas apa yang benar-benar diimplementasikan.

## 7. Acceptance criteria yang terukur

**AC-01** Repo original berjalan lokal dan screenshot/video baseline terdokumentasi.  
**AC-02** Satu Cloud Zone memiliki visual konsisten dengan baseline, jalan dan collision berfungsi.  
**AC-03** `E` di gerbang mengalihkan mobil ke checkpoint zona; setelah berpindah, kendaraan tidak memiliki kecepatan/spin tak wajar.  
**AC-04** `E` di learning station menghentikan input kendaraan; `Esc` mengembalikan kamera/kontrol ke keadaan tepat.  
**AC-05** `schedule` mencakup seluruh task tepat sekali, memilih VM valid, makespan = `max(vmLoad)`.  
**AC-06** Uji deterministik dengan seed sama dan konfigurasi sama menghasilkan hasil identik pada build yang sama.  
**AC-07** Log langkah ACO menampilkan pemilihan VM, probabilitas/feromon, dan best-so-far; GWO menampilkan kandidat, alpha/beta/delta, dan pembaruan posisi/diskretisasi.  
**AC-08** Perbandingan kedua algoritma memakai model komputasi dan dataset yang sama; jika memakai dua seed berbeda, keduanya diungkapkan.  
**AC-09** Grafik terhubung ke output fungsi asli, tidak ada angka perbandingan yang di-hardcode.  
**AC-10** Presentation Mode bisa diselesaikan tanpa mengemudi: tombol Previous/Next, jump, escape tersedia.  
**AC-11** Build produksi dilayani di subpath GitHub Pages dan halaman/tekstur/GLB tidak 404.  
**AC-12** `LICENSE` asli dan kredit Bruno/aset pihak ketiga terpelihara; penggunaan open-source dijelaskan jujur.  
**AC-13** Hasil pengujian FPS/load dicatat sesuai perangkat penguji; jangan menjanjikan FPS tanpa benchmark.

## 8. Risiko utama dan mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Asset baru tidak menyatu | World terasa campuran | Audit style + render pembanding, reuse pipeline palette/material asli |
| Clone terlalu kompleks | Deadline terganggu | Vertical slice Cloud lebih dulu, jangan 3 zona sekaligus |
| Paper bukan algoritma standar | Salah klaim metodologi | Label baseline/varian, periksa metode & formula di paper |
| Kendaraan crash saat teleport | Demo gagal | Reset velocity/angular velocity, grounded spawn, collider test |
| Simulasi lambat | FPS turun | Pisah logic dari renderer, batasi ukuran/iterasi, Web Worker jika sesuai |
| GitHub Pages asset 404 | Game gagal online | Vite `base`, relative asset url, E2E deploy test |
| Aturan orisinalitas dosen | Nilai/etik | Tampilkan atribusi, kontribusi kelompok, minta izin bila perlu |

## 9. Definition of Done

Demo bisa dipresentasikan dari opening hingga kesimpulan, ACO/GWO menghasilkan dan memvisualisasikan data numerik valid, tiga zona tidak berbeda gaya secara mencolok, produksi dapat dimainkan lewat URL GitHub Pages, dan dokumentasi/atribusi tersedia. Semua klaim tersebut harus dibuktikan lewat pengujian; dokumen ini sendiri bukan bukti implementasi.