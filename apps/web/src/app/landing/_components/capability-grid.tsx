"use client";

import { T } from "./tokens";
import { Reveal } from "./primitives";

const CAPABILITIES = [
  { t: "Beberapa Dompet",    d: "Tunai, rekening bank, dan e-wallet. Lacak terpisah atau jadi satu.", tint: T.tintBlue },
  { t: "Arus Kas Bersih",    d: "Lihat pemasukan dikurangi pengeluaran secara instan.", tint: T.tintMint },
  { t: "Kategori Kustom",    d: "Kategori berwarna untuk merapikan setiap transaksi.", tint: T.tintLilac },
  { t: "Transfer Dompet",    d: "Pindahkan dana antar dompet, tercatat otomatis.", tint: T.tintPeach },
  { t: "Transaksi Berulang", d: "Gaji, langganan, tagihan — dibuat otomatis sesuai jadwal.", tint: T.tintBlueDeep },
  { t: "Pencatatan AI",      d: "Scan struk belanja otomatis & input transaksi pakai bahasa sehari-hari.", tint: T.tintMint },
];

export function CapabilityGrid() {
  return (
    <section id="recurring" style={{ background: T.canvasParchment, padding: "clamp(56px,8vw,88px) 24px" }}>
      <Reveal style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Capability cards */}
        <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: T.primary, marginBottom: 14, textAlign: "center" }}>
          Semua dalam satu app
        </p>
        <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 700, letterSpacing: "-0.02em", color: T.ink, marginBottom: 40, textAlign: "center", maxWidth: 640, marginInline: "auto" }}>
          Semua yang kamu butuhkan. Tanpa yang tidak perlu.
        </h2>
        <div className="lp-cap-grid">
          {CAPABILITIES.map(({ t, d, tint }) => (
            <div key={t} className="lp-cap-card" style={{ background: tint, borderRadius: 20, padding: "22px 20px" }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.ink, letterSpacing: "-0.3px", marginBottom: 6 }}>{t}</div>
              <div style={{ fontSize: 14, color: T.textMuted, lineHeight: 1.55 }}>{d}</div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
