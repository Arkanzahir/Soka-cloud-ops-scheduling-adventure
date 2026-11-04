# Panduan Presentasi Kelompok — Cloud Ops

**Status:** contoh alur latihan; bukan laporan demo yang sudah berjalan. Durasi sekitar **8–12 menit** hanya usulan.

## Cara menggunakan game sebagai pengganti PPT

Terdapat **Explore Mode** (bebas berkendara) dan **Presentation Mode** (tombol Next/Previous, perpindahan ke checkpoint, progres bab). Saat presentasi, pakai Presentation Mode agar tidak membuang waktu berkendara atau terjebak rintangan. Mobil tetap menjadi cara menarik untuk memperkenalkan tiap zona.

| Urutan | Lokasi | Inti penjelasan | Yang diperagakan |
|---|---|---|---|
| 1 | Main World | Tujuan game, masalah CTS, algoritma ACO + GWO | Mobil dan peta |
| 2 | Cloud Zone | Task, VM, MI, MIPS, waktu eksekusi dan makespan | Alokasi Round Robin dan load |
| 3 | ACO Zone | Probabilitas pemilihan VM, feromon, evaporasi, deposit | Step satu task; Run iterasi dan grafik |
| 4 | GWO Zone | Kandidat solusi, alpha, beta, delta, update posisi | Tampilkan kandidat dan mapping ke VM |
| 5 | Results | Makespan, cost, utilization proxy dan fairness eksperimen | Perbandingan dataset identik |
| 6 | Research | Paper, status baseline vs varian, kesimpulan | Buka DOI dan temuan relevan |

## Narasi penjelasan singkat

**Cloud:** “Setiap task memiliki panjang pekerjaan dalam MI, dan setiap VM memiliki kemampuan MIPS. Dengan model sederhana ini, execution time diperoleh dari MI/MIPS. Makespan adalah VM yang paling akhir menyelesaikan kumpulan task-nya.”

**ACO:** “Semut virtual menyusun kandidat pemetaan task ke VM. Peluang memilih VM bergantung pada feromon dan informasi heuristik. Setelah hasil dievaluasi, feromon diperbarui dan penjadwalan terbaik dilacak.”

**GWO:** “Setiap serigala adalah satu kandidat solusi, bukan satu task. Alpha, beta, dan delta mewakili kandidat terbaik. Proses update memperbaiki kandidat, lalu nilai kontinu diubah menjadi pilihan VM diskret dan dihitung makespan-nya.”

**Results:** “Kedua algoritma memakai input dan metrik yang sama. Jika hasil berbeda, kita tidak langsung menyimpulkan ada algoritma yang selalu lebih baik; eksperimen beberapa seed diperlukan.”

**Papers:** “Paper menunjukkan penelitian yang menjadi rujukan. Implementasi pendidikan kami memakai baseline kecuali varian paper memang sudah direplikasi dengan tepat.”

## Pertanyaan yang mungkin ditanyakan dosen

**Apakah animasi algoritma benar-benar dihitung?** Tunjukkan log trace setiap iterasi, assignment, dan kode evaluator.

**Mengapa bukan CloudSim?** Karena ini model scheduling mandiri di browser dengan asumsi tertulis, bukan simulasi infrastruktur cloud lengkap.

**Mengapa GWO 2025 paper-nya pakai C/M tetapi kodenya baseline?** Jelaskan bahwa paper digunakan sebagai konteks riset, sedangkan kode baseline untuk visualisasi cara kerja; jangan klaim keduanya identik.

**Bagaimana memastikan evaluasi adil?** Dataset sama, fitness sama, anggaran evaluasi dan seed yang dicatat.

**Siapa membuat fondasi world?** Adaptasi proyek open-source dengan atribusi yang sesuai; kontribusi kelompok mencakup learning zones, engine algoritma, presentasi dan eksperimen yang selesai dibangun.

## Checklist latihan

- [ ] Tiap anggota tahu perbedaan task, VM, MI/MIPS, makespan.
- [ ] Alokasi task dan hasil metrik berasal dari JavaScript.
- [ ] Panel Step/Run/Reset bekerja untuk kedua algoritma.
- [ ] Tombol E/Enter, Esc, Next/Previous, dan reset kendaraan berfungsi.
- [ ] Presentasi bisa berjalan bahkan jika mengemudi terlalu lama: fitur teleport/skip.
- [ ] Grafik dapat dibaca melalui proyektor.
- [ ] Video cadangan demo siap jika browser/perangkat gagal.
