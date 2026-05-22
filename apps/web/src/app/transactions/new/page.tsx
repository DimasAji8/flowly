"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { TransactionForm } from "@/components/forms/transaction-form";
import { BackButton } from "@/components/ui/back-button";
import { ROUTES } from "@/constants/routes";
import { transactionsService } from "@/services/transactions.service";

export default function NewTransactionPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-5 max-w-lg">
      <BackButton />
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight text-[var(--color-text-primary)] md:text-2xl">
          New transaction
        </h1>
      </header>

      <TransactionForm
        submitLabel="Save transaction"
        onSubmit={async (values) => {
          await transactionsService.create({
            type: values.type,
            amount: values.amount,
            categoryId: values.categoryId,
            walletId: values.walletId,
            note: values.note,
            transactionDate: values.transactionDate,
          });
          router.replace(ROUTES.transactions);
        }}
      />
    </div>
  );
}
