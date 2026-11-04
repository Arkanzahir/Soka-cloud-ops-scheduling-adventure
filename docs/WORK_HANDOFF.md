# WORK HANDOFF — ringkasan untuk sesi baru

## Proyek

**CLOUD OPS: Scheduling Adventure** adalah adaptasi game mobil 3D Bruno Simon Folio 2025 menjadi presentasi HTML interaktif untuk tugas **Demo Week 10 (SOKA)**. Algoritma: **ACO + GWO** untuk Cloud Task Scheduling; menampilkan paper, langkah algoritma, task→VM allocation, makespan, cost, utilization proxy, serta visualisasi code-based.

## Desain yang disepakati

- Menggunakan **source code & aset asli** Bruno (bukan remake visual dari screenshot).
- World original tetap. Ada 3 mini-zone *Cloud / ACO / GWO* dengan same visual language; Research/Results sebagai stasiun.
- Mobil tetap seperti Bruno dan playable di setiap area; `E` pada gate masuk zone, `E` pada station buka materi, `Esc` tutup; kompatibilitas `Enter` original perlu ditangani.
- Dua mode: **Explore** (bebas mengemudi) dan **Presentation** (urutan bab + teleport/Next/Previous).
- Simulasi JS murni dan visualisasi sinkron; tidak memakai animasi pseudo.
- GitHub Pages setelah build static lulus test; lisensi MIT & atribusi wajib.

## Sumber diverifikasi

- Source: https://github.com/brunosimon/folio-2025
- License: https://github.com/brunosimon/folio-2025/blob/main/license.md
- Paper GWO: https://doi.org/10.1016/j.ins.2025.121943 — **GWO_C/M variant**, bukan GWO standar.
- Paper ACO kiriman tim: https://www.dbpia.co.kr/journal/articleDetail?nodeId=NODE11826229 — **belum berhasil diverifikasi**.
- Alternatif ACO 2024: https://doi.org/10.5573/IEIESPC.2024.13.3.243
- GitHub Pages via Vite: https://vite.dev/guide/static-deploy

## Kondisi saat handoff

Dokumen desain telah disusun, tetapi **repo Bruno belum dikloning, belum ada audit material tingkat-file, belum ada aset baru, simulasi game, build, atau deploy** dalam paket ini. Jangan mengklaim sudah terimplementasi.

## Kerjakan pertama

Baca `MASTER_PROMPT.md`, lalu lakukan M0 (audit + run baseline original) saja. Setelah ada screenshot dan audit, pilih desain aset Cloud mini-world yang konkret sebagai vertical slice. Selanjutnya rujuk `IMPLEMENTATION_PLAN.md`.

## Pertanyaan yang perlu diputuskan kemudian (tidak menghalangi audit)

1. Paper ACO DBpia benar-benar membahas CTS atau perlu pakai alternatif terverifikasi?
2. Dosen mengizinkan adaptasi source code open-source dengan atribusi?
3. Apakah tim perlu mereplikasi GWO_C/M atau cukup GWO baseline dengan paper sebagai pembanding/rujukan?
4. Batas waktu presentasi, device/browser target, dan default dataset final?

Gunakan jawaban default minimal: desktop browser 16:9; demo berurutan tetapi zone bisa lompat; baseline ACO dan GWO; dataset 8 tasks/3 VMs contoh; jangan memalsukan paper.