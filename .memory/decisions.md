# Decisions

Active architectural decisions and the reasoning behind them.

## Monorepo with npm workspaces (not pnpm/yarn/Turborepo)
Two apps only → npm workspaces + `concurrently` is enough; keep tooling simple.
Upgradeable later if the project grows.

## Local PostgreSQL, no Docker
DB runs on local Postgres (`localhost:5432`). No `docker-compose` yet; add one
later if needed.

## Ports 4000 (web) / 3333 (api)
Port 3000 intentionally avoided to prevent clashes with other local Next.js apps.

## Workspace-based multi-tenancy
All domain data scoped to `workspace_id`, enforced via `JwtAuthGuard` +
`WorkspaceGuard` (requires `X-Workspace-Id` header). Chosen over per-user data so
multiple users can share a workspace. Roles kept minimal: owner/member.

## JWT access + refresh tokens
Stateless auth. Separate secrets for access/refresh; access short-lived (15m),
refresh longer (7d). Frontend does single-flight silent refresh on 401.
Google login deliberately deferred (structure left ready, not implemented).

## Seed defaults on register (atomic)
Register creates user + workspace + owner membership + default wallets &
categories in one `prisma.$transaction`, so users can record transactions
immediately without setup.

## Money as Decimal(18,2)
Avoid float rounding errors for currency. Wallet balance is maintained
incrementally on transaction/transfer changes (single consistent strategy).

## Budget allocation 50/30/20 (needs/wants/savings)
Workspace stores needs/wants/savings target percentages (default 50/30/20);
categories carry a `group` to map spending into these buckets. Drives dashboard
spending insights.

## Recurring via scheduler job
`@nestjs/schedule` cron generates transactions from active recurring rows where
`next_run_at <= now`. Must be idempotent (no double-generate on restart); store
and process in UTC.

## Mobile-on-desktop, not wide dashboard
Even on desktop the container stays ~480px wide. Deliberate: keep the calm,
one-handed mobile experience everywhere; no wide analytics layout.

## Responsive breakpoint = `lg` (1024px), not `md`
Tablet (<1024px) uses the mobile interaction pattern (BottomNav + center FAB);
desktop (≥1024px) uses the right-bottom FAB. Touchscreen tablets fit the mobile
pattern better. Applies to: SideNav, BottomNav, AppShell, Modal, BackButton, and
the Transactions page.

## Category color removed from UI
Color picker removed from the category form (emoji icon is enough as identifier,
color was not used visually). `color` field is `@IsOptional()` in
`CreateCategoryDto`; service defaults to `#6E6E73`. Prisma column stays
non-nullable (no migration needed).

## Branding: "Teman Kas" on landing, "Flowly" elsewhere
Landing page brand = "Teman Kas" (wordmark logo), tagline "Sahabat Pengelola
Keuanganmu". Auth pages juga pakai brand "Teman Kas" (konsisten dengan landing).

## Auth page layout (`components/ui/sign-up.tsx`)
- **Split layout** 50/50: kiri = panel biru karakter animasi (only desktop `lg:`), kanan = form.
- **Karakter animasi** dari `animated-characters-login-page` (21st.dev): purple, black, orange, yellow — follow mouse cursor, bersembunyi saat typing password, intip saat password visible. Semua ref access via state `containerRect` (bukan akses `ref.current` saat render — mengikuti react-hooks/refs rule).
- **Desktop kanan**: tombol "Kembali ke beranda" di **kiri atas** (`hidden lg:flex`), form ter-center vertikal (`items-center`), `maxWidth: 420px`.
- **Mobile**: mini-hero gradient biru di atas (logo putih + link Beranda + tagline), form di bawah `items-start` (dekat hero, tidak menggantung).
- **Button di form**: pakai `AuthButton` komponen inline dengan `style` inline (`var(--color-accent)`) — bypass konflik shadcn `--accent` vs app `--color-accent`.
- **Field input**: pakai `Input` dari `input.tsx` (versi lama, punya `label`, `leftAdornment`, `rightAdornment`) — JANGAN pakai shadcn Input.
- **Register multi-step**: step indicator (2 dot bar + teks "Langkah X dari 2") di atas heading.
- **AVOID**: emoji di heading, tombol beranda di kanan atas.

## Developer role (UserRole enum + DeveloperGuard + dedicated shell)
- Backend: `UserRole` enum (`user | developer`), `DeveloperGuard` + `@DeveloperOnly()` decorator
- Developer hanya bisa login dengan akun khusus yang di-set via env (DEV_USER_EMAIL/PASSWORD)
- Login/register/landing redirect: jika `role === "developer"` → `/developer`, bukan dashboard user
- Developer punya layout sendiri (`DeveloperShell`) dengan sidebar khusus (menu Dashboard/Users/Workspaces/Health + Logout), full-width (no max-w constraint)
- User sidebar (`side-nav.tsx`) hanya menampilkan menu user biasa, developer menu dihapus
- Endpoint developer dilindungi `JwtAuthGuard` + `DeveloperGuard` (double guard, urut penting)

