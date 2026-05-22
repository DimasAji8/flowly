import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({ title, description, actionLabel, actionHref, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-card)] px-6 py-10 text-center">
      {/* Line-art SVG illustration */}
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden>
        <circle cx="32" cy="32" r="24" stroke="var(--color-border)" strokeWidth="1.5" />
        <path d="M22 32h20M32 22v20" stroke="var(--color-border)" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="32" cy="32" r="4" fill="var(--color-border-subtle)" stroke="var(--color-border)" strokeWidth="1.5" />
        <circle cx="20" cy="20" r="2" fill="var(--color-accent-soft)" />
        <circle cx="44" cy="44" r="2" fill="var(--color-accent-soft)" />
      </svg>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-[var(--color-text-primary)]">{title}</p>
        {description && (
          <p className="text-xs text-[var(--color-text-muted)]">{description}</p>
        )}
      </div>
      {(actionLabel && (actionHref || onAction)) && (
        <Button size="sm" asChildHref={actionHref} onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
