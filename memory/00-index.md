# Memory — Flowly

Folder ini menyimpan konteks penting, keputusan desain, dan rencana
yang belum diimplementasi. Selalu dibaca di awal task dan di-update saat
ada temuan/keputusan baru.

## Index
- `filter-plan.md` — audit & implementasi filter (SELESAI).
- `navigation-menu-plan.md` — penempatan menu (SELESAI: QuickActions di dashboard, Profil dibersihkan).
- `dashboard-redesign-plan.md` — redesign dashboard (SELESAI: SummaryCards + toggle saldo, QuickActions, SpendingInsights dipindah ke /reports).
- `ui-components.md` — **WAJIB BACA** daftar komponen UI yang tersedia.
- `reports-plan.md` — rencana pengembangan halaman Laporan (SELESAI: ringkasan bulan + tabel kategori).

## Keputusan yang sudah diambil
- **Savings goal "Tercapai"**: default filter "Aktif". Selesai.
- **Menu navigasi**: QuickActions grid di dashboard (6 icon), Profil = akun+tema+logout. Selesai.
- **Dashboard**: SummaryCards + toggle sembunyikan saldo, QuickActions, tanpa SpendingInsights. Selesai.
- **Halaman Laporan** (`/reports`): menampilkan ringkasan income/expense/net bulan + tabel pengeluaran per kategori (sorted terbesar). SpendingInsights tetap ada. Selesai.
- **Quick Actions icons**: light mode = `text-accent` (biru), dark mode = `text-secondary` (muted). Selesai.
- **Filter**: semua halaman list pakai komponen `FilterBar` (popover + draft state + tombol Terapkan). Reset langsung apply tanpa Terapkan.
- **Dark mode**: icon QuickActions pakai `bg-card-subtle text-secondary` agar tidak biru di dark mode.
- **Theme**: tidak pakai `next-themes`, custom `useTheme` hook + script inline di `<head>`.

## Keputusan/diskusi yang masih terbuka
- **Riwayat setoran savings goal**: butuh skema backend baru.
- **Halaman Laporan**: perlu dikembangkan — ringkasan income/expense, tabel pengeluaran per kategori, tren bulanan.

## Catatan arsitektur singkat
- Monorepo: `apps/web` (Next.js 16 App Router, Tailwind v4) + `apps/api` (NestJS 11 + Prisma 6).
- Web port 4000, API port 3333 (`/api/v1`).
- Bahasa UI: Indonesia.
- Modal bertingkat: gunakan step/state di dalam satu `Modal`, JANGAN nest `ConfirmModal` di dalam `Modal`.
- Filter: selalu gunakan `FilterBar` dari `filter-bar.tsx`.
