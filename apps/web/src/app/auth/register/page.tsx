"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormError } from "@/components/ui/form-error";
import { ROUTES } from "@/constants/routes";
import { ApiError } from "@/lib/api-client";
import {
  registerSchema,
  type RegisterFormValues,
} from "@/lib/auth-schemas";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { useRedirectIfAuthed } from "@/hooks/use-auth";

export default function RegisterPage() {
  const router = useRouter();
  const { isReady, isAuthed } = useRedirectIfAuthed();
  const setSession = useAuthStore((s) => s.setSession);

  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", gender: undefined },
  });

  const gender = watch("gender");

  if (!isReady || isAuthed) {
    return null;
  }

  const onSubmit = async (values: RegisterFormValues) => {
    setSubmitError(null);
    try {
      const session = await authService.register(values);
      setSession(session);
      router.replace(ROUTES.dashboard);
    } catch (e) {
      if (e instanceof ApiError) {
        setSubmitError(e.message);
      } else {
        setSubmitError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-foreground">
          Buat akun baru
        </h1>
        <p className="text-sm text-secondary">
          Mulai catat keuanganmu dengan tenang.
        </p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormError message={submitError} />

        <Input
          label="Nama"
          autoComplete="name"
          placeholder="Nama kamu"
          {...register("name")}
          error={errors.name?.message}
        />

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground">Avatar</span>
          <div className="flex gap-3">
            {(["m", "f"] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setValue("gender", g)}
                className={[
                  "flex flex-col items-center gap-1 rounded-2xl border-2 p-2 transition-colors",
                  gender === g
                    ? "border-accent bg-accent-soft"
                    : "border-border hover:border-accent/50",
                ].join(" ")}
              >
                <Image src={`/svg/${g}.svg`} alt={g === "m" ? "Laki-laki" : "Perempuan"} width={56} height={56} className="size-14 rounded-xl object-cover" />
                <span className="text-xs text-secondary">{g === "m" ? "Laki-laki" : "Perempuan"}</span>
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="kamu@contoh.com"
          {...register("email")}
          error={errors.email?.message}
        />

        <Input
          label="Kata sandi"
          type="password"
          autoComplete="new-password"
          placeholder="Minimal 8 karakter"
          hint="Minimal 8 karakter."
          {...register("password")}
          error={errors.password?.message}
        />

        <Button type="submit" isLoading={isSubmitting} className="mt-2">
          Buat akun
        </Button>
      </form>

      <p className="text-sm text-secondary text-center">
        Sudah punya akun?{" "}
        <Link
          href={ROUTES.login}
          className="text-accent hover:underline"
        >
          Masuk
        </Link>
      </p>
    </section>
  );
}
