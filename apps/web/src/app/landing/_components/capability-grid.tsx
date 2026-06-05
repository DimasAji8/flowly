"use client";

import { T } from "./tokens";
import { Reveal } from "./primitives";

// ─── Capability grid (soft-tinted cards, no emoji icons) ──────────────────────
export function CapabilityGrid() {
  const items = [
    { t: "Beberapa Dompet", d: "Tunai, rekening bank, dan e-wallet. Lacak terpisah atau jadi satu.", tint: T.tintBlue },
    { t: "Arus Kas Bersih", d: "Lihat pemasukan dikurangi pengeluaran secara instan.", tint: T.tintMint },
    { t: "Kategori Kustom", d: "Kategori berwarna untuk merapikan setiap transaksi.", tint: T.tintLilac },
    { t: "Transfer Dompet", d: "Pindahkan dana antar dompet, tercatat otomatis.", tint: T.tintPeach },
    { t: "Transaksi Berulang", d: "Gaji, langganan, tagihan — dibuat otomatis sesuai jadwal.", tint: T.tintBlueDeep },
    { t: "Multi-pengguna", d: "Satu workspace bisa dibagikan ke pasangan atau tim.", tint: T.tintMint },
  ];
  return (
    <section id="recurring" style={{ background: T.canvas, padding: "88px 24px" }}>
      <Reveal style={{ maxWidth: 1100, margin: "0 auto" }}>
        <p style={{ fontFamily: T.fontText, fontSize: 13, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: T.primary, marginBottom: 14, textAlign: "center" }}>
          Semua dalam satu app
        </p>
        <h2 style={{ fontFamily: T.fontDisplay, fontSize: "clamp(28px,4vw,44px)", fontWeight: 700, letterSpacing: "-0.02em", color: T.ink, marginBottom: 40, textAlign: "center", maxWidth: 640, marginInline: "auto" }}>
          Semua yang kamu butuhkan. Tanpa yang tidak perlu.
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          {items.map((f) => (
            <div
              key={f.t}
              className="lp-cap-card"
              style={{ background: f.tint, borderRadius: 20, padding: "26px 24px" }}
            >
              <div style={{ fontFamily: T.fontText, fontSize: 19, fontWeight: 700, color: T.ink, letterSpacing: "-0.3px", marginBottom: 8 }}>{f.t}</div>
              <div style={{ fontFamily: T.fontText, fontSize: 15, color: T.textMuted, lineHeight: 1.5 }}>{f.d}</div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
