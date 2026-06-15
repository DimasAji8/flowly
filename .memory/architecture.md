# Architecture

## Monorepo
npm workspaces (no pnpm/yarn, no Turborepo, no Docker for DB). Root `npm install`
+ `npm run dev` runs web + api together via `concurrently`.

```
apps/
├── web/   ← Next.js 16 (App Router, TS, Tailwind v4)
└── api/   ← NestJS 11 + Prisma 6
docs/instructions/   ← source spec (00-index.md …)
```

## Ports
- Web: **4000** (http://localhost:4000)
- API: **3333** (http://localhost:3333/api/v1) — port 3000 intentionally avoided.

## Tech Stack
- **Frontend:** Next.js 16 App Router, TypeScript, Tailwind v4 (CSS-first config),
  shadcn/ui + Radix, Zustand (state), React Hook Form + Zod (forms/validation),
  FullCalendar (calendar), Recharts (charts).
- **Backend:** NestJS 11, TypeScript, Prisma ORM 6, PostgreSQL 16 (local),
  @nestjs/config, class-validator + class-transformer, JWT + bcrypt,
  @nestjs/schedule (recurring job), @nestjs/swagger.

## Backend structure (`apps/api/src/`)
- `common/` — guards, decorators, types, filters, interceptors, utils.
  - `WorkspaceGuard`, `@CurrentWorkspace()`, `@WorkspaceRoles()`, `@CurrentUser()`,
    `@CurrentJwtPayload()`.
- `prisma/` — `prisma.service.ts` (DI PrismaClient), `schema.prisma`.
- `modules/` — each: `*.module.ts`, `*.controller.ts`, `*.service.ts`, `dto/`,
  optional `*.serializer.ts`. Modules: auth, users, workspaces, transactions,
  categories, wallets, recurring, transfers, savings-goals, developer.
- `common/` also includes `DeveloperGuard` + `@DeveloperOnly()` decorator untuk
  endpoint yang hanya bisa diakses user dengan role `developer`.
- `jobs/` — `recurring.job.ts` (+ `jobs.module.ts`), @nestjs/schedule cron.
- `main.ts` — global prefix `api/v1`, global ValidationPipe (whitelist +
  forbidNonWhitelisted + transform), CORS from `CORS_ORIGIN`, Swagger (non-prod).

## Frontend structure (`apps/web/src/`)
- `app/` — App Router pages: dashboard, transactions, categories, wallets,
  calendar, recurring, savings-goals, profile, auth (login/register), landing.
- `components/` — `ui/` (primitives), `layout/` (app-shell, bottom-nav, side-nav,
  auth-hydrator), plus feature folders (dashboard, transaction, wallet, recurring,
  calendar, savings-goals, forms).
- `store/` — Zustand stores (auth, workspace, categories, wallets).
- `services/` — API call wrappers per domain.
- `lib/` — `api-client.ts` (fetch wrapper w/ auto refresh), `auth-storage.ts`,
  Zod schemas. `hooks/`, `types/`, `utils/`, `constants/routes.ts`.

## Design Patterns
- Service layer never touches req/res; receives params from controller.
- Workspace scoping enforced via `JwtAuthGuard` → `WorkspaceGuard` chain.
- Atomic seeding on register via `prisma.$transaction`.
- Recurring job must be **idempotent** (no double-generate on restart); process
  in UTC, render to user timezone on frontend.
