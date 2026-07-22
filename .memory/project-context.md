# 📋 Project Context — Flowly (Teman Kas)

> **File ini adalah salah satu dari 2 file utama di folder `.memory/` yang WAJIB dibaca AI agent di awal task.**
> File ini berisi dokumentasi dasar tentang produk, arsitektur monorepo, database schema, API, UI/UX design tokens, dan komponen UI kustom.

---

## 🏠 1. Tentang Proyek & Core Business Rules

**Flowly** (landing page brand: **Teman Kas**) — aplikasi catatan keuangan pribadi mobile-first yang personal dan calm (bukan ERP/dashboard analytics rumit).

### Sasaran Produk (Goals)
*   **Kecepatan**: Catat transaksi baru dalam **< 5 detik**.
*   **Ergonomi**: Usable **one-handed** (tombol aksi utama diletakkan di jangkauan jempol / area bawah screen).
*   **Estetika**: Bersih, tenang (*calm UI*), berfokus pada ruang kosong (*whitespace*), tipografi, dan visual yang konsisten.

### Core Business Rules
*   **Multi-tenancy by Workspace**: Semua data finansial di-scoped oleh `workspace_id`. Setiap query database **WAJIB** memfilter berdasarkan workspace.
*   **Registrasi & Seeding**: Proses registrasi membuat user baru, workspace personal default, membership owner, dompet default, dan kategori default secara atomic dalam satu `prisma.$transaction`.
*   **Indikasi Warna**: Pemasukan (*income*) selalu berwarna hijau (`#15803D`), Pengeluaran (*expense*) selalu berwarna merah (`#B91C1C`).
*   **Alokasi Budget**: Menggunakan metode target alokasi budget bulanan default 50% Needs (Kebutuhan), 30% Wants (Keinginan), dan 20% Savings (Tabungan).
*   **Developer Role**: User dengan role `developer` dialihkan secara khusus ke `/developer` (mengakses Developer Console) yang memuat visual metric non-finansial, manajemen pengguna, review, dan system health.

---

## ⚙️ 2. Arsitektur & Tech Stack

Proyek ini menggunakan **monorepo npm workspaces** (tanpa PM2/Docker di server, berjalan di VPS Ubuntu dengan systemd + Nginx).

### Struktur Folder
```
apps/
├── web/   ← Next.js 16 (App Router, TS, Tailwind v4 CSS-first config, port 4000)
└── api/   ← NestJS 11 + Prisma 6 (PostgreSQL 16, port 3333)
```

### Tech Stack
*   **Frontend**: Next.js 16, TypeScript, Tailwind v4, Zustand (state), React Hook Form + Zod (validation), Recharts (charts), FullCalendar (calendar), Driver.js (onboarding tour), Sonner (toast notifications).
*   **Backend**: NestJS 11, TypeScript, Prisma ORM 6, PostgreSQL 16, JWT, @nestjs/schedule (cron jobs).
*   **Monorepo runner**: concurrently running `npm run dev` in root directory.

---

## 🗄️ 3. Skema Database Summary

Semua ID menggunakan `cuid()`. Kolom nominal uang menggunakan format `Decimal(18,2)`.

### Enums
*   `WorkspaceRole`: `owner` | `member`
*   `TransactionType`: `income` | `expense`
*   `RecurringFrequency`: `daily` | `weekly` | `monthly`
*   `Gender`: `m` | `f`
*   `WalletType`: `bank` | `e_wallet` | `cash` | `credit` | `savings` | `other`
*   `CategoryGroup`: `needs` | `wants` | `savings`

### Core Models
1.  **User**: id, name, email (unique), password (bcrypt), gender, lastSeenAt, timestamps.
2.  **Workspace**: id, name, ownerId, needsTarget (50), wantsTarget (30), savingsTarget (20), timestamps.
3.  **WorkspaceMember**: workspaceId, userId, role (member/owner).
4.  **Wallet**: id, workspaceId, name, type (WalletType), balance (Decimal).
5.  **Category**: id, workspaceId, name, type (TransactionType), color, icon, group (CategoryGroup).
6.  **Transaction**: id, workspaceId, walletId, categoryId, userId, type, amount, note, transactionDate.
7.  **Transfer**: id, workspaceId, fromWalletId, toWalletId, amount, note, transferDate.
8.  **RecurringTransaction**: id, workspaceId, walletId, categoryId, type, amount, frequency, note, nextRunAt, isActive.
9.  **Budget**: id, workspaceId, categoryId, amount, period (YYYY-MM). Unique on `[workspaceId, categoryId, period]`.
10. **Review**: id, name, rating (1-5), content, isShown (default true), timestamps (global landing page model).

---

## 🔌 4. API Conventions & Core Endpoints

Base path: **`/api/v1`**. Keamanan menggunakan JWT Auth + `X-Workspace-Id` header (WorkspaceGuard) untuk validasi multi-tenancy.

