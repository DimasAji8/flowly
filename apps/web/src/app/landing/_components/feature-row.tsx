"use client";

import Image from "next/image";
import { ROUTES } from "@/constants/routes";
import { T } from "./tokens";
import { Reveal, PhoneFrame, GhostButton } from "./primitives";

// ─── Feature row: soft tinted band, two columns (copy + phone / image) ────────
export function FeatureRow({
  id,
  eyebrow,
  title,
  body,
  bg,
  image,
  imageAlt,
  screen,
  reverse = false,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  body: string;
  bg: string;
  image: string;
  imageAlt: string;
  screen?: React.ReactNode;
  reverse?: boolean;
}) {
  return (
    <section id={id} style={{ background: bg, padding: "clamp(56px, 8vw, 96px) 24px" }}>
      <Reveal>
        <div className={`lp-feature-grid ${reverse ? "lp-reverse" : ""}`} style={{ maxWidth: 1100, margin: "0 auto" }}>
          {/* Copy side */}
          <div className="lp-feature-copy" style={{ display: "flex", flexDirection: "column" }}>
            <p style={{ fontFamily: T.fontText, fontSize: 13, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: T.primary, marginBottom: 14 }}>
              {eyebrow}
            </p>
            <h2 style={{ fontFamily: T.fontDisplay, fontSize: "clamp(28px,3.6vw,42px)", fontWeight: 700, lineHeight: 1.12, letterSpacing: "-0.02em", color: T.ink, marginBottom: 16 }}>
              {title}
            </h2>
            <p style={{ fontFamily: T.fontText, fontSize: "clamp(15px,1.8vw,18px)", lineHeight: 1.55, color: T.textMuted, maxWidth: 440 }}>
              {body}
            </p>
            <div className="lp-feature-actions" style={{ marginTop: 28, display: "flex" }}>
              <GhostButton href={ROUTES.register}>Coba sekarang</GhostButton>
            </div>
          </div>

          {/* Visual side: phone overlapping a rounded image */}
          <div style={{ position: "relative", display: "flex", justifyContent: "center", minHeight: 380 }}>
            <div
              className="lp-feature-img"
              style={{
                position: "relative",
                width: "100%",
                maxWidth: 460,
                aspectRatio: "4 / 5",
                borderRadius: 24,
                overflow: "hidden",
                boxShadow: "rgba(0,0,0,0.10) 0px 18px 48px -18px",
              }}
            >
              <Image src={image} alt={imageAlt} fill sizes="(max-width: 880px) 100vw, 460px" style={{ objectFit: "cover" }} />
            </div>
            <div style={{ position: "absolute", right: "2%", bottom: "-4%" }}>
              {screen && <PhoneFrame scale={0.62}>{screen}</PhoneFrame>}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
