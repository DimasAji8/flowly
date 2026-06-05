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
import { Banner } from "./_components/banner";
import { CapabilityGrid } from "./_components/capability-grid";
import { CtaSection } from "./_components/cta";
import { Footer } from "./_components/footer";
import { ScreenDashboard, ScreenCalendar, ScreenSavings } from "./_components/screens";

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
          title="Catat tiap transaksi. Tanpa repot."
          body="Pilih kategori, tentukan dompet, tambahkan catatan — selesai. Dirancang agar bisa dilakukan dengan satu tangan."
          bg={T.canvas}
          image={IMG.coffeeReceipt}
          imageAlt="Mencatat pengeluaran sehari-hari"
          screen={<ScreenDashboard />}
        />

        <FeatureRow
          id="calendar"
          eyebrow="Tampilan Kalender"
          title="Lihat uangmu dalam linimasa."
          body="Tampilan bulanan menunjukkan ke mana uang bergerak. Titik hijau untuk pemasukan, merah untuk pengeluaran. Ketuk tanggal mana pun untuk detail."
          bg={T.tintBlue}
          image={IMG.planning}
          imageAlt="Merencanakan anggaran bulanan"
          screen={<ScreenCalendar />}
          reverse
        />

        <Banner
          image={IMG.calmDesk}
          eyebrow="Tenang & Fokus"
          title="Dibuat untuk uang sehari-hari, bukan spreadsheet."
          cta="Mulai gratis"
          href={ROUTES.register}
        />

        <FeatureRow
          id="savings"
          eyebrow="Savings Goals"
          title="Impikan. Rencanakan. Wujudkan."
          body="Tetapkan target finansial dan saksikan progresnya bertumbuh. Setiap tabungan membawamu lebih dekat ke tujuan."
          bg={T.tintLilac}
          image={IMG.savingJar}
          imageAlt="Menabung untuk tujuan"
          screen={<ScreenSavings />}
        />

        <CapabilityGrid />

        <CtaSection />
      </main>

      <Footer />
    </>
  );
}
