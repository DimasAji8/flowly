import Link from "next/link";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "md" | "sm" | "lg" | "icon-sm";

const base = [
  "inline-flex items-center justify-center gap-2",
  "font-medium cursor-pointer",
  "transition-all duration-150 ease-out",
  "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
  "active:scale-[0.98]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
  "focus-visible:ring-offset-[var(--color-bg)] focus-visible:ring-[var(--color-accent)]",
].join(" ");

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-white hover:opacity-95 shadow-[0_1px_2px_rgba(15,23,42,0.08)]",
  secondary:
    "bg-card text-foreground border border-border hover:bg-card-subtle",
  ghost:
    "text-secondary hover:bg-card-subtle hover:text-foreground",
  danger:
    "bg-danger text-white hover:opacity-95",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm rounded-lg",
  md: "h-11 px-4 text-sm rounded-xl",
  lg: "h-12 px-5 text-base rounded-xl",
  "icon-sm": "h-8 w-8 rounded-lg p-0",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  /** Icon di kiri label */
  leftIcon?: React.ReactNode;
  /** Icon di kanan label */
  rightIcon?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

interface AsButtonProps
  extends CommonProps,
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className"> {
  asChildHref?: undefined;
}

interface AsLinkProps extends CommonProps {
  asChildHref: string;
}

export function Button(props: AsButtonProps | AsLinkProps) {
  const {
    variant = "primary",
    size = "md",
    className = "",
    isLoading,
    leftIcon,
    rightIcon,
    children,
  } = props;

  const cls = `${base} ${variants[variant]} ${sizes[size]} ${className}`;

  const content = (
    <>
      {isLoading ? (
        <Loader2 className="size-4 animate-spin" aria-hidden />
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </>
  );

  if ("asChildHref" in props && props.asChildHref) {
    return (
      <Link href={props.asChildHref} className={cls}>
        {content}
      </Link>
    );
  }

  // Strip props kustom sebelum spread ke <button>
  const {
    variant: _v,
    size: _s,
    isLoading: _l,
    asChildHref: _h,
    className: _c,
    children: _ch,
    leftIcon: _li,
    rightIcon: _ri,
    ...buttonProps
  } = props as AsButtonProps;

  return (
    <button
      {...buttonProps}
      disabled={buttonProps.disabled || isLoading}
      className={cls}
    >
      {content}
    </button>
  );
}
