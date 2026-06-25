import type { DriveStep } from "driver.js";

interface DashboardTourParams {
  isDesktop: boolean;
  onNavigateToWallets: () => void;
}

export const getDashboardSteps = ({ isDesktop, onNavigateToWallets }: DashboardTourParams): DriveStep[] => [
  {
    element: ".dashboard-summary",
    popover: {
      title: "Selamat Datang di Temankas",
      description: "Di sini Anda bisa melihat ringkasan pemasukan, pengeluaran, dan saldo bersih bulan ini secara cepat.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: isDesktop ? ".fab-add-desktop" : ".fab-add-mobile",
    popover: {
      title: "Tambah Transaksi",
      description: "Tombol ini digunakan untuk mencatat transaksi baru. Cukup klik, isi detail transaksi, dan simpan.",
      side: isDesktop ? "left" : "top",
      align: "center",
    },
  },
  {
    element: isDesktop ? ".side-item-dompet" : ".nav-item-dompet",
    popover: {
      title: "Menu Dompet",
      description: "Selanjutnya, mari kita pelajari cara mengelola rekening dan saldo Anda di halaman Dompet. Klik Lanjut untuk berpindah halaman.",
      side: isDesktop ? "right" : "top",
      align: "center",
      onNextClick: () => {
        onNavigateToWallets();
      },
    },
  },
  // Step phantom — tidak pernah ditampilkan. Tujuannya agar tombol "Lanjut"
  // tetap muncul di step sebelumnya (bukan "Selesai"), sehingga onNextClick terpicu.
  {
    popover: { title: "", description: "" },
  },
];
