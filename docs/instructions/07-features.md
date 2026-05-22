# 07 — Main Features

Daftar fitur utama Flowly. Setiap fitur punya scope yang jelas — jangan over-engineer.

## 1. Authentication

### Features

- Register
- Login
- JWT Auth
- Refresh Token
- Logout

### Future (siapkan struktur, belum implement)

- Google Login ready

## 2. Dashboard

### Show

- Total income bulan ini
- Total expense bulan ini
- Net cashflow
- Simple monthly chart
- Recent transactions

### Rules

Dashboard harus:

- Ringan
- Clean
- Tidak terlalu banyak card

## 3. Transaction Management

### Features

- Add transaction
- Edit transaction
- Delete transaction

### Fields

```txt
type
amount
category
wallet
note
transaction_date
```

### Type

```txt
income
expense
```

## 4. Categories

### Features

- Create category
- Edit category
- Delete category

### Fields

```txt
name
type
color
```

### Rules

- Gunakan indikator warna kecil saja (titik bulat).
- Tidak perlu icon besar.

## 5. Calendar View

### Features

- Monthly calendar
- Indicator income/expense per tanggal
- Klik tanggal → tampilkan transaksi pada hari itu

### Rules

- 🟢 Hijau = income
- 🔴 Merah = expense
- Minimal visual noise (titik kecil, bukan badge besar)

## 6. Recurring Transaction

### UX

Saat menambah transaksi:

```txt
[x] Repeat this transaction
```

Jika aktif, tampilkan pilihan:

```txt
frequency:
- daily
- weekly
- monthly
```

### System Behavior

- Recurring transaction otomatis membuat transaksi baru berdasarkan jadwal.
- Dijalankan oleh scheduler job (lihat `11-backend-structure.md` & schedule job NestJS).

## 7. Wallets

### Examples

- Cash
- BCA
- Dana
- GoPay

### Features

- Add wallet
- Wallet balance
- Wallet transaction history

## 8. Multi User

Gunakan konsep **workspace**:

```txt
workspace
```

Satu user bisa join ke beberapa workspace. Semua data (transaksi, kategori, wallet, recurring) terikat ke workspace.

### Roles

```txt
owner
member
```

- **Owner**: bisa invite, kelola anggota, dan punya full access.
- **Member**: bisa CRUD data dalam workspace.
