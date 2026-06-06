# Redesign Dashboard — Opsi & Rekomendasi

Status: **proposal / diskusi** (dicatat 2026-06-06)

Tujuan: tampilan terbaik & mudah dipakai (mobile-first), sekaligus
menyelesaikan masalah penempatan menu (lihat `navigation-menu-plan.md`).

## Struktur dashboard saat ini
```
header (logo/greeting + avatar)
SummaryCards (income / expense / net + total saldo)
Transaksi terbaru
SpendingInsights (breakdown kategori + target alokasi)
SavingsGoalsSummary
```
Masalah: tidak ada akses cepat ke fitur (Dompet, Tabungan, Kategori, dll),
semua tersembunyi di Profil. Dashboard terasa "pasif" (hanya menampilkan data).

## Prinsip desain yang dipakai
- **Mobile-first**: prioritaskan layar kecil, desktop sudah ter-cover SideNav.
- **F-pattern / hierarki jelas**: info terpenting (saldo) di atas, aksi cepat menyusul.
- **Progressive disclosure**: ringkasan dulu, detail via "Lihat semua".
- **Konsistensi**: reuse style kartu & warna yang sudah ada.

---

## Opsi 1 — Minimal: tambah Quick Actions saja
Struktur:
```
header
SummaryCards
[Quick Actions grid]   ← BARU (4 icon: Dompet, Tabungan, Kategori, Berulang/Alokasi)
Transaksi terbaru
SpendingInsights
SavingsGoalsSummary
```
- **Plus**: perubahan paling kecil, cepat, low-risk. Langsung selesaikan masalah discovery.
- **Minus**: dashboard tetap panjang; tidak ada peningkatan hierarki lain.
- **Cocok jika**: ingin perbaikan cepat tanpa mengubah banyak.

---

## Opsi 2 — Hero Balance + Quick Actions (REKOMENDASI)
Mengadopsi pola perbankan modern: kartu saldo besar di atas sebagai "hero",
diikuti aksi cepat, lalu konten.

Struktur:
```
header (greeting + avatar)
┌─────────────────────────────┐
│  HERO: Total Saldo (besar)  │  ← gabungan total saldo + net bulan ini
│  +income / -expense ringkas │
└─────────────────────────────┘
[Quick Actions grid 4 icon]
Ringkasan bulan (income/expense/net) — versi ringkas/chip
Transaksi terbaru (3 item + Lihat semua)
SpendingInsights (collapsible / ringkas)
SavingsGoalsSummary (carousel/ringkas)
```
- **Plus**: fokus visual ke saldo (yang paling sering dicari user), aksi cepat menonjol, terasa seperti app perbankan profesional.
- **Minus**: perlu redesign SummaryCards jadi hero + ringkasan terpisah.
- **Cocok jika**: ingin tampilan terbaik & modern (sesuai keinginan user).

### Detail Hero Balance
- Angka saldo total besar & jelas, dengan opsi sembunyikan (mata 👁) seperti m-banking.
- Subteks: net bulan ini (hijau/merah) + nama bulan.
- Background gradient halus / warna accent agar menonjol.

### Detail Quick Actions
- Grid `grid-cols-4` mobile. Tiap item: icon dalam kotak rounded `bg-accent-soft text-accent` + label kecil.
- Isi: Dompet, Tabungan, Kategori, Berulang. (Alokasi & Kalender opsional di baris ke-2 atau "Lainnya").
- `md:hidden` jika desktop sudah pakai SideNav, atau tetap tampil sebagai shortcut.

---

## Opsi 3 — Card-based modular (dashboard "widget")
Setiap blok jadi kartu modular yang bisa disusun ulang.
```
header
Hero Balance
Quick Actions
[grid kartu: Ringkasan bulan | Insights | Tabungan | Transaksi]
```
- **Plus**: paling fleksibel, scalable untuk fitur baru, rapi di desktop (multi-kolom).
- **Minus**: paling banyak kerjaan, butuh sistem layout grid responsif.
- **Cocok jika**: rencana jangka panjang dengan banyak fitur.

---

## Rekomendasi final: **Opsi 2 (Hero Balance + Quick Actions)** + dashboard ringkas
Alasan: paling seimbang antara "tampilan terbaik" dan "mudah dipakai", sesuai
keinginan user, dan effort menengah.

## Apa yang HARUS di dashboard vs TIDAK (penting)
Prinsip: dashboard = info yang dilihat **setiap hari** (glanceable).
Analisis mendalam yang dilihat **sesekali** → pindah ke halaman sendiri.

| Konten | Keputusan | Alasan |
|--------|-----------|--------|
| Hero saldo total | **Wajib di dashboard** | Info #1 yang dicari user tiap buka app |
| Quick Actions | **Wajib di dashboard** | Akses cepat fitur, ganti menu di Profil |
| Ringkasan bulan (income/expense/net) | **Ya, versi ringkas** | Konteks cepat, jadikan chip/baris kecil |
| Transaksi terbaru (3 item) | **Ya** | Aktivitas terakhir, relevan harian |
| SpendingInsights (analisis 50/30/20) | **PINDAH** ke halaman "Laporan/Analisis" | Detail, dilihat sesekali bukan tiap hari. Di dashboard cukup teaser 1 baris "Lihat analisis →" (opsional) |
| SavingsGoalsSummary | **Opsional / ringkas** | Sudah ada akses via Quick Actions. Bisa tampilkan 1 goal terdekat saja, atau hilangkan dari dashboard |

### Dashboard ringkas (usulan final)
```
header (greeting + avatar)
Hero Balance (saldo total + toggle sembunyikan + net bulan ini)
Quick Actions (4 icon)
Ringkasan bulan (chip income / expense / net) — ringkas
Transaksi terbaru (3 item + Lihat semua)
[opsional] 1 baris teaser "Analisis pengeluaran →" menuju halaman Laporan
```

### Halaman baru: Laporan/Analisis
- Pindahkan `SpendingInsights` ke sini (full version).
- Bisa diakses via Quick Actions ("Laporan") atau teaser di dashboard.
- Tempat natural untuk grafik/insight lain di masa depan.

### Rencana implementasi bertahap (revisi)
1. **Komponen `QuickActions`** — pindahkan menu dari Profil.
2. **`SummaryCards` → `HeroBalance`** — saldo fokus + toggle sembunyikan saldo.
3. **Ringkasan bulan** jadi chip ringkas.
4. **Pindahkan `SpendingInsights`** ke halaman baru `/reports` (atau sejenis).
5. **SavingsGoalsSummary**: ringkas jadi 1 goal terdekat di dashboard, atau cukup akses via Quick Actions.
6. **Bersihkan Profil** — akun, tema, logout saja.

### Catatan desktop
- Desktop punya SideNav. Quick Actions bisa `md:hidden`. Dashboard desktop bisa pakai layout 2 kolom untuk manfaatkan ruang.

## Status
Belum diimplementasi. Menunggu user memilih opsi (rekomendasi: Opsi 2).
