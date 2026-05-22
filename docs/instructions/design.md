# Flowly — Design Concept v2

Dokumen ini adalah konsep desain visual & interaksi untuk **iterasi UI Phase 2.5**, mengganti tampilan flat awal yang terasa seperti wireframe.

Konsep ini diturunkan dari:
- Brief asli (`03-design-concept.md` — calm financial journal, minimal, soft)
- Filter UI rules (`04-ui-rules.md` — hindari gradient besar, glow, glassmorphism)
- Inspirasi vibe segar: kombinasi background lembut + card putih + aksen pastel + dekoratif kecil
- Goal: **terasa segar dan personal**, bukan flat dan plain, tapi tetap "calm" — bukan playful kampus

> Penting: referensi visual yang dipakai sebagai mood hanya **inspirasi vibe**, bukan template untuk dijiplak. Flowly tetap punya identitas sendiri.

---

## 1. Tone & Karakter

| Atribut | Mau seperti ini | Bukan seperti ini |
|---------|----------------|-------------------|
| Mood | Calm, segar, personal | Flat clinical / corporate accounting |
| Karakter | "Journal keuangan yang ramah" | "ERP / dashboard analytics" |
| Density | Lega, banyak whitespace | Padat informasi |
| Accent | Pastel halus, sparingly | Saturasi tinggi di mana-mana |
| Dekoratif | Sentuhan kecil (star/dot, ilustrasi line) | Ilustrasi besar yang dominan |
| Animasi | Subtle, < 250ms | Bouncy, floating, parallax |

---

## 2. Palette

Mengganti palette netral abu-abu di brief lama dengan **sky-tinted neutral**. Tetap matte, tetap soft, tapi terasa lebih hidup.

### Light mode

```txt
Background page    #EFF4FB   (sky-tinted neutral, bukan #F3F4F6 abu)
Surface (section)  #E2EAF6
Card (default)     #FFFFFF   (putih bersih → kontras dengan background)
Card subtle        #F5F8FD   (varian untuk row/list item hover)

Text primary       #0F172A
Text secondary     #475569
Text muted         #94A3B8

Accent (primary)   #2563EB
Accent soft        #DBE6FB   (background chip biru pastel)

Success            #15803D
Success soft       #D7F0DF
Danger             #B91C1C
Danger soft        #FBE2E2
Warning            #B45309
Warning soft       #FCE9CC

Border             #DCE3EE
Border subtle      #ECF0F7

Shadow ring        rgba(15, 23, 42, 0.04)   (untuk elevation halus)
```

### Dark mode

```txt
Background page    #0B1220
Surface            #111A2D
Card               #161F36
Card subtle        #1B2541

Text primary       #E2E8F0
Text secondary     #94A3B8
Text muted         #64748B

Accent             #60A5FA
Accent soft        rgba(96, 165, 250, 0.15)

Success            #4ADE80
Success soft       rgba(74, 222, 128, 0.12)
Danger             #F87171
Danger soft        rgba(248, 113, 113, 0.12)

Border             #1F2A44
Border subtle      #182238
```

### Aturan Pemakaian

- **Page background = sky tint**, bukan putih murni dan bukan abu-abu netral.
- **Card utama = putih bersih** untuk kontras lembut dengan page → ini yang menghasilkan "depth tanpa shadow berat".
- **Pastel soft** dipakai HANYA untuk: chip status, badge kategori, hover state row, dan icon background. Tidak boleh dipakai sebagai background besar.
- **Text muted** ada level baru untuk timestamp / helper kecil.
- Income tetap hijau, Expense tetap merah — tapi value-nya sekarang punya pasangan "soft" untuk chip/background.

---

## 3. Tipografi

### Font

- Primary: **Inter** (font system stack: `Inter, ui-sans-serif, system-ui, ...`)
- Numerik: pakai `tabular-nums` di semua angka uang & tanggal supaya rata vertikal di list.

### Hirarki

| Level | Use | Size (mobile) | Size (desktop) | Weight | Tracking |
|-------|-----|---------------|----------------|--------|----------|
| Display | Page title (Halo, bulan, dll) | 28px | 32px | 700 | -0.01em |
| H2 | Section header | 18px | 20px | 600 | normal |
| H3 | Card title | 16px | 16px | 600 | normal |
| Body | Default | 14px | 14px | 400 | normal |
| Small | Caption, helper | 12px | 12px | 400 | normal |
| Label | Form label, uppercase chip | 11px | 11px | 600 | 0.06em |

