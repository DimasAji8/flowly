"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "@/lib/auth-schemas";
import { authService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/constants/routes";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [devToken, setDevToken] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true);
    setSuccessMessage("");
    setErrorMessage("");
    setDevToken(null);

    try {
      const response = await authService.forgotPassword(data);
      setSuccessMessage(response.message);
      if (response.token) {
        setDevToken(response.token);
      }
    } catch (_error: unknown) {
      setErrorMessage("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-xl border border-border p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-primary-text">Lupa Password</h1>
            <p className="text-sm text-secondary mt-2">
              Masukkan email Anda untuk menerima link reset password
            </p>
          </div>

          {successMessage && (
            <div className="mb-4 p-3 rounded-lg bg-success/10 border border-success/20 text-sm text-success">
              {successMessage}
            </div>
          )}

          {devToken && (
            <div className="mb-4 p-3 rounded-lg bg-warning/10 border border-warning/20 text-xs text-warning-text">
              <strong>Dev Mode — Token:</strong> <code className="break-all">{devToken}</code>
              <br />
              <Link
                href={`/auth/reset-password?token=${devToken}`}
                className="text-accent underline mt-1 inline-block"
              >
                Klik untuk reset password
              </Link>
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/20 text-sm text-danger">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="nama@example.com"
              {...register("email")}
              error={errors.email?.message}
            />

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Kirim Link Reset Password
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <Link href={ROUTES.login} className="text-accent hover:underline">
              Kembali ke Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
