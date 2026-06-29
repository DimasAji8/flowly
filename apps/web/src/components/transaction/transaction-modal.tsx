"use client";

import { useState, useRef } from "react";
import { ArrowDownCircle, ArrowUpCircle, Sparkles, Camera, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { TransactionForm } from "@/components/forms/transaction-form";
import { transactionsService } from "@/services/transactions.service";
import { aiService } from "@/services/ai.service";
import { useWalletStore } from "@/store/wallets.store";
import type { CreateTransactionFormValues } from "@/lib/transaction-schemas";
import type { Transaction, TransactionType } from "@/types/finance";

interface TransactionModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  transaction?: Transaction;
}

export function TransactionModal({ open, onClose, onSuccess, transaction }: TransactionModalProps) {
  const isEdit = Boolean(transaction);
  const [selectedType, setSelectedType] = useState<TransactionType | null>(null);
  const [showAiInput, setShowAiInput] = useState(false);
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const [aiValues, setAiValues] = useState<Partial<CreateTransactionFormValues> | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    setSelectedType(null);
    setShowAiInput(false);
    setAiValues(null);
    setAiText("");
    setScanLoading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
    onClose();
  };


  const handleSubmit = async (values: CreateTransactionFormValues) => {
    if (isEdit && transaction) {
      await transactionsService.update(transaction.id, {
        type: values.type, amount: values.amount, categoryId: values.categoryId,
        walletId: values.walletId, note: values.note, transactionDate: values.transactionDate,
      });
      toast.success("Transaksi diperbarui");
    } else {
      await transactionsService.create({
        type: values.type, amount: values.amount, categoryId: values.categoryId,
        walletId: values.walletId, note: values.note, transactionDate: values.transactionDate,
      });
      toast.success("Transaksi ditambahkan");
    }
    // Invalidate wallet store karena saldo dompet berubah
    useWalletStore.getState().invalidate();
    // Dispatch event agar semua halaman (dashboard, kalender, dll) refresh data
    window.dispatchEvent(new Event("flowly:transaction-added"));
    handleClose();
    onSuccess();
  };

  const handleProcessAi = async () => {
    if (!aiText.trim()) return;
    setAiLoading(true);
    try {
      const res = await aiService.parseTransaction(aiText.trim());
      if (res) {
        setAiValues({
          type: res.type,
          amount: res.amount,
          categoryId: res.categoryId || "",
          walletId: res.walletId || "",
          note: res.note || "",
          transactionDate: res.transactionDate,
        });
        setSelectedType(res.type);
        setShowAiInput(false);
        toast.success("AI berhasil menganalisis teks!");
      }
    } catch {
      toast.error("Gagal memproses dengan AI");
    } finally {
      setAiLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanLoading(true);
    try {
      const res = await aiService.scanReceipt(file);
      if (res) {
        setAiValues({
          type: res.type,
          amount: res.amount,
          categoryId: res.categoryId || "",
          walletId: res.walletId || "",
          note: res.note || "",
          transactionDate: res.transactionDate,
        });
        setSelectedType(res.type);
        toast.success("Struk berhasil di-scan!");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal men-scan struk belanja";
      toast.error(message);
    } finally {
      setScanLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (cameraInputRef.current) cameraInputRef.current.value = "";
    }
  };

  const handleTriggerGallery = () => {
    fileInputRef.current?.click();
  };

  const handleTriggerCamera = () => {
    cameraInputRef.current?.click();
  };

  // Edit mode → langsung ke form
  const showPicker = !isEdit && selectedType === null && !showAiInput && !scanLoading;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      onBack={
        showAiInput
          ? () => {
              setShowAiInput(false);
              setAiText("");
            }
          : !showPicker && !isEdit
            ? () => {
                setSelectedType(null);
                setAiValues(null);
              }
            : undefined
      }
      title={
        isEdit
          ? "Edit transaksi"
          : scanLoading
            ? "Membaca Struk..."
            : showAiInput
              ? "Tulis Cepat dengan AI"
              : showPicker
                ? "Tambah transaksi"
                : selectedType === "income"
                  ? "Pemasukan"
                  : "Pengeluaran"
      }
    >
      {scanLoading ? (
        <div className="flex flex-col items-center justify-center py-10 gap-4 flowly-enter">
          <div className="relative flex items-center justify-center">
            <div className="absolute size-12 rounded-full bg-accent/20 animate-ping"></div>
            <div className="relative rounded-full bg-accent/10 p-3">
              <Camera className="size-6 text-accent animate-pulse" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground">Sedang membaca struk...</p>
            <p className="text-xs text-muted mt-1 max-w-[240px]">AI sedang menganalisis nominal, toko, dan barang belanjaan Anda.</p>
          </div>
        </div>
      ) : showAiInput ? (
        <div className="flex flex-col gap-4 py-2 flowly-enter">
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-secondary">
              Tulis Detail Transaksi
            </span>
            <textarea
              rows={3}
              value={aiText}
              onChange={(e) => setAiText(e.target.value)}
              placeholder="Contoh: 'Tadi sore beli bensin pertamax 50rb pake e-wallet gopay' atau 'Gaji bulanan masuk rekening Mandiri 10 juta'"
              className="w-full rounded-xl border border-border-subtle bg-card-subtle px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-hidden transition-colors resize-none"
              disabled={aiLoading}
            />
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setShowAiInput(false);
                setAiText("");
              }}
              disabled={aiLoading}
            >
              Batal
            </Button>
            <Button
              type="button"
              className="flex-1"
              onClick={handleProcessAi}
              isLoading={aiLoading}
              disabled={!aiText.trim()}
            >
              Proses dengan AI
            </Button>
          </div>
        </div>
      ) : showPicker ? (
        <div className="flex flex-col gap-3 py-2">
          <button
            type="button"
            onClick={() => setSelectedType("income")}
            className="flex items-center gap-4 rounded-xl border border-border-subtle bg-card-subtle px-5 py-4 text-left transition-colors hover:border-success hover:bg-success/5"
          >
            <ArrowUpCircle className="size-8 shrink-0 text-success" strokeWidth={1.5} />
            <div>
              <p className="text-sm font-semibold text-foreground">Pemasukan</p>
              <p className="text-xs text-muted">Gaji, transfer masuk, dll.</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setSelectedType("expense")}
            className="flex items-center gap-4 rounded-xl border border-border-subtle bg-card-subtle px-5 py-4 text-left transition-colors hover:border-danger hover:bg-danger/5"
          >
            <ArrowDownCircle className="size-8 shrink-0 text-danger" strokeWidth={1.5} />
            <div>
              <p className="text-sm font-semibold text-foreground">Pengeluaran</p>
              <p className="text-xs text-muted">Belanja, tagihan, dll.</p>
            </div>
          </button>

          <div className="relative my-1 flex py-1 items-center">
            <div className="grow border-t border-border-subtle"></div>
            <span className="mx-3 text-[10px] font-medium uppercase tracking-wider text-muted select-none">Fitur Cerdas AI</span>
            <div className="grow border-t border-border-subtle"></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleTriggerCamera}
              className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border-subtle bg-card-subtle px-3 py-4 text-center transition-colors hover:border-accent hover:bg-accent/5 group"
            >
              <Camera className="size-6 text-accent transition-transform group-hover:scale-110" strokeWidth={1.5} />
              <div>
                <p className="text-xs font-semibold text-foreground flex items-center justify-center gap-1">
                  Kamera Struk <span className="text-[8px] bg-accent/10 text-accent px-1.5 py-0.5 rounded-full font-medium">AI</span>
                </p>
                <p className="text-[10px] text-muted mt-0.5">Ambil foto langsung</p>
              </div>
            </button>
            <button
              type="button"
              onClick={handleTriggerGallery}
              className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border-subtle bg-card-subtle px-3 py-4 text-center transition-colors hover:border-accent hover:bg-accent/5 group"
            >
              <ImageIcon className="size-6 text-accent transition-transform group-hover:scale-110" strokeWidth={1.5} />
              <div>
                <p className="text-xs font-semibold text-foreground flex items-center justify-center gap-1">
                  Pilih Galeri <span className="text-[8px] bg-accent/10 text-accent px-1.5 py-0.5 rounded-full font-medium">AI</span>
                </p>
                <p className="text-[10px] text-muted mt-0.5">Upload gambar/file</p>
              </div>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowAiInput(true)}
            className="flex items-center gap-4 rounded-xl border border-border-subtle bg-card-subtle px-5 py-4 text-left transition-colors hover:border-accent hover:bg-accent/5"
          >
            <Sparkles className="size-8 shrink-0 text-accent animate-pulse" strokeWidth={1.5} />
            <div>
              <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                Tulis Cepat dengan AI <span className="text-[9px] bg-accent/10 text-accent px-1.5 py-0.5 rounded-full font-medium tracking-wide">BETA</span>
              </p>
              <p className="text-xs text-muted">Ketik kalimat biasa, AI akan mengisi formulir otomatis.</p>
            </div>
          </button>
        </div>
      ) : (
        <div className="flowly-enter">
          <TransactionForm
            submitLabel={isEdit ? "Simpan perubahan" : "Simpan transaksi"}
            hideTypeToggle={!isEdit}
            defaultValues={
              transaction
                ? { type: transaction.type, amount: Number(transaction.amount), categoryId: transaction.categoryId, walletId: transaction.walletId, note: transaction.note ?? "", transactionDate: transaction.transactionDate }
                : aiValues
                  ? aiValues
                  : { type: selectedType ?? "expense" }
            }
            onSubmit={handleSubmit}
            secondaryAction={
              <Button type="button" variant="secondary" className="flex-1" onClick={handleClose}>
                Batal
              </Button>
            }
          />
        </div>
      )}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={cameraInputRef}
        onChange={handleFileChange}
        accept="image/*"
        capture="environment"
        className="hidden"
      />
    </Modal>
  );
}
