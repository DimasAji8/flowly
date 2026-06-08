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
          column-gap: 56px;
          align-items: center;
        }

        .lp-hero-visual {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        /* CTA shown next to copy on desktop; mobile copy below mockup */
        .lp-hero-cta-desktop {
          display: flex;
          gap: 14px;
          margin-top: 28px;
          flex-wrap: wrap;
        }

        .lp-hero-cta-mobile {
          display: none;
          gap: 14px;
          flex-wrap: wrap;
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

          .lp-hero-cta-desktop {
            display: none;
          }

          .lp-hero-cta-mobile {
            order: 3;
            display: flex;
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
        {/* Copy (+ desktop CTA) */}
        <Reveal className="lp-hero-copy">
          <h1
            style={{
              fontSize: "clamp(38px, 5.2vw, 62px)",
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              color: T.ink,
            }}
          >
            Kas Rapi,{" "}
            <span
              style={{
                background: `linear-gradient(135deg, ${T.primary} 0%, #2563eb 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Hidup Happy.
            </span>
          </h1>

          <p
            style={{
              fontSize: "clamp(15px, 1.8vw, 18px)",
              fontWeight: 400,
              lineHeight: 1.65,
              color: T.textMuted,
              maxWidth: 440,
              margin: "20px 0 0",
            }}
          >
            Biar gak cuma kerja cari duit, tapi juga tau duitnya ke mana. Catat, pantau, dan atur cashflow harian dengan cara yang simpel dan gak bikin pusing.
          </p>

          <div className="lp-feature-actions lp-hero-cta-desktop">
            <PrimaryButton href={ROUTES.register} big>
              Mulai gratis
            </PrimaryButton>
            <GhostButton href="#overview">Lihat fiturnya</GhostButton>
          </div>
        </Reveal>

        {/* Mockup */}
        <Reveal delay={100} className="lp-hero-visual">
          <MockupImage />
        </Reveal>

        {/* CTA — mobile only, after mockup */}
        <div className="lp-feature-actions lp-hero-cta-mobile">
          <PrimaryButton href={ROUTES.register} big>
            Mulai gratis
          </PrimaryButton>
          <GhostButton href="#overview">Lihat fiturnya</GhostButton>
        </div>
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
