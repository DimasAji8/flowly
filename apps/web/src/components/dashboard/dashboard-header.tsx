"use client";

interface DashboardHeaderProps {
  greeting: string;
  name: string;
  avatarSrc: string | null;
}

export function DashboardHeader({ greeting, name, avatarSrc }: DashboardHeaderProps) {
  const initial = name ? name.charAt(0).toUpperCase() : "?";

  return (
    <div
      className="relative -mx-5 -mt-6 overflow-hidden px-5 pb-24 pt-8 md:-mx-8 md:-mt-8 md:px-8 md:pt-10 md:rounded-t-2xl"
      style={{
        /* Light: navy-to-indigo premium — Dark: slate-900 yang sudah bagus */
        background: "var(--dashboard-header-bg)",
      }}
    >
      {/* Dot grid texture */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
        aria-hidden
      />
      {/* Accent glow bawah kanan */}
      <div
        className="pointer-events-none absolute -bottom-8 right-0 size-56 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(37,99,235,0.3) 0%, transparent 65%)" }}
        aria-hidden
      />
      {/* Glow kiri atas */}
      <div
        className="pointer-events-none absolute -left-8 -top-8 size-40 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 65%)" }}
        aria-hidden
      />

      <div className="relative flex items-center justify-between gap-3" suppressHydrationWarning>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-foreground/50" suppressHydrationWarning>
            {greeting}
          </p>
          <h1 className="truncate text-2xl font-bold tracking-tight text-foreground" suppressHydrationWarning>
            {name || "..."}
          </h1>
        </div>
        {avatarSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarSrc} alt={name} width={44} height={44}
            className="size-11 shrink-0 rounded-full object-cover ring-1 ring-white/20"
          />
        ) : (
          <div className="grid size-11 shrink-0 place-items-center rounded-full bg-foreground/10 text-base font-semibold text-foreground ring-1 ring-foreground/20 select-none">
            {initial}
          </div>
        )}
      </div>
    </div>
  );
}
