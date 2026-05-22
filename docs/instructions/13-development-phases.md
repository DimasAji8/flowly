# 13 — Development Phases

Pembagian pengembangan per phase. Selesaikan satu phase sebelum lanjut ke berikutnya untuk menjaga fokus.

## Phase 1 — Foundation

- Setup NestJS
- Setup Next.js
- Setup Prisma
- Setup PostgreSQL
- Implement authentication (register, login, JWT, refresh, me)

**Deliverable:** User bisa register & login, token tersimpan, ada protected route sederhana.

## Phase 2 — Core Features

- Transaction CRUD
- Categories CRUD
- Wallets CRUD
- Dashboard (income, expense, net cashflow, recent transactions, simple monthly chart)

**Deliverable:** User bisa input transaksi → data muncul di dashboard.

## Phase 3 — Calendar

- Integrasi FullCalendar
- Calendar transaction view (indicator hijau/merah, detail per tanggal)

**Deliverable:** User bisa lihat distribusi income/expense di kalender bulanan.

## Phase 4 — Recurring

- Recurring transaction CRUD
- Scheduler job (`@nestjs/schedule`)
- Auto-generate transaction harian

**Deliverable:** Transaksi recurring tergenerate otomatis pada `next_run_at`.

## Phase 5 — Polish & Deploy

- Responsive optimization (cek di 360px–480px)
- Dark mode
- Performance optimization (image, bundle, query)
- Deployment ke VPS (Nginx + PM2 + SSL)

**Deliverable:** Aplikasi live di production dengan SSL & dark mode aktif.

## Catatan

- **Multi-user (workspace)** bisa dimulai di Phase 1 (struktur data) dan disempurnakan di Phase 2–5.
- Setiap phase wajib disertai testing manual dasar sebelum lanjut.
- Jangan lompat phase tanpa konfirmasi product owner.
