# Navigasi & Penempatan Menu — Analisis & Rekomendasi

Status: **proposal / diskusi** (dicatat 2026-06-06)

## Masalah saat ini

Menu manajemen fitur inti disimpan di dalam halaman **Profil**:
- Dompet
- Target Tabungan
- Kategori
- Berulang (recurring)
- Target Alokasi

Sementara bottom nav hanya memuat: Beranda, Kalender, [FAB], Dompet, Profil.

### Kenapa ini kurang baik (setuju dengan user)
1. **Discovery buruk** — fitur utama seperti Target Tabungan "tersembunyi" di balik Profil. User harus tahu dulu untuk menemukannya.
2. **Mental model tidak konsisten** — Dompet muncul di bottom nav, tapi Target Tabungan (fitur setara pentingnya) ada di Profil.
3. **Profil overloaded** — idealnya Profil = akun & preferensi (data user, tema, logout), bukan pintu masuk fitur inti.
4. **Bottom nav terbatas** — hanya muat 4 slot + FAB, tidak cukup untuk semua fitur.

## Pola yang dipakai aplikasi perbankan/fintech
Aplikasi seperti BCA, Jago, Jenius, GoPay umumnya pakai **Quick Actions Grid**:
grid icon kecil di dashboard (biasanya 4 kolom) sebagai shortcut ke fitur-fitur.
Ini menyelesaikan discovery + akses cepat sekaligus.

## Opsi

### Opsi A — Quick Actions Grid di Dashboard (REKOMENDASI)
Tambah grid icon di dashboard, tepat di bawah `SummaryCards`.

```
[Dompet]  [Tabungan]  [Kategori]  [Berulang]
[Alokasi] [Kalender]  [Laporan]   [...]
```

- **Plus**: discovery bagus, akses cepat, familiar (pola perbankan), tidak menambah beban bottom nav.
- **Minus**: dashboard jadi lebih panjang. Perlu desain agar tidak terlalu ramai.
- **Profil dibersihkan**: tinggalkan akun + tema + logout saja.
- Penempatan ideal: `header → SummaryCards → [Quick Actions] → Transaksi terbaru → Insights`.

### Opsi B — Tambah tab "Menu/Lainnya" di bottom nav
Ganti slot "Profil" jadi "Menu" yang membuka halaman daftar semua fitur, profil masuk ke dalamnya.
- **Plus**: bottom nav tetap ringkas.
- **Minus**: tetap butuh 1 tap ekstra, discovery tidak sebaik grid di dashboard.

### Opsi C — Hybrid (REKOMENDASI JANGKA PANJANG)
- Quick Actions Grid di dashboard (Opsi A) untuk akses cepat fitur utama.
- Profil dibersihkan jadi murni akun & preferensi.
- Bottom nav tetap: Beranda, Kalender, [FAB], Dompet/Tabungan, Profil.
- Fitur sekunder (Kategori, Berulang, Alokasi) cukup diakses via Quick Actions grid.

## Rekomendasi final
**Opsi C (Hybrid)** — implementasi bertahap:
1. Buat komponen `QuickActions` grid di dashboard (icon + label kecil, grid 4 kolom mobile).
2. Pindahkan menu manajemen dari Profil ke grid tersebut.
3. Bersihkan Profil: sisakan info akun, toggle tema, logout.
4. (Opsional) Pertimbangkan ganti salah satu slot bottom nav dengan Target Tabungan jika dianggap fitur paling sering dipakai.

### Detail desain Quick Actions (saran)
- Grid `grid-cols-4` di mobile, `grid-cols-6/8` di desktop (atau sembunyikan di desktop karena ada side-nav).
- Tiap item: icon dalam kotak rounded + label kecil di bawah.
- Reuse `ROUTES` yang sudah ada.
- Konsisten dengan style `ManageRow` (icon dalam `bg-accent-soft text-accent`).

## Catatan
- Desktop sudah punya `SideNav` yang bisa memuat semua menu — masalah utama ada di mobile.
- Pertimbangkan apakah Quick Actions perlu tampil di desktop atau cukup mobile saja (karena side-nav sudah cover desktop).
- Belum diimplementasi. Menunggu keputusan user soal opsi mana yang dipilih.
