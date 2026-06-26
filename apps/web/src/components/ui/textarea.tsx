import { forwardRef } from "react";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {
    label,
    error,
    hint,
    className = "",
    id,
    rows = 3,
    ...rest
  },
  ref,
) {
  const textareaId = id ?? rest.name;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={textareaId}
          className="text-[11px] font-semibold uppercase tracking-[0.06em] text-secondary"
        >
          {label}
        </label>
      )}

      <div
        className={[
          "flex gap-2 px-3 py-2",
          "bg-card-subtle rounded-lg",
          "border outline-none transition-colors",
          "focus-within:bg-card",
          error
            ? "border-danger focus-within:border-danger"
            : "border-border-subtle focus-within:border-accent focus-within:ring-2 focus-within:ring-[var(--color-accent-soft)]",
        ].join(" ")}
      >
        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={
            error
              ? `${textareaId}-error`
              : hint
                ? `${textareaId}-hint`
                : undefined
          }
          className={[
            "flex-1 bg-transparent text-sm",
            "text-foreground placeholder:text-muted",
            "outline-none resize-none",
            className,
          ].join(" ")}
          {...rest}
        />
      </div>

      {error ? (
        <p
          id={`${textareaId}-error`}
          className="text-xs text-danger"
        >
          {error}
        </p>
      ) : hint ? (
        <p
          id={`${textareaId}-hint`}
          className="text-xs text-muted"
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
});
