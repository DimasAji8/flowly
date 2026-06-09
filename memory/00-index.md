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
- **Menu navigasi**: QuickActions grid di dashboard (5 icon: Tabungan, Kategori, Berulang, Alokasi, Laporan), Profil = akun+tema+logout. Selesai.
- **Dompet**: hanya ada di Bottom Navigation, tidak ada di Quick Actions (menghindari duplikasi). Selesai.
- **Dashboard**: SummaryCards + toggle sembunyikan saldo (default: tertutup, persistent via localStorage), QuickActions, tanpa SpendingInsights. Button "Analisis pengeluaran" dihapus (duplikasi dengan Laporan di Quick Actions). Target tabungan filter: hanya tampilkan yang tidak di-pause dan belum tercapai. Selesai.
- **Branding**: aplikasi bernama "Teman Kas" dengan tagline "Sahabat Pengelola Keuanganmu". Selesai.
- **Halaman Laporan** (`/reports`): menampilkan ringkasan income/expense/net bulan + tabel pengeluaran per kategori (sorted terbesar). SpendingInsights tetap ada. Selesai.
- **Quick Actions icons**: light mode = `text-accent` (biru), dark mode = `text-secondary` (muted). Selesai.
- **Filter**: semua halaman list pakai komponen `FilterBar` (popover + draft state + tombol Terapkan). Reset langsung apply tanpa Terapkan.
- **Dark mode**: icon QuickActions pakai `bg-card-subtle text-secondary` agar tidak biru di dark mode.
- **Theme**: tidak pakai `next-themes`, custom `useTheme` hook + script inline di `<head>`.
- **Hydration fix**: greeting dan date initialization dipindah ke useEffect untuk menghindari SSR/client mismatch. Selesai.
- **Emoji kategori**: background netral (bg-card-subtle), ukuran lebih besar (size-10, text-xl), emoji picker dengan 300+ emoji terorganisir dalam 10 kategori. Terintegrasi di form tambah dan edit kategori. Selesai.
- **Warna kategori**: fitur pemilihan warna dihapus dari form kategori (tidak digunakan secara visual, emoji sudah cukup sebagai identifier). Field color di service dijadikan optional. Selesai.
- **Responsive breakpoint untuk tambah transaksi**: Tablet (< 1024px) menggunakan behaviour mobile dengan BottomNav + FAB tengah. Desktop (≥ 1024px) menggunakan FAB kanan bawah. Breakpoint diubah dari `md` (768px) ke `lg` (1024px) karena tablet lebih cocok dengan pola interaksi touchscreen mobile. Berlaku untuk: SideNav, BottomNav, AppShell, Modal, BackButton, dan halaman Transactions. Selesai.

## Keputusan/diskusi yang masih terbuka
- **Riwayat setoran savings goal**: butuh skema backend baru.
- **Halaman Laporan**: perlu dikembangkan — ringkasan income/expense, tabel pengeluaran per kategori, tren bulanan.

## Catatan arsitektur singkat
- Monorepo: `apps/web` (Next.js 16 App Router, Tailwind v4) + `apps/api` (NestJS 11 + Prisma 6).
- Web port 4000, API port 3333 (`/api/v1`).
- Bahasa UI: Indonesia.
- Modal bertingkat: gunakan step/state di dalam satu `Modal`, JANGAN nest `ConfirmModal` di dalam `Modal`.
- Filter: selalu gunakan `FilterBar` dari `filter-bar.tsx`.
