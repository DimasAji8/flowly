"use client";

import { ROUTES } from "@/constants/routes";
import { T } from "./tokens";
import { Reveal, GhostButton } from "./primitives";
import { MasonryGallery } from "./masonry-gallery";

// ─── Feature row with masonry gallery for multiple images ────────
export function FeatureRowCarousel({
  id,
  eyebrow,
  title,
  body,
  bg,
  slides,
  reverse = false,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  body: string;
  bg: string;
  slides: Array<{ image: string; alt: string; height?: "short" | "medium" | "tall" }>;
  screen?: React.ReactNode;
  reverse?: boolean;
}) {
  return (
    <section id={id} style={{ background: bg, padding: "clamp(56px, 8vw, 96px) 24px" }}>
      <Reveal>
        <div className={`lp-feature-grid ${reverse ? "lp-reverse" : ""}`} style={{ maxWidth: 1100, margin: "0 auto" }}>
          {/* Copy side */}
          <div className="lp-feature-copy" style={{ display: "flex", flexDirection: "column" }}>
            <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: T.primary, marginBottom: 14 }}>
              {eyebrow}
            </p>
            <h2 style={{ fontSize: "clamp(28px,3.6vw,42px)", fontWeight: 700, lineHeight: 1.12, letterSpacing: "-0.02em", color: T.ink, marginBottom: 16 }}>
              {title}
            </h2>
            <p className="lp-feature-body" style={{ fontSize: "clamp(15px,1.8vw,18px)", lineHeight: 1.55, color: T.textMuted, maxWidth: 440 }}>
              {body}
            </p>
            <div className="lp-feature-actions lp-feature-cta" style={{ marginTop: 28, display: "flex" }}>
              <GhostButton href={ROUTES.register}>Coba sekarang</GhostButton>
            </div>
          </div>

          {/* Visual side with masonry gallery */}
          <div className="lp-feature-visual" style={{ position: "relative", display: "flex", justifyContent: reverse ? "flex-end" : "flex-start", minHeight: 380, overflow: "visible" }}>
            <div className="lp-feature-img" style={{ position: "relative", width: "100%", maxWidth: 600, padding: "0" }}>
              <MasonryGallery images={slides} />
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
