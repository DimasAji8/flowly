"use client";

import { T } from "./tokens";
import { Reveal } from "./primitives";

const IconWallet = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/>
  </svg>
);
const IconTrendUp = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
  </svg>
);
const IconTag = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
);
const IconArrows = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 16V4m0 0L3 8m4-4 4 4"/><path d="M17 8v12m0 0 4-4m-4 4-4-4"/>
  </svg>
);
const IconRepeat = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
  </svg>
);
const IconUsers = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const CAPABILITIES = [
  { Icon: IconWallet,  t: "Beberapa Dompet",    d: "Tunai, rekening bank, dan e-wallet. Lacak terpisah atau jadi satu.", tint: T.tintBlue },
  { Icon: IconTrendUp, t: "Arus Kas Bersih",    d: "Lihat pemasukan dikurangi pengeluaran secara instan.", tint: T.tintMint },
  { Icon: IconTag,     t: "Kategori Kustom",    d: "Kategori berwarna untuk merapikan setiap transaksi.", tint: T.tintLilac },
  { Icon: IconArrows,  t: "Transfer Dompet",    d: "Pindahkan dana antar dompet, tercatat otomatis.", tint: T.tintPeach },
  { Icon: IconRepeat,  t: "Transaksi Berulang", d: "Gaji, langganan, tagihan — dibuat otomatis sesuai jadwal.", tint: T.tintBlueDeep },
  { Icon: IconUsers,   t: "Multi-pengguna",     d: "Satu workspace bisa dibagikan ke pasangan atau tim.", tint: T.tintMint },
];

const TESTIMONIALS = [
  { quote: "Akhirnya ada app catatan keuangan yang tidak bikin pusing. Tampilannya bersih, dan cepat banget.", name: "Rafi A.", role: "Freelancer" },
  { quote: "Suka banget fitur tabungan dengan tracking progres-nya. Motivasi buat nabung jadi lebih kuat.", name: "Dinda S.", role: "Mahasiswi" },
  { quote: "Pakai buat keuangan bersama istri. Simpel tapi lengkap — lebih enak dari spreadsheet.", name: "Budi H.", role: "Karyawan Swasta" },
];

export function CapabilityGrid() {
  return (
    <section id="recurring" style={{ background: T.canvasParchment, padding: "88px 24px" }}>
      <Reveal style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Capability cards */}
        <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: T.primary, marginBottom: 14, textAlign: "center" }}>
          Semua dalam satu app
        </p>
        <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 700, letterSpacing: "-0.02em", color: T.ink, marginBottom: 40, textAlign: "center", maxWidth: 640, marginInline: "auto" }}>
          Semua yang kamu butuhkan. Tanpa yang tidak perlu.
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          {CAPABILITIES.map(({ Icon, t, d, tint }) => (
            <div key={t} className="lp-cap-card" style={{ background: tint, borderRadius: 20, padding: "26px 24px" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center", color: T.primary, marginBottom: 16 }}>
                <Icon />
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, color: T.ink, letterSpacing: "-0.3px", marginBottom: 8 }}>{t}</div>
              <div style={{ fontSize: 14, color: T.textMuted, lineHeight: 1.55 }}>{d}</div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: T.hairline, margin: "72px 0" }} />

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
              <p style={{ fontSize: 15, lineHeight: 1.7, color: T.ink, marginBottom: 20 }}>"{quote}"</p>
              <div style={{ fontSize: 14, fontWeight: 600, color: T.ink }}>{name}</div>
              <div style={{ fontSize: 13, color: T.textMuted }}>{role}</div>
            </div>
          ))}
        </div>

      </Reveal>
    </section>
  );
}
