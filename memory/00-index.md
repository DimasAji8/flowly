# Memory — Flowly

Folder ini menyimpan konteks penting, keputusan desain, dan rencana
yang belum diimplementasi. Selalu dibaca di awal task dan di-update saat
ada temuan/keputusan baru.

## Index
- `filter-plan.md` — audit kondisi filter saat ini + rekomendasi filter per halaman (SUDAH diimplementasi).
- `navigation-menu-plan.md` — analisis penempatan menu (menu inti di Profil → usul Quick Actions grid di dashboard). Proposal, belum diimplementasi.
- `dashboard-redesign-plan.md` — opsi redesign dashboard (3 opsi, rekomendasi Opsi 2 Hero Balance + Quick Actions). Proposal, belum diimplementasi.

## Keputusan/diskusi yang masih terbuka
- **Riwayat setoran savings goal**: saat ini hanya simpan `currentAmount` kumulatif,
  belum ada riwayat per setoran. Butuh skema backend baru jika ingin riwayat.
- **Penempatan menu navigasi**: **SELESAI (langkah 1)**. QuickActions grid di dashboard sudah dibuat, Profil sudah dibersihkan (akun + tema + logout saja), SideNav desktop sudah memuat semua menu. Langkah selanjutnya: redesign HeroBalance.
- **Redesign dashboard**: 3 opsi di dashboard-redesign-plan.md, rekomendasi Opsi 2 (Hero Balance + Quick Actions). Menunggu keputusan.

## Keputusan yang sudah diambil
- **Savings goal "Tercapai"**: default filter "Aktif" — goal selesai tidak tampil di default view, user bisa pilih chip "Tercapai" untuk melihat arsip. Selesai diimplementasi.

## Catatan arsitektur singkat
- Monorepo: `apps/web` (Next.js 16 App Router, Tailwind v4) + `apps/api` (NestJS 11 + Prisma 6).
- Web port 4000, API port 3333 (`/api/v1`).
- Bahasa UI: Indonesia.
- Tambah transaksi & setoran pakai pola single-modal multi-step (picker/form/confirm
  sebagai step di dalam satu `Modal`), JANGAN render `ConfirmModal` nested di dalam `Modal`
  (menyebabkan dua modal bertabrakan).