Line height: 1.4 untuk heading, 1.55 untuk body.

### Aturan
- Heading **tegas** dengan tracking sedikit negatif → modern feel.
- Body **clean** tanpa cape (line-height nyaman).
- Uppercase **HANYA** untuk label kecil & badge chip (tracking diperbesar).
- Angka uang selalu `tabular-nums` agar tidak "loncat" saat berubah.

---

## 4. Spacing & Radius

### Spacing scale
Tetap pakai Tailwind default (kelipatan 4px). Yang penting:
- Padding card default: `p-5` (20px)
- Padding card emphasized (Net cashflow): `p-6` (24px)
- Gap antar section di page: `gap-8` (mobile) / `gap-10` (desktop)
- Gap antar card di section: `gap-3` (12px)

### Radius
- Card / panel: `rounded-2xl` (16px) → **lebih lembut dari sebelumnya** (sebelumnya 8px terasa kaku)
- Button: `rounded-xl` (12px)
- Input: `rounded-lg` (8px)
- Chip / badge: `rounded-full`
- Modal / dialog: `rounded-2xl` di atas, `rounded-3xl` total kalau bottom sheet

### Elevation
- **Card default:** border 1px `Border subtle` + shadow halus `0 1px 2px rgba(15,23,42,0.04)`. Tidak ada heavy shadow.
- **Card emphasized:** border 1px `Border` + shadow `0 4px 16px -4px rgba(15,23,42,0.06)` — masih sangat halus.
- **Modal:** shadow lebih kuat tapi tetap soft, plus backdrop blur.

> Pencapaian "depth tanpa shadow berat" datang dari **kontras background page (sky tint) vs card (putih)**, bukan dari shadow.

---

## 5. Iconography

### Library: **lucide-react**

Alasan: line-style minimalis, weight konsisten, tidak warna-warni — cocok dengan filosofi calm.

### Aturan
- **Stroke width 2** secara default, ukuran 16px (di tombol kecil) atau 20px (di nav, list).
- Icon **monokrom** mengikuti warna teks parent. Tidak diwarnai dengan brand colors (kecuali untuk indikator kategori).
- Icon **TIDAK BOLEH** jadi dekorasi — hanya membantu scanability.
- **Bottom nav & side nav:** icon kecil di atas teks (mobile) atau di kiri teks (desktop).
- **Empty state:** ilustrasi line-art ringan (bukan emoji, bukan ilustrasi karakter berwarna). Pakai SVG sederhana custom atau dari lucide.

---

## 6. Komponen — Spec Visual

### 6.1 Card

**Default:**
- Background `#FFFFFF`
- Border 1px `Border subtle`
- Shadow halus
- Padding 20–24px
- Radius 16px

**Hover (untuk card interaktif):**
- Border naik ke `Border`
- Background tetap

### 6.2 Summary Cards (dashboard)

**Net cashflow card** (utama):
- Lebih besar dari yang lain, padding 24px
- Background putih
- Label uppercase kecil di atas
- Angka besar 32–36px, weight 700
- Indikator naik/turun: panah kecil + persen vs bulan lalu (kalau ada data)

**Income & Expense card** (sekunder):
- Padding 16–20px
- Angka 18–20px, weight 600
- Background putih, border tipis
- Indikator chip kecil "Income" / "Expense" warna pastel

Layout:
- Mobile: net besar di atas, income & expense 2 kolom di bawah
- Desktop: 3 kolom horizontal, net di kiri lebih dominan

### 6.3 Transaction Item

**Tampilan list (di card container):**
- Per item: padding-y 14px, padding-x 16px
- Layout horizontal:
  - Kiri: **icon kategori** dalam circle pastel (warna kategori soft, icon mengikuti tipe)
  - Tengah: nama kategori (medium 14px) + helper (date · wallet · note) di bawahnya (muted 12px)
  - Kanan: amount dengan sign (+/−) dan warna sesuai tipe, `tabular-nums`
- Hover (desktop): background `Card subtle`
- Tap (mobile): scale 0.99 sebentar, lalu open detail/edit

### 6.4 Status / Type Chip

Bentuk pill kecil, padding-x 8px, padding-y 2px, font 11px uppercase weight 600.

| Type | Background | Foreground |
|------|------------|-----------|
| Income | `Success soft` | `Success` |
| Expense | `Danger soft` | `Danger` |
| Pending | `Warning soft` | `Warning` |
| Default | `Card subtle` | `Text secondary` |

