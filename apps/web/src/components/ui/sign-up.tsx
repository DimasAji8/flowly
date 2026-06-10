"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef, forwardRef, useImperativeHandle, useMemo, useCallback, createContext, Children } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Wallet, ArrowRight, ArrowLeft, Loader, PartyPopper, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
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
  forceLookX?: number; forceLookY?: number;
}
const EyeBall = ({ size = 48, pupilSize = 16, maxDistance = 10, eyeColor = "white", pupilColor = "black", isBlinking = false, forceLookX, forceLookY }: EyeBallProps) => {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const eyeRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { setMouseX(e.clientX); setMouseY(e.clientY); };
    window.addEventListener("mousemove", h);
    return () => window.removeEventListener("mousemove", h);
  }, []);
  const pos = () => {
    if (!eyeRef.current) return { x: 0, y: 0 };
    if (forceLookX !== undefined && forceLookY !== undefined) return { x: forceLookX, y: forceLookY };
    const r = eyeRef.current.getBoundingClientRect();
    const dx = mouseX - (r.left + r.width / 2), dy = mouseY - (r.top + r.height / 2);
    const dist = Math.min(Math.sqrt(dx ** 2 + dy ** 2), maxDistance);
    const angle = Math.atan2(dy, dx);
    return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist };
  };
  const { x, y } = pos();
  return (
    <div ref={eyeRef} className="rounded-full flex items-center justify-center transition-all duration-150"
      style={{ width: size, height: isBlinking ? 2 : size, backgroundColor: eyeColor, overflow: "hidden" }}>
      {!isBlinking && <div className="rounded-full" style={{ width: pupilSize, height: pupilSize, backgroundColor: pupilColor, transform: `translate(${x}px,${y}px)`, transition: "transform 0.1s ease-out" }} />}
    </div>
  );
};

interface PupilProps { size?: number; maxDistance?: number; pupilColor?: string; forceLookX?: number; forceLookY?: number; }
const Pupil = ({ size = 12, maxDistance = 5, pupilColor = "black", forceLookX, forceLookY }: PupilProps) => {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { setMouseX(e.clientX); setMouseY(e.clientY); };
    window.addEventListener("mousemove", h);
    return () => window.removeEventListener("mousemove", h);
  }, []);
  const pos = () => {
    if (!ref.current) return { x: 0, y: 0 };
    if (forceLookX !== undefined && forceLookY !== undefined) return { x: forceLookX, y: forceLookY };
    const r = ref.current.getBoundingClientRect();
    const dx = mouseX - (r.left + r.width / 2), dy = mouseY - (r.top + r.height / 2);
    const dist = Math.min(Math.sqrt(dx ** 2 + dy ** 2), maxDistance);
    const angle = Math.atan2(dy, dx);
    return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist };
  };
  const { x, y } = pos();
  return <div ref={ref} className="rounded-full" style={{ width: size, height: size, backgroundColor: pupilColor, transform: `translate(${x}px,${y}px)`, transition: "transform 0.1s ease-out" }} />;
};

