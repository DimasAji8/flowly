"use client";

import { ROUTES } from "@/constants/routes";
import { T } from "./tokens";
import { Reveal, PhoneFrame, GhostButton } from "./primitives";

// Line icons (monokrom, stroke-based) — sesuai aturan no-emoji di landing
const IconTarget = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
  </svg>
);
const IconChart = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
  </svg>
);
const IconBell = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

const FEATURES = [
  { Icon: IconTarget, title: "Target yang Fleksibel", desc: "Atur target sesuai kemampuan. Pause atau lanjutkan kapan saja." },
  { Icon: IconChart,  title: "Tracking Real-time",   desc: "Lihat progres langsung. Visual yang jelas membuat motivasi tetap tinggi." },
  { Icon: IconBell,   title: "Reminder Cerdas",       desc: "Notifikasi pengingat bantu kamu konsisten mencapai target." },
];

export function FeatureRowSavings({
  id, eyebrow, title, body, screen,
}: {
  id?: string; eyebrow: string; title: string; body: string; screen?: React.ReactNode;
}) {
  return (
    <section
      id={id}
      style={{ background: T.tintLilac, padding: "clamp(64px, 10vw, 120px) 24px" }}
    >
      <Reveal>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          {/* Header */}
          <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 48px" }}>
            <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: T.primary, marginBottom: 16 }}>
              {eyebrow}
            </p>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.03em", color: T.ink, marginBottom: 16 }}>
              {title}
            </h2>
            <p style={{ fontSize: "clamp(15px, 2vw, 18px)", lineHeight: 1.6, color: T.textMuted }}>
              {body}
            </p>
          </div>

          {/* Card pembungkus konten */}
          <div style={{
            background: T.canvas,
            borderRadius: 24,
            border: `1px solid ${T.hairline}`,
            padding: "clamp(32px, 5vw, 56px)",
          }}>
            <div className="lp-savings-main">
              {/* Phone mockup */}
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <div style={{ maxWidth: 300, width: "100%" }}>
                  <PhoneFrame>{screen}</PhoneFrame>
                </div>
              </div>

              {/* Feature list */}
              <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                {FEATURES.map(({ Icon, title: ft, desc }) => (
                  <div key={ft} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                    <div style={{
                      flexShrink: 0,
                      width: 44, height: 44,
                      borderRadius: 12,
                      background: T.tintLilac,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: T.primary,
                    }}>
                      <Icon />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 17, fontWeight: 600, color: T.ink, marginBottom: 6, letterSpacing: "-0.2px" }}>{ft}</h3>
                      <p style={{ fontSize: 15, lineHeight: 1.6, color: T.textMuted, margin: 0 }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA */}
          <div style={{ textAlign: "center", marginTop: 48 }}>
            <GhostButton href={ROUTES.register}>Mulai Menabung Sekarang</GhostButton>
            <p style={{ fontSize: 13, color: T.textMuted, marginTop: 12 }}>Gratis selamanya • Tanpa kartu kredit</p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
