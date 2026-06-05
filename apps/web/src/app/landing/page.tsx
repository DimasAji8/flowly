"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
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
  textMuted: "#6e6e73",
  canvas: "#ffffff",
  canvasParchment: "#f5f5f7",
  surfaceTile1: "#272729",
  surfaceTile2: "#2a2a2c",
  surfaceBlack: "#000000",
  onDark: "#ffffff",
  hairline: "#e0e0e0",
  dividerSoft: "#f0f0f0",
  income: "#16a34a",
  incomeSoft: "#dcfce7",
  expense: "#dc2626",
  expenseSoft: "#fee2e2",
  primarySoft: "#dbe6fb",

  // Typography helpers
  fontDisplay: `"SF Pro Display", system-ui, -apple-system, sans-serif`,
  fontText: `"SF Pro Text", system-ui, -apple-system, sans-serif`,
};

// Unsplash placeholder images (sementara — akan diganti aset final).
const UNSPLASH = {
  heroLifestyle:
    "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80",
  planning:
    "https://images.unsplash.com/photo-1606189934846-a527add8a77b?auto=format&fit=crop&w=1000&q=80",
  savings:
    "https://images.unsplash.com/photo-1579621970795-87facc2f976d?auto=format&fit=crop&w=1000&q=80",
};

