"use client";

import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      position="bottom-center"
      toastOptions={{
        classNames: {
          toast:
            "!bg-[var(--color-card)] !border !border-[var(--color-border)] !text-[var(--color-text-primary)] !shadow-[var(--shadow-modal)] !rounded-xl !text-sm",
          success: "!text-[var(--color-success)]",
          error: "!text-[var(--color-danger)]",
        },
      }}
    />
  );
}
