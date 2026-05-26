type Size = "sm" | "md";
type Variant = "ghost" | "secondary";

const sizes: Record<Size, string> = {
  sm: "size-9 rounded-lg",
  md: "size-10 rounded-xl",
};

const variants: Record<Variant, string> = {
  ghost:
    "text-secondary hover:bg-card-subtle hover:text-foreground",
  secondary:
    "bg-card text-foreground border border-border hover:bg-card-subtle",
};

export interface IconButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className"> {
  size?: Size;
  variant?: Variant;
  /** ARIA label wajib karena button-nya icon-only */
  label: string;
  className?: string;
  children: React.ReactNode;
}

export function IconButton({
  size = "md",
  variant = "ghost",
  label,
  className = "",
  children,
  ...rest
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      {...rest}
      className={[
        "inline-flex items-center justify-center",
        "transition-all duration-150 ease-out active:scale-[0.96]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        sizes[size],
        variants[variant],
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}