// ─── Scroll-reveal wrapper ─────────────────────────────────────────────────────
function Reveal({
  children,
  delay = 0,
  as = "div",
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  as?: "div" | "section";
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, []);

  const Tag = as;
  return (
    <Tag
      ref={ref as React.RefObject<HTMLDivElement> & React.RefObject<HTMLElement>}
      style={{
        ...style,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 0.6s ease-out ${delay}ms, transform 0.6s ease-out ${delay}ms`,
      }}
    >
      {children}
    </Tag>
  );
}

// ─── Logo component (uses real assets in /public) ─────────────────────────────
function FlowlyLogo({
  variant = "icon-dark",
  size = "sm",
}: {
  variant?: "icon-dark" | "icon-light" | "wordmark-blue" | "wordmark-white";
  size?: "sm" | "md" | "lg";
}) {
  const iconH = size === "sm" ? 26 : size === "md" ? 34 : 46;

  if (variant === "wordmark-blue" || variant === "wordmark-white") {
    const src =
      variant === "wordmark-blue"
        ? "/img/logo-text-blue.webp"
        : "/img/logo-text-white.webp";
    const h = size === "lg" ? 48 : size === "md" ? 38 : 30;
    return (
      <Image
        src={src}
        alt="Teman Kas"
        height={h}
        width={Math.round(h * 4)}
        style={{ height: h, width: "auto", objectFit: "contain", display: "block" }}
        priority
      />
    );
  }

  // Icon-only (use crisp SVGs)
  const src = variant === "icon-light" ? "/svg/logo-light.svg" : "/svg/logo-dark.svg";
  return (
    <Image
      src={src}
      alt="Teman Kas"
      height={iconH}
      width={iconH}
      style={{ height: iconH, width: iconH, objectFit: "contain", display: "block" }}
      priority
    />
  );
}

// ─── Primary / secondary buttons ──────────────────────────────────────────────
function PrimaryButton({
  href,
  children,
  big = false,
}: {
  href: string;
  children: React.ReactNode;
  big?: boolean;
}) {
  return (
    <Link
      href={href}
      style={{
        backgroundColor: T.primary,
        color: T.onDark,
        fontFamily: T.fontText,
        fontSize: big ? 17 : 15,
        fontWeight: 500,
        letterSpacing: "-0.374px",
        borderRadius: 9999,
        padding: big ? "13px 28px" : "10px 20px",
        textDecoration: "none",
        display: "inline-block",
        transition: "background-color 0.2s ease-out, transform 0.15s ease-out",
        willChange: "transform",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.backgroundColor = T.primaryFocus;
        el.style.transform = "scale(1.03)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.backgroundColor = T.primary;
        el.style.transform = "scale(1)";
      }}
    >
      {children}
    </Link>
  );
}

// ─── Nav ──────────────────────────────────────────────────────────────────────
function GlobalNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const links = ["Features", "Calendar", "Savings", "Recurring"];

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
        height: 48,
        backgroundColor: scrolled ? "rgba(0,0,0,0.72)" : T.surfaceBlack,
        backdropFilter: scrolled ? "saturate(180%) blur(20px)" : "none",
        WebkitBackdropFilter: scrolled ? "saturate(180%) blur(20px)" : "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        transition: "background-color 0.3s ease",
      }}
    >
      <Link
        href="/"
        style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}
      >
        <FlowlyLogo variant="icon-light" size="sm" />
        <span
          style={{
            fontFamily: T.fontDisplay,
            fontSize: 17,
            fontWeight: 600,
            color: T.onDark,
            letterSpacing: "-0.3px",
          }}
        >
          Teman Kas
        </span>
      </Link>

      {/* Desktop nav links */}
      <div style={{ display: "flex", gap: 28, alignItems: "center" }} className="lp-nav-links">
        {links.map((label) => (
          <a
            key={label}
            href={`#${label.toLowerCase()}`}
            style={{
              color: "rgba(255,255,255,0.82)",
              fontFamily: T.fontText,
              fontSize: 13,
              fontWeight: 400,
              letterSpacing: "-0.12px",
              textDecoration: "none",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => ((e.target as HTMLElement).style.color = T.onDark)}
            onMouseLeave={(e) =>
              ((e.target as HTMLElement).style.color = "rgba(255,255,255,0.82)")
            }
          >
            {label}
          </a>
        ))}
      </div>

      {/* CTA cluster (desktop) */}
      <div style={{ display: "flex", gap: 12, alignItems: "center" }} className="lp-nav-cta">
        <Link
          href={ROUTES.login}
          style={{
            color: "rgba(255,255,255,0.82)",
            fontFamily: T.fontText,
            fontSize: 13,
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
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: "-0.12px",
            borderRadius: 9999,
            padding: "7px 16px",
            textDecoration: "none",
            transition: "background-color 0.15s",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.backgroundColor = T.primaryFocus)
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.backgroundColor = T.primary)
          }
        >
          Get Started
        </Link>
      </div>

      {/* Hamburger (mobile) */}
      <button
        type="button"
        aria-label="Menu"
        onClick={() => setMenuOpen((v) => !v)}
        className="lp-nav-burger"
        style={{
          display: "none",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 6,
          flexDirection: "column",
          gap: 4,
        }}
      >
        <span style={{ width: 20, height: 1.5, backgroundColor: T.onDark, borderRadius: 2 }} />
        <span style={{ width: 20, height: 1.5, backgroundColor: T.onDark, borderRadius: 2 }} />
      </button>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div
          className="lp-nav-mobile-menu"
          style={{
            position: "fixed",
            top: 48,
            left: 0,
            right: 0,
            backgroundColor: "rgba(0,0,0,0.92)",
            backdropFilter: "saturate(180%) blur(20px)",
            WebkitBackdropFilter: "saturate(180%) blur(20px)",
            padding: "16px 20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {links.map((label) => (
            <a
              key={label}
              href={`#${label.toLowerCase()}`}
              onClick={() => setMenuOpen(false)}
              style={{
                color: "rgba(255,255,255,0.85)",
                fontFamily: T.fontText,
                fontSize: 15,
                fontWeight: 400,
                textDecoration: "none",
                padding: "10px 0",
              }}
            >
              {label}
            </a>
          ))}
          <div style={{ height: 1, backgroundColor: "rgba(255,255,255,0.08)", margin: "8px 0" }} />
          <Link
            href={ROUTES.login}
            onClick={() => setMenuOpen(false)}
            style={{
              color: "rgba(255,255,255,0.85)",
              fontFamily: T.fontText,
              fontSize: 15,
              textDecoration: "none",
              padding: "10px 0",
            }}
          >
            Sign In
          </Link>
          <Link
            href={ROUTES.register}
            onClick={() => setMenuOpen(false)}
            style={{
              backgroundColor: T.primary,
              color: T.onDark,
              fontFamily: T.fontText,
              fontSize: 15,
              fontWeight: 500,
              borderRadius: 9999,
              padding: "11px 0",
              textAlign: "center",
              textDecoration: "none",
              marginTop: 4,
            }}
          >
            Get Started
          </Link>
        </div>
      )}
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
        padding: "128px 24px 80px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* soft radial glow backdrop */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 720,
          height: 720,
          background:
            "radial-gradient(circle, rgba(0,102,204,0.06) 0%, rgba(0,102,204,0) 60%)",
          pointerEvents: "none",
        }}
      />

      <Reveal style={{ position: "relative", zIndex: 1, width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        {/* Eyebrow */}
        <p
          style={{
            fontFamily: T.fontText,
            fontSize: 13,
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
            fontSize: "clamp(38px, 8vw, 72px)",
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
            fontSize: "clamp(17px, 2.4vw, 19px)",
            fontWeight: 400,
            lineHeight: 1.47,
            letterSpacing: "-0.374px",
            color: T.textMuted,
            maxWidth: 520,
            margin: "0 auto 36px",
          }}
        >
          Teman Kas is a calm, beautiful cashflow journal. Track income, expenses,
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
          <PrimaryButton href={ROUTES.register} big>
            Start for free
          </PrimaryButton>
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
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ marginTop: 1 }}>
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
      </Reveal>

      {/* Mock UI preview */}
      <Reveal
        delay={120}
        style={{
          position: "relative",
          zIndex: 1,
          marginTop: 64,
          width: "100%",
          maxWidth: 880,
        }}
      >
        <div
          style={{
            width: "100%",
            borderRadius: 20,
            overflow: "hidden",
            boxShadow:
              "rgba(0,0,0,0.14) 0px 24px 60px -8px, rgba(0,0,0,0.06) 0px 4px 16px",
            border: `1px solid ${T.hairline}`,
          }}
        >
          <MockDashboard />
        </div>
      </Reveal>
    </section>
  );
}

