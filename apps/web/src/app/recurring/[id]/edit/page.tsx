"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RecurringForm } from "@/components/forms/recurring-form";
import { FormError } from "@/components/ui/form-error";
import { BackButton } from "@/components/ui/back-button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { ROUTES } from "@/constants/routes";
import { ApiError } from "@/lib/api-client";
import { recurringService } from "@/services/recurring.service";
import type { RecurringTransaction } from "@/types/finance";

export default function EditRecurringPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [item, setItem] = useState<RecurringTransaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    recurringService
      .getById(id)
      .then((data) => {
        if (!cancelled) setItem(data);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof ApiError ? e.message : "Failed to load");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleDelete = async () => {
    if (!id) return;
    try {
      setDeleting(true);
      await recurringService.remove(id);
      router.replace(ROUTES.recurring);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to delete");
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 max-w-lg">
      <BackButton />
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
          Edit recurring
        </h1>
      </header>

      {loading ? (
        <div className="rounded-2xl border border-border-subtle bg-card p-6 text-center text-sm text-muted">
          Memuat…
        </div>
      ) : error && !item ? (
        <FormError message={error} />
      ) : item ? (
        <>
          <RecurringForm
            submitLabel="Simpan perubahan"
            defaultValues={{
              type: item.type,
              amount: Number(item.amount),
              categoryId: item.categoryId,
              walletId: item.walletId,
              frequency: item.frequency,
              nextRunAt: item.nextRunAt.slice(0, 10),
              note: item.note ?? "",
              isActive: item.isActive,
            }}
            onSubmit={async (values) => {
              await recurringService.update(item.id, {
                type: values.type,
                amount: values.amount,
                categoryId: values.categoryId,
                walletId: values.walletId,
                frequency: values.frequency,
                nextRunAt: values.nextRunAt,
                note: values.note,
                isActive: values.isActive,
              });
              router.replace(ROUTES.recurring);
            }}
          />

          <div className="mt-6 border-t border-border-subtle pt-6">
            <Button
              variant="danger"
              onClick={() => setConfirmOpen(true)}
              isLoading={deleting}
              leftIcon={<Trash2 className="size-4" aria-hidden />}
              className="w-full md:w-auto md:px-8"
            >
              Hapus recurring
            </Button>          </div>

          <ConfirmModal
            open={confirmOpen}
            onClose={() => setConfirmOpen(false)}
            onConfirm={handleDelete}
            title="Hapus recurring ini?"
          />
        </>
      ) : null}
    </div>
  );
}
