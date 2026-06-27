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

## Cross-page data sync via custom event `flowly:transaction-added`
Setelah mutasi data (tambah/edit/hapus transaksi, transfer, setoran tabungan, recurring),
semua halaman harus refresh tanpa manual reload. Pattern:
1. **Dispatcher** (modal/form): `window.dispatchEvent(new Event("flowly:transaction-added"))`
   setelah API call berhasil + store invalidation.
2. **Listener** (page): `useEffect` listen event → invalidate store → reload data.
3. **Store invalidation**: `useWalletStore.getState().invalidate()` + `useCategoryStore.getState().invalidate()`
   dipanggil di listener sebelum reload, supaya shared store juga fresh.
4. **Dashboard** harus pakai `useWalletStore` (bukan fetch langsung dari API) supaya
   wallet store invalidation berpengaruh.
- Dispatcher files: `transaction-modal`, `delete-transaction-modal`, `transfer-modal`,
  `withdrawal-modal`, `savings-goal-contribution-modal`, `savings-goal-modal`, `recurring-modal`
- Listener files: `dashboard`, `transactions`, `wallets`, `calendar`, `savings-goals`,
  `recurring`, `reports`, `wallets/transfers`
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

## AI Receipt Scanner: Separate Camera and Gallery triggers (2026-06-27)
- **Problem**: A single hidden file input with `accept="image/*"` did not open the camera directly on mobile, and adding `capture="environment"` bypassed the gallery, preventing users from selecting screenshots or saved receipts.
- **Solution**: Split the trigger into two dedicated buttons: "Kamera Struk" and "Pilih Galeri".
  - "Kamera Struk" triggers a hidden input with `capture="environment"` to open the native mobile camera app.
  - "Pilih Galeri" triggers a standard hidden input (`accept="image/*"` without `capture`) to open the file manager/gallery.
- **Benefits**: Provides direct camera scanning on mobile, keeps file selection intact, and automatically falls back to standard file selection on desktop.
- **Swagger Documentation**: Added `@ApiBody` to the `POST /ai/scan-receipt` endpoint in NestJS to allow interactive testing of receipt uploads directly in Swagger UI, and created dedicated response DTOs (`AiParsedTransactionResponseDto`, `AiInsightResponseDto`) to formalize return schemas.

## Developer Shell Refactor for Mobile Compatibility (2026-06-27)
- **Problem**: The developer console (`/developer/*`) was not responsive or usable on mobile because the navigation sidebar was hidden (`hidden lg:flex`) with no mobile alternative (burger/bottom nav).
- **Solution**: Refactored `DeveloperShell` to introduce a dedicated `DeveloperBottomNav` on mobile screens (`lg:hidden`). Also redesigned `DeveloperMobileHeader` with balanced layout (brand on the left, logout on the right), and cleaned up the desktop sidebar spacing and profile area at the bottom.
- **Layout**: Removed awkward floating box borders (`lg:rounded-t-2xl`, `lg:border-x`) on desktop full-width dashboard container to align with standard clean dashboard aesthetics.

## Developer Mode Complete UI/UX Redesign (2026-06-27)
- **Dashboard (`/developer`)**: Implemented Vercel/Stripe-like visual depth (subtle shadows `0 1px 2px rgba(0,0,0,.04), 0 8px 24px rgba(0,0,0,.06)`), a new automated AI insights recommendation banner, a larger 180px transaction trend chart with group hover triggers, and structured system health status cards.
- **Users (`/developer/users`)**: Added a quick stats summary bar (total users, active users, registrations, and developers counts). Implemented automated color-coded avatars based on user name characters, and moderation action menus (edit role, suspend, delete).
- **Workspaces (`/developer/workspaces`)**: Replaced standard table with card/table hybrid showing owners, health status, members, and transactions. Added quick actions.
- **Reviews (`/developer/reviews`)**: Refactored to a complete moderation dashboard with positive sentiment ratios, rating average calculations, rating chips, and visibility filters.
- **Health (`/developer/health`)**: Refactored to a Grafana/Better Stack monitoring layout, including a glowing Operational status banner, memory allocation progress indicators, latency KPIs, and active system logs.

