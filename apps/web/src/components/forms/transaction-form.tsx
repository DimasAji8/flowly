"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api-client";
import {
  createTransactionSchema,
  type CreateTransactionFormValues,
} from "@/lib/transaction-schemas";
import { categoriesService } from "@/services/categories.service";
import { walletsService } from "@/services/wallets.service";
import type { Category, TransactionType, Wallet } from "@/types/finance";
import { todayIsoDate } from "@/utils/format-date";

export interface TransactionFormProps {
  /** Default values untuk edit mode */
  defaultValues?: Partial<CreateTransactionFormValues>;
  /** Submit handler. Throw ApiError → ditampilkan di banner */
  onSubmit: (values: CreateTransactionFormValues) => Promise<void>;
  /** Action di kanan tombol submit (mis. Cancel) */
  secondaryAction?: React.ReactNode;
  submitLabel?: string;
}

export function TransactionForm({
  defaultValues,
  onSubmit,
  secondaryAction,
  submitLabel = "Save",
}: TransactionFormProps) {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateTransactionFormValues>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      type: "expense",
      amount: 0,
      categoryId: "",
      walletId: "",
      note: "",
      transactionDate: todayIsoDate(),
      ...defaultValues,
    },
  });

  const selectedType = watch("type") as TransactionType;
  const isEditing = Boolean(defaultValues);

  useEffect(() => {
    let cancelled = false;
    Promise.all([walletsService.list(), categoriesService.list()])
      .then(([w, c]) => {
        if (cancelled) return;
        setWallets(w);
        setCategories(c);

        // Auto-pick default kalau belum ada (mode create)
        if (!isEditing) {
          if (w[0]) setValue("walletId", w[0].id);
          const defaultCat = c.find((cat) => cat.type === "expense");
          if (defaultCat) setValue("categoryId", defaultCat.id);
        }
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setBootstrapError(
          e instanceof ApiError ? e.message : "Failed to load form data",
        );
      });
    return () => {
      cancelled = true;
    };
  }, [setValue, isEditing]);

  // Saat type berubah, auto-pilih kategori pertama dengan type itu (kecuali sudah valid)
  useEffect(() => {
    if (categories.length === 0) return;
    const currentCatId = watch("categoryId");
    const currentCat = categories.find((c) => c.id === currentCatId);
    if (currentCat && currentCat.type === selectedType) return; // ok
    const next = categories.find((c) => c.type === selectedType);
    if (next) setValue("categoryId", next.id);
  }, [selectedType, categories, setValue, watch]);

  const filteredCategories = useMemo(
    () => categories.filter((c) => c.type === selectedType),
    [categories, selectedType],
  );

  const submit = async (values: CreateTransactionFormValues) => {
    setSubmitError(null);
    try {
      const noteTrimmed = values.note?.trim() ?? "";
      await onSubmit({
        ...values,
        note: noteTrimmed || undefined,
      });
    } catch (e) {
      setSubmitError(
        e instanceof ApiError ? e.message : "Failed to save transaction",
      );
    }
  };

  const noWallets = wallets.length === 0;
  const noCategories = filteredCategories.length === 0;

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4">
      {bootstrapError && <FormError message={bootstrapError} />}
      <FormError message={submitError} />

      {/* Type toggle */}
      <Controller
        name="type"
        control={control}
        render={({ field }) => (
          <div
            role="radiogroup"
            aria-label="Transaction type"
            className="grid grid-cols-2 gap-2 rounded-xl bg-[var(--color-card-subtle)] p-1"
          >
            {(["expense", "income"] as TransactionType[]).map((t) => {
              const isActive = field.value === t;
              return (
                <button
                  key={t}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  onClick={() => field.onChange(t)}
                  className={[
                    "h-9 rounded-lg text-sm font-medium capitalize transition-colors",
                    isActive
                      ? "bg-[var(--color-card)] text-[var(--color-text-primary)] shadow-[var(--shadow-card)]"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]",
                  ].join(" ")}
                >
                  {t}
                </button>
              );
            })}
          </div>
        )}
      />

      <Input
        label="Amount"
        type="number"
        inputMode="decimal"
        step="0.01"
        min={0}
        placeholder="0"
        leftAdornment={<span className="font-medium">Rp</span>}
        {...register("amount", { valueAsNumber: true })}
        error={errors.amount?.message}
      />

      <SelectField
        label="Category"
        {...register("categoryId")}
        error={errors.categoryId?.message}
        disabled={noCategories}
      >
        {noCategories ? (
          <option value="">No category yet — create one first</option>
        ) : (
          filteredCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))
        )}
      </SelectField>

      <SelectField
        label="Wallet"
        {...register("walletId")}
        error={errors.walletId?.message}
        disabled={noWallets}
      >
        {noWallets ? (
          <option value="">No wallet yet — create one first</option>
        ) : (
          wallets.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))
        )}
      </SelectField>

      <Input
        label="Date"
        type="date"
        {...register("transactionDate")}
        error={errors.transactionDate?.message}
      />

      <Input
        label="Note (optional)"
        placeholder="e.g. Lunch with team"
        maxLength={280}
        {...register("note")}
        error={errors.note?.message}
      />

      <div className="mt-2 flex items-center gap-3">
        <Button
          type="submit"
          isLoading={isSubmitting}
          className="flex-1 md:flex-none md:px-8"
          disabled={noWallets || noCategories}
        >
          {submitLabel}
        </Button>
        {secondaryAction}
      </div>
    </form>
  );
}

// =====================================================
// Inline select — mengikuti style Input
// =====================================================

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
};

const SelectField = (() => {
  const C = ({ label, error, children, id, ...rest }: SelectProps) => {
    const fieldId = id ?? rest.name;
    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={fieldId}
          className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-secondary)]"
        >
          {label}
        </label>
        <div
          className={[
            "flex items-center px-3",
            "bg-[var(--color-card-subtle)] rounded-lg",
            "border outline-none transition-colors",
            "focus-within:bg-[var(--color-card)]",
            error
              ? "border-[var(--color-danger)] focus-within:border-[var(--color-danger)]"
              : "border-[var(--color-border-subtle)] focus-within:border-[var(--color-accent)] focus-within:ring-2 focus-within:ring-[var(--color-accent-soft)]",
          ].join(" ")}
        >
          <select
            id={fieldId}
            aria-invalid={Boolean(error) || undefined}
            className="h-11 flex-1 appearance-none bg-transparent text-sm text-[var(--color-text-primary)] outline-none disabled:opacity-50"
            {...rest}
          >
            {children}
          </select>
        </div>
        {error && (
          <p className="text-xs text-[var(--color-danger)]">{error}</p>
        )}
      </div>
    );
  };
  C.displayName = "SelectField";
  return C;
})();
