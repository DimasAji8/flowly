"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { useAuthStore } from "@/store/auth.store";

// ─── Design tokens (Apple-inspired, from DESIGN.md) ───────────────────────────
const T = {
  primary: "#0066cc",
  primaryFocus: "#0071e3",
  ink: "#1d1d1f",
  textMuted: "#6e6e73",
  canvas: "#ffffff",
  canvasParchment: "#f5f5f7",
  surfaceBlack: "#000000",
  onDark: "#ffffff",
  hairline: "#d2d2d7",
  income: "#16a34a",
  incomeSoft: "#dcfce7",
  expense: "#dc2626",
  expenseSoft: "#fee2e2",
  primarySoft: "#eaf1fb",
  fontDisplay: `"SF Pro Display", system-ui, -apple-system, sans-serif`,
  fontText: `"SF Pro Text", system-ui, -apple-system, sans-serif`,
};

// Unsplash placeholder images (sementara — akan diganti aset final).
const IMG = {
  heroLifestyle:
    "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1600&q=80",
  budgeting:
    "https://images.unsplash.com/photo-1579621970795-87facc2f976d?auto=format&fit=crop&w=1200&q=80",
  coffeeReceipt:
    "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?auto=format&fit=crop&w=1200&q=80",
  planning:
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80",
  savingJar:
    "https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?auto=format&fit=crop&w=1200&q=80",
  calmDesk:
    "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1600&q=80",
};

