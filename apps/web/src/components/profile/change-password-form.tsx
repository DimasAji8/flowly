"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { authService } from "@/services/auth.service";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const schema = z
  .object({
    currentPassword: z.string().min(1, "Wajib diisi"),
    newPassword: z.string().min(6, "Minimal 6 karakter").max(72),
    confirmPassword: z.string().min(1, "Wajib diisi"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Password baru tidak cocok",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

export function ChangePasswordForm({ onSuccess }: { onSuccess?: () => void }) {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    setSuccessMsg("");
    setErrorMsg("");
    try {
      const res = await authService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      setSuccessMsg(res.message);
      reset();
      setTimeout(() => onSuccess?.(), 1000);
    } catch (_e: unknown) {
      setErrorMsg("Password saat ini tidak benar.");
    }
  };

  const eyeBtn = (show: boolean, toggle: () => void) => (
    <button
      type="button"
      onClick={toggle}
      tabIndex={-1}
      className="text-secondary hover:text-primary-text"
    >
      {show ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {successMsg && (
        <div className="rounded-lg bg-success/10 border border-success/20 px-4 py-3 text-sm text-success">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="rounded-lg bg-danger/10 border border-danger/20 px-4 py-3 text-sm text-danger">
          {errorMsg}
        </div>
      )}

      <Input
        label="Password saat ini"
        type={showCurrent ? "text" : "password"}
        placeholder="••••••••"
        {...register("currentPassword")}
        error={errors.currentPassword?.message}
        rightAdornment={eyeBtn(showCurrent, () => setShowCurrent((v) => !v))}
      />
      <Input
        label="Password baru"
        type={showNew ? "text" : "password"}
        placeholder="Minimal 6 karakter"
        {...register("newPassword")}
        error={errors.newPassword?.message}
        rightAdornment={eyeBtn(showNew, () => setShowNew((v) => !v))}
      />
      <Input
        label="Konfirmasi password baru"
        type={showNew ? "text" : "password"}
        placeholder="Ulangi password baru"
        {...register("confirmPassword")}
        error={errors.confirmPassword?.message}
      />

      <Button type="submit" isLoading={isSubmitting} className="md:self-start md:px-8">
        Simpan Password
      </Button>
    </form>
  );
}
