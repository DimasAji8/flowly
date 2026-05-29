import { forwardRef } from "react";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, options, placeholder, className = "", id, ...rest },
  ref,
) {
  const inputId = id ?? rest.name;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-[11px] font-semibold uppercase tracking-[0.06em] text-secondary"
        >
          {label}
        </label>
      )}
      <div
        className={[
          "flex items-center px-3",
          "bg-card-subtle rounded-lg border outline-none transition-colors",
          "focus-within:bg-card",
          error
            ? "border-danger"
            : "border-border-subtle focus-within:border-accent focus-within:ring-2 focus-within:ring-accent-soft",
        ].join(" ")}
      >
        <select
          id={inputId}
          ref={ref}
          className={[
            "h-11 flex-1 bg-transparent text-sm text-foreground outline-none appearance-none cursor-pointer",
            className,
          ].join(" ")}
          {...rest}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
});
