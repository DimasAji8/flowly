# Rencana Pengembangan Halaman Laporan

Route: `/reports` | Status: **sebagian diimplementasi**

## Kondisi saat ini
Halaman Laporan berisi satu section: **Analisis Pengeluaran** (SpendingInsights — breakdown 50/30/20).

## Yang perlu ditambahkan (prioritas)

### 1. Ringkasan bulan (prioritas tinggi)
- Total income, expense, net bulan yang dipilih
- Bisa reuse data `monthlySummary` yang sudah di-fetch
- Tampilan: 3 chip/kartu kecil di atas

### 2. Pengeluaran per kategori (prioritas tinggi)
- Tabel/list kategori diurutkan dari terbesar
- Tampilkan: icon kategori, nama, jumlah, % dari total pengeluaran
- Data sudah ada di `categorySpends`

### 3. Tren bulanan (prioritas sedang)
- Grafik/barchart income vs expense 6 bulan terakhir
- Butuh fetch data beberapa bulan → pertimbangkan API endpoint baru atau multiple fetch

### 4. Export/share (prioritas rendah, jangka panjang)
- Screenshot atau PDF ringkasan bulanan

## Catatan
- Halaman sudah ada navigasi bulan (prev/next)
- Data `categorySpends` sudah tersedia, tinggal render tabel
- Untuk tren butuh data historis yang belum di-fetch saat ini