## Developer UI: table-based + pagination + shadcn
- Halaman `/developer/users`, `/developer/workspaces`, `/developer/reviews` pakai **DataTable** (`components/ui/data-table.tsx`) — generic `T extends object`, kolom + server-side pagination, skeleton loading.
- Dashboard (`/developer/page.tsx`) pakai **BigStat cards + engagement metrics + bar charts**, bukan tabel.
- API endpoints `/developer/users` dan `/developer/workspaces` kini **paginated** via `PaginationQueryDto`.
- `formatRelativeTime(iso)` di `utils/format-date.ts` untuk kolom "Terakhir Dilihat" pada tabel users.
- Gunakan shadcn `Table` + `Badge` + `Pagination` components — boleh install selama tidak menimpa `button.tsx` / `input.tsx`
- Detail plan: lihat `.memory/developer-ui-plan.md`

## Developer Dashboard (final design, 2026-06-16)
- **3 BigStat** cards (Total User, Transaksi, Volume) + engagement KPI
- **Tren Transaksi 7 Hari** — bar chart `TrendChart`, data dari `transactionsByDay`
- **Adopsi Fitur** — `AdoptionStat` (% rate) + `NumericStat` (nilai tunggal)
- **Distribusi Gender** + **Registrasi 6 Bulan** chart
- **User Terbaru** (5) + **System Health**
- Semua data **non-finansial** (count/jumlah/rate)

## Tarik Tunai (2026-06-16)
- **Konsep**: aksi naratif "ambil uang tunai dari dompet" — di belakang layar adalah Transfer dari dompet non-Tunai → dompet Tunai. BUKAN expense (tidak lewat `transactions`), BUKAN duplikasi schema.
- **Backend**: NO schema/migration baru. Reuse `POST /api/v1/transfers` (atomic decrement source + increment destination di `prisma.$transaction`). Dompet Tunai auto-create via `POST /api/v1/wallets` (name: "Tunai", type: cash, balance: 0) jika user belum punya wallet dengan `type === "cash"`.
- **Frontend**:
  - `components/wallet/withdrawal-modal.tsx` — single `Modal` dengan step state `'form' | 'confirm'` (mengikuti aturan "JANGAN nest ConfirmModal di dalam Modal"). Step konfirmasi pakai `onBack` prop `Modal` (tombol ArrowLeft muncul otomatis), bukan modal kedua.
  - Form: kartu ringkasan dompet asal (nama + saldo) + hint tujuan (existing Tunai atau auto-create "Tunai") + input jumlah (formatRupiah) + catatan opsional. Tombol submit pakai `leftIcon={<Banknote />}` dengan label "Lanjut".
  - Step konfirmasi: kartu ringkasan (Dari / Ke / Jumlah + catatan) + tombol "Kembali" / "Konfirmasi".
  - Auto-detect cash wallet: `wallets.find((w) => w.type === "cash")` — jika null, auto-create saat konfirmasi.
  - Refresh store: `useWalletStore.getState().invalidate()` + `fetch()` setelah sukses agar saldo & dompet baru ter-update di list.
- **ActionMenu** (`components/ui/action-menu.tsx`): tambah prop `onWithdraw` opsional + `withdrawLabel` (default "Tarik Tunai"), icon `Banknote` (lucide). Hanya di-render jika prop diberikan.
- **Wiring di `wallets/page.tsx`**: ActionMenu untuk wallet dengan `w.type !== "cash"` dapat `onWithdraw={() => { setWithdrawFromId(w.id); setWithdrawOpen(true); }}`. State `withdrawOpen` + `withdrawFromId` + `<WithdrawalModal />` di-render di bawah `<TransferModal />`. KEY MODAL WAJIB PREFIX unik (`transfer-` vs `withdraw-`) — pola key `${open}-${id}` saja menghasilkan duplicate key `false-` saat kedua modal tertutup.
- **Date**: hardcoded `isoToday()` (sama dengan `TransferModal` existing). Bisa di-extend ke date picker di masa depan.
- **Tunai source**: dompet `type === "cash"` tidak menampilkan opsi Tarik Tunai (logic di parent wallets page: `w.type !== "cash"`). Tidak ada validasi tambahan — `transfersService` sudah throw "Saldo tidak cukup" jika amount > balance.
