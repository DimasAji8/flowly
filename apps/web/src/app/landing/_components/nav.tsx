"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ROUTES } from "@/constants/routes";
import { T } from "./tokens";
import { Logo } from "./primitives";

const LINKS = ["Overview", "Calendar", "Savings", "Recurring"];

export function GlobalNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        height: 56,
        backgroundColor: scrolled ? "rgba(255,255,255,0.82)" : "rgba(255,255,255,0.96)",
        backdropFilter: "saturate(180%) blur(20px)",
        WebkitBackdropFilter: "saturate(180%) blur(20px)",
        borderBottom: `1px solid ${scrolled ? T.hairline : "transparent"}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 22px",
        transition: "background-color 0.3s ease, border-color 0.3s ease",
      }}
    >
      <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
        <Logo variant="wordmark-blue" height={26} />
      </Link>

      <div style={{ display: "flex", gap: 30, alignItems: "center" }} className="lp-nav-links">
        {LINKS.map((label) => (
          <a
            key={label}
            href={`#${label.toLowerCase()}`}
            style={{ color: T.ink, fontFamily: T.fontText, fontSize: 14, fontWeight: 500, textDecoration: "none", transition: "color 0.15s" }}
            onMouseEnter={(e) => ((e.target as HTMLElement).style.color = T.primary)}
            onMouseLeave={(e) => ((e.target as HTMLElement).style.color = T.ink)}
          >
            {label}
          </a>
        ))}
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center" }} className="lp-nav-cta">
        <Link href={ROUTES.login} style={{ color: T.ink, fontFamily: T.fontText, fontSize: 14, fontWeight: 500, textDecoration: "none" }}>
          Masuk
        </Link>
        <Link
          href={ROUTES.register}
          style={{
            backgroundColor: T.primary,
            color: T.onDark,
            fontFamily: T.fontText,
            fontSize: 14,
            fontWeight: 500,
            borderRadius: 9999,
            padding: "8px 18px",
            textDecoration: "none",
            transition: "background-color 0.15s",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = T.primaryFocus)}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = T.primary)}
        >
          Daftar
        </Link>
      </div>

      <button
        type="button"
        aria-label="Menu"
        onClick={() => setMenuOpen((v) => !v)}
        className="lp-nav-burger"
        style={{ display: "none", background: "none", border: "none", cursor: "pointer", padding: 6, flexDirection: "column", gap: 4 }}
      >
        <span style={{ width: 20, height: 1.6, backgroundColor: T.ink, borderRadius: 2 }} />
        <span style={{ width: 20, height: 1.6, backgroundColor: T.ink, borderRadius: 2 }} />
      </button>

      {menuOpen && (
        <div
          style={{
            position: "fixed",
            top: 56,
            left: 0,
            right: 0,
            backgroundColor: "rgba(255,255,255,0.98)",
            backdropFilter: "saturate(180%) blur(20px)",
            WebkitBackdropFilter: "saturate(180%) blur(20px)",
            padding: "12px 22px 22px",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            borderBottom: `1px solid ${T.hairline}`,
          }}
        >
          {LINKS.map((label) => (
            <a
              key={label}
              href={`#${label.toLowerCase()}`}
              onClick={() => setMenuOpen(false)}
              style={{ color: T.ink, fontFamily: T.fontText, fontSize: 15, textDecoration: "none", padding: "10px 0" }}
            >
              {label}
            </a>
          ))}
          <div style={{ height: 1, backgroundColor: T.hairline, margin: "8px 0" }} />
          <Link href={ROUTES.login} onClick={() => setMenuOpen(false)} style={{ color: T.ink, fontFamily: T.fontText, fontSize: 15, textDecoration: "none", padding: "10px 0" }}>
            Masuk
          </Link>
          <Link
            href={ROUTES.register}
            onClick={() => setMenuOpen(false)}
            style={{ backgroundColor: T.primary, color: T.onDark, fontFamily: T.fontText, fontSize: 15, fontWeight: 500, borderRadius: 9999, padding: "11px 0", textAlign: "center", textDecoration: "none", marginTop: 4 }}
          >
            Daftar
          </Link>
        </div>
      )}
    </nav>
  );
}
