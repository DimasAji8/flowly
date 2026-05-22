"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

        {/* Mobile: bottom sheet | Desktop: centered */}
        <Dialog.Content
          className={[
            "fixed z-50 bg-[var(--color-card)] shadow-[var(--shadow-modal)] outline-none",
            // mobile: bottom sheet
            "bottom-0 left-0 right-0 rounded-t-[24px] px-5 pb-8 pt-4",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
            // desktop: centered dialog
            "md:bottom-auto md:left-1/2 md:top-1/2 md:right-auto md:-translate-x-1/2 md:-translate-y-1/2",
            "md:w-full md:max-w-[480px] md:rounded-2xl md:px-6 md:pb-6 md:pt-5",
            "md:data-[state=closed]:slide-out-to-bottom-0 md:data-[state=open]:slide-in-from-bottom-0",
            "md:data-[state=closed]:zoom-out-95 md:data-[state=open]:zoom-in-95",
            "duration-200",
          ].join(" ")}
        >
          {/* Drag handle (mobile only) */}
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[var(--color-border)] md:hidden" aria-hidden />

          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="text-base font-semibold text-[var(--color-text-primary)]">
              {title}
            </Dialog.Title>
            <Dialog.Close
              className="grid size-8 place-items-center rounded-lg text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-card-subtle)] hover:text-[var(--color-text-primary)]"
              aria-label="Close"
            >
              <X className="size-4" />
            </Dialog.Close>
          </div>

          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
