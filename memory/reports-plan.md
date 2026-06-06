# Rencana Pengembangan Halaman Laporan

Route: `/reports` | Status: **SELESAI (fase 1)**

## Kondisi saat ini (2026-06-06)
Halaman Laporan sudah menampilkan:
1. ✅ **Ringkasan Bulan** (MonthlySummaryCard) - income, expense, net
2. ✅ **Pengeluaran per Kategori** (CategorySpendingTable) - sorted terbesar, dengan persentase
3. ✅ **Analisis Pengeluaran** (SpendingInsights) - breakdown 50/30/20

## Yang bisa ditambahkan ke depan (opsional)

### 3. Tren bulanan (prioritas rendah)
- Grafik/barchart income vs expense 6 bulan terakhir
- Butuh fetch data beberapa bulan → pertimbangkan API endpoint baru atau multiple fetch
- CATATAN: Sempat diimplementasi tapi dihapus karena terlalu banyak

### 4. Export/share (prioritas rendah, jangka panjang)
- Screenshot atau PDF ringkasan bulanan

## Catatan
- Halaman sudah ada navigasi bulan (prev/next)
- Data `categorySpends` sudah tersedia, tinggal render tabel
- Untuk tren butuh data historis yang belum di-fetch saat ini