### 6.5 Button

**Primary:**
- Background `Accent`
- Text white
- Tinggi 44px
- Radius 12px
- Hover: opacity 0.92
- Active: scale 0.98 (transition 100ms)
- Loading: spinner kecil + label tetap (jangan diganti "...")

**Secondary:**
- Background putih
- Border 1px `Border`
- Text `Text primary`
- Hover: background `Card subtle`

**Ghost:**
- Tanpa background
- Text `Text secondary`
- Hover: text `Text primary` + bg `Card subtle`

**Icon button (NEW):**
- Square 36×36px atau 40×40px
- Variant ghost / secondary
- Untuk: close modal, edit/delete row

### 6.6 Input

- Tinggi 44px (sebelumnya 44px sudah)
- Radius 8px (lebih kecil dari card supaya kontras)
- Background `Card subtle` (bukan card putih) → terasa "diisi"
- Border `Border subtle`, focus `Accent` 2px ring
- Label di atas, uppercase kecil, weight 600, tracking +
- Error: border merah + helper teks merah di bawah

**Amount input** (NEW):
- Prefix "Rp" abu-abu di kiri
- Font 24px weight 600 di body input
- Alignment: prefix kiri, value rata kiri tapi font besar terasa
- Format saat blur (mis. 25000 → 25.000)

### 6.7 Modal / Dialog (BARU)

Library: **Radix UI Dialog**

**Mobile:** bottom sheet
- Slide-up dari bawah
- Lebar 100%, max-height 92dvh
- Radius atas 24px
- Backdrop overlay rgba(0,0,0,0.4) + blur 4px
- Drag handle 4px×40px di atas

**Desktop:** centered
- Max-width 480px
- Radius 16px
- Backdrop overlay rgba(15,23,42,0.4) + blur 8px

**Header modal:** title + close icon (kanan atas, ghost icon button)
**Footer modal (untuk form):** sticky bawah, button Cancel + Save

### 6.8 Toast (BARU)

Library: **Sonner**

- Posisi: bottom-center (mobile), bottom-right (desktop)
- Durasi default 3s
- Tone:
  - Success: hijau soft + icon check
  - Error: merah soft + icon alert
  - Info: biru soft + icon info
- Animasi: fade + slide subtle, tidak bouncy

### 6.9 Skeleton Loading (BARU)

Ganti teks "Loading…" dengan placeholder shape yang menyerupai konten:
- Animasi: shimmer halus 1.5s loop, tidak agresif
- Background base: `Border subtle`
- Background highlight: `Card subtle`
- Bentuk: rectangle radius mengikuti komponen aslinya

### 6.10 Empty State (BARU)

Daripada teks polos:
- Ilustrasi line SVG sederhana 80–120px (geometri abstrak: garis + titik, bukan karakter)
- Heading kecil ("Belum ada transaksi")
- Helper teks 1 baris
- CTA primary button

---

## 7. Layout & Responsive

### Mobile (< 768px)
- Container max-width 480px (auto-center)
- Padding horizontal 20px
- Bottom nav sticky bawah dengan icon + label
- Page padding-bottom 80px (memberi ruang untuk bottom nav)

### Desktop (≥ 768px)
- Layout shell: sidebar 240px kiri + content max-width 760px
- Sidebar: brand + nav (icon + label horizontal)
- Page padding 32px
- Summary card 3 kolom horizontal

### Decorative accents (NEW)
Subtle dekoratif kecil di sudut page hero (dashboard / auth), seperti:
- Star/dot biru pastel kecil di pojok atas page
- Tidak boleh mengganggu konten utama
- HANYA di mobile hero section dan auth page

> Tujuan: menghilangkan kesan "wireframe" tanpa membuat ramai.

---

## 8. Motion

| Trigger | Animasi | Durasi | Easing |
|---------|---------|--------|--------|
| Page transition | fade-in only | 150ms | ease-out |
| Modal open | fade backdrop + slide-up sheet | 250ms | cubic-bezier(0.32, 0.72, 0, 1) |
| Modal close | reverse | 200ms | ease-in |
| Toast in/out | fade + slide kecil | 200ms | ease-out |
| Button press | scale 0.98 | 100ms | ease-out |
| Hover row | bg fade | 120ms | ease |
| Skeleton shimmer | 1.5s loop | infinite | ease-in-out |

