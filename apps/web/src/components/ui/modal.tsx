"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { ArrowLeft, X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  onBack?: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ open, onClose, onBack, title, children }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

        {/* Mobile: bottom sheet | Desktop: centered */}
        <Dialog.Content
          className={[
            "fixed z-50 bg-card shadow-(--shadow-modal) outline-none",
            // mobile: bottom sheet
            "bottom-0 left-0 right-0 rounded-t-[24px] px-5 pb-8 pt-4",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
            "data-[state=open]:duration-300 data-[state=closed]:duration-200",
            "data-[state=open]:ease-[cubic-bezier(0.32,0.72,0,1)]",
            // desktop: centered dialog
            "md:bottom-auto md:left-1/2 md:top-1/2 md:right-auto md:-translate-x-1/2 md:-translate-y-1/2",
            "md:w-full md:max-w-120 md:rounded-2xl md:px-6 md:pb-6 md:pt-5",
            "md:data-[state=closed]:slide-out-to-bottom-0 md:data-[state=open]:slide-in-from-bottom-0",
            "md:data-[state=closed]:zoom-out-95 md:data-[state=open]:zoom-in-95",
            "md:data-[state=open]:fade-in-0 md:data-[state=closed]:fade-out-0",
          ].join(" ")}
        >
          {/* Drag handle (mobile only) */}
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border md:hidden" aria-hidden />

          <Dialog.Description className="sr-only">{title}</Dialog.Description>

          <div className="mb-4 flex items-center gap-2">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="grid size-8 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-card-subtle hover:text-foreground"
                aria-label="Kembali"
              >
                <ArrowLeft className="size-4" />
              </button>
            )}
            <Dialog.Title className="flex-1 text-base font-semibold text-foreground">
              {title}
            </Dialog.Title>
            <Dialog.Close
              className="grid size-8 place-items-center rounded-lg text-muted transition-colors hover:bg-card-subtle hover:text-foreground"
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
