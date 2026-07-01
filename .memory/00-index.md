# 📋 Memory Index — Flowly (Teman Kas)

> **File ini adalah SATU-SATUNYA file yang WAJIB dibaca AI agent di awal task.**
> File ini berfungsi sebagai peta navigasi: memahami proyek, mengarahkan ke file
> yang tepat, dan menunjukkan apa yang perlu dikerjakan selanjutnya.
>
> **Aturan kerja:**
> 1. Baca file ini sepenuhnya (anda sedang membacanya sekarang).
> 2. Berdasarkan domain task, baca file spesifik yang diarahkan di bawah.
> 3. Setelah selesai task → update file `.memory/` yang relevan jika ada
>    keputusan baru, pola baru, atau perubahan implementasi.
>
> Folder canonical: `.memory/` (dengan titik). Folder `memory/` lama sudah dihapus.

---

## 🏠 Tentang Proyek

**Flowly** (brand landing: **Teman Kas**) — aplikasi catatan keuangan pribadi
mobile-first. Tujuan: catat transaksi < 5 detik, usable one-handed, terasa
calm & personal (bukan ERP/dashboard analytics).

- **Stack**: Next.js 16 (web, port 4000) + NestJS 11 + Prisma 6 + PostgreSQL 16 (api, port 3333)
- **Monorepo**: npm workspaces — `apps/web/` + `apps/api/`
- **Multi-tenancy**: semua data scoped `workspace_id`, enforced via `WorkspaceGuard`
- **Bahasa UI**: Indonesia
- **Deploy**: VPS Ubuntu, Nginx + systemd, domain `temankas.com`

---

## 🗂️ File Guide — Baca File Mana Berdasarkan Task

### SELALU BACA (untuk semua task frontend)

| File | Isi | Kapan baca |
|------|-----|------------|
| **`ui-components.md`** | Daftar komponen UI yang tersedia + aturan pakai | **WAJIB** untuk semua task UI/frontend |
| **`ui-ux.md`** | Filosofi desain, warna, tipografi, layout, aturan landing | **WAJIB** untuk semua task UI/frontend |

### BACA SESUAI DOMAIN

| File | Isi | Kapan baca |
|------|-----|------------|
| **`project-context.md`** | Ringkasan produk, goals, business rules, fitur utama | Task baru / butuh konteks produk |
| **`architecture.md`** | Struktur monorepo, tech stack, pola arsitektur, design patterns | Task backend/architecture, setup environment |
| **`database.md`** | Skema Prisma, model, relasi, constraints, indexes | Task yang melibatkan schema/model/relasi data |
| **`api.md`** | Konvensi REST, auth flow, workspace scoping, endpoint list | Task backend API, integrasi frontend-backend |
| **`decisions.md`** | Keputusan arsitektural + alasannya | Butuh konteks kenapa sesuatu diputuskan begini |
| **`deployment.md`** | Konfigurasi deploy, VPS info, CI/CD, provisioning | Task deploy, DevOps, server config |

### BACA UNTUK TASK SPESIFIK

| File | Isi | Kapan baca |
|------|-----|------------|
| **`developer-ui-plan.md`** | Rencana revamp halaman developer (table + pagination) | Task di halaman **`/developer/*`** |
| **`landing-improvement-plan.md`** | Rencana improvement landing page (SELESAI ✅) | Task di halaman **landing** |
| **`seo-setup.md`** | Implementasi SEO (SELESAI ✅) | Task SEO, metadata, structured data |
| **`ai-features-plan.md`** | Rencana detail fitur AI lanjutan (Receipt OCR & Insights) | Task AI Scanner dan Proactive Insights |
| **`whatsapp-integration-plan.md`** | Rencana integrasi WhatsApp bot gratis berbasis Baileys | Rencana fitur integrasi WhatsApp |

---

## 🎯 Backlog — Yang Perlu Dikerjakan

### ⏳ Aktif (belum selesai)

1. **Riwayat setoran savings goal** — butuh skema backend baru (tabel kontribusi)
   → Baca: `database.md` + `api.md`
2. **Integrasi WhatsApp** — integrasi bot WhatsApp gratis & ringan menggunakan Baileys
   → Baca: `whatsapp-integration-plan.md`

### ✅ Selesai (referensi saja, jangan kerja ulang)

