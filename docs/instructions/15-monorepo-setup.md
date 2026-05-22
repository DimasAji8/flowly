# 15 — Monorepo Setup & Local Development

Project Flowly menggunakan **npm workspaces** sebagai monorepo, dengan dua aplikasi:

- `apps/web` — Next.js (frontend)
- `apps/api` — NestJS (backend)

Tujuannya: cukup `npm install` dan `npm run dev` di root, semua dependency terpasang dan kedua aplikasi jalan bersamaan.

## Tree

```txt
cash-flow/
├── package.json              ← root workspace + script dev gabungan
├── package-lock.json
├── node_modules/             ← shared dependencies (hoisted)
├── .gitignore
│
├── apps/
│   ├── web/                  ← Next.js 16 (App Router, TS, Tailwind v4)
│   │   ├── package.json
│   │   ├── src/
│   │   ├── public/
│   │   ├── .env.local        ← env aktif (gitignored)
│   │   └── .env.example
│   │
│   └── api/                  ← NestJS 11 (TypeScript)
│       ├── package.json
│       ├── src/
│       ├── prisma/
│       │   └── schema.prisma ← schema database
│       ├── .env              ← env aktif (gitignored)
│       └── .env.example
│
└── docs/
    ├── readme.md             ← prompt asli
    └── instructions/         ← dokumentasi terstruktur
```

## Port Convention

| App | Port | URL |
|-----|------|-----|
| Web (Next.js) | **4000** | http://localhost:4000 |
| API (NestJS) | **3333** | http://localhost:3333/api/v1 |

Port 3000 sengaja **tidak dipakai** karena sering bentrok dengan project Next.js lain di mesin developer. Kalau mau pakai port lain, override pakai env saat menjalankan:

```bash
PORT=5000 npm run dev:web   # web di port 5000
```

API port di-set via `apps/api/.env` (`PORT=3333`).

## Script di Root

| Command | Fungsi |
|---------|--------|
| `npm run dev` | Jalankan **web + api** bersamaan (concurrently) |
| `npm run dev:web` | Jalankan web saja |
| `npm run dev:api` | Jalankan api saja |
| `npm run build` | Build kedua app untuk produksi |
| `npm run lint` | Lint semua workspace |
| `npm run db:migrate` | Prisma migrate dev (di api) |
| `npm run db:studio` | Buka Prisma Studio |
| `npm run db:generate` | Generate Prisma Client |

## First-Time Setup

### 1. Install dependencies

```bash
npm install
```

Cukup sekali di root — semua workspace ter-install.

### 2. Setup database PostgreSQL lokal

Pastikan PostgreSQL aktif di `localhost:5432`. Buat database (sekali saja):

```bash
sudo -u postgres psql -c "CREATE DATABASE flowly_dev OWNER <user>;"
```

Ganti `<user>` dengan user Postgres lokalmu (mis. `dimas` atau `postgres`).

### 3. Setup environment variables

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

Edit `apps/api/.env`:

- Ganti `PASSWORD` di `DATABASE_URL` dengan password Postgres lokal kamu.
- Set `JWT_SECRET` dan `JWT_REFRESH_SECRET` dengan string panjang acak (untuk produksi).

### 4. Generate Prisma client

```bash
npm run db:generate
```

(Belum perlu migrate karena `schema.prisma` masih kosong — model akan ditambahkan di Phase 1 sesuai `08-database-schema.md`.)

### 5. Jalankan dev

```bash
npm run dev
```

Output yang diharapkan:

```
[WEB] ▲ Next.js 16
[WEB] - Local: http://localhost:4000
[WEB] ✓ Ready
[API] 🚀 API running on http://localhost:3333/api/v1
```

## Verifikasi Manual

```bash
curl http://localhost:3333/api/v1
# {"name":"flowly-api","status":"ok"}

curl http://localhost:3333/api/v1/health
# {"status":"ok","timestamp":"..."}
```

Lalu buka `http://localhost:4000` di browser.

## Troubleshooting

### Port sudah dipakai

Cek siapa yang pakai:

```bash
ss -tlnp | grep -E ':3333|:4000'
```

Solusi: kill process lama, atau ganti port via env.

### Prisma error: `Environment variable not found: DATABASE_URL`

Pastikan `apps/api/.env` sudah dibuat dari `apps/api/.env.example`.

### CORS error di browser saat fetch API

Pastikan origin web ada di `CORS_ORIGIN` di `apps/api/.env` (comma-separated). Default sudah include `http://localhost:4000` & `http://localhost:3000`.

## Catatan

- **Tidak pakai Docker** untuk database — pakai PostgreSQL lokal langsung. Kalau di kemudian hari mau pakai Docker, tambahkan `docker-compose.yml` di root.
- **Tidak pakai pnpm/yarn** — sengaja stick ke npm untuk simplicity.
- **Tidak pakai Turborepo** — untuk dua app, npm workspaces + concurrently sudah cukup. Bisa di-upgrade nanti kalau project tumbuh.
