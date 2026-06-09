"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { VisuallyHidden } from "radix-ui";
import { Logo } from "./primitives";

const LINKS = [
  { label: "Overview", href: "#overview" },
  { label: "Calendar", href: "#calendar" },
  { label: "Savings", href: "#savings" },
  { label: "Recurring", href: "#recurring" },
];

const NAV_LINK_CLS =
  "text-sm font-medium text-[#3a3a3c] hover:text-[#0066cc] px-3.5 py-2 rounded-lg hover:bg-[#0066cc]/6 transition-colors duration-150 whitespace-nowrap";

export function GlobalNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      aria-label="Navigasi utama"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        height: 68,
        transition: "background 0.25s ease, box-shadow 0.25s ease",
        background: scrolled ? "rgba(255,255,255,0.96)" : "rgba(255,255,255,0)",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(12px)" : "none",
        boxShadow: scrolled ? "0 1px 0 0 rgba(0,0,0,0.07)" : "none",
      }}
    >
      <div
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          height: "100%",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        {/* ── Logo ── */}
        <Link
          href="/"
          aria-label="TemanKas – Beranda"
          style={{ display: "flex", alignItems: "center", flexShrink: 0 }}
        >
          <Logo variant="wordmark-blue" height={28} />
        </Link>

        {/* ── Desktop nav links (center) ── */}
        <div
          className="hidden lg:flex"
          style={{ alignItems: "center", gap: 16 }}
          role="navigation"
          aria-label="Menu desktop"
        >
          {LINKS.map((link) => (
            <a key={link.label} href={link.href} className={NAV_LINK_CLS}>
              {link.label}
            </a>
          ))}
        </div>

        {/* ── Desktop CTA ── */}
        <div
          className="hidden lg:flex"
          style={{ alignItems: "center", gap: 8, flexShrink: 0 }}
        >
          <Link
            href={ROUTES.login}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              height: 36,
              padding: "0 16px",
              borderRadius: 10,
              border: "1.5px solid #d1d1d6",
              color: "#3a3a3c",
              fontSize: 14,
              fontWeight: 500,
              textDecoration: "none",
              whiteSpace: "nowrap",
              background: "transparent",
              transition: "border-color 0.15s, background 0.15s",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = "#aeaeb2";
              el.style.background = "#f5f5f7";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = "#d1d1d6";
              el.style.background = "transparent";
            }}
          >
            Masuk
          </Link>
          <Link
            href={ROUTES.register}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              height: 36,
              padding: "0 18px",
              borderRadius: 10,
              background: "#0066cc",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
              whiteSpace: "nowrap",
              transition: "background 0.15s ease",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#0071e3")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#0066cc")}
          >
            Daftar
          </Link>
        </div>

        {/* ── Mobile hamburger ── */}
        <div className="flex lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                aria-label={open ? "Tutup menu" : "Buka menu navigasi"}
                aria-expanded={open}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  color: "#3a3a3c",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.05)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.background = "transparent")
                }
              >
                <Menu size={22} aria-hidden="true" />
              </button>
            </SheetTrigger>

            <SheetContent
              side="right"
              showCloseButton={false}
              className="lp-drawer"
              style={
                {
                  width: "min(82vw, 320px)",
                  maxWidth: "min(82vw, 320px)",
                  padding: 0,
                  gap: 0,
                  display: "flex",
                  flexDirection: "column",
                  background: "#fff",
                  borderLeft: "1px solid #f0f0f0",
                } as React.CSSProperties
              }
            >
              <VisuallyHidden.Root>
                <SheetTitle>Menu navigasi</SheetTitle>
              </VisuallyHidden.Root>
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 20px",
                  borderBottom: "1px solid #f0f0f0",
                  flexShrink: 0,
                }}
              >
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  aria-label="TemanKas – Beranda"
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <Logo variant="wordmark-blue" height={24} />
                </Link>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Tutup menu"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    color: "#6e6e73",
                    transition: "background 0.15s, color 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = "#f5f5f7";
                    el.style.color = "#1d1d1f";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = "transparent";
                    el.style.color = "#6e6e73";
                  }}
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </div>

              {/* Nav links */}
              <nav
                aria-label="Menu mobile"
                style={{ flex: 1, overflowY: "auto", padding: "12px 12px 8px" }}
              >
                <p
                  style={{
                    padding: "0 12px",
                    marginBottom: 6,
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#aeaeb2",
                    userSelect: "none",
                  }}
                >
                  Menu
                </p>
                {LINKS.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "12px 12px",
                      borderRadius: 10,
                      fontSize: 15,
                      fontWeight: 500,
                      color: "#1d1d1f",
                      textDecoration: "none",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLElement).style.background = "#f5f5f7")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLElement).style.background = "transparent")
                    }
                  >
                    {link.label}
                  </a>
                ))}
              </nav>

              {/* CTA */}
              <div
                style={{
                  padding: "16px 16px 24px",
                  borderTop: "1px solid #f0f0f0",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  flexShrink: 0,
                }}
              >
                <Link
                  href={ROUTES.register}
                  onClick={() => setOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: 48,
                    borderRadius: 12,
                    background: "#0066cc",
                    color: "#fff",
                    fontSize: 15,
                    fontWeight: 600,
                    textDecoration: "none",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.background = "#0071e3")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.background = "#0066cc")
                  }
                >
                  Daftar
                </Link>
                <Link
                  href={ROUTES.login}
                  onClick={() => setOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: 48,
                    borderRadius: 12,
                    border: "1.5px solid #e3e3e8",
                    color: "#1d1d1f",
                    fontSize: 15,
                    fontWeight: 600,
                    textDecoration: "none",
                    background: "transparent",
                    transition: "background 0.15s, border-color 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = "#f5f5f7";
                    el.style.borderColor = "#c0c0c8";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = "transparent";
                    el.style.borderColor = "#e3e3e8";
                  }}
                >
                  Masuk
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
