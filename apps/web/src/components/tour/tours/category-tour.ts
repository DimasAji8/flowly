import type { DriveStep } from "driver.js";

export const categorySteps: DriveStep[] = [
  {
    element: ".btn-add-category",
    popover: {
      title: "➕ Tambah Kategori Baru",
      description: "Gunakan tombol ini untuk membuat kategori pemasukan atau pengeluaran baru sesuai kebutuhanmu.",
      side: "bottom",
      align: "end",
    },
  },
  {
    element: ".category-list-container",
    popover: {
      title: "📋 Daftar Kategori",
      description: "Semua kategori kamu dikelompokkan berdasarkan Pemasukan dan Pengeluaran. Kamu bisa mengedit atau menghapus kategori dari sini.",
      side: "top",
      align: "start",
    },
  },
];
