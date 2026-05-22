"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RecurringForm } from "@/components/forms/recurring-form";
import { BackButton } from "@/components/ui/back-button";
import { ROUTES } from "@/constants/routes";
import { recurringService } from "@/services/recurring.service";

export default function NewRecurringPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-5 max-w-lg">
      <BackButton />
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight text-[var(--color-text-primary)] md:text-2xl">
          New recurring
        </h1>
      </header>

      <RecurringForm
        submitLabel="Save"
        onSubmit={async (values) => {
          await recurringService.create({
            type: values.type,
            amount: values.amount,
            categoryId: values.categoryId,
            walletId: values.walletId,
            frequency: values.frequency,
            nextRunAt: values.nextRunAt,
            note: values.note,
            isActive: values.isActive ?? true,
          });
          router.replace(ROUTES.recurring);
        }}
      />
    </div>
  );
}
