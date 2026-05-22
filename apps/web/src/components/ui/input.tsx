import { forwardRef } from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  /** Adornment di kiri input (mis. "Rp", icon) */
  leftAdornment?: React.ReactNode;
  /** Adornment di kanan input */
  rightAdornment?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    error,
    hint,
    leftAdornment,
    rightAdornment,
    className = "",
    id,
    ...rest
  },
  ref,
) {
  const inputId = id ?? rest.name;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-secondary)]"
        >
          {label}
        </label>
      )}

      <div
        className={[
          "flex items-center gap-2 px-3",
          "bg-[var(--color-card-subtle)] rounded-lg",
          "border outline-none transition-colors",
          "focus-within:bg-[var(--color-card)]",
          error
            ? "border-[var(--color-danger)] focus-within:border-[var(--color-danger)]"
            : "border-[var(--color-border-subtle)] focus-within:border-[var(--color-accent)] focus-within:ring-2 focus-within:ring-[var(--color-accent-soft)]",
        ].join(" ")}
      >
        {leftAdornment && (
          <span className="shrink-0 text-sm text-[var(--color-text-muted)]">
            {leftAdornment}
          </span>
        )}
        <input
          id={inputId}
          ref={ref}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={
            error
              ? `${inputId}-error`
              : hint
                ? `${inputId}-hint`
                : undefined
          }
          className={[
            "h-11 flex-1 bg-transparent text-sm",
            "text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]",
            "outline-none",
            className,
          ].join(" ")}
          {...rest}
        />
        {rightAdornment && (
          <span className="shrink-0 text-sm text-[var(--color-text-muted)]">
            {rightAdornment}
          </span>
        )}
      </div>

      {error ? (
        <p
          id={`${inputId}-error`}
          className="text-xs text-[var(--color-danger)]"
        >
          {error}
        </p>
      ) : hint ? (
        <p
          id={`${inputId}-hint`}
          className="text-xs text-[var(--color-text-muted)]"
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
});
