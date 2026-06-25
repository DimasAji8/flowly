import type { DriveStep } from "driver.js";

interface WalletTourParams {
  isDesktop: boolean;
  onNavigateToCalendar: () => void;
}

export const getWalletSteps = ({ isDesktop, onNavigateToCalendar }: WalletTourParams): DriveStep[] => [
  {
    element: ".btn-add-wallet",
    popover: {
      title: "Tambah Dompet Baru",
      description: "Buat dompet baru untuk memisahkan uang tunai, rekening bank, e-wallet, atau tabungan khusus.",
      side: "bottom",
      align: "end",
    },
  },
  {
    element: ".wallet-list-container",
    popover: {
      title: "Daftar Dompet dan Saldo",
      description: "Semua dompet Anda ditampilkan di sini beserta saldonya. Anda bisa melakukan transfer antar dompet atau tarik tunai dari menu aksi di setiap dompet.",
      side: "top",
      align: "start",
    },
  },
  {
    element: ".wallet-history-link",
    popover: {
      title: "Riwayat Transfer",
      description: "Klik di sini untuk melihat semua riwayat pemindahan saldo antar dompet yang pernah Anda lakukan.",
      side: "top",
      align: "center",
    },
  },
  {
    element: isDesktop ? ".side-item-kalender" : ".nav-item-kalender",
    popover: {
      title: "Menu Kalender",
      description: "Terakhir, mari kita lihat halaman Kalender untuk memantau catatan keuangan harian Anda. Klik Lanjut untuk berpindah halaman.",
      side: isDesktop ? "right" : "top",
      align: "center",
      onNextClick: () => {
        onNavigateToCalendar();
      },
    },
  },
  // Step phantom — tidak pernah ditampilkan. Tujuannya agar tombol "Lanjut"
  // tetap muncul di step sebelumnya (bukan "Selesai"), sehingga onNextClick terpicu.
  {
    popover: { title: "", description: "" },
  },
];
