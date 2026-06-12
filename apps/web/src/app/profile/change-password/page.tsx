"use client";

import { useRouter } from "next/navigation";
import { KeyRound } from "lucide-react";
import { Card } from "@/components/ui/card";
import { BackButton } from "@/components/ui/back-button";
import { ChangePasswordForm } from "@/components/profile/change-password-form";

export default function ChangePasswordPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <BackButton label="Ubah Password" />

      <Card padding="md">
        <div className="flex items-center gap-3 mb-6">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
            <KeyRound className="size-4" aria-hidden />
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">Ubah Password</p>
            <p className="text-xs text-muted">Pastikan gunakan password yang kuat</p>
          </div>
        </div>
        <ChangePasswordForm onSuccess={() => router.back()} />
      </Card>
    </div>
  );
}