// ─── Mock dashboard UI ────────────────────────────────────────────────────────
function MockDashboard() {
  const transactions = [
    { label: "Grocery Store", cat: "Food", amount: "-Rp 185.000", type: "expense" },
    { label: "Monthly Salary", cat: "Income", amount: "+Rp 8.500.000", type: "income" },
    { label: "Netflix", cat: "Subscriptions", amount: "-Rp 54.000", type: "expense" },
    { label: "Freelance Project", cat: "Income", amount: "+Rp 2.200.000", type: "income" },
    { label: "Coffee Shop", cat: "Food", amount: "-Rp 42.000", type: "expense" },
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
      className="lp-mock-dashboard"
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
        <div style={{ marginBottom: 14 }}>
          <FlowlyLogo variant="wordmark-blue" size="sm" />
        </div>
        {[
          "Dashboard",
          "Transactions",
          "Calendar",
          "Wallets",
          "Savings Goals",
          "Recurring",
          "Categories",
        ].map((item, i) => (
          <div
            key={item}
            style={{
              padding: "7px 10px",
              borderRadius: 8,
              fontSize: 13,
              color: i === 0 ? T.primary : T.textMuted,
              backgroundColor: i === 0 ? T.primarySoft : "transparent",
              fontWeight: i === 0 ? 600 : 400,
              letterSpacing: "-0.224px",
            }}
          >
            {item}
          </div>
        ))}
      </div>

      {/* Main content */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          {[
            { label: "Income", value: "Rp 10.700.000", color: T.income },
            { label: "Expenses", value: "Rp 3.281.000", color: T.expense },
            { label: "Net Flow", value: "Rp 7.419.000", color: T.primary },
          ].map((s) => (
            <div
              key={s.label}
              style={{ backgroundColor: T.canvas, borderRadius: 12, padding: "14px 16px" }}
            >
              <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 4 }}>{s.label}</div>
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
        <div style={{ backgroundColor: T.canvas, borderRadius: 12, padding: "14px 16px", flex: 1 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: T.ink,
              marginBottom: 10,
              letterSpacing: "-0.224px",
            }}
          >
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
                    backgroundColor: tx.type === "income" ? T.incomeSoft : T.expenseSoft,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    color: tx.type === "income" ? T.income : T.expense,
                  }}
                >
                  {tx.type === "income" ? "↑" : "↓"}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: T.ink }}>{tx.label}</div>
                  <div style={{ fontSize: 11, color: T.textMuted }}>{tx.cat}</div>
                </div>
              </div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: tx.type === "income" ? T.income : T.expense,
                }}
              >
                {tx.amount}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Stats strip ───────────────────────────────────────────────────────────────
