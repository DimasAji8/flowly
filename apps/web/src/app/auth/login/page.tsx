"use client";

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
import { loginSchema, type LoginFormValues } from "@/lib/auth-schemas";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { useRedirectIfAuthed } from "@/hooks/use-auth";

export default function LoginPage() {
  const router = useRouter();
  const { isReady, isAuthed } = useRedirectIfAuthed();
  const setSession = useAuthStore((s) => s.setSession);

  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  if (!isReady || isAuthed) {
    return null;
  }

  const onSubmit = async (values: LoginFormValues) => {
    setSubmitError(null);
    try {
      const session = await authService.login(values);
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
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
          Welcome back
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Log in to keep your cashflow journal up to date.
        </p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormError message={submitError} />

        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          {...register("email")}
          error={errors.email?.message}
        />

        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          {...register("password")}
          error={errors.password?.message}
        />

        <Button type="submit" isLoading={isSubmitting} className="mt-2">
          Log in
        </Button>
      </form>

      <p className="text-sm text-[var(--color-text-secondary)] text-center">
        Don&apos;t have an account?{" "}
        <Link
          href={ROUTES.register}
          className="text-[var(--color-accent)] hover:underline"
        >
          Sign up
        </Link>
      </p>
    </section>
  );
}
