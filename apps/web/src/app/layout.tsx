import type { Metadata } from "next";
import { Playfair_Display, Urbanist } from "next/font/google";
import "./globals.css";
import { AuthHydrator } from "@/components/layout/auth-hydrator";
import { ToastProvider } from "@/components/ui/toast-provider";
import { ThemeProvider } from "@/components/ui/theme-provider";

const jakarta = Urbanist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Flowly",
  description: "Mobile-first cashflow journal",
  icons: {
    icon: [
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon/favicon.ico" },
    ],
    apple: "/favicon/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full antialiased ${jakarta.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans" suppressHydrationWarning>
        <ThemeProvider>
          <AuthHydrator>{children}</AuthHydrator>
          <ToastProvider />
        </ThemeProvider>
      </body>
    </html>
  );
}
