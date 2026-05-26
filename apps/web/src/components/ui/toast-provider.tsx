"use client";

import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      position="bottom-center"
      toastOptions={{
        classNames: {
          toast:
            "!bg-card !border !border-border !text-foreground !shadow-[var(--shadow-modal)] !rounded-xl !text-sm",
          success: "!text-success",
          error: "!text-danger",
        },
      }}
    />
  );
}
