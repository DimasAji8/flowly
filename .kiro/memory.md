# Project Memory — TemanKas / Flowly

## Stack
- Monorepo: `apps/web` (Next.js 16, App Router, TS, Tailwind v4) + `apps/api` (NestJS 11 + Prisma 6)
- Web: http://localhost:4000 | API: http://localhost:3333/api/v1
- UI library: shadcn/ui (Radix primitives), custom `Button`, `Sheet`, dll di `src/components/ui/`

## Design Tokens (landing page)
- File: `apps/web/src/app/landing/_components/tokens.ts`
- Primary blue: `#0066cc` (hover: `#0071e3`)
- Ink: `#1d1d1f` | Muted: `#6e6e73` | Hairline: `#e3e3e8`
- Canvas: `#ffffff` | Tint backgrounds: `tintBlue #eef4fc`, `tintLilac #f1edfb`, dll

## Landing Page Navbar (`apps/web/src/app/landing/_components/nav.tsx`)
- Satu-satunya navbar yang aktif — `nav-old.tsx` sudah dihapus
- Sticky, transparan saat top → `bg-white/96 + backdrop-blur` saat scroll
- Layout desktop: `flexbox space-between` — Logo kiri | Nav links tengah | CTA kanan
- Nav links gap: `16px` (inline style)
- CTA: "Masuk" = outline button (border `#d1d1d6`, h=36px, radius=10px), "Daftar" = solid blue (h=36px, radius=10px), gap `8px` antar keduanya
- Mobile drawer: `SheetContent` dari shadcn, width `min(82vw, 320px)`, full inline styles (bypass Tailwind konflik), `VisuallyHidden` title untuk accessibility
- CSS override di `globals.css`: `.lp-drawer { gap: 0 !important; padding: 0 !important; }`

## Komponen Landing Page
- `nav.tsx` — navbar (redesigned, nav-old.tsx sudah dihapus)
- `hero.tsx` — hero section dua kolom
- `feature-row.tsx` — baris fitur
- `banner.tsx`, `capability-grid.tsx`, `cta.tsx`, `footer.tsx`, `screens.tsx`
- `primitives.tsx` — `Logo`, `PhoneFrame`, `PrimaryButton`, `GhostButton`, `Reveal`
- `tokens.ts` — design tokens
- `styles.tsx` — global CSS landing page

## Catatan Penting
- `SheetContent` dari shadcn punya `flex flex-col gap-4` hardcoded — tidak bisa di-override Tailwind biasa, harus pakai inline styles + CSS `!important`
- Logo tersedia di `/public/img/logo-text-blue.webp` dan `/public/img/logo-text-white.webp`
- Jangan ubah brand color TemanKas (`#0066cc`)
- `color` di Category DTO sudah dijadikan `@IsOptional()` — default `#6E6E73` di service jika tidak dikirim. Prisma schema masih non-nullable (tidak perlu migration).
