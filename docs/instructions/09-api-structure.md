# 09 — API Structure

Semua API menggunakan REST dengan prefix opsional `/api/v1` (sesuaikan saat implementasi). Authenticated endpoint memerlukan header `Authorization: Bearer <jwt>`.

## Auth

```txt
POST /auth/register
POST /auth/login
POST /auth/refresh
GET  /auth/me
```

| Endpoint | Body | Response |
|----------|------|----------|
| `POST /auth/register` | `{ name, email, password }` | `{ user, accessToken, refreshToken }` |
| `POST /auth/login` | `{ email, password }` | `{ user, accessToken, refreshToken }` |
| `POST /auth/refresh` | `{ refreshToken }` | `{ accessToken }` |
| `GET /auth/me` | — | `{ user }` |

## Transactions

```txt
GET    /transactions
POST   /transactions
PATCH  /transactions/:id
DELETE /transactions/:id
```

Query params disarankan:

- `?from=YYYY-MM-DD&to=YYYY-MM-DD`
- `?type=income|expense`
- `?wallet_id=...`
- `?category_id=...`

## Categories

```txt
GET  /categories
POST /categories
```

Tambahkan saat implementasi (sesuai kebutuhan):

```txt
PATCH  /categories/:id
DELETE /categories/:id
```

## Wallets

```txt
GET  /wallets
POST /wallets
```

Tambahkan saat implementasi:

```txt
PATCH  /wallets/:id
DELETE /wallets/:id
GET    /wallets/:id/transactions
```

## Aturan Umum API

- Semua response sukses: `{ data, message? }`
- Semua error: `{ statusCode, message, error }`
- Validation pakai DTO + class-validator (NestJS) → mirror dengan Zod schema di frontend
- Pagination: `?page=1&limit=20` → response `{ data, meta: { page, limit, total } }`
- Authorization: setiap request data dijamin ter-scope ke workspace user (via JWT payload + guard)

## Swagger / OpenAPI

Saat dev mode (`NODE_ENV !== production`), API mengekspos:

- **Swagger UI:** `http://localhost:3333/api/v1/docs`
- **OpenAPI JSON:** `http://localhost:3333/api/v1/docs-json`

Cara test endpoint protected dari Swagger UI:

1. Hit `POST /auth/login` atau `/auth/register`, salin `accessToken` dan `workspaceId` dari response.
2. Klik tombol **Authorize** di kanan atas.
3. Tempel access token di field `access-token` (tanpa prefix `Bearer`).
4. Tempel workspace id di field `workspace-id` (untuk endpoint workspace-scoped).
5. Endpoint protected sekarang bisa di-execute langsung.

## Belum Tercantum (Tambahan yang Disarankan)

Saat implementasi, kemungkinan dibutuhkan:

```txt
GET    /workspaces
POST   /workspaces
PATCH  /workspaces/:id
POST   /workspaces/:id/members      (invite)
DELETE /workspaces/:id/members/:uid

GET    /recurring
POST   /recurring
PATCH  /recurring/:id
DELETE /recurring/:id

GET    /dashboard/summary           (income, expense, net cashflow bulan ini)
```

Konfirmasi ke product owner sebelum menambah endpoint baru di luar list utama.
