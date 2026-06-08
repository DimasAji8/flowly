"use client";

import { ROUTES } from "@/constants/routes";
import { T } from "./tokens";
import { Reveal, PrimaryButton, GhostButton } from "./primitives";
import { MockupImage } from "./mockup-image";

// ─── Hero (two-column, Bibit-style, soft tinted bg) ───────────────────────────
export function HeroSection() {
  return (
    <>
      <style jsx>{`
        .lp-hero-grid {
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          gap: 56px;
          align-items: center;
        }

        .lp-hero-visual {
          display: flex;
          justify-content: center;
        }

        @media (max-width: 768px) {
          .lp-hero-grid {
            display: flex;
            flex-direction: column;
            gap: 32px;
            text-align: center;
          }

          .lp-hero-copy {
            order: 1;
          }

          .lp-hero-visual {
            order: 2;
          }

          .lp-hero-cta {
            justify-content: center;
          }
        }
      `}</style>
      <section
        style={{
          // soft gradient wash so the hero isn't plain white
          background: `linear-gradient(180deg, ${T.tintBlue} 0%, ${T.canvas} 100%)`,
          padding: "96px 24px 64px",
        }}
      >
      <div className="lp-hero-grid" style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Left: copy + CTA as one cohesive block */}
        <Reveal className="lp-hero-copy">
          <h1
            style={{
              fontFamily: T.fontDisplay,
              fontSize: "clamp(36px, 5vw, 56px)",
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: "-0.02em",
              color: T.ink,
            }}
          >
            Atur duit,{" "}
            <span style={{ color: T.primary, textDecoration: "underline", textDecorationThickness: "3px", textUnderlineOffset: "6px" }}>
              tanpa drama.
            </span>
          </h1>

          <p
            style={{
              fontFamily: T.fontText,
              fontSize: "clamp(16px, 2vw, 19px)",
              lineHeight: 1.55,
              color: T.textMuted,
              maxWidth: 460,
              margin: "20px 0 0",
            }}
          >
            Teman Kas bantu kamu paham ke mana uangmu pergi — catat pemasukan,
            pengeluaran, dan target nabung dalam hitungan detik. Tenang, rapi,
            dan beneran kepakai tiap hari.
          </p>

          <div className="lp-feature-actions lp-hero-cta" style={{ display: "flex", gap: 14, marginTop: 28, flexWrap: "wrap" }}>
            <PrimaryButton href={ROUTES.register} big>
              Mulai gratis
            </PrimaryButton>
            <GhostButton href="#overview">Lihat fiturnya</GhostButton>
          </div>
        </Reveal>

        {/* Right: mockup image */}
        <Reveal delay={100} className="lp-hero-visual">
          <MockupImage />
        </Reveal>
      </div>

      <StatsStrip />
      </section>
    </>
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
