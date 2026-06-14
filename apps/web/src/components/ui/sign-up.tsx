"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle, useMemo, useCallback, createContext, Children } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, ArrowLeft, Loader, PartyPopper, X, AlertCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { GlobalOptions as ConfettiGlobalOptions, CreateTypes as ConfettiInstance, Options as ConfettiOptions } from "canvas-confetti";
import confetti from "canvas-confetti";

// ─── Confetti ────────────────────────────────────────────────────────────────
type Api = { fire: (options?: ConfettiOptions) => void };
export type ConfettiRef = Api | null;
createContext<Api>({} as Api);

const Confetti = forwardRef<ConfettiRef, React.ComponentPropsWithRef<"canvas"> & { options?: ConfettiOptions; globalOptions?: ConfettiGlobalOptions; manualstart?: boolean }>(
  (props, ref) => {
    const { options, globalOptions = { resize: true, useWorker: true }, manualstart = false, ...rest } = props;
    const instanceRef = useRef<ConfettiInstance | null>(null);
    const canvasRef = useCallback((node: HTMLCanvasElement) => {
      if (node !== null) {
        if (instanceRef.current) return;
        instanceRef.current = confetti.create(node, { ...globalOptions, resize: true });
      } else {
        if (instanceRef.current) { instanceRef.current.reset(); instanceRef.current = null; }
      }
    }, [globalOptions]);
    const fire = useCallback((opts = {}) => instanceRef.current?.({ ...options, ...opts }), [options]);
    const api = useMemo(() => ({ fire }), [fire]);
    useImperativeHandle(ref, () => api, [api]);
    useEffect(() => { if (!manualstart) fire(); }, [manualstart, fire]);
    return <canvas ref={canvasRef} {...rest} />;
  }
);
Confetti.displayName = "Confetti";

// ─── Animated Characters ─────────────────────────────────────────────────────
interface EyeBallProps {
  size?: number; pupilSize?: number; maxDistance?: number;
  eyeColor?: string; pupilColor?: string; isBlinking?: boolean;
  lookX?: number; lookY?: number;
}
const EyeBall = ({ size = 48, pupilSize = 16, eyeColor = "white", pupilColor = "black", isBlinking = false, lookX = 0, lookY = 0 }: EyeBallProps) => (
  <div className="rounded-full flex items-center justify-center transition-all duration-150"
    style={{ width: size, height: isBlinking ? 2 : size, backgroundColor: eyeColor, overflow: "hidden" }}>
    {!isBlinking && <div className="rounded-full" style={{ width: pupilSize, height: pupilSize, backgroundColor: pupilColor, transform: `translate(${lookX}px,${lookY}px)`, transition: "transform 0.1s ease-out" }} />}
  </div>
);

interface PupilProps { size?: number; pupilColor?: string; lookX?: number; lookY?: number; }
const Pupil = ({ size = 12, pupilColor = "black", lookX = 0, lookY = 0 }: PupilProps) => (
  <div className="rounded-full" style={{ width: size, height: size, backgroundColor: pupilColor, transform: `translate(${lookX}px,${lookY}px)`, transition: "transform 0.1s ease-out" }} />
);

