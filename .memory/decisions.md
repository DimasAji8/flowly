# 📌 Decisions & Backlog — Flowly (Teman Kas)

> **File ini adalah salah satu dari 2 file utama di folder `.memory/` yang WAJIB dibaca AI agent di awal task.**
> File ini menyimpan riwayat keputusan arsitektur, log perbaikan masalah (*troubleshooting*), serta rencana pengerjaan (*backlog*) aktif.

---

## 🏛️ 1. Riwayat Keputusan Arsitektural Utama

*   **npm Workspaces**: Monorepo minimalis menggunakan default `npm workspaces` + `concurrently` untuk penyederhanaan setup tanpa overhead pnpm/Turborepo.
*   **Local Postgres**: DB berjalan di `localhost:5432` tanpa Docker untuk performa lokal yang ringan dan setup cepat.
*   **Port Config**: Web menggunakan port `4000`, API menggunakan port `3333` (menghindari port default `3000` yang sering bertabrakan).
*   **Tarik Tunai**: Aksi transfer naratif dari dompet non-Tunai ke dompet Tunai (tanpa membuat skema database baru). Jika dompet "Tunai" belum ada, sistem akan membuatnya secara otomatis dengan type `cash`.
*   **Split Brand**: Menggunakan nama **"Teman Kas"** pada landing page dan auth pages demi citra lokal yang ramah, serta nama **"Flowly"** di metadata/dashboard internal.
*   **Developer Dashboard (Redesign)**: Layout dashboard admin yang modern (Vercel/Stripe-like) untuk monitoring non-finansial: tren registrasi, adopsi fitur, operational status, system health log, dan feedback/review moderation.
*   **AI Page Refactor**: Dashboard dibebaskan dari latency Gemini API (3-5 detik) dengan memindahkan modul AI Insights ke halaman khusus **Analisis AI** (`/ai`) dengan indikator skor visual 0-100 yang simetris dan dimuat secara instan menggunakan persistent file-cache.
*   **Client-Side Image Compression**: Mengompresi gambar struk belanja > 1.5MB pada client-side via HTML Canvas menjadi JPEG resolusi 1600px dengan kualitas 80% sebelum diunggah, untuk menghindari error ukuran berkas backend (max 4MB).
*   **Sonner Toast Replacement**: Semua pemanggilan `alert()` browser pada Developer Console diganti dengan toast notification modern menggunakan `sonner`.

---

## 🎯 2. Backlog & Rencana Pengembangan Aktif

### ⏳ A. Integrasi WhatsApp Bot (Gratis & Ringan)
*   **Kebutuhan**: Memungkinkan user mencatat transaksi atau menanyakan saldo via WhatsApp.
*   **Library**: `@whiskeysockets/baileys` (WebSocket langsung ke server WhatsApp Web, memory footprint rendah ~30-50MB RAM).
*   **Skema Database**:
    ```prisma
    model User {
      // ...
      whatsappNumber String?   @unique @map("whatsapp_number")
    }
    ```
*   **Alur Kerja**:
    1.  User mengirim chat (Contoh: *"Catat nasi padang 20rb dari dompet gopay"*).
    2.  NestJS backend mencari user berdasarkan nomor WhatsApp pengirim yang telah dinormalisasi.
    3.  Jika terdaftar, kirim pesan ke Gemini API untuk diklasifikasikan intent-nya (`RECORD_TRANSACTION`, `GET_BALANCE`, `GET_INSIGHTS`, `HELP`).
    4.  Picu service AI yang relevan, catat transaksi di database, lalu kembalikan respon chat konfirmasi ke user.
*   **Langkah Berikutnya**: Jalankan migrasi kolom `whatsapp_number`, buat UI input nomor WA di halaman Profil, inisialisasi module Baileys dengan session manager di `.sessions/`.

### 💤 B. Versi Mobile Android (CapacitorJS) — *Diarsipkan ke Branch Terpisah*
*   **Pendekatan**: Membungkus Next.js `apps/web` menjadi WebView native menggunakan CapacitorJS.
*   **Status Terakhir (2026-07-22)**:
    *   Seluruh konfigurasi Capacitor, folder `apps/web/android/`, serta dependencies mobile telah **dipindahkan dan diarsipkan** ke branch git khusus: **`archive/android-setup`** agar tidak mengotori/mempengaruhi branch utama (`dev` / `main`).
    *   Branch utama (`dev` / `main`) telah dibersihkan sepenuhnya dan kembali menggunakan konfigurasi Next.js standard server (tanpa static export conditional `EXPORT_MOBILE`).
    *   Kueri parameter routing (menggantikan dynamic route `/transactions/[id]/edit` -> `/transactions/edit?id=<id>`) tetap dipertahankan karena lebih aman dan membersihkan potensi error static export di masa depan tanpa merusak logic web.
*   **Langkah Jika Ingin Melanjutkan**:
    *   Lakukan git checkout/merge dari branch `archive/android-setup` kembali ke branch aktif.

---

## 🔧 3. Log Troubleshooting Proyek

### 🛠️ Masalah SSL API `api.temankas.com` (2026-06-21)
*   **Gejala**: Login gagal dengan pesan `ERR_CERT_COMMON_NAME_INVALID` karena API backend belum memiliki SSL.
*   **Solusi**:
    ```bash
    sudo certbot --nginx -d api.temankas.com
    # Pilih opsi 1 (reinstall existing certificate) untuk menyatukan SSL web & api.
    ```
*   *Catatan*: Hindari hardcode konfigurasi SSL Certbot di dalam repository agar file konfigurasi Nginx di repo tetap bersih dan portabel.

### 🛠️ Perbaikan Kesalahan Linting Build Produksi (2026-06-12)
*   **Gejala**: Build Next.js gagal di GitHub Actions karena type errors dan kegagalan lint.
*   **Penyebab & Perbaikan**:
    1.  File yatim `animated-characters-login-page.tsx` yang rusak telah dihapus.
    2.  Variable yang tidak digunakan (`ROUTES`, `PhoneFrame`, dll.) dibersihkan.
    3.  Rule `no-unused-vars` di `eslint.config.mjs` diubah untuk mengabaikan parameter berawalan underscore (contoh: `_`).
    4.  Politisasi SSR-safe di-override dengan filter `eslint-disable-next-line react-hooks/set-state-in-effect`.
    5.  Error NestJS `no-unsafe-return` di DTO diperbaiki dengan mengetik parameter decorator `@Transform` secara eksplisit: `({ value }: { value: unknown })`.