function StatsStrip() {
  const stats = [
    { value: "< 5s", label: "to log a transaction" },
    { value: "100%", label: "free to get started" },
    { value: "0", label: "ads, ever" },
  ];
  return (
    <section style={{ backgroundColor: T.canvasParchment, padding: "56px 24px" }}>
      <Reveal
        style={{
          maxWidth: 880,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 24,
          textAlign: "center",
        }}
      >
        {stats.map((s) => (
          <div key={s.label}>
            <div
              style={{
                fontFamily: T.fontDisplay,
                fontSize: "clamp(28px, 5vw, 40px)",
                fontWeight: 600,
                color: T.ink,
                letterSpacing: "-0.02em",
                marginBottom: 6,
              }}
            >
              {s.value}
            </div>
            <div
              style={{
                fontFamily: T.fontText,
                fontSize: 14,
                color: T.textMuted,
                letterSpacing: "-0.224px",
              }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </Reveal>
    </section>
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
        padding: "88px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <Reveal style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
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
            fontSize: "clamp(30px, 5vw, 48px)",
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
            fontSize: "clamp(17px, 2.4vw, 19px)",
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
      </Reveal>
      <Reveal delay={120} style={{ width: "100%", display: "flex", justifyContent: "center" }}>
        {children}
      </Reveal>
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
        padding: "88px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <Reveal style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
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
            fontSize: "clamp(30px, 5vw, 48px)",
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
            fontSize: "clamp(17px, 2.4vw, 19px)",
            fontWeight: 400,
            lineHeight: 1.47,
            letterSpacing: "-0.374px",
            color: T.textMuted,
            maxWidth: 540,
            margin: "0 auto 48px",
          }}
        >
          {tagline}
        </p>
      </Reveal>
      <Reveal delay={120} style={{ width: "100%", display: "flex", justifyContent: "center" }}>
        {children}
      </Reveal>
    </section>
  );
}

// ─── Transaction feature ───────────────────────────────────────────────────────
function TransactionMock() {
  const items = [
    { icon: "🛒", label: "Grocery", cat: "Food & Drink", amount: "-Rp 185.000", income: false },
    { icon: "💼", label: "Salary", cat: "Income", amount: "+Rp 8.500.000", income: true },
    { icon: "☕", label: "Coffee", cat: "Food & Drink", amount: "-Rp 42.000", income: false },
    { icon: "📱", label: "Netflix", cat: "Subscription", amount: "-Rp 54.000", income: false },
    { icon: "🚗", label: "Grab", cat: "Transport", amount: "-Rp 38.000", income: false },
    { icon: "💸", label: "Freelance", cat: "Income", amount: "+Rp 2.200.000", income: true },
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
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: T.onDark,
                  letterSpacing: "-0.224px",
                }}
              >
                {tx.label}
              </div>
              <div style={{ fontSize: 12, color: T.bodyMuted }}>{tx.cat}</div>
            </div>
          </div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: tx.income ? "#4ade80" : "#f87171",
            }}
          >
            {tx.amount}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Calendar mock ─────────────────────────────────────────────────────────────
