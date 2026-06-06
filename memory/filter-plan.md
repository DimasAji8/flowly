# Filter & Sorting — Rencana Peningkatan

Status: **SELESAI diimplementasi** (2026-06-06)

## Yang sudah diimplementasi

### Backend (NestJS)
- `savings-goals`: DTO `ListSavingsGoalsQuery` — param `isPaused`, `isCompleted` (isCompleted filter server-side via in-memory karena tidak ada kolom boolean di DB)
- `recurring`: DTO `ListRecurringQuery` — param `type`, `isActive`; default sort berubah dari `createdAt desc` ke `nextRunAt asc`

### Frontend (Next.js)
- Komponen reusable `FilterChips` di `components/ui/filter-chips.tsx`
- **Transactions** (`/transactions`): filter tipe (All/Pemasukan/Pengeluaran) + dropdown dompet + dropdown kategori (kategori otomatis difilter berdasarkan tipe terpilih; reset saat tipe berubah). Fetch wallets & categories via store.
- **Savings Goals** (`/savings-goals`): filter status chips (Semua/Aktif/Tercapai/Dijeda) — client-side via `useMemo`. Default: "Aktif" supaya goal tercapai tidak memenuhi layar.
- **Recurring** (`/recurring`): filter tipe + filter aktif/non-aktif — server-side via query param. Reload otomatis saat filter berubah.

## Catatan teknis
- Transactions: `type`, `walletId`, `categoryId` sudah didukung API sejak awal, tinggal wiring UI.
- Savings Goals: filter `isPaused` dan `isCompleted` sekarang juga tersedia di API (untuk future use), tapi UI menggunakan `useMemo` client-side karena data sudah di-fetch semuanya.
- Recurring: API sekarang support `type` dan `isActive` query param.

## Halaman yang belum difilter
- Wallets: data sedikit, grouping per tipe sudah cukup
- Categories: sudah ter-split income/expense
- Calendar: opsional, bisa ditambahkan filter type/wallet untuk detail hari
- Transfers: tidak ada param tambahan yang relevan

Konteks: Saat ini aplikasi Flowly hampir tidak punya filter. Yang ada hanya
navigasi bulan (transactions, calendar, transfers). Dokumen ini mencatat
temuan audit + rekomendasi filter per halaman.

## Temuan audit (kondisi saat ini)

| Halaman | Filter yang sudah ada | Param API tersedia tapi belum dipakai |
|---------|----------------------|----------------------------------------|
| Transactions | Navigasi bulan (`from`/`to`), `limit:500 page:1` hardcoded | `type`, `walletId`, `categoryId`, pagination |
| Savings Goals | Tidak ada | API `list()` tanpa param → filter harus client-side |
| Wallets | Grouping otomatis per tipe | API `list()` tanpa param → client-side |
| Categories | Split income/expense client-side | `type` (didukung API, tapi UI sudah split) |
| Recurring | Tidak ada | API `list()` tanpa param → client-side |
| Calendar | Navigasi bulan + klik tanggal | `type`, `walletId`, `categoryId` untuk detail hari |
| Transfers | Navigasi bulan (`year`/`month`) | Tidak ada param tambahan |

## Rekomendasi filter (prioritas)

### Prioritas tinggi — Transactions (paling banyak data)
- Filter `type`: All / Pemasukan / Pengeluaran (segmented control / chips)
- Filter `walletId`: dropdown dompet
- Filter `categoryId`: dropdown kategori (idealnya tergantung type terpilih)
- Search note (client-side dari hasil bulan tsb, karena API belum ada `q`)
- Sorting: tanggal (default desc), nominal
- Semua param di atas SUDAH didukung API → tinggal wiring UI.
- Catatan: pertimbangkan pindah dari `limit:500` ke pagination nyata bila data besar.

### Prioritas sedang — Savings Goals
- Filter status: Aktif / Tercapai / Dijeda (chips) — client-side
- Berkaitan dengan diskusi sebelumnya soal goal "Tercapai" auto-collapse:
  tab/chip "Tercapai" bisa jadi tempat arsip goal selesai.
- Sorting: progress %, target date terdekat.

### Prioritas sedang — Recurring
- Filter: type (income/expense), status aktif/non-aktif, frekuensi — client-side
- Sorting: jadwal berikutnya terdekat.

### Prioritas rendah
- Wallets: search by name (client-side) — data biasanya sedikit.
- Categories: sudah ter-split, filter minim manfaat.
- Calendar: filter type/wallet/category untuk detail hari (opsional).

## Pola UI yang disarankan (konsistensi)
- Gunakan komponen filter bar reusable (chips untuk pilihan eksklusif kecil,
  dropdown untuk daftar panjang spt wallet/kategori).
- Mobile-first: filter bisa di balik tombol "Filter" yang membuka sheet/modal
  agar tidak makan ruang di layar kecil.
- Pertahankan bahasa Indonesia untuk label (konsisten dgn app).

## Catatan teknis
- Beberapa service (savings-goals, wallets, recurring) belum terima query param.
  Filter untuk halaman ini dilakukan client-side dulu. Bila data tumbuh besar,
  pertimbangkan tambah query param di API NestJS.
- Belum ada riwayat setoran per savings goal (hanya `currentAmount` kumulatif).
  Jika butuh riwayat, perlu skema baru di backend (tabel kontribusi).
