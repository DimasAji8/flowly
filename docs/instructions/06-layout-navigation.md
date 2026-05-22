# 06 — Layout, Navigation, Animation & Dark Mode

## Mobile Layout

### Base Width

```txt
390px
```

Design utama dibuat untuk lebar 390px (iPhone 13/14 baseline). Layout harus fleksibel turun ke 360px dan naik ke desktop tanpa pecah.

### Container

- Max width pada desktop: ~430–480px (mobile-first, tidak full lebar di desktop)
- Padding horizontal: 16px–20px

## Navigation

### Bottom Navigation (4 menu utama)

```txt
Home
Calendar
Transactions
Profile
```

### Rules

- **Maksimal 4 menu** di bottom navigation. Jangan tambah lagi.
- Bottom nav selalu visible di main pages (kecuali fullscreen modal/form).
- Active state: warna accent + font-weight lebih tebal.
- Inactive state: secondary text color.

## Animation Rules

### ✅ Gunakan

- Subtle transition (200–250ms)
- Fast animation
- Smooth micro interaction (hover, tap feedback)
- Ease-out untuk masuk, ease-in untuk keluar

### ❌ Hindari

- Floating animation (elemen bergerak terus)
- Bounce berlebihan
- Animasi berat (parallax, complex transform)
- Animasi >400ms pada interaksi sehari-hari

## Charts

Gunakan visualisasi **sederhana**:

- Simple bar chart (cashflow bulanan)
- Donut chart sederhana (distribusi kategori)

Hindari:

- Analytics overload (terlalu banyak chart dalam 1 page)
- 3D chart
- Chart dengan banyak axis/legend

## Dark Mode

Support 2 mode:

- Light mode (default)
- Dark mode

### Aturan

- Tetap gunakan **matte color** (bukan pure black/white)
- Soft contrast — readable tapi tidak menyilaukan
- Income tetap hijau, Expense tetap merah (dengan saturasi disesuaikan)
- Toggle dark mode tersedia di Profile

## Responsive

- Mobile first (390px baseline)
- Tablet & desktop: layout tetap dibatasi container ~480px (looks like mobile-on-desktop)
- Tidak perlu layout dashboard wide untuk desktop — fokus tetap mobile experience
