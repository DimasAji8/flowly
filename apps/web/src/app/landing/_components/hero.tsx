"use client";

import { ROUTES } from "@/constants/routes";
import { T } from "./tokens";
import { Reveal, PhoneFrame, PrimaryButton, GhostButton } from "./primitives";
import { ScreenDashboard } from "./screens";

// ─── Hero (two-column, Bibit-style, soft tinted bg) ───────────────────────────
export function HeroSection() {
  return (
    <section
      style={{
        // soft gradient wash so the hero isn't plain white
        background: `linear-gradient(180deg, ${T.tintBlue} 0%, ${T.canvas} 100%)`,
        padding: "104px 24px 64px",
      }}
    >
      <div className="lp-hero-grid" style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Left: copy + CTA */}
        <Reveal className="lp-hero-copy">
          <span
            style={{
              display: "inline-flex",
              alignSelf: "flex-start",
              alignItems: "center",
              gap: 8,
              fontFamily: T.fontText,
              fontSize: 13,
              fontWeight: 600,
              color: T.primary,
              background: T.canvas,
              border: `1px solid ${T.hairline}`,
              borderRadius: 9999,
              padding: "6px 14px",
              marginBottom: 22,
            }}
          >
            <span style={{ width: 7, height: 7, borderRadius: 9999, background: T.income }} />
            Jurnal arus kas pribadi
          </span>

          <h1
            style={{
              fontFamily: T.fontDisplay,
              fontSize: "clamp(36px, 5.4vw, 60px)",
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: "-0.02em",
              color: T.ink,
            }}
          >
            Tahu ke mana{" "}
            <span style={{ color: T.primary, textDecoration: "underline", textDecorationThickness: "3px", textUnderlineOffset: "6px" }}>
              uangmu
            </span>{" "}
            pergi.
          </h1>

          <p
            style={{
              fontFamily: T.fontText,
              fontSize: "clamp(16px, 2vw, 19px)",
              lineHeight: 1.5,
              color: T.textMuted,
              maxWidth: 440,
              margin: "20px 0 0",
            }}
          >
            Teman Kas adalah jurnal arus kas yang tenang dan rapi. Catat pemasukan,
            pengeluaran, dan tujuan menabung — semuanya di satu tempat.
          </p>

          <div className="lp-feature-actions" style={{ display: "flex", gap: 14, marginTop: 32, flexWrap: "wrap" }}>
            <PrimaryButton href={ROUTES.register} big>
              Mulai gratis
            </PrimaryButton>
            <GhostButton href="#overview">Lihat fiturnya</GhostButton>
          </div>
        </Reveal>

        {/* Right: phone on soft blob */}
        <Reveal delay={100} className="lp-hero-visual">
          <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <div
              aria-hidden
              style={{
                position: "absolute",
                width: "104%",
                aspectRatio: "1 / 1",
                background: `radial-gradient(circle at 50% 42%, rgba(0,102,204,0.16) 0%, rgba(0,102,204,0.05) 46%, rgba(0,102,204,0) 70%)`,
                borderRadius: "46% 54% 52% 48% / 50% 46% 54% 50%",
              }}
            />
            <div style={{ position: "relative", zIndex: 1 }}>
              <PhoneFrame scale={0.86}>
                <ScreenDashboard />
              </PhoneFrame>
            </div>
          </div>
        </Reveal>
      </div>

      <StatsStrip />
    </section>
  );
}

// ─── Stats strip ──────────────────────────────────────────────────────────────
function StatsStrip() {
  const stats = [
    { top: "Catat transaksi", big: "< 5 detik", sub: "Cepat & satu tangan" },
    { top: "Selalu", big: "Gratis", sub: "Untuk memulai" },
    { top: "Bisa dibagi", big: "Multi-user", sub: "Workspace bersama" },
    { top: "Tanpa", big: "Iklan", sub: "Tenang & fokus" },
  ];
  return (
    <Reveal delay={150}>
      <div
        className="lp-stats-grid"
        style={{
          maxWidth: 1100,
          margin: "64px auto 0",
          background: T.canvas,
          border: `1px solid ${T.hairline}`,
          borderRadius: 24,
          padding: "32px 16px",
          boxShadow: "rgba(0,0,0,0.04) 0px 12px 28px -16px",
        }}
      >
        {stats.map((s) => (
          <div key={s.big} style={{ textAlign: "center", padding: "8px 12px" }}>
            <div style={{ fontFamily: T.fontText, fontSize: 13, color: T.textMuted, marginBottom: 6 }}>{s.top}</div>
            <div style={{ fontFamily: T.fontDisplay, fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 700, color: T.primary, letterSpacing: "-0.02em" }}>
              {s.big}
            </div>
            <div style={{ fontFamily: T.fontText, fontSize: 13, fontWeight: 600, color: T.ink, marginTop: 6 }}>{s.sub}</div>
          </div>
        ))}
      </div>
    </Reveal>
  );
}
