import type { Metadata } from "next";
import { Urbanist, Playfair_Display } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AuthHydrator } from "@/components/layout/auth-hydrator";
import { ToastProvider } from "@/components/ui/toast-provider";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { cn } from "@/lib/utils";

const urbanist = Urbanist({
  subsets: ["latin"],
  variable: "--font-urbanist",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://temankas.com'),
  title: {
    default: "Teman Kas - Aplikasi Pencatatan Keuangan Pribadi & Bisnis",
    template: "%s | Teman Kas"
  },
  description: "Aplikasi mobile-first untuk mencatat dan memantau arus kas harian. Catat pemasukan, pengeluaran, target tabungan, dan kelola keuangan dengan mudah. Gratis dan mudah digunakan.",
  keywords: [
    "aplikasi keuangan",
    "pencatatan keuangan",
    "cashflow",
    "catat pengeluaran",
    "catat pemasukan",
    "target tabungan",
    "manajemen keuangan pribadi",
    "aplikasi catatan keuangan",
    "budget planner",
    "financial tracker",
    "dompet digital",
    "rekap keuangan",
    "teman kas",
    "pengelolaan uang",
    "aplikasi gratis"
  ],
  authors: [{ name: "Teman Kas" }],
  creator: "Teman Kas",
  publisher: "Teman Kas",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon/favicon.ico" },
    ],
    apple: "/favicon/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://temankas.com",
    siteName: "Teman Kas",
    title: "Teman Kas - Sahabat Pengelola Keuanganmu",
    description: "Aplikasi mobile-first untuk mencatat dan memantau arus kas harian. Catat pemasukan, pengeluaran, target tabungan dengan mudah.",
    images: [
      {
        url: "/img/og-image.png",
        width: 1200,
        height: 630,
        alt: "Teman Kas - Aplikasi Pencatatan Keuangan",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Teman Kas - Sahabat Pengelola Keuanganmu",
    description: "Aplikasi mobile-first untuk mencatat dan memantau arus kas harian.",
    images: ["/img/og-image.png"],
    creator: "@temankas",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "google6da9112f10e672cb",
    // yandex: "your-yandex-verification-code",
    // yahoo: "your-yahoo-verification-code",
  },
  alternates: {
    canonical: "https://temankas.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("h-full", "antialiased", urbanist.variable, playfair.variable, "font-sans")} suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans" suppressHydrationWarning>
        <Script id="theme-init" strategy="beforeInteractive">{`try{var t=localStorage.getItem('theme');var c=document.documentElement.classList;if(t==='dark'){c.add('dark');}else{c.add('light');}}catch(e){}`}</Script>
        <ThemeProvider>
          <AuthHydrator>{children}</AuthHydrator>
          <ToastProvider />
        </ThemeProvider>
      </body>
    </html>
  );
}
