# 10 — Frontend Folder Structure

Struktur folder Next.js (App Router) untuk Flowly. **Lokasi: `apps/web/src/`** (lihat `15-monorepo-setup.md`).

## Tree

```txt
src/
│
├── app/
│   ├── dashboard/
│   ├── calendar/
│   ├── transactions/
│   ├── profile/
│   └── auth/
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── dashboard/
│   ├── calendar/
│   ├── transaction/
│   └── forms/
│
├── hooks/
├── services/
├── store/
├── lib/
├── types/
├── utils/
└── constants/
```

## Penjelasan Folder

### `app/`

Routing Next.js 15 App Router. Setiap folder = satu route.

- `dashboard/` → `/dashboard`
- `calendar/` → `/calendar`
- `transactions/` → `/transactions`
- `profile/` → `/profile`
- `auth/` → `/auth/login`, `/auth/register`

### `components/`

- `ui/` — komponen base (shadcn/ui generated)
- `layout/` — layout reusable (BottomNav, Header, Container)
- `dashboard/` — komponen khusus dashboard (SummaryCard, MonthlyChart)
- `calendar/` — komponen calendar (CalendarGrid, DayCell, DayDetail)
- `transaction/` — komponen transaksi (TransactionItem, TransactionList)
- `forms/` — form reusable (TransactionForm, CategoryForm, WalletForm)

### `hooks/`

Custom React hooks (mis. `useAuth`, `useTransactions`, `useDarkMode`).

### `services/`

API client / data fetcher. Wrap fetch atau axios per resource:

```txt
services/
├── auth.service.ts
├── transactions.service.ts
├── categories.service.ts
├── wallets.service.ts
└── recurring.service.ts
```

### `store/`

Zustand stores (mis. `authStore`, `workspaceStore`, `uiStore`).

### `lib/`

Utility library setup (mis. `axios.ts`, `dayjs.ts`, `zod.ts`).

### `types/`

TypeScript types & interfaces global (mis. `Transaction`, `Wallet`, `Category`).

### `utils/`

Pure helper functions (mis. `formatCurrency`, `formatDate`, `groupByDate`).

### `constants/`

Constant values (mis. `routes.ts`, `colors.ts`, `frequencies.ts`).

## Konvensi

- Komponen: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- Utils & helpers: `camelCase.ts`
- Types: `PascalCase` interface/type, file `camelCase.ts`
- 1 file = 1 komponen utama (kecuali komponen kecil yang berkaitan erat)
- Letakkan komponen di folder paling spesifik (jika cuma dipakai di dashboard, taruh di `components/dashboard/`, bukan `components/ui/`)
