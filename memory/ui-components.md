# Komponen UI yang Tersedia — Flowly

Selalu gunakan komponen ini sebelum membuat elemen baru dari scratch.
File ada di `apps/web/src/components/ui/`.

## Komponen dasar

| Komponen | File | Kegunaan |
|----------|------|----------|
| `Button` | `button.tsx` | Tombol. Variant: `primary`, `secondary`, `ghost`, `danger`. Size: `sm`, `md`. Props: `isLoading`, `leftIcon`. |
| `Input` | `input.tsx` | Input teks. Props: `label`, `error`, `leftAdornment`, `rightAdornment`. |
| `Select` | `select.tsx` | Dropdown select. Props: `label`, `error`, `options: {value, label}[]`, `placeholder`. **Gunakan ini, bukan `<select>` native.** |
| `Card` | `card.tsx` | Wrapper kartu. Props: `padding` (`none`, `md`). |
| `Skeleton` | `skeleton.tsx` | Loading placeholder. |
| `Chip` | `chip.tsx` | Badge/label kecil. Props: `tone` (`neutral`, `accent`, `success`, `danger`, `warning`), `size` (`sm`, `md`), `dot`, `dotColor`. |
| `FilterBar` | `filter-bar.tsx` | **Filter popover** — tombol "Filter" → popover dengan draft state + tombol Terapkan/Batal/Reset. Config array dengan type `chip` atau `dropdown`. Reset langsung apply. **Gunakan ini untuk semua filter di halaman list.** |
| `EmptyState` | `empty-state.tsx` | State kosong. Props: `title`, `description`, `actionLabel`, `actionHref`, `onAction`. |
| `FormError` | `form-error.tsx` | Pesan error form. |

## Komponen overlay

| Komponen | File | Kegunaan |
|----------|------|----------|
| `Modal` | `modal.tsx` | Modal sheet. Props: `open`, `onClose`, `onBack`, `title`. **Jangan nest Modal di dalam Modal.** |
| `ConfirmModal` | `confirm-modal.tsx` | Modal konfirmasi. Props: `open`, `onClose`, `onConfirm`, `title`, `description`, `confirmLabel`, `confirmVariant`, `loading`. **Render sebagai sibling, bukan child Modal.** |
| `DropdownMenu` | `dropdown-menu.tsx` | Dropdown menu (Radix-based). |
| `Popover` | `popover.tsx` | Popover (Radix-based). |
| `Calendar` | `calendar.tsx` | Kalender date picker. |

## Komponen navigasi/layout

| Komponen | File | Kegunaan |
|----------|------|----------|
| `BackButton` | `back-button.tsx` | Tombol kembali mobile. Props: `label`, `onBack` (override default `router.back()`). |
| `ActionMenu` | `action-menu.tsx` | Menu aksi (edit/delete/pause) untuk list item. |
| `IconButton` | `icon-button.tsx` | Tombol icon. |

## Aturan penting

1. **Select** — selalu pakai `Select` dari `select.tsx`, bukan `<select>` HTML native.
2. **Modal bertingkat** — konfirmasi di dalam form modal harus pakai step/state di dalam satu `Modal`, bukan `ConfirmModal` nested.
3. **Loading state** — gunakan `Skeleton` untuk placeholder loading.
4. **State kosong** — gunakan `EmptyState` untuk halaman/section tanpa data.
5. **Filter toggle kecil** — `FilterChips`. Filter daftar panjang — `Select`.