function Characters({ isTyping, showPassword, password }: { isTyping: boolean; showPassword: boolean; password: string }) {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [isPurpleBlinking, setIsPurpleBlinking] = useState(false);
  const [isBlackBlinking, setIsBlackBlinking] = useState(false);
  const [isLookingAtEachOther, setIsLookingAtEachOther] = useState(false);
  const [isPurplePeeking, setIsPurplePeeking] = useState(false);
  const [containerRect, setContainerRect] = useState<{ left: number; top: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { setMouseX(e.clientX); setMouseY(e.clientY); };
    window.addEventListener("mousemove", h);
    return () => window.removeEventListener("mousemove", h);
  }, []);

  // Track container position without accessing ref during render
  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        const r = containerRef.current.getBoundingClientRect();
        setContainerRect({ left: r.left, top: r.top });
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const scheduleBlink = (setter: (v: boolean) => void) => {
      const t = setTimeout(() => { setter(true); setTimeout(() => { setter(false); scheduleBlink(setter); }, 150); }, Math.random() * 4000 + 3000);
      return t;
    };
    const t1 = scheduleBlink(setIsPurpleBlinking);
    const t2 = scheduleBlink(setIsBlackBlinking);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setIsLookingAtEachOther(isTyping), 0);
    if (isTyping) {
      const t2 = setTimeout(() => setIsLookingAtEachOther(false), 800);
      return () => { clearTimeout(t); clearTimeout(t2); };
    }
    return () => clearTimeout(t);
  }, [isTyping]);

  useEffect(() => {
    const shouldPeek = password.length > 0 && showPassword;
    const t0 = setTimeout(() => setIsPurplePeeking(!shouldPeek ? false : isPurplePeeking), 0);
    if (!shouldPeek) return () => clearTimeout(t0);
    const t = setTimeout(() => {
      setIsPurplePeeking(true);
      setTimeout(() => setIsPurplePeeking(false), 800);
    }, Math.random() * 3000 + 2000);
    return () => { clearTimeout(t0); clearTimeout(t); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [password, showPassword]);

  const CHAR_CENTERS = {
    purple: { x: 160, y: 200 },
    black:  { x: 300, y: 155 },
    orange: { x: 120, y: 100 },
    yellow: { x: 380, y: 115 },
  };

  const calcPos = (center: { x: number; y: number }) => {
    if (!containerRect) return { faceX: 0, faceY: 0, bodySkew: 0 };
    const dx = mouseX - (containerRect.left + center.x);
    const dy = mouseY - (containerRect.top + center.y);
    return {
      faceX: Math.max(-15, Math.min(15, dx / 20)),
      faceY: Math.max(-10, Math.min(10, dy / 30)),
      bodySkew: Math.max(-6, Math.min(6, -dx / 120)),
    };
  };

  const calcLook = (center: { x: number; y: number }, max = 5) => {
    if (!containerRect) return { lx: 0, ly: 0 };
    const dx = mouseX - (containerRect.left + center.x);
    const dy = mouseY - (containerRect.top + center.y);
    const dist = Math.min(Math.sqrt(dx ** 2 + dy ** 2), max);
    const angle = Math.atan2(dy, dx);
    return { lx: Math.cos(angle) * dist, ly: Math.sin(angle) * dist };
  };

  const pp = calcPos(CHAR_CENTERS.purple);
  const bp = calcPos(CHAR_CENTERS.black);
  const yp = calcPos(CHAR_CENTERS.yellow);
  const op = calcPos(CHAR_CENTERS.orange);
  const hiding = isTyping || (password.length > 0 && !showPassword);
  const peekingOut = password.length > 0 && showPassword;

  const purpleLook = peekingOut
    ? { lx: isPurplePeeking ? 4 : -4, ly: isPurplePeeking ? 5 : -4 }
    : isLookingAtEachOther ? { lx: 3, ly: 4 }
    : calcLook(CHAR_CENTERS.purple);

  const blackLook = peekingOut ? { lx: -4, ly: -4 }
    : isLookingAtEachOther ? { lx: 0, ly: -4 }
    : calcLook(CHAR_CENTERS.black, 4);

  const orangeLook = peekingOut ? { lx: -5, ly: -4 } : calcLook(CHAR_CENTERS.orange);
  const yellowLook = peekingOut ? { lx: -5, ly: -4 } : calcLook(CHAR_CENTERS.yellow);

  return (
    <div ref={containerRef} style={{ position: "relative", width: 550, height: 400 }}>
      {/* Purple */}
      <div className="absolute bottom-0 transition-all duration-700 ease-in-out"
        style={{ left: 70, width: 180, height: hiding ? 440 : 400, backgroundColor: "#6C3FF5", borderRadius: "10px 10px 0 0", zIndex: 1,
          transform: peekingOut ? "skewX(0deg)" : hiding ? `skewX(${(pp.bodySkew||0)-12}deg) translateX(40px)` : `skewX(${pp.bodySkew||0}deg)`,
          transformOrigin: "bottom center" }}>
        <div className="absolute flex gap-8 transition-all duration-700 ease-in-out"
          style={{ left: peekingOut ? 20 : isLookingAtEachOther ? 55 : 45 + pp.faceX, top: peekingOut ? 35 : isLookingAtEachOther ? 65 : 40 + pp.faceY }}>
          {[0,1].map(i => <EyeBall key={i} size={18} pupilSize={7} eyeColor="white" pupilColor="#2D2D2D" isBlinking={isPurpleBlinking} lookX={purpleLook.lx} lookY={purpleLook.ly} />)}
        </div>
      </div>
      {/* Black */}
      <div className="absolute bottom-0 transition-all duration-700 ease-in-out"
        style={{ left: 240, width: 120, height: 310, backgroundColor: "#2D2D2D", borderRadius: "8px 8px 0 0", zIndex: 2,
          transform: peekingOut ? "skewX(0deg)" : isLookingAtEachOther ? `skewX(${(bp.bodySkew||0)*1.5+10}deg) translateX(20px)` : hiding ? `skewX(${(bp.bodySkew||0)*1.5}deg)` : `skewX(${bp.bodySkew||0}deg)`,
          transformOrigin: "bottom center" }}>
        <div className="absolute flex gap-6 transition-all duration-700 ease-in-out"
          style={{ left: peekingOut ? 10 : isLookingAtEachOther ? 32 : 26 + bp.faceX, top: peekingOut ? 28 : isLookingAtEachOther ? 12 : 32 + bp.faceY }}>
          {[0,1].map(i => <EyeBall key={i} size={16} pupilSize={6} eyeColor="white" pupilColor="#2D2D2D" isBlinking={isBlackBlinking} lookX={blackLook.lx} lookY={blackLook.ly} />)}
        </div>
      </div>
      {/* Orange */}
      <div className="absolute bottom-0 transition-all duration-700 ease-in-out"
        style={{ left: 0, width: 240, height: 200, backgroundColor: "#FF9B6B", borderRadius: "120px 120px 0 0", zIndex: 3,
          transform: peekingOut ? "skewX(0deg)" : `skewX(${op.bodySkew||0}deg)`, transformOrigin: "bottom center" }}>
        <div className="absolute flex gap-8 transition-all duration-200 ease-out"
          style={{ left: peekingOut ? 50 : 82 + (op.faceX||0), top: peekingOut ? 85 : 90 + (op.faceY||0) }}>
          {[0,1].map(i => <Pupil key={i} size={12} pupilColor="#2D2D2D" lookX={orangeLook.lx} lookY={orangeLook.ly} />)}
        </div>
      </div>
      {/* Yellow */}
      <div className="absolute bottom-0 transition-all duration-700 ease-in-out"
        style={{ left: 310, width: 140, height: 230, backgroundColor: "#E8D754", borderRadius: "70px 70px 0 0", zIndex: 4,
          transform: peekingOut ? "skewX(0deg)" : `skewX(${yp.bodySkew||0}deg)`, transformOrigin: "bottom center" }}>
        <div className="absolute flex gap-6 transition-all duration-200 ease-out"
          style={{ left: peekingOut ? 20 : 52 + (yp.faceX||0), top: peekingOut ? 35 : 40 + (yp.faceY||0) }}>
          {[0,1].map(i => <Pupil key={i} size={12} pupilColor="#2D2D2D" lookX={yellowLook.lx} lookY={yellowLook.ly} />)}
        </div>
        <div className="absolute w-20 h-1 bg-[#2D2D2D] rounded-full transition-all duration-200 ease-out"
          style={{ left: peekingOut ? 10 : 40 + (yp.faceX||0), top: peekingOut ? 88 : 88 + (yp.faceY||0) }} />
      </div>
    </div>
  );
}

// ─── TextLoop ────────────────────────────────────────────────────────────────
function TextLoop({ children, interval = 2 }: { children: React.ReactNode[]; interval?: number }) {
  const [idx, setIdx] = useState(0);
  const items = Children.toArray(children);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % items.length), interval * 1000);
    return () => clearInterval(t);
  }, [items.length, interval]);
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.div key={idx} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} transition={{ duration: 0.3 }}>
        {items[idx]}
      </motion.div>
    </AnimatePresence>
  );
}

