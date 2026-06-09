"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackButton({ label = "Kembali" }: { label?: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="lg:hidden inline-flex items-center gap-1.5 text-sm text-secondary hover:text-foreground transition-colors"
    >
      <ArrowLeft className="size-4" aria-hidden />
      {label}
    </button>
  );
}
