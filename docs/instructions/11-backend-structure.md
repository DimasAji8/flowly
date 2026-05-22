# 11 — Backend Folder Structure

Struktur folder NestJS untuk Flowly. **Lokasi: `apps/api/src/`** (lihat `15-monorepo-setup.md`).

## Tree

```txt
src/
│
├── common/
│   ├── guards/
│   ├── filters/
│   ├── interceptors/
│   ├── decorators/
│   └── utils/
│
├── config/
│
├── prisma/
│
├── modules/
│   ├── auth/
│   ├── users/
│   ├── workspaces/
│   ├── transactions/
│   ├── categories/
│   ├── wallets/
│   └── recurring/
│
├── jobs/
│
└── main.ts
```

## Penjelasan Folder

### `common/`

Reusable building block lintas modul:

- `guards/` — JWT guard, Workspace guard, Role guard
- `filters/` — Global exception filter
- `interceptors/` — Logging, response transform
- `decorators/` — Custom decorators (mis. `@CurrentUser()`, `@Workspace()`)
- `utils/` — Helper utilities

### `config/`

Konfigurasi aplikasi (database, JWT, env). Gunakan `@nestjs/config`.

### `prisma/`

- `schema.prisma`
- Migration files
- `prisma.service.ts` (DI service untuk PrismaClient)

### `modules/`

Setiap modul berisi pattern NestJS standar:

```txt
auth/
├── auth.module.ts
├── auth.controller.ts
├── auth.service.ts
├── dto/
└── strategies/      (jwt.strategy.ts, refresh.strategy.ts)
```

Untuk module CRUD biasa:

```txt
transactions/
├── transactions.module.ts
├── transactions.controller.ts
├── transactions.service.ts
└── dto/
```

Daftar modul:

- `auth/` — register, login, refresh, me
- `users/` — user profile management
- `workspaces/` — CRUD workspace + member management
- `transactions/` — CRUD transaksi
- `categories/` — CRUD kategori
- `wallets/` — CRUD wallet + balance
- `recurring/` — CRUD recurring transaction

### `jobs/`

Scheduler jobs menggunakan `@nestjs/schedule`:

```txt
jobs/
├── recurring.job.ts
└── jobs.module.ts
```

### `main.ts`

Bootstrap NestJS app: setup CORS, validation pipe global, global filter, prefix API.

## Recurring Job

Gunakan paket: `@nestjs/schedule`

### Job Behavior

Setiap hari (cron):

1. Cek semua `recurring_transactions` yang `is_active = true` dan `next_run_at <= NOW()`.
2. Generate row baru di tabel `transactions` berdasarkan recurring tersebut.
3. Update `next_run_at` sesuai `frequency` (daily / weekly / monthly).
4. Logging hasil eksekusi.

### Catatan

- Job harus idempotent — kalau service restart, jangan double-generate.
- Pertimbangkan timezone: simpan dan proses dalam UTC, render ke timezone user di frontend.

## Konvensi

- DTO selalu pakai `class-validator` + `class-transformer`.
- Service layer **tidak** akses `req` / `res` langsung — terima param dari controller.
- Setiap query data harus include `workspace_id` filter (gunakan guard + decorator).
- Error throw pakai exception NestJS bawaan (`BadRequestException`, `NotFoundException`, `ForbiddenException`).
