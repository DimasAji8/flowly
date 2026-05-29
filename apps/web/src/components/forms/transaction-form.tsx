"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, Check, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { FormError } from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ApiError } from "@/lib/api-client";
import {
  createTransactionSchema,
  type CreateTransactionFormValues,
} from "@/lib/transaction-schemas";
import { useWalletStore } from "@/store/wallets.store";
import { useCategoryStore } from "@/store/categories.store";
import type { TransactionType } from "@/types/finance";
import { todayIsoDate, formatDateLong } from "@/utils/format-date";

export interface TransactionFormProps {
  defaultValues?: Partial<CreateTransactionFormValues>;
  onSubmit: (values: CreateTransactionFormValues) => Promise<void>;
  secondaryAction?: React.ReactNode;
  submitLabel?: string;
  hideTypeToggle?: boolean;
}

function formatRupiah(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function parseRupiah(formatted: string): number {
  return Number(formatted.replace(/\./g, "")) || 0;
}

export function TransactionForm({
  defaultValues,
  onSubmit,
  secondaryAction,
  submitLabel = "Save",
  hideTypeToggle = false,
}: TransactionFormProps) {
  const { wallets, fetch: fetchWallets } = useWalletStore();
  const { categories, fetch: fetchCategories } = useCategoryStore();
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<CreateTransactionFormValues | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [amountDisplay, setAmountDisplay] = useState(
    defaultValues?.amount ? formatRupiah(String(defaultValues.amount)) : ""
  );

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateTransactionFormValues>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      type: "expense",
      amount: defaultValues?.amount ?? 0,
      categoryId: "",
      walletId: "",
      note: "",
      transactionDate: todayIsoDate(),
      ...defaultValues,
    },
  });

  const selectedType = useWatch({ control, name: "type" }) as TransactionType;
  const categoryId = useWatch({ control, name: "categoryId" });
  const isEditing = Boolean(defaultValues);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchWallets(), fetchCategories()])
      .then(() => {
        if (cancelled) return;
        const w = useWalletStore.getState().wallets;
        const c = useCategoryStore.getState().categories;
        if (!isEditing) {
          if (w[0]) setValue("walletId", w[0].id);
          const defaultCat = c.find((cat) => cat.type === "expense");
          if (defaultCat) setValue("categoryId", defaultCat.id);
        }
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setBootstrapError(e instanceof ApiError ? e.message : "Failed to load form data");
      });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, setValue]);

  useEffect(() => {
    if (categories.length === 0) return;
    const currentCat = categories.find((c) => c.id === categoryId);
    if (currentCat && currentCat.type === selectedType) return;
    const next = categories.find((c) => c.type === selectedType);
    if (next) setValue("categoryId", next.id);
  }, [selectedType, categories, setValue, categoryId]);

  const filteredCategories = useMemo(
    () => categories.filter((c) => c.type === selectedType),
    [categories, selectedType],
  );

  const submit = (values: CreateTransactionFormValues) => {
    setSubmitError(null);
    setPendingValues(values);
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!pendingValues) return;
    setConfirming(true);
    try {
      const noteTrimmed = pendingValues.note?.trim() ?? "";
      await onSubmit({ ...pendingValues, note: noteTrimmed || undefined });
      setConfirmOpen(false);
      setPendingValues(null);
    } catch (e) {
      setSubmitError(e instanceof ApiError ? e.message : "Failed to save transaction");
      setConfirmOpen(false);
    } finally {
      setConfirming(false);
    }
  };

  const noWallets = wallets.length === 0;
  const noCategories = filteredCategories.length === 0;

  const walletId = useWatch({ control, name: "walletId" });
  const [dateOpen, setDateOpen] = useState(false);

  const selectedCategory = filteredCategories.find((c) => c.id === categoryId);
  const selectedWallet = wallets.find((w) => w.id === walletId);

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4">
      {bootstrapError && <FormError message={bootstrapError} />}
      <FormError message={submitError} />

      {!hideTypeToggle && (
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <div role="radiogroup" aria-label="Jenis transaksi" className="grid grid-cols-2 gap-2 rounded-xl bg-card-subtle p-1">
              {(["expense", "income"] as TransactionType[]).map((t) => {
                const isActive = field.value === t;
                return (
                  <button key={t} type="button" role="radio" aria-checked={isActive} onClick={() => field.onChange(t)}
                    className={["h-9 rounded-lg text-sm font-medium transition-colors", isActive ? "bg-card text-foreground shadow-(--shadow-card)" : "text-secondary hover:text-foreground"].join(" ")}
                  >
                    {t === "expense" ? "Pengeluaran" : "Pemasukan"}
                  </button>
                );
              })}
            </div>
          )}
        />
      )}

      <Controller
        name="amount"
        control={control}
        render={({ field }) => (
          <Input
            label="Jumlah"
            inputMode="numeric"
            placeholder="0"
            leftAdornment={<span className="font-medium">Rp</span>}
            value={amountDisplay}
            onChange={(e) => {
              const formatted = formatRupiah(e.target.value);
              setAmountDisplay(formatted);
              field.onChange(parseRupiah(formatted));
            }}
            error={errors.amount?.message}
          />
        )}
      />

      {/* Kategori */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-secondary">Kategori</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              disabled={noCategories}
              className={[
                "flex h-11 w-full items-center justify-between rounded-lg border px-3 text-sm transition-colors",
                "bg-card-subtle text-foreground",
                errors.categoryId ? "border-danger" : "border-border-subtle hover:border-accent",
                "disabled:opacity-50",
              ].join(" ")}
            >
              <span>{noCategories ? "Belum ada kategori" : (selectedCategory?.name ?? "Pilih kategori")}</span>
              <ChevronDown className="size-4 text-muted" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width)" align="start">
            {filteredCategories.map((c) => (
              <DropdownMenuItem key={c.id} onSelect={() => setValue("categoryId", c.id)} className="flex items-center justify-between">
                <span>{c.name}</span>
                {c.id === categoryId && <Check className="size-4 text-accent" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {errors.categoryId && <p className="text-xs text-danger">{errors.categoryId.message}</p>}
      </div>

      {/* Dompet */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-secondary">Dompet</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              disabled={noWallets}
              className={[
                "flex h-11 w-full items-center justify-between rounded-lg border px-3 text-sm transition-colors",
                "bg-card-subtle text-foreground",
                errors.walletId ? "border-danger" : "border-border-subtle hover:border-accent",
                "disabled:opacity-50",
              ].join(" ")}
            >
              <span>{noWallets ? "Belum ada dompet" : (selectedWallet?.name ?? "Pilih dompet")}</span>
              <ChevronDown className="size-4 text-muted" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width)" align="start">
            {wallets.map((w) => (
              <DropdownMenuItem key={w.id} onSelect={() => setValue("walletId", w.id)} className="flex items-center justify-between">
                <span>{w.name}</span>
                {w.id === walletId && <Check className="size-4 text-accent" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {errors.walletId && <p className="text-xs text-danger">{errors.walletId.message}</p>}
      </div>

      {/* Tanggal — Popover + Calendar */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-secondary">Tanggal</span>
        <Controller
          name="transactionDate"
          control={control}
          render={({ field }) => {
            const dateValue = field.value ? new Date(field.value + "T00:00:00") : undefined;
            return (
              <Popover open={dateOpen} onOpenChange={setDateOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={[
                      "flex h-11 w-full items-center justify-between rounded-lg border px-3 text-sm transition-colors text-left",
                      "bg-card-subtle text-foreground",
                      errors.transactionDate ? "border-danger" : "border-border-subtle hover:border-accent",
                    ].join(" ")}
                  >
                    <span>{field.value ? formatDateLong(field.value) : "Pilih tanggal"}</span>
                    <CalendarIcon className="size-4 text-muted" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateValue}
                    onSelect={(date) => {
                      if (!date) return;
                      const y = date.getFullYear();
                      const m = String(date.getMonth() + 1).padStart(2, "0");
                      const d = String(date.getDate()).padStart(2, "0");
                      field.onChange(`${y}-${m}-${d}`);
                      setDateOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            );
          }}
        />
        {errors.transactionDate && <p className="text-xs text-danger">{errors.transactionDate.message}</p>}
      </div>

      <Input label="Catatan (opsional)" placeholder="mis. Makan siang bareng tim" maxLength={280} {...register("note")} error={errors.note?.message} />

      <div className="mt-2 flex items-center gap-3">
        {secondaryAction}
        <Button type="submit" isLoading={isSubmitting} className="flex-1" disabled={noWallets || noCategories}>
          {submitLabel}
        </Button>
      </div>

      {pendingValues && (
        <ConfirmModal
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={handleConfirm}
          title="Konfirmasi Transaksi"
          description={[
            pendingValues.type === "expense" ? "Pengeluaran" : "Pemasukan",
            `Rp ${formatRupiah(String(pendingValues.amount))}`,
            `· ${filteredCategories.find((c) => c.id === pendingValues.categoryId)?.name ?? ""}`,
            `· ${wallets.find((w) => w.id === pendingValues.walletId)?.name ?? ""}`,
            pendingValues.note ? `· "${pendingValues.note.trim()}"` : "",
          ].filter(Boolean).join("  ")}
          confirmLabel={submitLabel}
          confirmVariant="primary"
          loading={confirming}
        />
      )}
    </form>
  );
}
