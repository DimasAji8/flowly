"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { useAuthStore } from "@/store/auth.store";

// ─── Design tokens (Apple-inspired, from DESIGN.md) ───────────────────────────
const T = {
  // Colors
  primary: "#0066cc",
  primaryFocus: "#0071e3",
  primaryOnDark: "#2997ff",
  ink: "#1d1d1f",
  bodyMuted: "#cccccc",
  inkMuted80: "#333333",
  inkMuted48: "#7a7a7a",
  canvas: "#ffffff",
  canvasParchment: "#f5f5f7",
  surfaceTile1: "#272729",
  surfaceTile2: "#2a2a2c",
  surfaceBlack: "#000000",
  onDark: "#ffffff",
  hairline: "#e0e0e0",
  dividerSoft: "#f0f0f0",

  // Typography helpers
  fontDisplay: `"SF Pro Display", system-ui, -apple-system, sans-serif`,
  fontText: `"SF Pro Text", system-ui, -apple-system, sans-serif`,
};

// ─── Nav ──────────────────────────────────────────────────────────────────────
function GlobalNav() {
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
        height: 44,
        backgroundColor: scrolled
          ? "rgba(0,0,0,0.85)"
          : T.surfaceBlack,
        backdropFilter: scrolled ? "saturate(180%) blur(20px)" : "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        transition: "background-color 0.3s",
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        style={{
          color: T.onDark,
          fontFamily: T.fontDisplay,
          fontSize: 17,
          fontWeight: 600,
          letterSpacing: "-0.374px",
          textDecoration: "none",
        }}
      >
        Flowly
      </Link>

      {/* Desktop nav links */}
      <div
        style={{
          display: "flex",
          gap: 28,
          alignItems: "center",
        }}
        className="hidden md:flex"
      >
        {["Features", "Calendar", "Savings", "Recurring"].map((label) => (
          <a
            key={label}
            href={`#${label.toLowerCase()}`}
            style={{
              color: "rgba(255,255,255,0.8)",
              fontFamily: T.fontText,
              fontSize: 12,
              fontWeight: 400,
              letterSpacing: "-0.12px",
              textDecoration: "none",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) =>
              ((e.target as HTMLElement).style.color = T.onDark)
            }
            onMouseLeave={(e) =>
              ((e.target as HTMLElement).style.color = "rgba(255,255,255,0.8)")
            }
          >
            {label}
          </a>
        ))}
      </div>

      {/* CTA cluster */}
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <Link
          href={ROUTES.login}
          style={{
            color: "rgba(255,255,255,0.8)",
            fontFamily: T.fontText,
            fontSize: 12,
            fontWeight: 400,
            letterSpacing: "-0.12px",
            textDecoration: "none",
          }}
        >
          Sign In
        </Link>
        <Link
          href={ROUTES.register}
          style={{
            backgroundColor: T.primary,
            color: T.onDark,
            fontFamily: T.fontText,
            fontSize: 12,
            fontWeight: 400,
            letterSpacing: "-0.12px",
            borderRadius: 9999,
            padding: "6px 14px",
            textDecoration: "none",
            transition: "background-color 0.15s",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.backgroundColor =
              T.primaryFocus)
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.backgroundColor = T.primary)
          }
        >
          Get Started
        </Link>
      </div>
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section
      style={{
        backgroundColor: T.canvas,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "120px 24px 80px",
        textAlign: "center",
      }}
    >
      {/* Eyebrow */}
      <p
        style={{
          fontFamily: T.fontText,
          fontSize: 14,
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: T.primary,
          marginBottom: 20,
        }}
      >
        Personal Finance, Simplified
      </p>

      {/* Headline */}
      <h1
        style={{
          fontFamily: T.fontDisplay,
          fontSize: "clamp(40px, 8vw, 72px)",
          fontWeight: 600,
          lineHeight: 1.07,
          letterSpacing: "-0.03em",
          color: T.ink,
          maxWidth: 820,
          margin: "0 auto 24px",
        }}
      >
        Know where your
        <br />
        money goes.
      </h1>

      {/* Tagline */}
      <p
        style={{
          fontFamily: T.fontText,
          fontSize: 19,
          fontWeight: 400,
          lineHeight: 1.47,
          letterSpacing: "-0.374px",
          color: "#6e6e73",
          maxWidth: 520,
          margin: "0 auto 40px",
        }}
      >
        Flowly is a calm, beautiful cashflow journal. Track income, expenses,
        and savings goals — all in one place.
      </p>

      {/* CTAs */}
      <div
        style={{
          display: "flex",
          gap: 14,
          alignItems: "center",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <Link
          href={ROUTES.register}
          style={{
            backgroundColor: T.primary,
            color: T.onDark,
            fontFamily: T.fontText,
            fontSize: 17,
            fontWeight: 400,
            letterSpacing: "-0.374px",
            borderRadius: 9999,
            padding: "11px 22px",
            textDecoration: "none",
            transition: "background-color 0.15s, transform 0.1s",
            display: "inline-block",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.backgroundColor =
              T.primaryFocus)
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.backgroundColor = T.primary)
          }
        >
          Start for free
        </Link>
        <a
          href="#features"
          style={{
            color: T.primary,
            fontFamily: T.fontText,
            fontSize: 17,
            fontWeight: 400,
            letterSpacing: "-0.374px",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "11px 0",
          }}
        >
          See how it works
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            style={{ marginTop: 1 }}
          >
            <path
              d="M3 7h8M7 3l4 4-4 4"
              stroke={T.primary}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </div>

      {/* Mock UI preview */}
      <div
        style={{
          marginTop: 72,
          width: "100%",
          maxWidth: 860,
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: "rgba(0,0,0,0.14) 0px 24px 60px -8px, rgba(0,0,0,0.06) 0px 4px 16px",
          border: `1px solid ${T.hairline}`,
        }}
      >
        <MockDashboard />
      </div>
    </section>
  );
}

