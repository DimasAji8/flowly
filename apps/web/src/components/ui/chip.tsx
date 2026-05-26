type Tone = "neutral" | "accent" | "success" | "danger" | "warning";
type Size = "sm" | "md";

const tones: Record<Tone, string> = {
  neutral:
    "bg-card-subtle text-secondary",
  accent: "bg-accent-soft text-accent",
  success:
    "bg-success-soft text-success",
  danger: "bg-danger-soft text-danger",
  warning:
    "bg-[var(--color-warning-soft)] text-[var(--color-warning)]",
};

const sizes: Record<Size, string> = {
  sm: "h-5 px-2 text-[10px] tracking-[0.06em]",
  md: "h-6 px-2.5 text-[11px] tracking-[0.06em]",
};

export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  size?: Size;
  /** Render dot kecil di kiri label */
  dot?: boolean;
  /** Override warna dot (untuk indikator kategori) */
  dotColor?: string;
}

export function Chip({
  tone = "neutral",
  size = "md",
  dot,
  dotColor,
  className = "",
  children,
  ...rest
}: ChipProps) {
  return (
    <span
      {...rest}
      className={[
        "inline-flex items-center gap-1.5 rounded-full font-semibold uppercase",
        tones[tone],
        sizes[size],
        className,
      ].join(" ")}
    >
      {dot && (
        <span
          aria-hidden
          className="block size-1.5 rounded-full"
          style={{ backgroundColor: dotColor ?? "currentColor" }}
        />
      )}
      {children}
    </span>
  );
}