Aturan keras:
- ❌ Tidak ada animasi floating/bouncing
- ❌ Tidak ada parallax
- ❌ Tidak ada stagger panjang
- ✅ Animasi cuma "menyamarkan transisi state", bukan dekorasi

---

## 9. Interaktivitas Baru

### 9.1 Quick Add Transaction (modal)
- Tombol "+ Add transaction" di dashboard → buka **modal** (bukan navigasi)
- Halaman `/transactions/new` tetap ada sebagai fallback (deep link langsung)
- Mobile: bottom sheet
- Desktop: centered dialog

### 9.2 Edit / Delete Transaction
- Tap item transaksi → modal detail dengan tombol Edit & Delete
- Edit: form di modal yang sama (inline switch)
- Delete: konfirmasi modal sederhana

### 9.3 Toast feedback
- Setiap mutasi (add/edit/delete) → toast hijau "Tersimpan"
- Error → toast merah dengan pesan API

### 9.4 Loading states
- Replace "Loading…" dengan skeleton di:
  - Summary cards
  - Recent transactions
  - Transactions list page
  - Form select (wallet, kategori) saat fetch awal

### 9.5 Empty states
- Replace teks polos dengan ilustrasi + CTA di:
  - Transactions list (belum ada transaksi)
  - Calendar (belum ada data)
  - Recent transactions di dashboard

---

## 10. Dark Mode

Dipertahankan dari brief, tapi sekarang punya palette dedicated yang mengikuti vibe baru. Toggle di Profile (Phase 5).

Aturan:
- **Bukan** pure black / pure white
- Card sedikit lebih terang dari page background → tetap bedakan layer
- Aksen biru lebih cerah di dark mode (`#60A5FA`)
- Pastel soft pakai rgba dengan opacity 12–15%

---

## 11. Apa yang Dipertahankan dari Brief Lama

- Filosofi calm, minimal, tidak ramai icon, tidak gradient besar
- Mobile-first 390px
- Bottom nav 4 tab (Home, Calendar, Transactions, Profile)
- Hindari pure white & pure black
- Income hijau, Expense merah
- Tipografi sebagai pondasi hierarki

## Apa yang Diubah / Ditambahkan

- Palette page background: abu netral → sky-tinted neutral
- Card: surface card abu → putih bersih (depth via kontras, bukan shadow)
- Radius lebih besar (16px untuk card)
- Pastel soft variant untuk chip status & accent
- Icon (lucide-react) ditambahkan di nav
- Modal interaction (Radix Dialog) untuk add/edit/delete
- Toast notification (Sonner)
- Skeleton loading + empty state ilustratif
- Decorative accents kecil di hero
- Tipografi hirarki lebih kuat (display vs body lebih kontras)

---

## 12. Roadmap Implementasi

### Batch 1 — Foundation
1. Update `globals.css` dengan palette baru + radius scale + shadow tokens
2. Install `lucide-react`
3. Refresh primitives: Button, Input, Card (baru), Chip (baru), IconButton (baru)
4. Refresh BottomNav & SideNav dengan icon
5. Update typography (display heading, label, dll)

### Batch 2 — Component Upgrade
6. Skeleton primitive
7. Empty state komponen + ilustrasi line-art
8. SummaryCards v2 (hierarchy)
9. TransactionItem v2 (icon circle pastel + chip)
10. AmountInput dedicated component

### Batch 3 — Interactivity
11. Install `@radix-ui/react-dialog` & `sonner`
12. Modal primitive (Dialog) dengan animasi mobile bottom sheet
13. Quick add transaction modal di dashboard
14. Edit/Delete transaction modal
15. Toast provider + integrasi di semua mutasi

### Batch 4 — Polish
16. Decorative accents di hero
17. Page transitions halus
18. Final pass: dark mode value tuning, tabular-nums di angka

Setiap batch diakhiri dengan: build pass, smoke test, dan verifikasi di kedua viewport mobile + desktop.

---

## 13. Out of Scope (untuk Phase 2.5 ini)

- Custom font loading (Inter via next/font) — masih pakai system stack untuk hindari hydration issue dulu
- Animasi advanced (page transitions Framer Motion) — pakai CSS transition dulu
- Calendar view styling — masuk Phase 3
- Charts visual upgrade — masuk Phase 2.6
- Keyboard shortcuts (mis. cmd+K untuk add transaksi) — Phase 5
