# Cashflow Mobile App — Full Project Prompt

## Project Overview

Buat sebuah aplikasi mobile-first bernama **Flowly** (placeholder name) untuk pencatatan cashflow pribadi dan multi-user.

Fokus utama aplikasi:

* minimalis
* clean
* nyaman digunakan setiap hari
* mobile-first
* cepat saat input transaksi
* visual tenang dan modern
* tidak terasa seperti aplikasi accounting perusahaan

Aplikasi digunakan untuk:

* mencatat pemasukan dan pengeluaran
* melihat histori transaksi
* melihat cashflow berdasarkan kalender
* mengelola kategori
* recurring transaction
* multi-user sederhana

Pendekatan desain:

> calm UI + whitespace + typography + spacing

Bukan:

* dashboard crypto
* UI penuh icon
* AI gradient style
* glassmorphism berlebihan

---

# Main Stack

## Frontend

* Next.js 15 (App Router)
* TypeScript
* Tailwind CSS v4
* shadcn/ui
* Zustand
* React Hook Form
* Zod
* FullCalendar
* Recharts

## Backend

* NestJS
* TypeScript
* Prisma ORM
* PostgreSQL
* JWT Authentication
* bcrypt

## Deployment

Frontend:

* VPS (Nginx + PM2)

Backend:

* VPS (PM2)

Database:

* PostgreSQL

---

# Design Concept

## Visual Style

Gunakan desain:

* minimal
* soft
* modern
* elegant
* calm financial journal

Prioritaskan:

* spacing
* typography
* layout

Bukan dekorasi berlebihan.

---

# UI Rules

## Hindari

* gradient besar
* glow effect
* neon
* card berlebihan
* icon terlalu banyak
* shadow berat
* warna terlalu kontras
* background pure white (#FFFFFF)

---

# Color Palette

Gunakan warna soft matte, bukan putih terang.

## Background

```txt
#F3F4F6
```

## Surface

```txt
#E5E7EB
```

## Card

```txt
#ECEFF3
```

## Primary Text

```txt
#111827
```

## Secondary Text

```txt
#4B5563
```

## Accent

```txt
#2563EB
```

## Success

```txt
#15803D
```

## Danger

```txt
#B91C1C
```

## Border

```txt
#D1D5DB
```

---

# Typography

Gunakan:

* Inter

Rules:

* heading tegas
* body clean
* line height nyaman
* tidak terlalu padat

---

# Mobile Layout

## Base Width

```txt
390px
```

## Navigation

Bottom navigation:

```txt
Home
Calendar
Transactions
Profile
```

Jangan lebih dari 4 menu utama.

---

# Main Features

# 1. Authentication

## Features

* Register
* Login
* JWT Auth
* Refresh Token
* Logout

## Future

* Google Login ready

---

# 2. Dashboard

## Show

* total income bulan ini
* total expense bulan ini
* net cashflow
* simple monthly chart
* recent transactions

## Rules

Dashboard harus:

* ringan
* clean
* tidak terlalu banyak card

---

# 3. Transaction Management

## Features

* add transaction
* edit transaction
* delete transaction

## Fields

```txt
type
amount
category
wallet
note
transaction_date
```

## Type

```txt
income
expense
```

---

# 4. Categories

## Features

* create category
* edit category
* delete category

## Fields

```txt
name
type
color
```

Gunakan indikator warna kecil saja.

Tidak perlu icon besar.

---

# 5. Calendar View

## Features

* monthly calendar
* indicator income/expense
* click date to show transactions

## Rules

* hijau = income
* merah = expense
* minimal visual noise

---

# 6. Recurring Transaction

## UX

Saat tambah transaksi:

```txt
[x] Repeat this transaction
```

Jika aktif:

```txt
frequency:
- daily
- weekly
- monthly
```

## System

Recurring transaction otomatis membuat transaksi baru berdasarkan jadwal.

---

# 7. Wallets

## Examples

* Cash
* BCA
* Dana
* GoPay

## Features

* add wallet
* wallet balance
* wallet transaction history

---

# 8. Multi User

Gunakan konsep:

```txt
workspace
```

## Roles

```txt
owner
member
```

---

# Database Schema

# users

```txt
id
name
email
password
created_at
updated_at
```

# workspaces

```txt
id
name
owner_id
created_at
updated_at
```

# workspace_members

```txt
id
workspace_id
user_id
role
created_at
```

# wallets

```txt
id
workspace_id
name
balance
created_at
```

# categories

```txt
id
workspace_id
name
type
color
created_at
```

# transactions

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

# recurring_transactions

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

---

# Frontend Folder Structure

```txt
src/
│
├── app/
│   ├── dashboard/
│   ├── calendar/
│   ├── transactions/
│   ├── profile/
│   └── auth/
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── dashboard/
│   ├── calendar/
│   ├── transaction/
│   └── forms/
│
├── hooks/
├── services/
├── store/
├── lib/
├── types/
├── utils/
└── constants/
```

---

# Backend Folder Structure

```txt
src/
│
├── common/
│   ├── guards/
│   ├── filters/
│   ├── interceptors/
│   ├── decorators/
│   └── utils/
│
├── config/
│
├── prisma/
│
├── modules/
│   ├── auth/
│   ├── users/
│   ├── workspaces/
│   ├── transactions/
│   ├── categories/
│   ├── wallets/
│   └── recurring/
│
├── jobs/
│
└── main.ts
```

---

# API Structure

# Auth

```txt
POST /auth/register
POST /auth/login
POST /auth/refresh
GET  /auth/me
```

# Transactions

```txt
GET    /transactions
POST   /transactions
PATCH  /transactions/:id
DELETE /transactions/:id
```

# Categories

```txt
GET /categories
POST /categories
```

# Wallets

```txt
GET /wallets
POST /wallets
```

---

# Recurring Job

Gunakan:

* @nestjs/schedule

## Job

Setiap hari:

* cek recurring_transactions
* generate transaction baru
* update next_run_at

---

# UX Principles

User harus bisa:

* tambah transaksi < 5 detik
* melihat data tanpa bingung
* menggunakan aplikasi dengan satu tangan

---

# Animation Rules

Gunakan:

* subtle transition
* fast animation
* smooth micro interaction

Hindari:

* floating animation
* bounce berlebihan
* animasi berat

---

# Charts

Gunakan:

* simple bar chart
* donut chart sederhana

Jangan:

* analytics overload

---

# Dark Mode

Support:

* light mode
* dark mode

Tetap gunakan:

* matte color
* soft contrast

Bukan pure black/pure white.

---

# VPS Deployment

## Frontend

* Next.js build
* PM2
* Nginx reverse proxy

## Backend

* NestJS build
* PM2
* Nginx reverse proxy

## SSL

* Certbot + Let's Encrypt

---

# Development Phases

# Phase 1

* setup NestJS
* setup Next.js
* setup Prisma
* setup PostgreSQL
* authentication

---

# Phase 2

* transaction CRUD
* categories
* wallets
* dashboard

---

# Phase 3

* calendar integration
* calendar transaction view

---

# Phase 4

* recurring transaction
* scheduler job

---

# Phase 5

* responsive optimization
* dark mode
* performance optimization
* deployment

---

# Final Goal

Aplikasi harus terasa:

* ringan
* tenang
* cepat
* modern
* personal

Bukan:

* ERP
* crypto dashboard
* accounting system perusahaan.