- Dashboard Fase 2 (Immersive header, floating balance card, toggle assets/monthly)
- Wallet balance adjustment (Sesuaikan saldo dompet melalui ActionMenu dengan penyesuaian otomatis di background)
- Ganti Password dalam app (UI di Profil + backend endpoint POST /auth/change-password)
- AI Receipt Scanner & Proactive Insights (Scan struk belanja & analisis pengeluaran AI proaktif di Dashboard)
- Integrasi AI Frontend & Backend (Kolom input cepat AI untuk memicu parser AI)
- Onboarding Tour (Dashboard, Wallet, Calendar pages dengan Driver.js & fix bug klik menu)
- AI Transaction Parser Backend (Modul NestJS terintegrasi Google Gemini 2.5 Flash API untuk parsing teks natural)
- Landing page improvement (FAQ, savings, capability grid, review carousel)
- SEO setup (metadata, sitemap, structured data, Google Search Console)
- Dashboard fase 1 (SummaryCards, QuickActions, SpendingInsights → Reports)
- Developer dashboard + table refactor (DataTable + pagination)
- Filter, navigasi/menu, laporan fase 1
- Deployment (VPS, Nginx, systemd, CI/CD, SSL)
- **Stale data fix** — semua halaman auto-refresh setelah mutasi via custom event `flowly:transaction-added` (15 file, 7 dispatchers + 8 listeners)

---

## ⚠️ Aturan Kritis (JANGAN LANGGAR)

### Komponen UI
- **Button**: pakai `Button` dari `button.tsx` (variant: primary/secondary/ghost/danger), **BUKAN** shadcn Button
- **Input**: pakai `Input` dari `input.tsx` (punya label/adornment), **BUKAN** shadcn Input
- **Select**: pakai `Select` dari `select.tsx`, **BUKAN** `<select>` HTML native
- **Modal**: step/state di satu `Modal`, **JANGAN** nest `ConfirmModal` di dalam `Modal`
- **Filter**: pakai `FilterBar` (`filter-bar.tsx`) untuk semua filter di halaman list
- **JANGAN jalankan `npx shadcn add`** — bisa menimpa `button.tsx`/`input.tsx` yang sudah dikustomisasi

### Desain
- **Calm UI** — hindari gradient besar, glow/neon, shadow tebal, terlalu banyak ikon
- **Income hijau** (`#15803D`), **expense merah** (`#B91C1C`) — aturan warna tetap
- **Breakpoint**: `lg` (1024px) — tablet pakai pola mobile (BottomNav + FAB tengah)
- **Currency**: format Rupiah dengan `.` separator, `inputMode="numeric"`, adornment `Rp`
- **Font**: Urbanist (semua halaman), hero weight 800

### Branding
- Landing page: **"Teman Kas"**
- Auth/metadata: **"Flowly"**
- Logo aset: `/public/svg/logo-dark.svg`, `/public/img/logo-text-blue.webp`

### Backend
- Semua query **WAJIB** filter by `workspace_id`
- Money: `Decimal(18,2)`, jangan float
- Wallet balance: update incrementally (jangan on-the-fly summation)
- Recurring job: idempotent, process in UTC

---

## 📌 Keputusan Aktif (Ringkas)

| Keputusan | Detail |
|-----------|--------|
| Modal pattern | Step/state di satu `Modal`, bukan nest |
| Filter pattern | `FilterBar` — popover + draft + Terapkan/Reset |
| Select pattern | `Select` dari `select.tsx`, bukan native |
| Theme | Custom `useTheme` hook + script inline di `<head>` |
| QuickActions icon | `bg-card-subtle text-secondary border-border-subtle` (adaptive) |
| Breakpoint | `lg` (1024px) — tablet = mobile pattern |
| Category color | Dihapus dari form (emoji cukup), default `#6E6E73` |
| Hero tab toggle | Pill "Total Aset" / "Sisa Bulan" di hero card, localStorage `teman-kas.hero-tab` |
| Review/Carousel | Embla-based `Carousel` shadcn + `carousel-ui.css` |
| Tarik Tunai | Transfer ke dompet Tunai, reuse `POST /transfers`, `WithdrawalModal` |
| Bahasa UI | Indonesia |
| SSL API | `api.temankas.com` — Certbot (reinstall existing cert, tambah domain). **Jangan hardcode** SSL blok di config repo |
| AI Rate Limiting | Custom User-ID ThrottlerGuard, limit parse (20/m), scan (10/m), insights (5/m) |
| AI Camera Compression | Client-side Canvas resizing/compression for >1.5MB images before API upload |
| AI Page Performance | File-based persistent cache + instant empty/onboarding load on mount |


## 🔧 Troubleshoot Terakhir (2026-06-21)

**Masalah:** `api.temankas.com` belum punya SSL → login gagal `ERR_CERT_COMMON_NAME_INVALID`
karena frontend di HTTPS panggil API yang belum SSL.

**Fix:**
```bash
sudo certbot --nginx -d api.temankas.com
# Pilih opsi 1 (reinstall existing certificate) — tambah domain ke cert existing
```

---

## 🔄 Update Protocol

Setelah menyelesaikan task:
1. **Update file yang relevan** — tambah keputusan baru, hapus yang usang
2. **Update backlog** di file ini — tandai selesai / tambah item baru
3. **Jangan hapus** keputusan yang masih berlaku (cek dulu apakah masih dipakai)
4. **Jangan buat folder baru** — semua di `.memory/` saja