export interface LoginData { email: string; password: string; }
export interface RegisterData { name: string; email: string; password: string; gender?: "m" | "f"; }
export interface AuthComponentProps {
  mode: "login" | "register";
  logo?: React.ReactNode;
  brandName?: string;
  loginLink?: string;
  registerLink?: string;
  homeLink?: string;
  onLoginSubmit: (data: LoginData) => Promise<void>;
  onRegisterSubmit: (data: RegisterData) => Promise<void>;
  onRegisterComplete?: () => void;
}

// ─── Auth Button ─────────────────────────────────────────────────────────────
function AuthButton({ children, disabled, rightIcon, type = "submit", onClick }: {
  children: React.ReactNode; disabled?: boolean; rightIcon?: React.ReactNode;
  type?: "submit" | "button"; onClick?: () => void;
}) {
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        width: "100%", height: 48, borderRadius: 12, border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        background: disabled ? "var(--color-border)" : "var(--color-accent)",
        color: disabled ? "var(--color-text-muted)" : "#fff",
        fontSize: 15, fontWeight: 600, fontFamily: "var(--font-sans)",
        transition: "opacity 0.15s",
        opacity: disabled ? 0.6 : 1,
      }}
      onMouseEnter={e => { if (!disabled) (e.currentTarget as HTMLElement).style.opacity = "0.88"; }}
      onMouseLeave={e => { if (!disabled) (e.currentTarget as HTMLElement).style.opacity = "1"; }}
    >
      {children}{rightIcon}
    </button>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────
