"use client";

import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { T } from "./tokens";
import { Reveal, PrimaryButton } from "./primitives";

// ─── Final CTA (soft tinted band) ─────────────────────────────────────────────
export function CtaSection() {
  return (
    <section
      style={{
        background: `linear-gradient(180deg, ${T.canvas} 0%, ${T.tintBlue} 100%)`,
        padding: "96px 24px",
        textAlign: "center",
      }}
    >
      <Reveal>
        <h2 style={{ fontFamily: T.fontDisplay, fontSize: "clamp(30px,5vw,52px)", fontWeight: 700, lineHeight: 1.08, letterSpacing: "-0.02em", color: T.ink, maxWidth: 640, margin: "0 auto 18px" }}>
          Kejelasan finansialmu dimulai di sini.
        </h2>
        <p style={{ fontFamily: T.fontText, fontSize: "clamp(17px,2.4vw,19px)", color: T.textMuted, maxWidth: 460, margin: "0 auto 32px" }}>
          Gabung dengan Teman Kas dan pahami ke mana setiap rupiah pergi. Gratis untuk memulai.
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <PrimaryButton href={ROUTES.register} big>
            Buat akun gratis
          </PrimaryButton>
          <Link
            href={ROUTES.login}
            style={{ color: T.primary, fontFamily: T.fontText, fontSize: 16, fontWeight: 500, borderRadius: 9999, padding: "12px 28px", textDecoration: "none", border: `1px solid ${T.primary}`, background: T.canvas }}
          >
            Masuk
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
