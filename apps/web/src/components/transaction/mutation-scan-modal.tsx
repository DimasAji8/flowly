"use client";

import { useState, useRef, useCallback } from "react";
import {
  FileText,
  Image as ImageIcon,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { aiService, type ScannedMutationItem } from "@/services/ai.service";
import { transactionsService } from "@/services/transactions.service";
import { useWalletStore } from "@/store/wallets.store";
import { useCategoryStore } from "@/store/categories.store";

interface MutationScanModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type Row = ScannedMutationItem & { selected: boolean; id: string };

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function MutationScanModal({ open, onClose, onSuccess }: MutationScanModalProps) {
  const [step, setStep] = useState<"upload" | "scanning" | "preview" | "saving">("upload");
  const [rows, setRows] = useState<Row[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const { wallets } = useWalletStore();
  const { categories } = useCategoryStore();

  const handleClose = () => {
    setStep("upload");
    setRows([]);
    setExpandedRows(new Set());
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (pdfInputRef.current) pdfInputRef.current.value = "";
    onClose();
  };

  const processFile = useCallback(async (file: File) => {
    const allowed = ["image/png", "image/jpeg", "image/webp", "application/pdf"];
    if (!allowed.includes(file.type)) {
      toast.error("Format tidak didukung. Gunakan gambar (png/jpg/webp) atau PDF.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File terlalu besar. Maksimal 10MB.");
      return;
    }

    setStep("scanning");
    try {
      const result = await aiService.scanMutation(file);
      if (!result || result.length === 0) {
        toast.error("Tidak ada transaksi yang ditemukan dari file ini.");
        setStep("upload");
        return;
      }
      // Semua dipilih by default, kecuali duplikat
      setRows(
        result.map((item, i) => ({
          ...item,
          id: `row-${i}`,
          selected: !item.isDuplicate,
        }))
      );
      setStep("preview");
    } catch {
      toast.error("Gagal membaca mutasi. Coba lagi atau gunakan file lain.");
      setStep("upload");
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const toggleRow = (id: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, selected: !r.selected } : r)));
  };

  const toggleExpand = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectedRows = rows.filter((r) => r.selected);

  const handleSave = async () => {
    if (selectedRows.length === 0) {
      toast.error("Pilih minimal 1 transaksi untuk disimpan.");
      return;
    }
    setStep("saving");
    let successCount = 0;
    let failCount = 0;

    for (const row of selectedRows) {
      try {
        await transactionsService.create({
          type: row.type,
          amount: row.amount,
          categoryId: row.categoryId ?? "",
          walletId: row.walletId ?? "",
          note: row.note,
          transactionDate: row.date,
        });
        successCount++;
      } catch {
        failCount++;
      }
    }

    window.dispatchEvent(new Event("flowly:transaction-added"));

    if (failCount === 0) {
      toast.success(`${successCount} transaksi berhasil disimpan.`);
    } else {
      toast.warning(`${successCount} berhasil, ${failCount} gagal disimpan.`);
    }

    onSuccess();
    handleClose();
  };

  const getCategoryName = (id: string | null) =>
    categories.find((c) => c.id === id)?.name ?? "—";
  const getWalletName = (id: string | null) =>
    wallets.find((w) => w.id === id)?.name ?? "—";

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Impor Mutasi Rekening"
    >
      {/* STEP: UPLOAD */}
      {step === "upload" && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted">
            Upload screenshot atau PDF mutasi rekening bank. AI akan membaca semua transaksi secara otomatis.
          </p>

          {/* Drop zone */}
          <div
            className={`relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 transition-colors ${
              dragOver
                ? "border-accent bg-accent/5"
                : "border-border-subtle bg-card-subtle"
            }`}
            onDragOver={handleDragOver}
            onDragEnter={handleDragOver}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <Upload className="size-8 text-muted" />
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Seret file ke sini</p>
              <p className="text-xs text-muted mt-1">PNG, JPG, WEBP, atau PDF — maks. 10MB</p>
            </div>
          </div>

          {/* Dua tombol terpisah */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 rounded-xl border border-border-subtle bg-card px-4 py-3 text-sm font-medium text-foreground hover:bg-card-subtle transition-colors"
            >
              <ImageIcon className="size-4 text-muted" />
              Pilih Gambar
            </button>
            <button
              type="button"
              onClick={() => pdfInputRef.current?.click()}
              className="flex items-center justify-center gap-2 rounded-xl border border-border-subtle bg-card px-4 py-3 text-sm font-medium text-foreground hover:bg-card-subtle transition-colors"
            >
              <FileText className="size-4 text-muted" />
              Pilih PDF
            </button>
          </div>

          {/* Input gambar */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
          {/* Input PDF terpisah agar file picker langsung filter PDF */}
          <input
            ref={pdfInputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={handleFileChange}
          />

          <p className="text-[11px] text-muted text-center">
            Transaksi yang mungkin duplikat akan ditandai otomatis untuk Anda review.
          </p>
        </div>
      )}

      {/* STEP: SCANNING */}
      {step === "scanning" && (
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="relative">
            <Loader2 className="size-10 text-accent animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">Membaca mutasi rekening...</p>
            <p className="text-xs text-muted mt-1">AI sedang menganalisis dan mengekstrak transaksi</p>
          </div>
          <div className="flex flex-col gap-2 w-full max-w-xs">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        </div>
      )}

      {/* STEP: PREVIEW */}
      {step === "preview" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                {rows.length} transaksi ditemukan
              </p>
              <p className="text-xs text-muted">
                {selectedRows.length} dipilih · {rows.filter((r) => r.isDuplicate).length} kemungkinan duplikat
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="text-xs text-accent hover:underline"
                onClick={() => setRows((prev) => prev.map((r) => ({ ...r, selected: true })))}
              >
                Pilih semua
              </button>
              <span className="text-xs text-muted">·</span>
              <button
                type="button"
                className="text-xs text-muted hover:underline"
                onClick={() => setRows((prev) => prev.map((r) => ({ ...r, selected: false })))}
              >
                Batal semua
              </button>
            </div>
          </div>

          {/* Tabel transaksi */}
          <div className="flex flex-col gap-2 max-h-[50vh] overflow-y-auto pr-1">
            {rows.map((row) => (
              <div
                key={row.id}
                className={`rounded-xl border transition-colors ${
                  row.isDuplicate
                    ? "border-warning/40 bg-warning/5"
                    : row.selected
                    ? "border-accent/30 bg-accent/5"
                    : "border-border-subtle bg-card"
                }`}
              >
                {/* Header baris */}
                <div className="flex items-center gap-3 px-3 py-2.5">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    id={`row-check-${row.id}`}
                    checked={row.selected}
                    onChange={() => toggleRow(row.id)}
                    className="size-4 accent-[var(--color-accent)] cursor-pointer flex-shrink-0"
                  />

                  {/* Tanggal */}
                  <span className="text-xs text-muted w-20 flex-shrink-0">{row.date}</span>

                  {/* Note */}
                  <span className="flex-1 text-sm text-foreground truncate">{row.note}</span>

                  {/* Duplikat badge */}
                  {row.isDuplicate && (
                    <div className="flex items-center gap-1 text-[10px] text-warning flex-shrink-0">
                      <AlertTriangle className="size-3" />
                      Duplikat
                    </div>
                  )}

                  {/* Nominal */}
                  <span
                    className={`text-sm font-semibold flex-shrink-0 ${
                      row.type === "income" ? "text-[#15803D]" : "text-[#B91C1C]"
                    }`}
                  >
                    {row.type === "income" ? "+" : "-"}
                    {formatRupiah(row.amount)}
                  </span>

                  {/* Expand toggle */}
                  <button
                    type="button"
                    onClick={() => toggleExpand(row.id)}
                    className="text-muted hover:text-foreground flex-shrink-0"
                  >
                    {expandedRows.has(row.id) ? (
                      <ChevronUp className="size-4" />
                    ) : (
                      <ChevronDown className="size-4" />
                    )}
                  </button>
                </div>

                {/* Detail expanded */}
                {expandedRows.has(row.id) && (
                  <div className="border-t border-border-subtle mx-3 pt-2 pb-2.5 grid grid-cols-2 gap-x-4 gap-y-1">
                    <div>
                      <span className="text-[10px] text-muted">Kategori</span>
                      <p className="text-xs text-foreground">{getCategoryName(row.categoryId)}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted">Dompet</span>
                      <p className="text-xs text-foreground">{getWalletName(row.walletId)}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[10px] text-muted">Deskripsi asli</span>
                      <p className="text-xs text-foreground">{row.description}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Summary & actions */}
          <div className="flex items-center justify-between border-t border-border-subtle pt-3">
            <button
              type="button"
              onClick={() => { setStep("upload"); setRows([]); }}
              className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors"
            >
              <Trash2 className="size-4" />
              Ganti file
            </button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={selectedRows.length === 0}
            >
              <CheckCircle2 className="size-4" />
              Simpan {selectedRows.length} Transaksi
            </Button>
          </div>
        </div>
      )}

      {/* STEP: SAVING */}
      {step === "saving" && (
        <div className="flex flex-col items-center gap-4 py-8">
          <Loader2 className="size-10 text-accent animate-spin" />
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">Menyimpan transaksi...</p>
            <p className="text-xs text-muted mt-1">Mohon tunggu sebentar</p>
          </div>
        </div>
      )}
    </Modal>
  );
}