export const AuthComponent = ({
  mode, brandName = "Teman Kas", loginLink = "/auth/login", registerLink = "/auth/register", homeLink = "/",
  onLoginSubmit, onRegisterSubmit, onRegisterComplete,
}: AuthComponentProps) => {
  const isLogin = mode === "login";

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginTyping, setLoginTyping] = useState(false);

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regGender, setRegGender] = useState<"m" | "f" | undefined>();
  const [regPassword, setRegPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regTyping, setRegTyping] = useState(false);

  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const confettiRef = useRef<ConfettiRef>(null);

  const isLoginValid = /\S+@\S+\.\S+/.test(loginEmail) && loginPassword.length > 0;
  const isRegInfoValid = /\S+@\S+\.\S+/.test(regEmail) && regName.trim().length >= 2;
  const isRegPassValid = regPassword.length >= 8;

  const fireCannon = () => {
    const fire = confettiRef.current?.fire;
    if (!fire) return;
    const d = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100, particleCount: 50 };
    fire({ ...d, origin: { x: 0, y: 1 }, angle: 60 });
    fire({ ...d, origin: { x: 1, y: 1 }, angle: 120 });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoginValid || status !== "idle") return;
    setStatus("loading");
    try { await onLoginSubmit({ email: loginEmail, password: loginPassword }); }
    catch (err) { setErrorMsg(err instanceof Error ? err.message : "Terjadi kesalahan."); setStatus("error"); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== "idle") return;
    setStatus("loading");
    try {
      await onRegisterSubmit({ name: regName, email: regEmail, password: regPassword, gender: regGender });
      fireCannon();
      setStatus("success");
    } catch (err) { setErrorMsg(err instanceof Error ? err.message : "Terjadi kesalahan."); setStatus("error"); }
  };

  const closeModal = () => { setStatus("idle"); setErrorMsg(""); };

  // Password field that characters react to
  const activePassword = isLogin ? loginPassword : regPassword;
  const activeShowPassword = isLogin ? showLoginPassword : showRegPassword;
  const activeTyping = isLogin ? loginTyping : regTyping;

  return (
    <div className="grid lg:grid-cols-2" style={{ minHeight: "100vh" }}>
      <Confetti ref={confettiRef} manualstart className="fixed inset-0 w-full h-full pointer-events-none z-[999]" />

      {/* Status modal */}
      <AnimatePresence>
        {status !== "idle" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-card border border-border rounded-2xl p-8 w-full max-w-sm flex flex-col items-center gap-4 mx-4 shadow-lg">
              {(status === "error" || status === "success") && (
                <button onClick={closeModal} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
              )}
              {status === "loading" && (
                <div className="relative inline-block">
                  <TextLoop interval={1.5}>
                    {["Memeriksa...", "Menyiapkan sesi...", "Hampir selesai..."].map(m => (
                      <div key={m} className="flex flex-col items-center gap-3">
                        <Loader className="w-10 h-10 text-primary animate-spin" />
                        <p className="text-base font-medium text-foreground">{m}</p>
                      </div>
                    ))}
                  </TextLoop>
                </div>
              )}
              {status === "error" && <>
                <AlertCircle className="w-10 h-10 text-destructive" />
                <p className="text-base font-medium text-center">{errorMsg}</p>
                <Button onClick={closeModal} variant="secondary" size="sm">Coba Lagi</Button>
              </>}
              {status === "success" && <>
                <PartyPopper className="w-10 h-10 text-green-500" />
                <p className="text-base font-bold">Selamat datang!</p>
                <p className="text-sm text-muted-foreground text-center">Akun kamu siap. Yuk mulai catat keuanganmu!</p>
                <Button onClick={() => { closeModal(); onRegisterComplete?.(); }} variant="primary" size="sm">Mulai Sekarang</Button>
              </>}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Left panel — characters */}
      <div className="relative hidden lg:flex flex-col justify-between bg-gradient-to-br from-primary/90 via-primary to-primary/80 p-12 text-primary-foreground overflow-hidden">
        <Link href={homeLink} className="relative z-20">
          <Image src="/img/logo-text-white.webp" alt="Teman Kas" width={0} height={0} sizes="100vw" style={{ width: "auto", height: 48 }} />
        </Link>

        <div className="relative z-20 flex items-end justify-center h-[500px]">
          <Characters isTyping={activeTyping} showPassword={activeShowPassword} password={activePassword} />
        </div>

        <p className="relative z-20 text-sm text-primary-foreground/50">© 2026 {brandName}. Gratis selamanya.</p>

        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />
        <div className="absolute top-1/4 right-1/4 size-64 bg-primary-foreground/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 size-96 bg-primary-foreground/5 rounded-full blur-3xl" />
      </div>

      {/* Right panel — form */}
      <div className="relative flex flex-col bg-background" style={{ minHeight: "100vh" }}>
        {/* Mobile top bar — minimal (only mobile) */}
        <div className="lg:hidden flex items-center justify-between px-5 py-3" style={{ flexShrink: 0 }}>
          <Link href={homeLink}>
            <Image src="/img/logo-text-blue.webp" alt="Teman Kas" width={0} height={0} sizes="100vw" loading="eager" style={{ width: "auto", height: 28 }} />
          </Link>
          <Link href={homeLink} className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="size-4" /> Beranda
          </Link>
        </div>

        {/* Desktop back to home — top left */}
        <div className="hidden lg:flex items-center px-8 py-5" style={{ flexShrink: 0 }}>
          <Link href={homeLink} className="flex items-center gap-1.5 text-sm font-medium text-secondary hover:text-foreground transition-colors">
            <ArrowLeft className="size-4" /> Kembali ke beranda
          </Link>
        </div>

        {/* Form — centered both on desktop and mobile */}
        <div className="flex justify-center items-center px-8 py-8 lg:py-8" style={{ flex: 1 }}>
          <div style={{ width: "100%", maxWidth: 420 }}>
            <AnimatePresence mode="wait">
              {isLogin ? (
                /* ── LOGIN ── */
                <motion.div key="login" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
                  <div className="mb-8">
                    <h1 style={{ fontSize: "clamp(28px,4vw,36px)", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--color-text-primary)", marginBottom: 6 }}>Selamat datang</h1>
                    <p style={{ fontSize: 15, color: "var(--color-text-secondary)" }}>Masuk untuk melanjutkan catatan keuanganmu.</p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-4">
                    <Input id="email" label="Email" type="email" placeholder="kamu@contoh.com" value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      onFocus={() => setLoginTyping(true)} onBlur={() => setLoginTyping(false)}
                      autoComplete="email" required />
                    <Input id="password" label="Kata sandi" type={showLoginPassword ? "text" : "password"} placeholder="••••••••"
                      value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                      autoComplete="current-password" required
                      rightAdornment={
                        <button type="button" onClick={() => setShowLoginPassword(v => !v)} style={{ color: "var(--color-text-muted)" }}>
                          {showLoginPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      } />

                    <div style={{ paddingTop: 8 }}>
                      <AuthButton disabled={!isLoginValid || status === "loading"}>Masuk</AuthButton>
                    </div>
                    
                    <div style={{ textAlign: "right", marginTop: 12 }}>
                      <Link href="/auth/forgot-password" style={{ fontSize: 13, color: "var(--color-accent)", textDecoration: "none", fontWeight: 500 }}>
                        Lupa password?
                      </Link>
                    </div>
                  </form>

                  <p style={{ textAlign: "center", fontSize: 14, color: "var(--color-text-secondary)", marginTop: 20 }}>
                    Belum punya akun?{" "}
                    <Link href={registerLink} style={{ color: "var(--color-accent)", fontWeight: 600 }}>Daftar</Link>
                  </p>
                </motion.div>
              ) : (
                /* ── REGISTER (single step) ── */
                <motion.div key="reg" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
                  <div className="mb-6">
                    <h1 style={{ fontSize: "clamp(28px,4vw,36px)", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--color-text-primary)", marginBottom: 6 }}>Buat akun baru</h1>
                    <p style={{ fontSize: 15, color: "var(--color-text-secondary)" }}>Gratis selamanya. Tanpa kartu kredit.</p>
                  </div>

                  <form onSubmit={handleRegister} className="space-y-4">
                    <Input id="name" label="Nama" type="text" placeholder="Nama kamu" value={regName}
                      onChange={e => setRegName(e.target.value)}
                      onFocus={() => setRegTyping(true)} onBlur={() => setRegTyping(false)}
                      autoComplete="name" required />
                    <Input id="reg-email" label="Email" type="email" placeholder="kamu@contoh.com" value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      onFocus={() => setRegTyping(true)} onBlur={() => setRegTyping(false)}
                      autoComplete="email" required />
                    <Input id="reg-pass" label="Kata sandi" type={showRegPassword ? "text" : "password"} placeholder="Minimal 8 karakter"
                      value={regPassword} onChange={e => setRegPassword(e.target.value)}
                      onFocus={() => setRegTyping(true)} onBlur={() => setRegTyping(false)}
                      autoComplete="new-password" required
                      rightAdornment={
                        <button type="button" onClick={() => setShowRegPassword(v => !v)} style={{ color: "var(--color-text-muted)" }}>
                          {showRegPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      } />

                    {/* Avatar */}
                    <div className="flex flex-col gap-2 pt-1">
                      <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-secondary)" }}>Avatar <span style={{ textTransform: "none", fontWeight: 400 }}>(opsional)</span></span>
                      <div className="flex gap-3">
                        {(["m", "f"] as const).map(g => (
                          <button key={g} type="button" onClick={() => setRegGender(regGender === g ? undefined : g)}
                            style={{
                              display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                              borderRadius: 16, border: `2px solid ${regGender === g ? "var(--color-accent)" : "var(--color-border)"}`,
                              padding: "8px 12px", background: regGender === g ? "var(--color-accent-soft)" : "transparent",
                              transition: "all 0.15s", cursor: "pointer",
                            }}>
                            <Image src={`/svg/${g}.svg`} alt={g === "m" ? "Laki-laki" : "Perempuan"} width={44} height={44} className="rounded-xl object-cover" style={{ width: 44, height: 44 }} />
                            <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{g === "m" ? "Laki-laki" : "Perempuan"}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ paddingTop: 8 }}>
                      <AuthButton disabled={!isRegInfoValid || !isRegPassValid || status === "loading"}>Buat Akun</AuthButton>
                    </div>
                  </form>

                  <p style={{ textAlign: "center", fontSize: 14, color: "var(--color-text-secondary)", marginTop: 24 }}>
                    Sudah punya akun?{" "}
                    <Link href={loginLink} style={{ color: "var(--color-accent)", fontWeight: 600 }}>Masuk</Link>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