## Developer Mode Sidebar Dark Slate & Pagination Bug Fixes (2026-06-27)
- **Sidebar Background**: Differentiated the Developer Console sidebar from the main user sidebar by styling it with a premium dark slate color scheme (`bg-slate-950 text-slate-100` and `border-slate-800`). This matches the developer-oriented consoles of modern SaaS platforms (like Railway/GitLab/Supabase) and contrasts cleanly with the light gray background of the page.
- **Pagination Bug Fix**: Solved the issue where navigating to other pages in the paginated lists (Users, Workspaces, Reviews) caused the pagination buttons to disappear. The cause was that the client-side pagination total and totalPages stats were calculated from the local search filter result, which on subsequent pages only represents that page's chunk size (e.g. 2 items instead of the database total of 12). Restricted client-side overrides to only apply when an active search query or status filter is present, ensuring standard pagination uses the database totals.

## Developer Shell Full Width & Pagination Layout Fixes (2026-06-27)
- **Full Width Restoration**: Removed the `max-w-7xl` and `mx-auto` constraint from `developer-shell.tsx` main container so that the console workspace stretches 100% full-width on desktop screens as requested.
- **Pagination Clipping Fix**: Removed redundant outer card wrappers around `<DataTable>` in `users/page.tsx`, `workspaces/page.tsx`, and `reviews/page.tsx`. This prevents the pagination footer from getting trapped at the bottom edges of the card and clipped/cut off by the wrapper's `overflow-hidden` border-radius bounds. Paginators now render cleanly below the table card on the page background.

## Developer Sidebar Reverted to Premium White Theme (2026-06-27)
- **Background Color**: Reverted the Developer Mode sidebar from dark slate to a clean, solid white theme (`bg-card` and `border-r border-border-subtle`). This satisfies the requirement of differentiating it from the gray page background (`#eff4fb`) while maintaining visual alignment with TemanKas's core brand identity.

## User Suspension Login Error Message Update (2026-06-27)
- **Error Message**: Updated the suspension error message returned by NestJS during login attempts or API request authorization to: `Akun Anda ditangguhkan, silakan hubungi administrator untuk membuka`. This guides users on the action to take when their account is locked.

## User Deletion Relational Integrity Fix (2026-06-27)
- **Constraint Violation**: Resolved the `PrismaClientKnownRequestError` with code `P2003` (Foreign key constraint violated on `transactions_user_id_fkey`) when deleting users.
- **Solution**: Wrapped the delete operation inside a database transaction (`this.prisma.$transaction`), explicitly deleting all transactions made by the target user (`tx.transaction.deleteMany({ where: { userId } })`) before deleting the user. This satisfies the Restrict foreign key constraint and allows clean deletions.

## Replaced Browser Alerts with Sonner Toast Notifications (2026-06-27)
- **Problem**: Browser `alert(...)` calls were used in developer pages, which are disruptive, block the main execution thread, and look unpolished.
- **Solution**: Replaced all native browser alerts with `sonner` toast notifications (`toast.success` and `toast.error`). Applied this to:
  - User moderation actions (`users/page.tsx`)
  - Workspace management actions (`workspaces/page.tsx`)
  - Review visibility toggles and deletions (`reviews/page.tsx`)

## Dedicated AI Analytics Page & Dashboard Speed Fix (2026-06-27)
- **Problem**: In-line AI Insights on the main dashboard blocked or shifted layout content due to real-time Gemini API latency (3-5s), making the initial dashboard feel slow.
- **Solution**: Moved AI Insights out of the main dashboard (`dashboard/page.tsx`) and into a dedicated **"Analisis AI"** menu page (`/ai`). Added `Sparkles` navigation link in `side-nav.tsx`.
- **Backend Optimization**: Implemented a `force` query parameter in `AiController` and `AiService` (`/ai/insights?force=true`), allowing the user to bypass the 6-hour cache on-demand and regenerate financial recommendations.
- **UI Design**: Added a financial health score indicator (0-100 gauge), a manual "Mulai Analisis Keuangan" action button with visual loading spinners, and skeleton state shimmers for loading.