### Fitur Autentikasi
*   `POST /auth/register` & `POST /auth/login` -> Mengembalikan token JWT (`accessToken` 15m, `refreshToken` 7d) dan `workspaceId` aktif.
*   `POST /auth/forgot-password` & `POST /auth/reset-password` -> Penanganan reset password menggunakan email verification (Resend API).
*   `PATCH /auth/change-password` -> Endpoint ganti password dari profil user.

### API Khusus B2B (API Key Access)
*   Jika header `X-API-Key` dikirimkan (berisi `B2B_API_KEY`), `B2bAuthGuard` secara otomatis meng-bypass `JwtAuthGuard` dan `WorkspaceGuard`, lalu menginjeksi mock user dan workspace B2B yang sudah diatur di environment variable. Developer mobile (iOS/Android) tidak perlu login JWT untuk memanggil endpoint.

### Fitur AI (Gemini Integration)
*   `POST /ai/parse-transaction` -> Parsing kalimat bahasa natural menjadi objek transaksi JSON.
*   `POST /ai/scan-receipt` -> OCR Struk belanja menggunakan Gemini Vision (multimodal) untuk auto-fill form transaksi.
*   `POST /ai/scan-mutation` -> Bulk parsing screenshot/PDF mutasi bank. Menghasilkan objek transaksional lengkap dengan penanda duplikasi otomatis.
*   `GET /ai/insights` -> Financial health score (0-100) dan 3 saran proaktif. Dilengkapi sistem persistent cache 6 jam berbasis file di folder `.cache/ai-insights/`.

---

## 🎨 5. UI / UX Design & Custom Component Rules

### Design Tokens (Soft Matte)
*   **Background**: `#F3F4F6` (light) | `#0F172A` (dark)
*   **Surface**: `#E5E7EB` (light) | `#111827` (dark)
*   **Card**: `#ECEFF3` (light) | `#1E293B` (dark)
*   **Accent/Primary**: `#2563EB` (biru)
*   **Success (Income)**: `#15803D` (hijau)
*   **Danger (Expense)**: `#B91C1C` (merah)
*   **Font**: **Urbanist** (global default).

### Komponen Kustom Utama (Lokasi: `apps/web/src/components/ui/`)
1.  **`Button`** (`button.tsx`): Kustom tombol dengan loading state. **Gunakan ini, BUKAN shadcn Button.**
2.  **`Input`** (`input.tsx`): Dilengkapi label, hint, error, left/right adornment. **Gunakan ini, BUKAN shadcn Input.**
3.  **`Select`** (`select.tsx`): Dropdown terintegrasi. **Gunakan ini, BUKAN select HTML native.**
4.  **`FilterBar`** (`filter-bar.tsx`): Popover filter dengan draft state (Terapkan/Batal/Reset). **Wajib untuk semua halaman list.**
5.  **`Modal`** (`modal.tsx`): Window dialog/sheet. **JANGAN menumpuk (nest) Modal/ConfirmModal di dalamnya.**
6.  **`DataTable`** (`data-table.tsx`): Tabel generik responsif dengan client-side pagination untuk Developer Console.

### Sinkronisasi Data Lintas Halaman (Custom Event Pattern)
Setiap kali terjadi mutasi transaksi/transfer/tabungan berhasil, dispatcher **WAJIB** memicu event global:
```typescript
window.dispatchEvent(new Event("flowly:transaction-added"));
```
Semua halaman aktif (Dashboard, List Transaksi, Wallets, Kalender, Savings, dll) mendengarkan event ini untuk me-reload data dan meng-invalidaasi store Zustand (`useWalletStore`, `useCategoryStore`) secara otomatis agar data tetap sinkron tanpa reload browser.

---

## ⚠️ 6. Aturan Kritis Pengembangan (JANGAN LANGGAR)

1.  **Proteksi Data**: Pastikan semua query/mutasi data backend NestJS selalu memiliki filter `workspace_id`.
2.  **Input Nominal Uang**: Format Rupiah wajib menggunakan ribuan separator `.` (titik) via helper `formatRupiah`/`parseRupiah`. Input form wajib menggunakan `inputMode="numeric"` (bukan `type="number"`) dengan adornment `Rp`.
3.  **Shadcn UI Conflict Warning**: **JANGAN jalankan `npx shadcn add`** tanpa pengawasan karena berpotensi merusak dan menimpa file `button.tsx` dan `input.tsx` kustom yang telah dimodifikasi.
4.  **Calm UI Principle**: Hindari gradasi warna mencolok, efek glow, neon, shadow tebal, dan penggunaan emoji sebagai icon utama. Gunakan border 1px solid tipis untuk pemisah.
5.  **Bahasa UI**: Seluruh tulisan, notifikasi, label, dan error message yang tampil ke pengguna akhir wajib ditulis dalam **Bahasa Indonesia**.
