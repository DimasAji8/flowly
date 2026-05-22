# 02 — Tech Stack

## Frontend

| Tool | Keterangan |
|------|------------|
| Next.js 16 | App Router (versi saat scaffold; dokumen awal menulis 15, fungsionalitas superset) |
| TypeScript | Type safety |
| Tailwind CSS v4 | Styling utility |
| shadcn/ui | Komponen UI (di-install saat fitur UI mulai dikerjakan) |
| Zustand | State management (install saat dipakai) |
| React Hook Form | Form handling (install saat dipakai) |
| Zod | Schema validation (install saat dipakai) |
| FullCalendar | Calendar view (install di Phase 3) |
| Recharts | Chart & visualisasi (install di Phase 2) |

## Backend

| Tool | Keterangan |
|------|------------|
| NestJS 11 | Framework backend |
| TypeScript | Type safety |
| Prisma ORM 6 | Database ORM |
| PostgreSQL 16 | Database (lokal, bukan Docker) |
| @nestjs/config | Env management |
| class-validator + class-transformer | DTO validation |
| JWT | Authentication (install di Phase 1) |
| bcrypt | Password hashing (install di Phase 1) |

## Deployment

| Komponen | Platform |
|----------|----------|
| Frontend | VPS (Nginx + PM2) |
| Backend  | VPS (PM2) |
| Database | PostgreSQL |
| SSL      | Certbot + Let's Encrypt |

## Catatan Teknologi

- **Monorepo** dengan npm workspaces — lihat `15-monorepo-setup.md`.
- Gunakan **App Router** Next.js (bukan Pages Router).
- Tailwind v4 menggunakan konfigurasi baru (CSS-first config).
- shadcn/ui dipakai sebagai base komponen — boleh di-customize sesuai design system.
- Zustand untuk state global (lebih ringan dari Redux untuk scope ini).
- Prisma sebagai single source of truth untuk schema database.
- JWT + Refresh Token pattern untuk authentication.
- **Port konvensi:** Web `4000`, API `3333` (lihat `15-monorepo-setup.md`).
