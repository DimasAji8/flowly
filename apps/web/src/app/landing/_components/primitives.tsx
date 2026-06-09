"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { T } from "./tokens";

// ─── Scroll-reveal wrapper ─────────────────────────────────────────────────────
export function Reveal({
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
export function Logo({
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
        height: "auto",
        width: isWordmark ? "auto" : height,
        maxHeight: height,
        objectFit: "contain",
        display: "block",
      }}
      priority
    />
  );
}

// ─── Phone frame containing an app screen ─────────────────────────────────────
export function PhoneFrame({ children, scale = 1 }: { children: React.ReactNode; scale?: number }) {
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

// ─── Buttons ───────────────────────────────────────────────────────────────────
export function PrimaryButton({
  href,
  children,
  big = false,
}: {
  href: string;
  children: React.ReactNode;
  big?: boolean;
}) {
  return (
    <a
      href={href}
      style={{
        background: T.primary,
        color: T.onDark,
        fontFamily: T.fontText,
        fontSize: big ? 16 : 15,
        fontWeight: 500,
        borderRadius: 9999,
        padding: big ? "13px 28px" : "10px 22px",
        textDecoration: "none",
        display: "inline-block",
        transition: "background-color 0.15s ease, transform 0.15s ease",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.backgroundColor = T.primaryFocus;
        el.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.backgroundColor = T.primary;
        el.style.transform = "translateY(0)";
      }}
    >
      {children}
    </a>
  );
}

export function GhostButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      style={{
        color: T.ink,
        fontFamily: T.fontText,
        fontSize: 16,
        fontWeight: 500,
        borderRadius: 9999,
        padding: "12px 26px",
        textDecoration: "none",
        display: "inline-block",
        border: `1px solid ${T.hairline}`,
        background: T.canvas,
        transition: "border-color 0.15s, background 0.15s",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = T.primary;
        el.style.background = T.primarySoft;
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = T.hairline;
        el.style.background = T.canvas;
      }}
    >
      {children}
    </a>
  );
}
