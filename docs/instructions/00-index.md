# Flowly — Agent Instruction Index

Dokumentasi ini adalah panduan terstruktur untuk agent (AI atau developer) yang akan mengerjakan project **Flowly** — aplikasi mobile-first untuk pencatatan cashflow pribadi & multi-user.

Setiap file fokus pada satu topik agar konteks lebih ringan dan mudah dipahami.

## Cara Membaca Dokumentasi

1. Mulai dari `01-project-overview.md` untuk memahami tujuan & filosofi produk.
2. Lanjut ke `02-tech-stack.md` untuk memahami teknologi yang digunakan.
3. Baca dokumen design (`03`–`06`) jika sedang mengerjakan UI/UX.
4. Baca dokumen feature (`07-features.md`) untuk memahami scope fitur.
5. Baca dokumen schema & API (`08`–`09`) sebelum coding backend/frontend integration.
6. Baca folder structure (`10`–`11`) sebelum membuat file/folder baru.
7. Baca `12-deployment.md` saat akan deploy.
8. Gunakan `13-development-phases.md` sebagai roadmap.

## Daftar File

| File | Topik |
|------|-------|
| `01-project-overview.md` | Tujuan produk, filosofi, target user |
| `02-tech-stack.md` | Frontend, Backend, Database, Deployment stack |
| `03-design-concept.md` | Visual style & design philosophy |
| `04-ui-rules.md` | Aturan UI: hindari & gunakan |
| `05-color-typography.md` | Color palette & typography |
| `06-layout-navigation.md` | Mobile layout, navigation, animation, dark mode |
| `07-features.md` | Daftar fitur utama & detail tiap fitur |
| `08-database-schema.md` | Skema database Prisma/PostgreSQL |
| `09-api-structure.md` | Daftar endpoint REST API |
| `10-frontend-structure.md` | Struktur folder frontend Next.js |
| `11-backend-structure.md` | Struktur folder backend NestJS |
| `12-deployment.md` | Panduan deployment VPS |
| `13-development-phases.md` | Tahapan development per phase |
| `14-ux-principles.md` | Prinsip UX & goal akhir produk |
| `15-monorepo-setup.md` | Struktur monorepo, port, script dev, troubleshooting |

## Quick Reference

- **Nama produk:** Flowly (placeholder)
- **Tipe:** Mobile-first web app
- **Frontend:** Next.js 15 + Tailwind v4 + shadcn/ui
- **Backend:** NestJS + Prisma + PostgreSQL
- **Konsep:** calm UI, minimal, modern, financial journal
- **Bukan:** ERP, crypto dashboard, accounting enterprise