// ─── Scroll-reveal wrapper ─────────────────────────────────────────────────────
function Reveal({
  children,
  delay = 0,
  style,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      // No observer support → reveal on next frame to avoid sync setState.
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
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
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.7s ease-out ${delay}ms, transform 0.7s ease-out ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ─── Logo (real assets in /public) ────────────────────────────────────────────
function Logo({
  variant,
  height,
}: {
  variant: "icon-blue" | "icon-light" | "wordmark-blue" | "wordmark-white";
  height: number;
}) {
  const src =
    variant === "icon-blue"
      ? "/svg/logo-dark.svg"
      : variant === "icon-light"
      ? "/svg/logo-light.svg"
      : variant === "wordmark-blue"
      ? "/img/logo-text-blue.webp"
      : "/img/logo-text-white.webp";
  const isWordmark = variant.startsWith("wordmark");
  return (
    <Image
      src={src}
      alt="Teman Kas"
      height={height}
      width={isWordmark ? height * 4 : height}
      style={{
        height,
        width: isWordmark ? "auto" : height,
        objectFit: "contain",
        display: "block",
      }}
      priority
    />
  );
}

// ─── Phone frame containing an app screen ─────────────────────────────────────
function PhoneFrame({ children, scale = 1 }: { children: React.ReactNode; scale?: number }) {
  return (
    <div
      style={{
        width: 300 * scale,
        height: 620 * scale,
        borderRadius: 52 * scale,
        background: "#1d1d1f",
        padding: 12 * scale,
        boxShadow: "rgba(0,0,0,0.28) 0px 40px 80px -24px, rgba(0,0,0,0.10) 0px 8px 24px",
        position: "relative",
      }}
    >
      {/* notch */}
      <div
        style={{
          position: "absolute",
          top: 12 * scale,
          left: "50%",
          transform: "translateX(-50%)",
          width: 110 * scale,
          height: 26 * scale,
          borderRadius: 9999,
          background: "#1d1d1f",
          zIndex: 3,
        }}
      />
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 42 * scale,
          overflow: "hidden",
          background: T.canvasParchment,
          position: "relative",
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ─── App screen: Dashboard ────────────────────────────────────────────────────
function ScreenDashboard() {
  const txs = [
    { label: "Monthly Salary", cat: "Income", amt: "+Rp 8.500.000", income: true },
    { label: "Grocery Store", cat: "Food & Drink", amt: "-Rp 185.000", income: false },
    { label: "Netflix", cat: "Subscriptions", amt: "-Rp 54.000", income: false },
    { label: "Coffee Shop", cat: "Food & Drink", amt: "-Rp 42.000", income: false },
  ];
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", fontFamily: T.fontText, background: T.canvasParchment }}>
      <div style={{ padding: "40px 18px 14px" }}>
        <div style={{ fontSize: 12, color: T.textMuted }}>June 2026</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: T.ink, letterSpacing: "-0.4px", marginTop: 2 }}>
          Good evening
        </div>
      </div>
      {/* net flow card */}
      <div style={{ margin: "0 14px", background: T.primary, borderRadius: 18, padding: "16px 18px", color: T.onDark }}>
        <div style={{ fontSize: 11, opacity: 0.85 }}>Net flow this month</div>
        <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.6px", marginTop: 2 }}>Rp 7.419.000</div>
        <div style={{ display: "flex", gap: 16, marginTop: 12, fontSize: 11 }}>
          <span>↑ Income Rp 10.7jt</span>
          <span>↓ Spend Rp 3.28jt</span>
        </div>
      </div>
      {/* list */}
      <div style={{ margin: "16px 14px 0", background: T.canvas, borderRadius: 18, padding: "6px 14px", flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: T.ink, padding: "10px 0 6px" }}>Recent</div>
        {txs.map((t, i) => (
          <div
            key={t.label}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "9px 0",
              borderTop: i === 0 ? "none" : "1px solid #f0f0f0",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 9,
                  background: t.income ? T.incomeSoft : T.expenseSoft,
                  color: t.income ? T.income : T.expense,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                }}
              >
                {t.income ? "↑" : "↓"}
              </span>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: T.ink }}>{t.label}</div>
                <div style={{ fontSize: 10.5, color: T.textMuted }}>{t.cat}</div>
              </div>
            </div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: t.income ? T.income : T.expense }}>{t.amt}</div>
          </div>
        ))}
      </div>
      {/* bottom bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          padding: "12px 0 18px",
          marginTop: 14,
          background: T.canvas,
          borderTop: "1px solid #ececec",
        }}
      >
        {["Home", "Calendar", "", "List", "You"].map((l, i) =>
          i === 2 ? (
            <span
              key={i}
              style={{
                width: 42,
                height: 42,
                borderRadius: 9999,
                background: T.primary,
                color: T.onDark,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                marginTop: -22,
                boxShadow: "rgba(0,102,204,0.4) 0px 8px 18px -4px",
              }}
            >
              +
            </span>
          ) : (
            <span key={i} style={{ fontSize: 10, color: i === 0 ? T.primary : T.textMuted, fontWeight: i === 0 ? 600 : 400 }}>
              {l}
            </span>
          )
        )}
      </div>
    </div>
  );
}

// ─── App screen: Calendar ─────────────────────────────────────────────────────
function ScreenCalendar() {
  const days = ["S", "M", "T", "W", "T", "F", "S"];
  const cells = Array.from({ length: 35 }, (_, i) => {
    const d = i - 0;
    const day = d >= 1 && d <= 30 ? d : null;
    return { day, e: day ? day % 2 === 1 : false, in: day ? [4, 12, 25].includes(day) : false };
  });
  return (
    <div style={{ height: "100%", fontFamily: T.fontText, background: T.canvas, padding: "44px 16px 16px" }}>
      <div style={{ fontSize: 18, fontWeight: 700, color: T.ink, letterSpacing: "-0.3px", marginBottom: 14 }}>June 2026</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", marginBottom: 6 }}>
        {days.map((d, i) => (
          <div key={i} style={{ textAlign: "center", fontSize: 10, fontWeight: 600, color: T.textMuted }}>{d}</div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "8px 0" }}>
        {cells.map((c, i) => (
          <div key={i} style={{ textAlign: "center", minHeight: 34 }}>
            {c.day && (
              <>
                <div
                  style={{
                    fontSize: 12,
                    color: c.day === 4 ? T.onDark : T.ink,
                    fontWeight: c.day === 4 ? 700 : 400,
                    width: 24,
                    height: 24,
                    lineHeight: "24px",
                    borderRadius: 9999,
                    margin: "0 auto",
                    background: c.day === 4 ? T.primary : "transparent",
                  }}
                >
                  {c.day}
                </div>
                <div style={{ display: "flex", gap: 2, justifyContent: "center", marginTop: 3 }}>
                  {c.e && <span style={{ width: 4, height: 4, borderRadius: 9999, background: T.expense }} />}
                  {c.in && <span style={{ width: 4, height: 4, borderRadius: 9999, background: T.income }} />}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 18, background: T.canvasParchment, borderRadius: 14, padding: "12px 14px" }}>
        <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 8 }}>Wed, June 4</div>
        {[
          { l: "Salary", a: "+Rp 8.500.000", inc: true },
          { l: "Groceries", a: "-Rp 185.000", inc: false },
        ].map((t) => (
          <div key={t.l} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0" }}>
            <span style={{ fontSize: 12, color: T.ink }}>{t.l}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: t.inc ? T.income : T.expense }}>{t.a}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── App screen: Savings goals ────────────────────────────────────────────────
function ScreenSavings() {
  const goals = [
    { l: "Emergency Fund", c: 8.5, t: 10, pct: 85, color: T.primary },
    { l: "Vacation to Japan", c: 3.2, t: 8, pct: 40, color: "#7c3aed" },
    { l: "New Laptop", c: 5.4, t: 6, pct: 90, color: T.income },
  ];
  return (
    <div style={{ height: "100%", fontFamily: T.fontText, background: T.canvasParchment, padding: "44px 16px 16px" }}>
      <div style={{ fontSize: 18, fontWeight: 700, color: T.ink, letterSpacing: "-0.3px", marginBottom: 14 }}>Savings Goals</div>
      {goals.map((g) => (
        <div key={g.l} style={{ background: T.canvas, borderRadius: 16, padding: "14px 16px", marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{g.l}</div>
              <div style={{ fontSize: 11, color: T.textMuted }}>Rp {g.c}jt / Rp {g.t}jt</div>
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: g.color }}>{g.pct}%</div>
          </div>
          <div style={{ height: 7, borderRadius: 9999, background: "#eaeaea", overflow: "hidden" }}>
            <div style={{ width: `${g.pct}%`, height: "100%", background: g.color, borderRadius: 9999 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Nav ──────────────────────────────────────────────────────────────────────
function GlobalNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const links = ["Overview", "Calendar", "Savings", "Recurring"];

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
        padding: "0 22px",
        transition: "background-color 0.3s ease",
      }}
    >
      <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
        <Logo variant="icon-light" height={24} />
        <span style={{ fontFamily: T.fontDisplay, fontSize: 17, fontWeight: 600, color: T.onDark, letterSpacing: "-0.3px" }}>
          Teman Kas
        </span>
      </Link>

      <div style={{ display: "flex", gap: 28, alignItems: "center" }} className="lp-nav-links">
        {links.map((label) => (
          <a
            key={label}
            href={`#${label.toLowerCase()}`}
            style={{
              color: "rgba(255,255,255,0.82)",
              fontFamily: T.fontText,
              fontSize: 13,
              textDecoration: "none",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => ((e.target as HTMLElement).style.color = T.onDark)}
            onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "rgba(255,255,255,0.82)")}
          >
            {label}
          </a>
        ))}
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center" }} className="lp-nav-cta">
        <Link href={ROUTES.login} style={{ color: "rgba(255,255,255,0.82)", fontFamily: T.fontText, fontSize: 13, textDecoration: "none" }}>
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
            borderRadius: 9999,
            padding: "7px 16px",
            textDecoration: "none",
            transition: "background-color 0.15s",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = T.primaryFocus)}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = T.primary)}
        >
          Get Started
        </Link>
      </div>

      <button
        type="button"
        aria-label="Menu"
        onClick={() => setMenuOpen((v) => !v)}
        className="lp-nav-burger"
        style={{ display: "none", background: "none", border: "none", cursor: "pointer", padding: 6, flexDirection: "column", gap: 4 }}
      >
        <span style={{ width: 20, height: 1.5, backgroundColor: T.onDark, borderRadius: 2 }} />
        <span style={{ width: 20, height: 1.5, backgroundColor: T.onDark, borderRadius: 2 }} />
      </button>

      {menuOpen && (
        <div
          style={{
            position: "fixed",
            top: 48,
            left: 0,
            right: 0,
            backgroundColor: "rgba(0,0,0,0.94)",
            backdropFilter: "saturate(180%) blur(20px)",
            WebkitBackdropFilter: "saturate(180%) blur(20px)",
            padding: "12px 22px 22px",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {links.map((label) => (
            <a
              key={label}
              href={`#${label.toLowerCase()}`}
              onClick={() => setMenuOpen(false)}
              style={{ color: "rgba(255,255,255,0.85)", fontFamily: T.fontText, fontSize: 15, textDecoration: "none", padding: "10px 0" }}
            >
              {label}
            </a>
          ))}
          <div style={{ height: 1, backgroundColor: "rgba(255,255,255,0.08)", margin: "8px 0" }} />
          <Link href={ROUTES.login} onClick={() => setMenuOpen(false)} style={{ color: "rgba(255,255,255,0.85)", fontFamily: T.fontText, fontSize: 15, textDecoration: "none", padding: "10px 0" }}>
            Sign In
          </Link>
          <Link
            href={ROUTES.register}
            onClick={() => setMenuOpen(false)}
            style={{ backgroundColor: T.primary, color: T.onDark, fontFamily: T.fontText, fontSize: 15, fontWeight: 500, borderRadius: 9999, padding: "11px 0", textAlign: "center", textDecoration: "none", marginTop: 4 }}
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
    <section style={{ background: T.canvas, padding: "96px 24px 0", textAlign: "center" }}>
      <Reveal>
        <h1
          style={{
            fontFamily: T.fontDisplay,
            fontSize: "clamp(48px, 9vw, 96px)",
            fontWeight: 600,
            lineHeight: 1.04,
            letterSpacing: "-0.03em",
            color: T.ink,
            margin: "24px auto 0",
          }}
        >
          Teman Kas
        </h1>
        <p
          style={{
            fontFamily: T.fontDisplay,
            fontSize: "clamp(21px, 3.4vw, 30px)",
            fontWeight: 500,
            lineHeight: 1.25,
            letterSpacing: "-0.01em",
            color: T.ink,
            maxWidth: 640,
            margin: "16px auto 0",
          }}
        >
          Tahu ke mana uangmu pergi.
        </p>
        <div style={{ display: "flex", gap: 24, justifyContent: "center", marginTop: 18, flexWrap: "wrap" }}>
          <Link href={ROUTES.register} style={{ color: T.primary, fontFamily: T.fontText, fontSize: "clamp(17px,2.4vw,21px)", textDecoration: "none" }}>
            Mulai gratis ›
          </Link>
          <a href="#overview" style={{ color: T.primary, fontFamily: T.fontText, fontSize: "clamp(17px,2.4vw,21px)", textDecoration: "none" }}>
            Lihat fiturnya ›
          </a>
        </div>
      </Reveal>

      {/* Big hero image (lifestyle) */}
      <Reveal delay={100}>
        <div
          style={{
            maxWidth: 1100,
            margin: "44px auto 0",
            position: "relative",
            aspectRatio: "16 / 9",
            borderRadius: 28,
            overflow: "hidden",
          }}
        >
          <Image src={IMG.heroLifestyle} alt="Mengatur keuangan pribadi" fill priority sizes="(max-width: 1100px) 100vw, 1100px" style={{ objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.35) 100%)" }} />
          {/* phone floating over image */}
          <div className="lp-hero-phone" style={{ position: "absolute", right: "8%", bottom: "-6%", transform: "scale(0.72)", transformOrigin: "bottom right" }}>
            <PhoneFrame>
              <ScreenDashboard />
            </PhoneFrame>
          </div>
          <div style={{ position: "absolute", left: 28, bottom: 26, textAlign: "left", maxWidth: 460 }}>
            <p style={{ fontFamily: T.fontDisplay, fontSize: "clamp(20px,2.6vw,30px)", fontWeight: 600, color: T.onDark, letterSpacing: "-0.02em", lineHeight: 1.18, margin: 0 }}>
              Catat pemasukan & pengeluaran dalam hitungan detik.
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

