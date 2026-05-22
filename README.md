# Flowly

Mobile-first cashflow app — monorepo (web + api).

## Quick Start

```bash
# 1. Install
npm install

# 2. Setup env (sekali saja)
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
# → edit apps/api/.env, ganti PASSWORD di DATABASE_URL

# 3. Generate Prisma client
npm run db:generate

# 4. Jalankan dev (web + api bersamaan)
npm run dev
```

- **Web:** http://localhost:4000
- **API:** http://localhost:3333/api/v1

## Struktur

```
apps/
├── web/   ← Next.js 16 (App Router, TS, Tailwind v4)
└── api/   ← NestJS 11 + Prisma 6
docs/
└── instructions/   ← dokumentasi lengkap (mulai dari 00-index.md)
```

Selengkapnya lihat [`docs/instructions/00-index.md`](docs/instructions/00-index.md) dan [`docs/instructions/15-monorepo-setup.md`](docs/instructions/15-monorepo-setup.md).
