"use client";

import { T } from "./tokens";
import { Reveal } from "./primitives";
import { Accordion, AccordionItem } from "@/components/ui/accordion";

const FAQS = [
  { q: "Beneran gratis?", a: "Ya, gratis selamanya untuk penggunaan personal. Tidak ada biaya tersembunyi, tidak butuh kartu kredit untuk daftar." },
  { q: "Apakah data saya aman?", a: "Data disimpan terenkripsi dan tidak pernah dibagikan ke pihak ketiga. Hanya kamu yang bisa mengakses catatan keuanganmu." },
  { q: "Bisa dipakai lebih dari satu perangkat?", a: "Ya. Login dari perangkat mana pun dan data kamu langsung tersinkron." },
  { q: "Apakah ada asisten AI?", a: "Ya. Teman Kas dilengkapi asisten AI untuk memindai (scan) struk belanja secara otomatis dan memproses pencatatan lewat teks bahasa sehari-hari." },
  { q: "Apakah ada iklan di aplikasi?", a: "Tidak ada iklan sama sekali. Fokus kamu tidak kami ganggu." },
  { q: "Bagaimana cara menghapus akun saya?", a: "Kamu bisa menghapus akun dan semua data kapan saja melalui pengaturan profil." },
];

export function FaqSection() {
  return (
    <section style={{ background: T.tintBlue, padding: "88px 24px" }}>
      <style>{`
        .accordion-item { border-bottom: 1px solid ${T.hairline}; }
        .accordion-item:first-child { border-top: 1px solid ${T.hairline}; }
        .accordion-trigger {
          display: flex; justify-content: space-between; align-items: center;
          width: 100%; padding: 20px 0; gap: 16px;
          background: none; border: none; cursor: pointer; text-align: left;
          font-size: 16px; font-weight: 600; color: ${T.ink}; line-height: 1.4;
        }
        .accordion-trigger:hover { color: ${T.primary}; }
        .accordion-chevron {
          flex-shrink: 0; color: ${T.textMuted};
          transition: transform 200ms ease;
        }
        .accordion-trigger[data-state="open"] .accordion-chevron { transform: rotate(180deg); }
        .accordion-content {
          overflow: hidden;
        }
        .accordion-content[data-state="open"]   { animation: acc-slide-down 200ms ease; }
        .accordion-content[data-state="closed"]  { animation: acc-slide-up   200ms ease; }
        @keyframes acc-slide-down {
          from { height: 0; opacity: 0; }
          to   { height: var(--radix-accordion-content-height); opacity: 1; }
        }
        @keyframes acc-slide-up {
          from { height: var(--radix-accordion-content-height); opacity: 1; }
          to   { height: 0; opacity: 0; }
        }
        .accordion-body {
          font-size: 15px; line-height: 1.7; color: ${T.textMuted}; padding-bottom: 20px;
        }
      `}</style>
      <Reveal>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: T.primary, textAlign: "center", marginBottom: 14 }}>
            FAQ
          </p>
          <h2 style={{ fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 700, letterSpacing: "-0.02em", color: T.ink, textAlign: "center", marginBottom: 48 }}>
            Pertanyaan yang sering ditanyakan.
          </h2>
          <Accordion type="single" collapsible>
            {FAQS.map((item, i) => (
              <AccordionItem key={item.q} value={`faq-${i}`} trigger={item.q}>
                {item.a}
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Reveal>
    </section>
  );
}
