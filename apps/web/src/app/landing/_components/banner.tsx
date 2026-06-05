"use client";

import Image from "next/image";
import Link from "next/link";
import { T } from "./tokens";
import { Reveal } from "./primitives";

// ─── Full-width banner with overlay text ──────────────────────────────────────
export function Banner({
  image,
  eyebrow,
  title,
  cta,
  href,
}: {
  image: string;
  eyebrow: string;
  title: string;
  cta: string;
  href: string;
}) {
  return (
    <section style={{ background: T.canvas, padding: "20px 20px" }}>
      <Reveal>
        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", aspectRatio: "16 / 9", borderRadius: 28, overflow: "hidden" }}>
          <Image src={image} alt={title} fill sizes="(max-width: 1100px) 100vw, 1100px" style={{ objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.1) 45%, rgba(0,0,0,0.25) 100%)" }} />
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 24px" }}>
            <p style={{ fontFamily: T.fontText, fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.9)", marginBottom: 12 }}>
              {eyebrow}
            </p>
            <h2 style={{ fontFamily: T.fontDisplay, fontSize: "clamp(28px,4.5vw,52px)", fontWeight: 700, lineHeight: 1.08, letterSpacing: "-0.02em", color: T.onDark, maxWidth: 720, marginBottom: 24 }}>
              {title}
            </h2>
            <Link
              href={href}
              style={{ background: T.onDark, color: T.ink, fontFamily: T.fontText, fontSize: 16, fontWeight: 500, borderRadius: 9999, padding: "12px 26px", textDecoration: "none" }}
            >
              {cta}
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
