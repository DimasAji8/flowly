# 14 — UX Principles & Final Goal

## UX Principles

User harus bisa:

- ⚡ **Tambah transaksi < 5 detik**
- 👁️ **Melihat data tanpa bingung**
- ✋ **Menggunakan aplikasi dengan satu tangan**

Tiga prinsip ini adalah filter utama setiap keputusan UX. Kalau sebuah fitur/UI melanggar salah satu, perbaiki atau buang.

## Implikasi Praktis

### Tambah transaksi < 5 detik

- Form tambah transaksi langsung accessible dari home (FAB atau shortcut bottom nav).
- Default value cerdas: tanggal = hari ini, wallet = terakhir dipakai, type = expense.
- Minimal field wajib: type, amount, category, wallet, date.
- Note bersifat opsional.

### Melihat data tanpa bingung

- Hierarki visual jelas (typography & spacing).
- Income & expense dibedakan warna konsisten (hijau/merah).
- Tidak ada chart yang membutuhkan tutorial untuk dibaca.

### Satu tangan

- Action utama berada di area mudah dijangkau jempol (bawah).
- Bottom navigation, FAB di kanan bawah, primary button di bawah form.
- Hindari action penting di pojok kiri atas.

## Final Goal

Aplikasi harus terasa:

- ✅ Ringan
- ✅ Tenang
- ✅ Cepat
- ✅ Modern
- ✅ Personal

Aplikasi BUKAN:

- ❌ ERP
- ❌ Crypto dashboard
- ❌ Accounting system perusahaan

## Pertanyaan Filter Sebelum Merge Fitur

Sebelum menambah / merge sebuah fitur atau UI, tanyakan:

1. Apakah ini bikin user lebih cepat catat transaksi?
2. Apakah ini bikin tampilan lebih tenang atau malah ramai?
3. Apakah ini bisa dipakai dengan satu tangan?
4. Apakah ini selaras dengan filosofi "calm financial journal"?

Kalau ada jawaban "tidak" tanpa alasan kuat → revisi atau buang.
