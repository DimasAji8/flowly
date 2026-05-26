"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api-client";
import { categoriesService } from "@/services/categories.service";
import { walletsService } from "@/services/wallets.service";
import type {
  Category,
  RecurringFrequency,
  TransactionType,
  Wallet,
} from "@/types/finance";
import { todayIsoDate } from "@/utils/format-date";

export const recurringFormSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.number().positive("Amount must be greater than 0"),
  categoryId: z.string().min(1, "Pick a category"),
  walletId: z.string().min(1, "Pick a wallet"),
  frequency: z.enum(["daily", "weekly", "monthly"]),
  nextRunAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
  note: z.string().max(280, "Note is too long").optional(),
  isActive: z.boolean().optional(),
});

export type RecurringFormValues = z.infer<typeof recurringFormSchema>;

export interface RecurringFormProps {
  defaultValues?: Partial<RecurringFormValues>;
  onSubmit: (values: RecurringFormValues) => Promise<void>;
  secondaryAction?: React.ReactNode;
  submitLabel?: string;
}

export function RecurringForm({
  defaultValues,
  onSubmit,
  secondaryAction,
  submitLabel = "Simpan",
}: RecurringFormProps) {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isEditing = Boolean(defaultValues);

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RecurringFormValues>({
    resolver: zodResolver(recurringFormSchema),
    defaultValues: {
      type: "expense",
      amount: 0,
      categoryId: "",
      walletId: "",
      frequency: "monthly",
      nextRunAt: todayIsoDate(),
      note: "",
      isActive: true,
      ...defaultValues,
    },
  });

  const selectedType = watch("type") as TransactionType;

  useEffect(() => {
    let cancelled = false;
    Promise.all([walletsService.list(), categoriesService.list()])
      .then(([w, c]) => {
        if (cancelled) return;
        setWallets(w);
        setCategories(c);
        if (!isEditing) {
          if (w[0]) setValue("walletId", w[0].id);
          const cat = c.find((x) => x.type === "expense");
          if (cat) setValue("categoryId", cat.id);
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

  useEffect(() => {
    if (categories.length === 0) return;
    const currentId = watch("categoryId");
    const current = categories.find((c) => c.id === currentId);
    if (current && current.type === selectedType) return;
    const next = categories.find((c) => c.type === selectedType);
    if (next) setValue("categoryId", next.id);
  }, [selectedType, categories, setValue, watch]);

  const filteredCategories = useMemo(
    () => categories.filter((c) => c.type === selectedType),
    [categories, selectedType],
  );

  const submit = async (values: RecurringFormValues) => {
    setSubmitError(null);
    try {
      const noteTrimmed = values.note?.trim() ?? "";
      await onSubmit({ ...values, note: noteTrimmed || undefined });
    } catch (e) {
      setSubmitError(e instanceof ApiError ? e.message : "Failed to save");
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
            aria-label="Jenis transaksi"
            className="grid grid-cols-2 gap-2 rounded-xl bg-card-subtle p-1"
          >
            {(["expense", "income"] as TransactionType[]).map((t) => {
              const active = field.value === t;
              return (
                <button
                  key={t}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => field.onChange(t)}
                  className={[
                    "h-9 rounded-lg text-sm font-medium capitalize transition-colors",
                    active
                      ? "bg-card text-foreground shadow-[var(--shadow-card)]"
                      : "text-secondary",
                  ].join(" ")}
                >
                  {t === "expense" ? "Pengeluaran" : "Pemasukan"}
                </button>
              );
            })}
          </div>
        )}
      />

      <Input
        label="Jumlah"
        type="number"
        step="0.01"
        min={0}
        placeholder="0"
        leftAdornment={<span className="font-medium">Rp</span>}
        {...register("amount", { valueAsNumber: true })}
        error={errors.amount?.message}
      />

      <SelectField
        label="Kategori"
        {...register("categoryId")}
        error={errors.categoryId?.message}
        disabled={noCategories}
      >
        {noCategories ? (
          <option value="">Belum ada kategori</option>
        ) : (
          filteredCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))
        )}
      </SelectField>

      <SelectField
        label="Dompet"
        {...register("walletId")}
        error={errors.walletId?.message}
        disabled={noWallets}
      >
        {noWallets ? (
          <option value="">Belum ada dompet</option>
        ) : (
          wallets.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))
        )}
      </SelectField>

      <SelectField
        label="Frekuensi"
        {...register("frequency")}
        error={errors.frequency?.message}
      >
        <option value="daily">Harian</option>
        <option value="weekly">Mingguan</option>
        <option value="monthly">Bulanan</option>
      </SelectField>

      <Input
        label="Tanggal mulai"
        type="date"
        {...register("nextRunAt")}
        error={errors.nextRunAt?.message}
      />

      <Input
        label="Catatan (opsional)"
        placeholder="mis. Langganan Spotify"
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
// SelectField (sama dengan transaction-form, dipisah biar self-contained)
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
          className="text-[11px] font-semibold uppercase tracking-[0.06em] text-secondary"
        >
          {label}
        </label>
        <div
          className={[
            "flex items-center px-3 rounded-lg",
            "bg-card-subtle",
            "border outline-none transition-colors",
            "focus-within:bg-card",
            error
              ? "border-danger focus-within:border-danger"
              : "border-border-subtle focus-within:border-accent focus-within:ring-2 focus-within:ring-[var(--color-accent-soft)]",
          ].join(" ")}
        >
          <select
            id={fieldId}
            aria-invalid={Boolean(error) || undefined}
            className="h-11 flex-1 appearance-none bg-transparent text-sm capitalize text-foreground outline-none disabled:opacity-50"
            {...rest}
          >
            {children}
          </select>
        </div>
        {error && (
          <p className="text-xs text-danger">{error}</p>
        )}
      </div>
    );
  };
  C.displayName = "SelectField";
  return C;
})();