// ─── Big feature row: image + phone, alternating ──────────────────────────────
function FeatureRow({
  id,
  eyebrow,
  title,
  body,
  bg,
  image,
  imageAlt,
  screen,
  reverse = false,
  dark = false,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  body: string;
  bg: string;
  image: string;
  imageAlt: string;
  screen: React.ReactNode;
  reverse?: boolean;
  dark?: boolean;
}) {
  const textColor = dark ? T.onDark : T.ink;
  const mutedColor = dark ? "rgba(255,255,255,0.72)" : T.textMuted;
  return (
    <section id={id} style={{ background: T.canvas, padding: "20px 20px 0" }}>
      <Reveal>
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            borderRadius: 28,
            background: bg,
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div className={`lp-feature-grid ${reverse ? "lp-reverse" : ""}`}>
            {/* Text + phone side */}
            <div style={{ padding: "clamp(36px,5vw,64px)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <p style={{ fontFamily: T.fontText, fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: T.primary, marginBottom: 14 }}>
                {eyebrow}
              </p>
              <h2 style={{ fontFamily: T.fontDisplay, fontSize: "clamp(28px,3.6vw,42px)", fontWeight: 600, lineHeight: 1.1, letterSpacing: "-0.02em", color: textColor, marginBottom: 16 }}>
                {title}
              </h2>
              <p style={{ fontFamily: T.fontText, fontSize: "clamp(15px,1.8vw,18px)", lineHeight: 1.5, color: mutedColor, maxWidth: 460 }}>
                {body}
              </p>
              <div style={{ marginTop: 36, display: "flex", justifyContent: "center" }}>
                <PhoneFrame scale={0.82}>{screen}</PhoneFrame>
              </div>
            </div>
            {/* Image side */}
            <div style={{ position: "relative", minHeight: 320 }}>
              <Image src={image} alt={imageAlt} fill sizes="(max-width: 880px) 100vw, 550px" style={{ objectFit: "cover" }} />
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

// ─── Full-width banner with overlay text ──────────────────────────────────────
function Banner({
  image,
  eyebrow,
  title,
  cta,
  href,
}: {
  image: string;
  eyebrow: string;
  title: string;
  cta: string;
  href: string;
}) {
  return (
    <section style={{ background: T.canvas, padding: "20px 20px 0" }}>
      <Reveal>
        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", aspectRatio: "16 / 9", borderRadius: 28, overflow: "hidden" }}>
          <Image src={image} alt={title} fill sizes="(max-width: 1100px) 100vw, 1100px" style={{ objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.1) 45%, rgba(0,0,0,0.2) 100%)" }} />
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 24px" }}>
            <p style={{ fontFamily: T.fontText, fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.9)", marginBottom: 12 }}>
              {eyebrow}
            </p>
            <h2 style={{ fontFamily: T.fontDisplay, fontSize: "clamp(28px,4.5vw,52px)", fontWeight: 600, lineHeight: 1.08, letterSpacing: "-0.02em", color: T.onDark, maxWidth: 720, marginBottom: 24 }}>
              {title}
            </h2>
            <Link
              href={href}
              style={{ background: T.onDark, color: T.ink, fontFamily: T.fontText, fontSize: 16, fontWeight: 500, borderRadius: 9999, padding: "12px 26px", textDecoration: "none" }}
            >
              {cta}
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

// ─── Capability grid (text-only, calm, no emoji) ──────────────────────────────
function CapabilityGrid() {
  const items = [
    { t: "Beberapa Dompet", d: "Tunai, rekening bank, dan e-wallet. Lacak terpisah atau jadi satu." },
    { t: "Arus Kas Bersih", d: "Lihat pemasukan dikurangi pengeluaran secara instan." },
    { t: "Kategori Kustom", d: "Kategori berwarna untuk merapikan setiap transaksi." },
    { t: "Transfer Dompet", d: "Pindahkan dana antar dompet, tercatat otomatis." },
    { t: "Transaksi Berulang", d: "Gaji, langganan, tagihan — dibuat otomatis sesuai jadwal." },
    { t: "Multi-pengguna", d: "Satu workspace bisa dibagikan ke pasangan atau tim." },
  ];
  return (
    <section style={{ background: T.canvas, padding: "80px 24px 56px" }}>
      <Reveal style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ fontFamily: T.fontDisplay, fontSize: "clamp(28px,4vw,44px)", fontWeight: 600, letterSpacing: "-0.02em", color: T.ink, marginBottom: 36, maxWidth: 640 }}>
          Semua yang kamu butuhkan. Tanpa yang tidak perlu.
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 1, background: T.hairline, borderRadius: 20, overflow: "hidden", border: `1px solid ${T.hairline}` }}>
          {items.map((f) => (
            <div key={f.t} style={{ background: T.canvas, padding: "28px 26px" }}>
              <div style={{ fontFamily: T.fontText, fontSize: 19, fontWeight: 600, color: T.ink, letterSpacing: "-0.3px", marginBottom: 8 }}>{f.t}</div>
              <div style={{ fontFamily: T.fontText, fontSize: 15, color: T.textMuted, lineHeight: 1.5 }}>{f.d}</div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

// ─── Final CTA ─────────────────────────────────────────────────────────────────
function CtaSection() {
  return (
    <section style={{ background: T.canvasParchment, padding: "96px 24px", textAlign: "center" }}>
      <Reveal>
        <h2 style={{ fontFamily: T.fontDisplay, fontSize: "clamp(30px,5vw,56px)", fontWeight: 600, lineHeight: 1.06, letterSpacing: "-0.03em", color: T.ink, maxWidth: 640, margin: "0 auto 18px" }}>
          Kejelasan finansialmu dimulai di sini.
        </h2>
        <p style={{ fontFamily: T.fontText, fontSize: "clamp(17px,2.4vw,19px)", color: T.textMuted, maxWidth: 460, margin: "0 auto 32px" }}>
          Gabung dengan Teman Kas dan pahami ke mana setiap rupiah pergi. Gratis untuk memulai.
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href={ROUTES.register}
            style={{ background: T.primary, color: T.onDark, fontFamily: T.fontText, fontSize: 17, fontWeight: 500, borderRadius: 9999, padding: "13px 28px", textDecoration: "none" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = T.primaryFocus)}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = T.primary)}
          >
            Buat akun gratis
          </Link>
          <Link
            href={ROUTES.login}
            style={{ color: T.primary, fontFamily: T.fontText, fontSize: 17, fontWeight: 500, borderRadius: 9999, padding: "12px 28px", textDecoration: "none", border: `1px solid ${T.primary}` }}
          >
            Masuk
          </Link>
        </div>
      </Reveal>
    </section>
  );
}

// ─── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  const columns = [
    { heading: "Produk", links: ["Overview", "Dompet", "Savings Goals", "Transaksi Berulang", "Kalender"] },
    { heading: "Akun", links: ["Masuk", "Buat Akun"] },
    { heading: "Tentang", links: ["Ikhtisar", "Privasi", "Ketentuan"] },
  ];
  return (
    <footer style={{ background: T.canvasParchment, borderTop: `1px solid ${T.hairline}`, padding: "48px 24px 32px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40 }} className="footer-grid">
        <div>
          <div style={{ marginBottom: 12 }}>
            <Logo variant="wordmark-blue" height={34} />
          </div>
          <p style={{ fontFamily: T.fontText, fontSize: 13, color: T.textMuted, lineHeight: 1.6, maxWidth: 260 }}>
            Jurnal arus kas yang tenang dan personal, dibuat untuk penggunaan sehari-hari.
          </p>
        </div>
        {columns.map((col) => (
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

        .lp-feature-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 520px;
        }
        .lp-feature-grid.lp-reverse { direction: rtl; }
        .lp-feature-grid.lp-reverse > * { direction: ltr; }

        @media (max-width: 880px) {
          .lp-feature-grid { grid-template-columns: 1fr; }
          .lp-feature-grid.lp-reverse { direction: ltr; }
          .lp-feature-grid > div:last-child { min-height: 280px !important; order: -1; }
        }

        @media (max-width: 640px) {
          .lp-hero-phone { display: none !important; }
        }

        .lp-nav-burger { display: none; }
        @media (max-width: 768px) {
          .lp-nav-links { display: none !important; }
          .lp-nav-cta { display: none !important; }
          .lp-nav-burger { display: flex !important; }
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

      <main style={{ background: T.canvas }}>
        <HeroSection />

        <FeatureRow
          id="overview"
          eyebrow="Pemasukan & Pengeluaran"
          title="Catat tiap transaksi. Tanpa repot."
          body="Pilih kategori, tentukan dompet, tambahkan catatan — selesai. Dirancang agar bisa dilakukan dengan satu tangan."
          bg={T.canvasParchment}
          image={IMG.coffeeReceipt}
          imageAlt="Mencatat pengeluaran sehari-hari"
          screen={<ScreenDashboard />}
        />

        <FeatureRow
          id="calendar"
          eyebrow="Tampilan Kalender"
          title="Lihat uangmu dalam linimasa."
          body="Tampilan bulanan menunjukkan ke mana uang bergerak. Titik hijau untuk pemasukan, merah untuk pengeluaran. Ketuk tanggal mana pun untuk detail."
          bg="#eef3fb"
          image={IMG.planning}
          imageAlt="Merencanakan anggaran bulanan"
          screen={<ScreenCalendar />}
          reverse
        />

        <Banner
          image={IMG.calmDesk}
          eyebrow="Tenang & Fokus"
          title="Dibuat untuk uang sehari-hari, bukan spreadsheet."
          cta="Mulai gratis"
          href={ROUTES.register}
        />

        <FeatureRow
          id="savings"
          eyebrow="Savings Goals"
          title="Impikan. Rencanakan. Wujudkan."
          body="Tetapkan target finansial dan saksikan progresnya bertumbuh. Setiap tabungan membawamu lebih dekat ke tujuan."
          bg="#f3eefb"
          image={IMG.savingJar}
          imageAlt="Menabung untuk tujuan"
          screen={<ScreenSavings />}
        />

        <CapabilityGrid />

        <CtaSection />
      </main>

      <Footer />
    </>
  );
}
