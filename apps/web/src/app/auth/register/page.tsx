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
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

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
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
          Create your account
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Start your calm cashflow journal.
        </p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormError message={submitError} />

        <Input
          label="Name"
          autoComplete="name"
          placeholder="Your name"
          {...register("name")}
          error={errors.name?.message}
        />

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
          autoComplete="new-password"
          placeholder="At least 8 characters"
          hint="Minimum 8 characters."
          {...register("password")}
          error={errors.password?.message}
        />

        <Button type="submit" isLoading={isSubmitting} className="mt-2">
          Create account
        </Button>
      </form>

      <p className="text-sm text-[var(--color-text-secondary)] text-center">
        Already have an account?{" "}
        <Link
          href={ROUTES.login}
          className="text-[var(--color-accent)] hover:underline"
        >
          Log in
        </Link>
      </p>
    </section>
  );
}
