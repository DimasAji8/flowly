"use client";

import { T } from "./tokens";
import { Logo } from "./primitives";

const COLUMNS = [
  { heading: "Produk", links: ["Overview", "Dompet", "Savings Goals", "Transaksi Berulang", "Kalender"] },
  { heading: "Akun", links: ["Masuk", "Buat Akun"] },
  { heading: "Tentang", links: ["Ikhtisar", "Privasi", "Ketentuan"] },
];

export function Footer() {
  return (
    <footer style={{ background: T.tintBlue, borderTop: `1px solid ${T.hairline}`, padding: "48px 24px 32px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40 }} className="footer-grid">
        <div>
          <div style={{ marginBottom: 12 }}>
            <Logo variant="wordmark-blue" height={34} />
          </div>
          <p style={{ fontFamily: T.fontText, fontSize: 13, color: T.textMuted, lineHeight: 1.6, maxWidth: 260 }}>
            Jurnal arus kas yang tenang dan personal, dibuat untuk penggunaan sehari-hari.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.heading}>
            <div style={{ fontFamily: T.fontText, fontSize: 12, fontWeight: 600, color: "#333", marginBottom: 12 }}>{col.heading}</div>
            {col.links.map((link) => (
              <div key={link}>
                <a
                  href="#"
                  style={{ fontFamily: T.fontText, fontSize: 12, color: T.textMuted, lineHeight: 2.4, textDecoration: "none", display: "block" }}
                  onMouseEnter={(e) => ((e.target as HTMLElement).style.color = T.primary)}
                  onMouseLeave={(e) => ((e.target as HTMLElement).style.color = T.textMuted)}
                >
                  {link}
                </a>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div style={{ maxWidth: 1100, margin: "32px auto 0", paddingTop: 20, borderTop: `1px solid ${T.hairline}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <p style={{ fontFamily: T.fontText, fontSize: 12, color: "#86868b" }}>Hak cipta © 2026 Teman Kas. Seluruh hak dilindungi.</p>
        <div style={{ display: "flex", gap: 20 }}>
          {["Kebijakan Privasi", "Ketentuan Penggunaan"].map((l) => (
            <a key={l} href="#" style={{ fontFamily: T.fontText, fontSize: 12, color: "#86868b", textDecoration: "none" }}>{l}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}
