# 04 — UI Rules

## ❌ Hindari

- Gradient besar
- Glow effect
- Neon
- Card berlebihan
- Icon terlalu banyak
- Shadow berat
- Warna terlalu kontras
- Background pure white (`#FFFFFF`)
- Background pure black (`#000000`) di dark mode

## ✅ Gunakan

- Background soft matte (lihat `05-color-typography.md`)
- Whitespace yang cukup
- Border tipis untuk separator (bukan shadow)
- Indikator warna kecil (titik kecil untuk kategori)
- Icon hanya saat benar-benar perlu (navigation, action utama)
- Hierarki visual lewat typography & spacing, bukan dekorasi

## Card & Container

- Card hanya untuk grouping content yang benar-benar terpisah
- Hindari nested card (card di dalam card)
- Gunakan border tipis + background sedikit berbeda dari surface

## Shadow

- Tidak ada heavy shadow
- Jika perlu elevation, gunakan border 1px tipis
- Maksimal `shadow-sm` di Tailwind, dan jarang dipakai

## Konsistensi

- Spacing menggunakan kelipatan 4px (Tailwind default)
- Border radius konsisten: `rounded-lg` untuk card, `rounded-md` untuk button/input
- Tinggi tombol konsisten (umumnya 40–44px untuk mobile)