// ─── Mock dashboard UI ────────────────────────────────────────────────────────
function MockDashboard() {
  const transactions = [
    { label: "Grocery Store", cat: "Food", amount: "-Rp 185.000", type: "expense", color: "#ef4444" },
    { label: "Monthly Salary", cat: "Income", amount: "+Rp 8.500.000", type: "income", color: "#16a34a" },
    { label: "Netflix", cat: "Subscriptions", amount: "-Rp 54.000", type: "expense", color: "#ef4444" },
    { label: "Freelance Project", cat: "Income", amount: "+Rp 2.200.000", type: "income", color: "#16a34a" },
    { label: "Coffee Shop", cat: "Food", amount: "-Rp 42.000", type: "expense", color: "#ef4444" },
  ];

  return (
    <div
      style={{
        backgroundColor: "#eff4fb",
        padding: 24,
        display: "grid",
        gridTemplateColumns: "220px 1fr",
        gap: 16,
        minHeight: 380,
        fontFamily: T.fontText,
      }}
      className="hidden md:grid"
    >
      {/* Sidebar */}
      <div
        style={{
          backgroundColor: T.canvas,
          borderRadius: 14,
          padding: "20px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 600, color: T.ink, marginBottom: 12, letterSpacing: "-0.224px" }}>
          Flowly
        </div>
        {["Dashboard", "Transactions", "Calendar", "Wallets", "Savings Goals", "Recurring", "Categories"].map(
          (item, i) => (
            <div
              key={item}
              style={{
                padding: "7px 10px",
                borderRadius: 8,
                fontSize: 13,
                color: i === 0 ? T.primary : "#6e6e73",
                backgroundColor: i === 0 ? "#dbe6fb" : "transparent",
                fontWeight: i === 0 ? 600 : 400,
                letterSpacing: "-0.224px",
              }}
            >
              {item}
            </div>
          )
        )}
      </div>

      {/* Main content */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          {[
            { label: "Income", value: "Rp 10.700.000", color: "#16a34a", bg: "#dcfce7" },
            { label: "Expenses", value: "Rp 3.281.000", color: "#dc2626", bg: "#fee2e2" },
            { label: "Net Flow", value: "Rp 7.419.000", color: T.primary, bg: "#dbe6fb" },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                backgroundColor: T.canvas,
                borderRadius: 12,
                padding: "14px 16px",
              }}
            >
              <div style={{ fontSize: 11, color: "#6e6e73", marginBottom: 4 }}>{s.label}</div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: s.color,
                  letterSpacing: "-0.374px",
                }}
              >
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Recent transactions */}
        <div
          style={{
            backgroundColor: T.canvas,
            borderRadius: 12,
            padding: "14px 16px",
            flex: 1,
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: T.ink, marginBottom: 10, letterSpacing: "-0.224px" }}>
            Recent Transactions
          </div>
          {transactions.map((tx) => (
            <div
              key={tx.label}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "7px 0",
                borderBottom: `1px solid ${T.dividerSoft}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    backgroundColor: tx.type === "income" ? "#dcfce7" : "#fee2e2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                  }}
                >
                  {tx.type === "income" ? "↑" : "↓"}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: T.ink }}>{tx.label}</div>
                  <div style={{ fontSize: 11, color: "#6e6e73" }}>{tx.cat}</div>
                </div>
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: tx.color }}>
                {tx.amount}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Feature tile (dark) ──────────────────────────────────────────────────────
function DarkFeatureTile({
  id,
  eyebrow,
  headline,
  tagline,
  children,
  variant = 1,
}: {
  id?: string;
  eyebrow: string;
  headline: string;
  tagline: string;
  children?: React.ReactNode;
  variant?: 1 | 2 | 3;
}) {
  const bg = variant === 1 ? T.surfaceTile1 : variant === 2 ? T.surfaceTile2 : "#1a1a1c";
  return (
    <section
      id={id}
      style={{
        backgroundColor: bg,
        padding: "80px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <p
        style={{
          fontFamily: T.fontText,
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: T.primaryOnDark,
          marginBottom: 16,
        }}
      >
        {eyebrow}
      </p>
      <h2
        style={{
          fontFamily: T.fontDisplay,
          fontSize: "clamp(34px, 5vw, 48px)",
          fontWeight: 600,
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
          color: T.onDark,
          maxWidth: 680,
          margin: "0 auto 20px",
        }}
      >
        {headline}
      </h2>
      <p
        style={{
          fontFamily: T.fontText,
          fontSize: 19,
          fontWeight: 400,
          lineHeight: 1.47,
          letterSpacing: "-0.374px",
          color: T.bodyMuted,
          maxWidth: 540,
          margin: "0 auto 48px",
        }}
      >
        {tagline}
      </p>
      {children}
    </section>
  );
}

// ─── Feature tile (light) ─────────────────────────────────────────────────────
function LightFeatureTile({
  id,
  eyebrow,
  headline,
  tagline,
  parchment = false,
  children,
}: {
  id?: string;
  eyebrow: string;
  headline: string;
  tagline: string;
  parchment?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <section
      id={id}
      style={{
        backgroundColor: parchment ? T.canvasParchment : T.canvas,
        padding: "80px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <p
        style={{
          fontFamily: T.fontText,
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: T.primary,
          marginBottom: 16,
        }}
      >
        {eyebrow}
      </p>
      <h2
        style={{
          fontFamily: T.fontDisplay,
          fontSize: "clamp(34px, 5vw, 48px)",
          fontWeight: 600,
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
          color: T.ink,
          maxWidth: 680,
          margin: "0 auto 20px",
        }}
      >
        {headline}
      </h2>
      <p
        style={{
          fontFamily: T.fontText,
          fontSize: 19,
          fontWeight: 400,
          lineHeight: 1.47,
          letterSpacing: "-0.374px",
          color: "#6e6e73",
          maxWidth: 540,
          margin: "0 auto 48px",
        }}
      >
        {tagline}
      </p>
      {children}
    </section>
  );
}

// ─── Transaction feature ───────────────────────────────────────────────────────
function TransactionMock() {
  const items = [
    { icon: "🛒", label: "Grocery", cat: "Food & Drink", amount: "-Rp 185.000", color: "#ef4444" },
    { icon: "💼", label: "Salary", cat: "Income", amount: "+Rp 8.500.000", color: "#16a34a" },
    { icon: "☕", label: "Coffee", cat: "Food & Drink", amount: "-Rp 42.000", color: "#ef4444" },
    { icon: "📱", label: "Netflix", cat: "Subscription", amount: "-Rp 54.000", color: "#ef4444" },
    { icon: "🚗", label: "Grab", cat: "Transport", amount: "-Rp 38.000", color: "#ef4444" },
    { icon: "💸", label: "Freelance", cat: "Income", amount: "+Rp 2.200.000", color: "#16a34a" },
  ];
  return (
    <div
      style={{
        width: "100%",
        maxWidth: 440,
        margin: "0 auto",
        backgroundColor: "rgba(255,255,255,0.06)",
        borderRadius: 18,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      {items.map((tx, i) => (
        <div
          key={tx.label}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "13px 20px",
            borderBottom: i < items.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                backgroundColor: "rgba(255,255,255,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 17,
              }}
            >
              {tx.icon}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: T.onDark, letterSpacing: "-0.224px" }}>
                {tx.label}
              </div>
              <div style={{ fontSize: 12, color: T.bodyMuted }}>{tx.cat}</div>
            </div>
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: tx.color }}>{tx.amount}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Calendar mock ─────────────────────────────────────────────────────────────
function CalendarMock() {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dates = [
    { d: 1, e: true, i: false },
    { d: 2, e: false, i: false },
    { d: 3, e: true, i: true },
    { d: 4, e: false, i: false },
    { d: 5, e: true, i: false },
    { d: 6, e: false, i: false },
    { d: 7, e: true, i: false },
    { d: 8, e: false, i: false },
    { d: 9, e: true, i: false },
    { d: 10, e: false, i: true },
    { d: 11, e: true, i: false },
    { d: 12, e: false, i: false },
    { d: 13, e: true, i: false },
    { d: 14, e: true, i: true },
    { d: 15, e: false, i: false },
    { d: 16, e: true, i: false },
    { d: 17, e: false, i: false },
    { d: 18, e: true, i: false },
    { d: 19, e: false, i: false },
    { d: 20, e: true, i: true },
    { d: 21, e: false, i: false },
    { d: 22, e: true, i: false },
    { d: 23, e: true, i: false },
    { d: 24, e: false, i: false },
    { d: 25, e: true, i: false },
    { d: 26, e: false, i: false },
    { d: 27, e: true, i: false },
    { d: 28, e: false, i: false },
    { d: 29, e: true, i: true },
    { d: 30, e: false, i: false },
    { d: 31, e: true, i: false },
  ];

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 480,
        margin: "0 auto",
        backgroundColor: T.canvas,
        borderRadius: 18,
        overflow: "hidden",
        boxShadow: "rgba(0,0,0,0.08) 0px 8px 32px -4px",
        border: `1px solid ${T.hairline}`,
      }}
    >
      {/* Month header */}
      <div
        style={{
          padding: "16px 20px 12px",
          borderBottom: `1px solid ${T.dividerSoft}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontFamily: T.fontDisplay,
            fontSize: 17,
            fontWeight: 600,
            color: T.ink,
            letterSpacing: "-0.374px",
          }}
        >
          June 2026
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 9999,
              backgroundColor: T.canvasParchment,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: 13,
              color: T.inkMuted80,
            }}
          >
            ‹
          </div>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 9999,
              backgroundColor: T.canvasParchment,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: 13,
              color: T.inkMuted80,
            }}
          >
            ›
          </div>
        </div>
      </div>

      {/* Day headers */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          padding: "10px 12px 4px",
        }}
      >
        {days.map((d) => (
          <div
            key={d}
            style={{
              textAlign: "center",
              fontFamily: T.fontText,
              fontSize: 11,
              fontWeight: 600,
              color: T.inkMuted48,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Dates */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          padding: "4px 12px 14px",
          gap: "2px 0",
        }}
      >
        {/* Offset: June 2026 starts on Monday = 1 */}
        <div />
        {dates.map((dt) => (
          <div
            key={dt.d}
            style={{
              textAlign: "center",
              padding: "6px 2px",
              position: "relative",
            }}
          >
            <div
              style={{
                fontFamily: T.fontText,
                fontSize: 13,
                fontWeight: dt.d === 3 ? 600 : 400,
                color: dt.d === 3 ? T.primary : T.ink,
                width: 28,
                height: 28,
                borderRadius: 9999,
                backgroundColor: dt.d === 3 ? "#dbe6fb" : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto",
              }}
            >
              {dt.d}
            </div>
            {/* Indicators */}
            <div
              style={{
                display: "flex",
                gap: 2,
                justifyContent: "center",
                marginTop: 2,
              }}
            >
              {dt.e && (
                <div
                  style={{ width: 4, height: 4, borderRadius: 9999, backgroundColor: "#ef4444" }}
                />
              )}
              {dt.i && (
                <div
                  style={{ width: 4, height: 4, borderRadius: 9999, backgroundColor: "#16a34a" }}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Savings goals mock ────────────────────────────────────────────────────────
function SavingsMock() {
  const goals = [
    { label: "Emergency Fund", icon: "🛡️", current: 8500000, target: 10000000, color: "#0066cc" },
    { label: "Vacation to Japan", icon: "✈️", current: 3200000, target: 8000000, color: "#7c3aed" },
    { label: "New Laptop", icon: "💻", current: 5400000, target: 6000000, color: "#16a34a" },
    { label: "Wedding Fund", icon: "💍", current: 12000000, target: 50000000, color: "#db2777" },
  ];

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 520,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {goals.map((g) => {
        const pct = Math.round((g.current / g.target) * 100);
        return (
          <div
            key={g.label}
            style={{
              backgroundColor: T.canvas,
              borderRadius: 14,
              padding: "16px 20px",
              border: `1px solid ${T.hairline}`,
              boxShadow: "rgba(0,0,0,0.04) 0px 2px 8px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 10,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 20 }}>{g.icon}</span>
                <div>
                  <div
                    style={{
                      fontFamily: T.fontText,
                      fontSize: 14,
                      fontWeight: 600,
                      color: T.ink,
                      letterSpacing: "-0.224px",
                    }}
                  >
                    {g.label}
                  </div>
                  <div style={{ fontFamily: T.fontText, fontSize: 12, color: "#6e6e73" }}>
                    Rp {(g.current / 1000000).toFixed(1)}M / Rp {(g.target / 1000000).toFixed(1)}M
                  </div>
                </div>
              </div>
              <div
                style={{
                  fontFamily: T.fontText,
                  fontSize: 14,
                  fontWeight: 600,
                  color: g.color,
                }}
              >
                {pct}%
              </div>
            </div>
            {/* Progress bar */}
            <div
              style={{
                height: 6,
                borderRadius: 9999,
                backgroundColor: "#e8edf2",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${pct}%`,
                  borderRadius: 9999,
                  backgroundColor: g.color,
                  transition: "width 0.6s ease",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Recurring mock ────────────────────────────────────────────────────────────
function RecurringMock() {
  const items = [
    { icon: "📺", label: "Netflix", freq: "Monthly", next: "Jul 1", amount: "Rp 54.000", color: "#ef4444" },
    { icon: "🏠", label: "Rent", freq: "Monthly", next: "Jul 5", amount: "Rp 2.500.000", color: "#ef4444" },
    { icon: "💼", label: "Salary", freq: "Monthly", next: "Jul 25", amount: "Rp 8.500.000", color: "#16a34a" },
    { icon: "⚡", label: "Electricity", freq: "Monthly", next: "Jul 10", amount: "Rp 320.000", color: "#ef4444" },
    { icon: "📱", label: "Phone Plan", freq: "Monthly", next: "Jul 3", amount: "Rp 79.000", color: "#ef4444" },
  ];
  return (
    <div
      style={{
        width: "100%",
        maxWidth: 460,
        margin: "0 auto",
        backgroundColor: "rgba(255,255,255,0.06)",
        borderRadius: 18,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "14px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontFamily: T.fontText,
            fontSize: 13,
            fontWeight: 600,
            color: T.onDark,
            letterSpacing: "-0.224px",
          }}
        >
          Upcoming — July 2026
        </span>
        <span
          style={{
            backgroundColor: "rgba(41,151,255,0.15)",
            color: T.primaryOnDark,
            fontFamily: T.fontText,
            fontSize: 11,
            fontWeight: 600,
            borderRadius: 9999,
            padding: "3px 10px",
          }}
        >
          5 active
        </span>
      </div>
      {items.map((item, i) => (
        <div
          key={item.label}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 20px",
            borderBottom: i < items.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: "rgba(255,255,255,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
              }}
            >
              {item.icon}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: T.onDark, letterSpacing: "-0.224px" }}>
                {item.label}
              </div>
              <div style={{ fontSize: 11, color: T.bodyMuted }}>
                {item.freq} · Next {item.next}
              </div>
            </div>
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: item.color }}>{item.amount}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Feature grid (wallets & workspaces) ──────────────────────────────────────
function FeatureGrid() {
  const features = [
    {
      icon: "👛",
      title: "Multiple Wallets",
      desc: "Cash, bank accounts, e-wallets — track them all separately or together.",
    },
    {
      icon: "📊",
      title: "Net Cashflow View",
      desc: "Instantly see income minus expenses. Your financial health, at a glance.",
    },
    {
      icon: "🗂️",
      title: "Custom Categories",
      desc: "Color-coded categories to organize income and expenses exactly how you think.",
    },
    {
      icon: "🔄",
      title: "Wallet Transfers",
      desc: "Move money between wallets. Transfer records are tracked automatically.",
    },
    {
      icon: "📅",
      title: "Calendar Journal",
      desc: "Browse transactions day by day. Red for expenses, green for income.",
    },
    {
      icon: "🎯",
      title: "Savings Goals",
      desc: "Set targets, track progress, and allocate funds toward what matters.",
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: 16,
        width: "100%",
        maxWidth: 900,
        margin: "0 auto",
      }}
    >
      {features.map((f) => (
        <div
          key={f.title}
          style={{
            backgroundColor: T.canvas,
            borderRadius: 18,
            padding: "24px",
            border: `1px solid ${T.hairline}`,
            textAlign: "left",
          }}
        >
          <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
          <div
            style={{
              fontFamily: T.fontText,
              fontSize: 17,
              fontWeight: 600,
              color: T.ink,
              letterSpacing: "-0.374px",
              marginBottom: 6,
            }}
          >
            {f.title}
          </div>
          <div
            style={{
              fontFamily: T.fontText,
              fontSize: 14,
              fontWeight: 400,
              color: "#6e6e73",
              lineHeight: 1.5,
              letterSpacing: "-0.224px",
            }}
          >
            {f.desc}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Final CTA section ─────────────────────────────────────────────────────────
function CtaSection() {
  return (
    <section
      style={{
        backgroundColor: T.canvasParchment,
        padding: "100px 24px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <h2
        style={{
          fontFamily: T.fontDisplay,
          fontSize: "clamp(34px, 5vw, 56px)",
          fontWeight: 600,
          lineHeight: 1.07,
          letterSpacing: "-0.03em",
          color: T.ink,
          maxWidth: 640,
          margin: "0 auto 20px",
        }}
      >
        Your financial clarity starts here.
      </h2>
      <p
        style={{
          fontFamily: T.fontText,
          fontSize: 19,
          fontWeight: 400,
          lineHeight: 1.47,
          letterSpacing: "-0.374px",
          color: "#6e6e73",
          maxWidth: 460,
          margin: "0 auto 40px",
        }}
      >
        Join Flowly and finally understand where every rupiah goes. Free to get started.
      </p>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
        <Link
          href={ROUTES.register}
          style={{
            backgroundColor: T.primary,
            color: T.onDark,
            fontFamily: T.fontText,
            fontSize: 17,
            fontWeight: 400,
            letterSpacing: "-0.374px",
            borderRadius: 9999,
            padding: "13px 28px",
            textDecoration: "none",
            display: "inline-block",
            transition: "background-color 0.15s",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.backgroundColor = T.primaryFocus)
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.backgroundColor = T.primary)
          }
        >
          Create free account
        </Link>
        <Link
          href={ROUTES.login}
          style={{
            color: T.primary,
            fontFamily: T.fontText,
            fontSize: 17,
            fontWeight: 400,
            letterSpacing: "-0.374px",
            borderRadius: 9999,
            padding: "13px 28px",
            textDecoration: "none",
            display: "inline-block",
            border: `1px solid ${T.primary}`,
          }}
        >
          Sign in
        </Link>
      </div>
    </section>
  );
}

// ─── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  const columns = [
    {
      heading: "Product",
      links: ["Features", "Wallets", "Savings Goals", "Recurring", "Calendar"],
    },
    {
      heading: "Account",
      links: ["Sign In", "Create Account"],
    },
    {
      heading: "About",
      links: ["Overview", "Design", "Privacy Policy", "Terms of Use"],
    },
  ];

  return (
    <footer
      style={{
        backgroundColor: T.canvasParchment,
        borderTop: `1px solid ${T.hairline}`,
        padding: "48px 24px 32px",
        maxWidth: "100%",
      }}
    >
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr 1fr",
          gap: 40,
        }}
        className="footer-grid"
      >
        {/* Brand */}
        <div>
          <div
            style={{
              fontFamily: T.fontDisplay,
              fontSize: 20,
              fontWeight: 600,
              color: T.ink,
              letterSpacing: "-0.374px",
              marginBottom: 10,
            }}
          >
            Flowly
          </div>
          <p
            style={{
              fontFamily: T.fontText,
              fontSize: 13,
              color: "#6e6e73",
              lineHeight: 1.6,
              maxWidth: 220,
            }}
          >
            A calm, personal cashflow journal built for everyday use.
          </p>
        </div>

        {/* Link columns */}
        {columns.map((col) => (
          <div key={col.heading}>
            <div
              style={{
                fontFamily: T.fontText,
                fontSize: 12,
                fontWeight: 600,
                color: T.inkMuted80,
                letterSpacing: "-0.12px",
                marginBottom: 12,
              }}
            >
              {col.heading}
            </div>
            {col.links.map((link) => (
              <div key={link} style={{ marginBottom: 2 }}>
                <a
                  href="#"
                  style={{
                    fontFamily: T.fontText,
                    fontSize: 12,
                    fontWeight: 400,
                    color: "#6e6e73",
                    letterSpacing: "-0.12px",
                    lineHeight: 2.4,
                    textDecoration: "none",
                    display: "block",
                  }}
                  onMouseEnter={(e) =>
                    ((e.target as HTMLElement).style.color = T.primary)
                  }
                  onMouseLeave={(e) =>
                    ((e.target as HTMLElement).style.color = "#6e6e73")
                  }
                >
                  {link}
                </a>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Legal */}
      <div
        style={{
          maxWidth: 900,
          margin: "32px auto 0",
          paddingTop: 20,
          borderTop: `1px solid ${T.hairline}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <p
          style={{
            fontFamily: T.fontText,
            fontSize: 12,
            color: T.inkMuted48,
            letterSpacing: "-0.12px",
          }}
        >
          Copyright © 2026 Flowly. All rights reserved.
        </p>
        <div style={{ display: "flex", gap: 20 }}>
          {["Privacy Policy", "Terms of Use"].map((l) => (
            <a
              key={l}
              href="#"
              style={{
                fontFamily: T.fontText,
                fontSize: 12,
                color: T.inkMuted48,
                letterSpacing: "-0.12px",
                textDecoration: "none",
              }}
            >
              {l}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const router = useRouter();
  const { isReady, user, accessToken } = useAuthStore();

  useEffect(() => {
    if (isReady && user && accessToken) {
      router.replace(ROUTES.dashboard);
    }
  }, [isReady, user, accessToken, router]);

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        @media (max-width: 768px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <GlobalNav />

      <main>
        {/* 1 · Hero — white tile */}
        <HeroSection />

        {/* 2 · Transactions — dark tile */}
        <DarkFeatureTile
          id="features"
          eyebrow="Income & Expenses"
          headline="Track every transaction. Effortlessly."
          tagline="Log income and expenses in seconds. Assign categories, pick a wallet, add a note — and you're done."
          variant={1}
        >
          <TransactionMock />
        </DarkFeatureTile>

        {/* 3 · Calendar — parchment tile */}
        <LightFeatureTile
          id="calendar"
          eyebrow="Calendar View"
          headline="See your money in time."
          tagline="A month view that shows where your money moved. Green dots for income, red dots for expenses. Tap any day to explore."
          parchment
        >
          <CalendarMock />
        </LightFeatureTile>

        {/* 4 · Recurring — dark tile (variant 2) */}
        <DarkFeatureTile
          id="recurring"
          eyebrow="Recurring Transactions"
          headline="Set it once. Stay on track."
          tagline="Automate repeating income and expenses — salary, subscriptions, bills. Flowly creates them for you on schedule."
          variant={2}
        >
          <RecurringMock />
        </DarkFeatureTile>

        {/* 5 · Savings Goals — white tile */}
        <LightFeatureTile
          id="savings"
          eyebrow="Savings Goals"
          headline="Dream. Plan. Achieve."
          tagline="Set financial targets and watch your progress grow. Every saving counts toward the life you want."
          parchment={false}
        >
          <SavingsMock />
        </LightFeatureTile>

        {/* 6 · Feature grid — parchment tile */}
        <LightFeatureTile
          eyebrow="Everything you need"
          headline="Powerful tools. Quiet interface."
          tagline="Flowly packs every feature you need into a calm, focused experience — nothing extra, nothing missing."
          parchment
        >
          <FeatureGrid />
        </LightFeatureTile>

        {/* 7 · CTA */}
        <CtaSection />
      </main>

      <Footer />
    </>
  );
}