function CalendarMock() {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dates = Array.from({ length: 31 }, (_, idx) => {
    const d = idx + 1;
    return { d, e: d % 2 === 1, i: [3, 10, 14, 20, 29].includes(d) };
  });

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
          {["‹", "›"].map((c) => (
            <div
              key={c}
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
              {c}
            </div>
          ))}
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
          <div key={dt.d} style={{ textAlign: "center", padding: "6px 2px", position: "relative" }}>
            <div
              style={{
                fontFamily: T.fontText,
                fontSize: 13,
                fontWeight: dt.d === 3 ? 600 : 400,
                color: dt.d === 3 ? T.primary : T.ink,
                width: 28,
                height: 28,
                borderRadius: 9999,
                backgroundColor: dt.d === 3 ? T.primarySoft : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto",
              }}
            >
              {dt.d}
            </div>
            <div style={{ display: "flex", gap: 2, justifyContent: "center", marginTop: 2 }}>
              {dt.e && (
                <div style={{ width: 4, height: 4, borderRadius: 9999, backgroundColor: T.expense }} />
              )}
              {dt.i && (
                <div style={{ width: 4, height: 4, borderRadius: 9999, backgroundColor: T.income }} />
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
                <div style={{ textAlign: "left" }}>
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
                  <div style={{ fontFamily: T.fontText, fontSize: 12, color: T.textMuted }}>
                    Rp {(g.current / 1000000).toFixed(1)}M / Rp {(g.target / 1000000).toFixed(1)}M
                  </div>
                </div>
              </div>
              <div style={{ fontFamily: T.fontText, fontSize: 14, fontWeight: 600, color: g.color }}>
                {pct}%
              </div>
            </div>
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
    { icon: "📺", label: "Netflix", freq: "Monthly", next: "Jul 1", amount: "Rp 54.000", income: false },
    { icon: "🏠", label: "Rent", freq: "Monthly", next: "Jul 5", amount: "Rp 2.500.000", income: false },
    { icon: "💼", label: "Salary", freq: "Monthly", next: "Jul 25", amount: "Rp 8.500.000", income: true },
    { icon: "⚡", label: "Electricity", freq: "Monthly", next: "Jul 10", amount: "Rp 320.000", income: false },
    { icon: "📱", label: "Phone Plan", freq: "Monthly", next: "Jul 3", amount: "Rp 79.000", income: false },
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
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: T.onDark,
                  letterSpacing: "-0.224px",
                }}
              >
                {item.label}
              </div>
              <div style={{ fontSize: 11, color: T.bodyMuted }}>
                {item.freq} · Next {item.next}
              </div>
            </div>
          </div>
          <div
            style={{ fontSize: 13, fontWeight: 600, color: item.income ? "#4ade80" : "#f87171" }}
          >
            {item.amount}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Lifestyle / image band ────────────────────────────────────────────────────
function ImageBand() {
  return (
    <section style={{ backgroundColor: T.canvas, padding: "0 24px 88px" }}>
      <Reveal style={{ maxWidth: 980, margin: "0 auto" }}>
        <div
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "16 / 7",
            borderRadius: 24,
            overflow: "hidden",
            border: `1px solid ${T.hairline}`,
          }}
        >
          <Image
            src={UNSPLASH.heroLifestyle}
            alt="Person managing personal finances"
            fill
            sizes="(max-width: 980px) 100vw, 980px"
            style={{ objectFit: "cover" }}
          />
          {/* gradient + caption overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(0,0,0,0) 35%, rgba(0,0,0,0.55) 100%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 24,
              bottom: 24,
              right: 24,
              textAlign: "left",
            }}
          >
            <p
              style={{
                fontFamily: T.fontDisplay,
                fontSize: "clamp(20px, 3vw, 28px)",
                fontWeight: 600,
                color: T.onDark,
                letterSpacing: "-0.02em",
                margin: 0,
                maxWidth: 520,
                lineHeight: 1.2,
              }}
            >
              Built for everyday money, not spreadsheets.
            </p>
          </div>
        </div>
      </Reveal>
    </section>
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
          className="lp-feature-card"
          style={{
            backgroundColor: T.canvas,
            borderRadius: 18,
            padding: "24px",
            border: `1px solid ${T.hairline}`,
            textAlign: "left",
            transition: "transform 0.2s ease-out, box-shadow 0.2s ease-out",
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
              color: T.textMuted,
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
        padding: "104px 24px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Reveal style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
        <h2
          style={{
            fontFamily: T.fontDisplay,
            fontSize: "clamp(30px, 5vw, 56px)",
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
            fontSize: "clamp(17px, 2.4vw, 19px)",
            fontWeight: 400,
            lineHeight: 1.47,
            letterSpacing: "-0.374px",
            color: T.textMuted,
            maxWidth: 460,
            margin: "0 auto 40px",
          }}
        >
          Join Teman Kas and finally understand where every rupiah goes. Free to get started.
        </p>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
          <PrimaryButton href={ROUTES.register} big>
            Create free account
          </PrimaryButton>
          <Link
            href={ROUTES.login}
            style={{
              color: T.primary,
              fontFamily: T.fontText,
              fontSize: 17,
              fontWeight: 500,
              letterSpacing: "-0.374px",
              borderRadius: 9999,
              padding: "12px 28px",
              textDecoration: "none",
              display: "inline-block",
              border: `1px solid ${T.primary}`,
              transition: "background-color 0.15s",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.backgroundColor = "rgba(0,102,204,0.06)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.backgroundColor = "transparent")
            }
          >
            Sign in
          </Link>
        </div>
      </Reveal>
    </section>
  );
}

// ─── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  const columns = [
    { heading: "Product", links: ["Features", "Wallets", "Savings Goals", "Recurring", "Calendar"] },
    { heading: "Account", links: ["Sign In", "Create Account"] },
    { heading: "About", links: ["Overview", "Design", "Privacy Policy", "Terms of Use"] },
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
          <div style={{ marginBottom: 12 }}>
            <FlowlyLogo variant="wordmark-blue" size="md" />
          </div>
          <p
            style={{
              fontFamily: T.fontText,
              fontSize: 13,
              color: T.textMuted,
              lineHeight: 1.6,
              maxWidth: 240,
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
                    color: T.textMuted,
                    letterSpacing: "-0.12px",
                    lineHeight: 2.4,
                    textDecoration: "none",
                    display: "block",
                  }}
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
          Copyright © 2026 Teman Kas. All rights reserved.
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

        /* Feature card hover lift */
        .lp-feature-card:hover {
          transform: translateY(-4px);
          box-shadow: rgba(0,0,0,0.08) 0px 12px 28px -8px;
        }

        /* Nav responsive: hide links/cta and show burger on small screens */
        .lp-nav-burger { display: none; }
        @media (max-width: 768px) {
          .lp-nav-links { display: none !important; }
          .lp-nav-cta { display: none !important; }
          .lp-nav-burger { display: flex !important; }
        }

        /* Dashboard mock collapses on small screens */
        @media (max-width: 768px) {
          .lp-mock-dashboard {
            grid-template-columns: 1fr !important;
          }
          .lp-mock-dashboard > div:first-child { display: none !important; }
        }

        @media (max-width: 768px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }

        @media (prefers-reduced-motion: reduce) {
          * { transition: none !important; animation: none !important; }
        }
      `}</style>

      <GlobalNav />

      <main>
        {/* 1 · Hero — white tile */}
        <HeroSection />

        {/* 2 · Stats strip */}
        <StatsStrip />

        {/* 3 · Transactions — dark tile */}
        <DarkFeatureTile
          id="features"
          eyebrow="Income & Expenses"
          headline="Track every transaction. Effortlessly."
          tagline="Log income and expenses in seconds. Assign categories, pick a wallet, add a note — and you're done."
          variant={1}
        >
          <TransactionMock />
        </DarkFeatureTile>

        {/* 4 · Calendar — parchment tile */}
        <LightFeatureTile
          id="calendar"
          eyebrow="Calendar View"
          headline="See your money in time."
          tagline="A month view that shows where your money moved. Green dots for income, red dots for expenses. Tap any day to explore."
          parchment
        >
          <CalendarMock />
        </LightFeatureTile>

        {/* 5 · Recurring — dark tile (variant 2) */}
        <DarkFeatureTile
          id="recurring"
          eyebrow="Recurring Transactions"
          headline="Set it once. Stay on track."
          tagline="Automate repeating income and expenses — salary, subscriptions, bills. Teman Kas creates them for you on schedule."
          variant={2}
        >
          <RecurringMock />
        </DarkFeatureTile>

        {/* 6 · Savings Goals — white tile */}
        <LightFeatureTile
          id="savings"
          eyebrow="Savings Goals"
          headline="Dream. Plan. Achieve."
          tagline="Set financial targets and watch your progress grow. Every saving counts toward the life you want."
          parchment={false}
        >
          <SavingsMock />
        </LightFeatureTile>

        {/* 7 · Lifestyle image band */}
        <ImageBand />

        {/* 8 · Feature grid — parchment tile */}
        <LightFeatureTile
          eyebrow="Everything you need"
          headline="Powerful tools. Quiet interface."
          tagline="Teman Kas packs every feature you need into a calm, focused experience — nothing extra, nothing missing."
          parchment
        >
          <FeatureGrid />
        </LightFeatureTile>

        {/* 9 · CTA */}
        <CtaSection />
      </main>

      <Footer />
    </>
  );
}
