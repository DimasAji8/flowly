"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { useAuthStore } from "@/store/auth.store";

import { T, IMG } from "./_components/tokens";
import { LandingStyles } from "./_components/styles";
import { GlobalNav } from "./_components/nav";
import { HeroSection } from "./_components/hero";
import { FeatureRow } from "./_components/feature-row";
import { FeatureRowSavings } from "./_components/feature-row-savings";
import { Banner } from "./_components/banner";
import { CapabilityGrid } from "./_components/capability-grid";
import { FaqSection } from "./_components/faq";
import { CtaSection } from "./_components/cta";
import { Footer } from "./_components/footer";
import { ScreenSavings } from "./_components/screens";

export default function LandingPage() {
  const router = useRouter();
  const { isReady, user, accessToken } = useAuthStore();

  useEffect(() => {
    if (isReady && user && accessToken) {
      router.replace(ROUTES.dashboard);
    }
  }, [isReady, user, accessToken, router]);

  return (
    <>
      <LandingStyles />
      <GlobalNav />

      <main>
        <HeroSection />

        <FeatureRow
          id="overview"
          eyebrow="Pemasukan & Pengeluaran"
          title="Catat pengeluaran jangan Cuma perasaan."
          body="Gak perlu lagi tebak-tebakan uang habis ke mana. Pilih kategori, pilih dompet, selesai dalam 5 detik bahkan sambil rebahan."
          bg={T.canvas}
          image="/img/section-2.webp"
          imageAlt="Mencatat keuangan dari rumah"
        />

        <FeatureRow
          id="calendar"
          eyebrow="Tampilan Kalender"
          title="Lihat uangmu dalam linimasa."
          body="Tampilan bulanan menunjukkan ke mana uang bergerak. Titik hijau untuk pemasukan, merah untuk pengeluaran. Ketuk tanggal mana pun untuk detail."
          bg={T.tintBlue}
          image="/img/mockup-calendar.webp"
          imageAlt="Tampilan kalender transaksi bulanan"
          reverse
        />

        <Banner
          image={IMG.calmDesk}
          eyebrow="Tenang & Fokus"
          title="Dibuat untuk uang sehari-hari, bukan spreadsheet."
          cta="Mulai gratis"
          href={ROUTES.register}
        />

        <FeatureRowSavings
          id="savings"
          eyebrow="Target Tabungan"
          title="Wujudkan Impian Finansial dengan Rencana yang Terukur"
          body="Kelola target keuangan jangka pendek dan panjang dengan tracking real-time. Sistem fleksibel yang menyesuaikan dengan kemampuan dan prioritas Anda."
          screen={<ScreenSavings />}
        />

        <CapabilityGrid />

        <FaqSection />

        <CtaSection />
      </main>

      <Footer />
    </>
  );
}
