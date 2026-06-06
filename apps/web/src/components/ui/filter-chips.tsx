interface Option<T extends string> {
  label: string;
  value: T | "all";
}

interface FilterChipsProps<T extends string> {
  options: Option<T>[];
  value: T | "all";
  onChange: (value: T | "all") => void;
}

export function FilterChips<T extends string>({ options, value, onChange }: FilterChipsProps<T>) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={[
              "rounded-full px-3 py-1 text-xs font-semibold transition-colors",
              active
                ? "bg-accent text-white"
                : "bg-card-subtle text-secondary hover:bg-border-subtle hover:text-foreground border border-border-subtle",
            ].join(" ")}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
