# Memory — Flowly

Folder ini menyimpan konteks penting, keputusan desain, dan rencana
yang belum diimplementasi. Selalu dibaca di awal task dan di-update saat
ada temuan/keputusan baru.

## Index
- `filter-plan.md` — audit kondisi filter saat ini + rekomendasi filter per halaman (belum diimplementasi).

## Keputusan/diskusi yang masih terbuka
- **Riwayat setoran savings goal**: saat ini hanya simpan `currentAmount` kumulatif,
  belum ada riwayat per setoran. Butuh skema backend baru jika ingin riwayat.

## Keputusan yang sudah diambil
- **Savings goal "Tercapai"**: default filter "Aktif" — goal selesai tidak tampil di default view, user bisa pilih chip "Tercapai" untuk melihat arsip. Selesai diimplementasi.

## Catatan arsitektur singkat
- Monorepo: `apps/web` (Next.js 16 App Router, Tailwind v4) + `apps/api` (NestJS 11 + Prisma 6).
- Web port 4000, API port 3333 (`/api/v1`).
- Bahasa UI: Indonesia.
- Tambah transaksi & setoran pakai pola single-modal multi-step (picker/form/confirm
  sebagai step di dalam satu `Modal`), JANGAN render `ConfirmModal` nested di dalam `Modal`
  (menyebabkan dua modal bertabrakan).
