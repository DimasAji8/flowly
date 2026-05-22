import { Wallet } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-dvh w-full items-center justify-center overflow-hidden bg-[var(--color-bg)] px-5 py-10">
      {/* dekoratif kecil */}
      <span
        aria-hidden
        className="pointer-events-none absolute left-8 top-12 size-2.5 rotate-12 rounded-sm bg-[var(--color-accent-soft)]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute right-12 top-24 size-3 rounded-full bg-[var(--color-accent-soft)]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-16 left-16 size-1.5 rounded-full bg-[var(--color-accent-soft)]"
      />

      <div className="relative w-full max-w-[400px] md:rounded-2xl md:border md:border-[var(--color-border-subtle)] md:bg-[var(--color-card)] md:p-10 md:shadow-[var(--shadow-card-emphasis)]">
        <div className="mb-6 inline-flex items-center gap-2 text-base font-semibold tracking-tight text-[var(--color-text-primary)] md:mb-8">
          <span className="grid size-8 place-items-center rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
            <Wallet className="size-4" strokeWidth={2.2} aria-hidden />
          </span>
          Flowly
        </div>
        {children}
      </div>
    </div>
  );
}
