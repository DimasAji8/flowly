type Variant = "default" | "emphasis" | "subtle";
type Padding = "none" | "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  default:
    "bg-card border border-border-subtle shadow-[var(--shadow-card)]",
  emphasis:
    "bg-card border border-border shadow-[var(--shadow-card-emphasis)]",
  subtle:
    "bg-card-subtle border border-border-subtle",
};

const paddings: Record<Padding, string> = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
  padding?: Padding;
}

export function Card({
  variant = "default",
  padding = "md",
  className = "",
  children,
  ...rest
}: CardProps) {
  return (
    <div
      {...rest}
      className={[
        "rounded-2xl",
        variants[variant],
        paddings[padding],
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
