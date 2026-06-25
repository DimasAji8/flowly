import type { DriveStep } from "driver.js";

export const calendarSteps: DriveStep[] = [
  {
    element: ".calendar-card-container",
    popover: {
      title: "Kalender Transaksi",
      description: "Kalender ini menampilkan catatan pemasukan dan pengeluaran harian Anda. Tanggal dengan indikator warna membantu Anda melihat aktivitas keuangan dengan cepat.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: ".calendar-monthly-summary",
    popover: {
      title: "Ringkasan Bulanan",
      description: "Di sini Anda bisa melihat total pemasukan, pengeluaran, dan selisih bersih untuk bulan yang sedang ditampilkan.",
      side: "top",
      align: "center",
    },
  },
  {
    element: ".calendar-daily-detail",
    popover: {
      title: "Detail Transaksi Harian",
      description: "Klik pada tanggal mana saja di kalender untuk melihat daftar transaksi lengkap pada hari tersebut di bagian bawah ini.",
      side: "top",
      align: "center",
    },
  },
];
