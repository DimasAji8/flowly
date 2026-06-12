"use client";

import { T } from "./tokens";
import { Reveal } from "./primitives";

const CAPABILITIES = [
  { t: "Beberapa Dompet",    d: "Tunai, rekening bank, dan e-wallet. Lacak terpisah atau jadi satu.", tint: T.tintBlue },
  { t: "Arus Kas Bersih",    d: "Lihat pemasukan dikurangi pengeluaran secara instan.", tint: T.tintMint },
  { t: "Kategori Kustom",    d: "Kategori berwarna untuk merapikan setiap transaksi.", tint: T.tintLilac },
  { t: "Transfer Dompet",    d: "Pindahkan dana antar dompet, tercatat otomatis.", tint: T.tintPeach },
  { t: "Transaksi Berulang", d: "Gaji, langganan, tagihan — dibuat otomatis sesuai jadwal.", tint: T.tintBlueDeep },
  { t: "Multi-pengguna",     d: "Satu workspace bisa dibagikan ke pasangan atau tim.", tint: T.tintMint },
];

const TESTIMONIALS = [
  { quote: "Akhirnya ada app catatan keuangan yang tidak bikin pusing. Tampilannya bersih, dan cepat banget.", name: "Rafi A.", role: "Freelancer" },
  { quote: "Suka banget fitur tabungan dengan tracking progres-nya. Motivasi buat nabung jadi lebih kuat.", name: "Dinda S.", role: "Mahasiswi" },
  { quote: "Pakai buat keuangan bersama istri. Simpel tapi lengkap lebih enak dari spreadsheet.", name: "Budi H.", role: "Karyawan Swasta" },
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

        {/* Divider */}
        <div style={{ height: 1, background: T.hairline, margin: "clamp(40px,6vw,72px) 0" }} />

        {/* Testimoni */}
        <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: T.primary, textAlign: "center", marginBottom: 14 }}>
          Dari pengguna nyata
        </p>
        <h2 style={{ fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 700, letterSpacing: "-0.02em", color: T.ink, textAlign: "center", marginBottom: 40 }}>
          Dipercaya untuk keuangan sehari-hari.
        </h2>
        <div className="lp-testimonial-grid">
          {TESTIMONIALS.map(({ quote, name, role }) => (
            <div key={name} style={{ background: T.canvas, borderRadius: 20, padding: "28px 24px", border: `1px solid ${T.hairline}` }}>
              <p style={{ fontSize: 15, lineHeight: 1.7, color: T.ink, marginBottom: 20 }}>&ldquo;{quote}&rdquo;</p>
              <div style={{ fontSize: 14, fontWeight: 600, color: T.ink }}>{name}</div>
              <div style={{ fontSize: 13, color: T.textMuted }}>{role}</div>
            </div>
          ))}
        </div>

      </Reveal>
    </section>
  );
}
