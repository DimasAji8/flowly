# Project Context

## Overview
**Flowly** — mobile-first cashflow journal app. Personal & simple multi-user
(workspace-based) tracking of income/expense. Should feel calm, fast, personal —
NOT an enterprise accounting/ERP/crypto dashboard.

## Goals
- Add a transaction in **< 5 seconds**.
- View data without confusion (clear visual hierarchy, consistent colors).
- Usable **one-handed** (primary actions at bottom / thumb reach).
- Feel: lightweight, calm, fast, modern, personal.

## Core Business Rules
- **Multi-tenancy by workspace.** Almost all data is scoped to `workspace_id`.
  Every data query MUST be filtered by workspace (enforced at guard/service layer).
- A user can belong to multiple workspaces. Roles: `owner` (full access, invite,
  manage members) and `member` (CRUD data within workspace).
- On register: a personal workspace + owner membership is auto-created, and
  default wallets + categories are seeded so the user can record immediately.
- On login: the user's primary workspace = oldest workspace they own.
- Income is always green (Success), expense always red (Danger).
- Budget allocation per workspace: needs/wants/savings targets (default 50/30/20).
- **Developer role**: UserRole enum (`user | developer`). Developer memiliki
  dashboard, layout, sidebar sendiri. Auto-seed dari env saat startup. Login
  langsung redirect ke `/developer`, bukan dashboard user.

## Main Features
Auth, Dashboard (monthly income/expense/net + chart + recent + spending insights),
Transactions (CRUD), Categories (name/type/color/icon/group), Calendar (monthly,
green/red dot indicators), Recurring transactions (scheduler-driven), Wallets
(balance + history), Transfers (between wallets), Savings Goals, Multi-user
workspaces.