function Characters({ isTyping, showPassword, password }: { isTyping: boolean; showPassword: boolean; password: string }) {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [isPurpleBlinking, setIsPurpleBlinking] = useState(false);
  const [isBlackBlinking, setIsBlackBlinking] = useState(false);
  const [isLookingAtEachOther, setIsLookingAtEachOther] = useState(false);
  const [isPurplePeeking, setIsPurplePeeking] = useState(false);
  const purpleRef = useRef<HTMLDivElement>(null);
  const blackRef = useRef<HTMLDivElement>(null);
  const yellowRef = useRef<HTMLDivElement>(null);
  const orangeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { setMouseX(e.clientX); setMouseY(e.clientY); };
    window.addEventListener("mousemove", h);
    return () => window.removeEventListener("mousemove", h);
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
    if (isTyping) {
      setIsLookingAtEachOther(true);
      const t = setTimeout(() => setIsLookingAtEachOther(false), 800);
      return () => clearTimeout(t);
    } else setIsLookingAtEachOther(false);
  }, [isTyping]);

  useEffect(() => {
    if (password.length > 0 && showPassword) {
      const t = setTimeout(() => { setIsPurplePeeking(true); setTimeout(() => setIsPurplePeeking(false), 800); }, Math.random() * 3000 + 2000);
      return () => clearTimeout(t);
    } else setIsPurplePeeking(false);
  }, [password, showPassword, isPurplePeeking]);

  const calcPos = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (!ref.current) return { faceX: 0, faceY: 0, bodySkew: 0 };
    const r = ref.current.getBoundingClientRect();
    const dx = mouseX - (r.left + r.width / 2), dy = mouseY - (r.top + r.height / 3);
    return {
      faceX: Math.max(-15, Math.min(15, dx / 20)),
      faceY: Math.max(-10, Math.min(10, dy / 30)),
      bodySkew: Math.max(-6, Math.min(6, -dx / 120)),
    };
  };

  const pp = calcPos(purpleRef), bp = calcPos(blackRef), yp = calcPos(yellowRef), op = calcPos(orangeRef);
  const hiding = isTyping || (password.length > 0 && !showPassword);
  const peekingOut = password.length > 0 && showPassword;

  return (
    <div style={{ position: "relative", width: 550, height: 400 }}>
      {/* Purple */}
      <div ref={purpleRef} className="absolute bottom-0 transition-all duration-700 ease-in-out"
        style={{ left: 70, width: 180, height: hiding ? 440 : 400, backgroundColor: "#6C3FF5", borderRadius: "10px 10px 0 0", zIndex: 1,
          transform: peekingOut ? "skewX(0deg)" : hiding ? `skewX(${(pp.bodySkew||0)-12}deg) translateX(40px)` : `skewX(${pp.bodySkew||0}deg)`,
          transformOrigin: "bottom center" }}>
        <div className="absolute flex gap-8 transition-all duration-700 ease-in-out"
          style={{ left: peekingOut ? 20 : isLookingAtEachOther ? 55 : 45 + pp.faceX, top: peekingOut ? 35 : isLookingAtEachOther ? 65 : 40 + pp.faceY }}>
          {[0,1].map(i => <EyeBall key={i} size={18} pupilSize={7} maxDistance={5} eyeColor="white" pupilColor="#2D2D2D" isBlinking={isPurpleBlinking}
            forceLookX={peekingOut ? (isPurplePeeking?4:-4) : isLookingAtEachOther?3:undefined}
            forceLookY={peekingOut ? (isPurplePeeking?5:-4) : isLookingAtEachOther?4:undefined} />)}
        </div>
      </div>
      {/* Black */}
      <div ref={blackRef} className="absolute bottom-0 transition-all duration-700 ease-in-out"
        style={{ left: 240, width: 120, height: 310, backgroundColor: "#2D2D2D", borderRadius: "8px 8px 0 0", zIndex: 2,
          transform: peekingOut ? "skewX(0deg)" : isLookingAtEachOther ? `skewX(${(bp.bodySkew||0)*1.5+10}deg) translateX(20px)` : hiding ? `skewX(${(bp.bodySkew||0)*1.5}deg)` : `skewX(${bp.bodySkew||0}deg)`,
          transformOrigin: "bottom center" }}>
        <div className="absolute flex gap-6 transition-all duration-700 ease-in-out"
          style={{ left: peekingOut ? 10 : isLookingAtEachOther ? 32 : 26 + bp.faceX, top: peekingOut ? 28 : isLookingAtEachOther ? 12 : 32 + bp.faceY }}>
          {[0,1].map(i => <EyeBall key={i} size={16} pupilSize={6} maxDistance={4} eyeColor="white" pupilColor="#2D2D2D" isBlinking={isBlackBlinking}
            forceLookX={peekingOut ? -4 : isLookingAtEachOther?0:undefined}
            forceLookY={peekingOut ? -4 : isLookingAtEachOther?-4:undefined} />)}
        </div>
      </div>
      {/* Orange */}
      <div ref={orangeRef} className="absolute bottom-0 transition-all duration-700 ease-in-out"
        style={{ left: 0, width: 240, height: 200, backgroundColor: "#FF9B6B", borderRadius: "120px 120px 0 0", zIndex: 3,
          transform: peekingOut ? "skewX(0deg)" : `skewX(${op.bodySkew||0}deg)`, transformOrigin: "bottom center" }}>
        <div className="absolute flex gap-8 transition-all duration-200 ease-out"
          style={{ left: peekingOut ? 50 : 82 + (op.faceX||0), top: peekingOut ? 85 : 90 + (op.faceY||0) }}>
          {[0,1].map(i => <Pupil key={i} size={12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={peekingOut?-5:undefined} forceLookY={peekingOut?-4:undefined} />)}
        </div>
      </div>
      {/* Yellow */}
      <div ref={yellowRef} className="absolute bottom-0 transition-all duration-700 ease-in-out"
        style={{ left: 310, width: 140, height: 230, backgroundColor: "#E8D754", borderRadius: "70px 70px 0 0", zIndex: 4,
          transform: peekingOut ? "skewX(0deg)" : `skewX(${yp.bodySkew||0}deg)`, transformOrigin: "bottom center" }}>
        <div className="absolute flex gap-6 transition-all duration-200 ease-out"
          style={{ left: peekingOut ? 20 : 52 + (yp.faceX||0), top: peekingOut ? 35 : 40 + (yp.faceY||0) }}>
          {[0,1].map(i => <Pupil key={i} size={12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={peekingOut?-5:undefined} forceLookY={peekingOut?-4:undefined} />)}
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

// ─── Types ───────────────────────────────────────────────────────────────────
type RegisterStep = "info" | "password";
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
  const [regConfirm, setRegConfirm] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirm, setShowRegConfirm] = useState(false);
  const [regTyping, setRegTyping] = useState(false);
  const [step, setStep] = useState<RegisterStep>("info");

  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const confettiRef = useRef<ConfettiRef>(null);

  const isLoginValid = /\S+@\S+\.\S+/.test(loginEmail) && loginPassword.length > 0;
  const isRegInfoValid = /\S+@\S+\.\S+/.test(regEmail) && regName.trim().length >= 2;
  const isRegPassValid = regPassword.length >= 8 && regConfirm.length >= 8;

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
    if (regPassword !== regConfirm) { setErrorMsg("Kata sandi tidak cocok!"); setStatus("error"); return; }
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
    <div className="min-h-screen grid lg:grid-cols-2">
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
                <Button onClick={closeModal} size="sm">Coba Lagi</Button>
              </>}
              {status === "success" && <>
                <PartyPopper className="w-10 h-10 text-green-500" />
                <p className="text-base font-bold">Selamat datang!</p>
                <p className="text-sm text-muted-foreground text-center">Akun kamu siap. Yuk mulai catat keuanganmu!</p>
                <Button onClick={() => { closeModal(); onRegisterComplete?.(); }} size="sm">Mulai Sekarang</Button>
              </>}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Left panel — characters */}
      <div className="relative hidden lg:flex flex-col justify-between bg-gradient-to-br from-primary/90 via-primary to-primary/80 p-12 text-primary-foreground overflow-hidden">
        <Link href={homeLink} className="relative z-20 flex items-center gap-2 text-lg font-semibold">
          <div className="size-8 rounded-lg bg-primary-foreground/10 backdrop-blur-sm flex items-center justify-center">
            <Wallet className="size-4" />
          </div>
          <span>{brandName}</span>
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
      <div className="flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 text-lg font-semibold mb-10">
            <Link href={homeLink} className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Wallet className="size-4 text-primary" />
              </div>
              <span>{brandName}</span>
            </Link>
          </div>

          <AnimatePresence mode="wait">
            {isLogin ? (
              /* ── LOGIN ── */
              <motion.div key="login" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold tracking-tight mb-1">Selamat datang!</h1>
                  <p className="text-muted-foreground text-sm">Masuk untuk melanjutkan catatan keuanganmu.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="kamu@contoh.com" value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      onFocus={() => setLoginTyping(true)} onBlur={() => setLoginTyping(false)}
                      className="h-12" autoComplete="email" required />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="password">Kata sandi</Label>
                    <div className="relative">
                      <Input id="password" type={showLoginPassword ? "text" : "password"} placeholder="••••••••"
                        value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                        className="h-12 pr-10" autoComplete="current-password" required />
                      <button type="button" onClick={() => setShowLoginPassword(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                        {showLoginPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-12 text-base" disabled={!isLoginValid || status === "loading"}>
                    Masuk
                  </Button>
                </form>

                <p className="text-center text-sm text-muted-foreground mt-8">
                  Belum punya akun?{" "}
                  <Link href={registerLink} className="text-primary font-medium hover:underline">Daftar</Link>
                </p>
              </motion.div>
            ) : step === "info" ? (
              /* ── REGISTER step 1 ── */
              <motion.div key="reg-info" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold tracking-tight mb-1">Buat akun baru</h1>
                  <p className="text-muted-foreground text-sm">Gratis selamanya. Tanpa kartu kredit.</p>
                </div>

                <form onSubmit={e => { e.preventDefault(); if (isRegInfoValid) setStep("password"); }} className="space-y-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Nama</Label>
                    <Input id="name" type="text" placeholder="Nama kamu" value={regName}
                      onChange={e => setRegName(e.target.value)}
                      onFocus={() => setRegTyping(true)} onBlur={() => setRegTyping(false)}
                      className="h-12" autoComplete="name" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-email">Email</Label>
                    <Input id="reg-email" type="email" placeholder="kamu@contoh.com" value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      onFocus={() => setRegTyping(true)} onBlur={() => setRegTyping(false)}
                      className="h-12" autoComplete="email" required />
                  </div>

                  {/* Avatar */}
                  <div className="space-y-2">
                    <Label>Avatar <span className="text-muted-foreground font-normal">(opsional)</span></Label>
                    <div className="flex gap-3">
                      {(["m", "f"] as const).map(g => (
                        <button key={g} type="button" onClick={() => setRegGender(regGender === g ? undefined : g)}
                          className={cn("flex flex-col items-center gap-1 rounded-2xl border-2 p-2 transition-all duration-200",
                            regGender === g ? "border-primary bg-primary/5" : "border-border hover:border-primary/50")}>
                          <Image src={`/svg/${g}.svg`} alt={g === "m" ? "Laki-laki" : "Perempuan"} width={48} height={48} className="size-12 rounded-xl object-cover" />
                          <span className="text-xs text-muted-foreground">{g === "m" ? "Laki-laki" : "Perempuan"}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-12 text-base" disabled={!isRegInfoValid}>
                    Lanjut <ArrowRight className="ml-2 size-4" />
                  </Button>
                </form>

                <p className="text-center text-sm text-muted-foreground mt-8">
                  Sudah punya akun?{" "}
                  <Link href={loginLink} className="text-primary font-medium hover:underline">Masuk</Link>
                </p>
              </motion.div>
            ) : (
              /* ── REGISTER step 2 ── */
              <motion.div key="reg-pass" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold tracking-tight mb-1">Buat kata sandi</h1>
                  <p className="text-muted-foreground text-sm">Minimal 8 karakter.</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-pass">Kata sandi</Label>
                    <div className="relative">
                      <Input id="reg-pass" type={showRegPassword ? "text" : "password"} placeholder="Minimal 8 karakter"
                        value={regPassword} onChange={e => setRegPassword(e.target.value)}
                        onFocus={() => setRegTyping(true)} onBlur={() => setRegTyping(false)}
                        className="h-12 pr-10" autoComplete="new-password" required />
                      <button type="button" onClick={() => setShowRegPassword(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                        {showRegPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-confirm">Konfirmasi kata sandi</Label>
                    <div className="relative">
                      <Input id="reg-confirm" type={showRegConfirm ? "text" : "password"} placeholder="Ulangi kata sandi"
                        value={regConfirm} onChange={e => setRegConfirm(e.target.value)}
                        className="h-12 pr-10" autoComplete="new-password" required />
                      <button type="button" onClick={() => setShowRegConfirm(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                        {showRegConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-12 text-base" disabled={!isRegPassValid || status === "loading"}>
                    Buat Akun <ArrowRight className="ml-2 size-4" />
                  </Button>
                </form>

                <div className="text-center mt-6">
                  <button type="button" onClick={() => setStep("info")}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto">
                    <ArrowLeft className="size-4" /> Kembali
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
