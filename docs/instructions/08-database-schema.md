# 08 — Database Schema

Database menggunakan **PostgreSQL** dengan **Prisma ORM**. Semua data multi-tenant berbasis `workspace_id`.

## users

```txt
id
name
email
password
created_at
updated_at
```

- `email` unique
- `password` di-hash dengan bcrypt
- Relasi: 1 user → many workspaces (sebagai owner), many workspace_members (sebagai member)

## workspaces

```txt
id
name
owner_id
created_at
updated_at
```

- `owner_id` FK → `users.id`
- Relasi: 1 workspace → many members, wallets, categories, transactions, recurring_transactions

## workspace_members

```txt
id
workspace_id
user_id
role
created_at
```

- `role`: enum `owner` | `member`
- Composite unique: (`workspace_id`, `user_id`) — user tidak bisa double join workspace yang sama

## wallets

```txt
id
workspace_id
name
balance
created_at
```

- `balance` di-update saat transaksi add/edit/delete (atau dihitung dari sum transaksi — pilih salah satu strategi konsisten)
- Relasi: 1 wallet → many transactions

## categories

```txt
id
workspace_id
name
type
color
created_at
```

- `type`: enum `income` | `expense`
- `color`: hex string (mis. `#15803D`)
- Relasi: 1 category → many transactions

## transactions

```txt
id
workspace_id
wallet_id
category_id
user_id
type
amount
note
transaction_date
created_at
updated_at
```

- `type`: enum `income` | `expense`
- `user_id`: user yang membuat transaksi (untuk audit di multi-user)
- `transaction_date`: tanggal transaksi (bukan created_at)

## recurring_transactions

```txt
id
workspace_id
wallet_id
category_id
type
amount
frequency
note
next_run_at
is_active
created_at
```

- `frequency`: enum `daily` | `weekly` | `monthly`
- `next_run_at`: timestamp untuk scheduler
- `is_active`: bisa di-pause user

## Catatan Implementasi

- Semua tabel kecuali `users` punya `workspace_id` untuk multi-tenancy.
- Semua query data harus difilter `workspace_id` — wajib dijaga di service/guard layer.
- Gunakan soft delete bila perlu (opsional, tergantung kebutuhan audit).
- Index disarankan pada: `workspace_id`, `transaction_date`, `next_run_at`.
