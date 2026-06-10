"use client";

import { useRouter } from "next/navigation";
import { AuthComponent, type RegisterData } from "@/components/ui/sign-up";
import { ROUTES } from "@/constants/routes";
import { ApiError } from "@/lib/api-client";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { useRedirectIfAuthed } from "@/hooks/use-auth";

export default function RegisterPage() {
  const router = useRouter();
  const { isReady, isAuthed } = useRedirectIfAuthed();
  const setSession = useAuthStore((s) => s.setSession);

  if (!isReady || isAuthed) {
    return null;
  }

  const handleRegister = async (data: RegisterData) => {
    try {
      const session = await authService.register({
        name: data.name,
        email: data.email,
        password: data.password,
        gender: data.gender,
      });
      setSession(session);
      // Don't redirect yet — component shows confetti success modal
    } catch (e) {
      if (e instanceof ApiError) throw new Error(e.message);
      throw new Error("Terjadi kesalahan. Coba lagi.");
    }
  };

  return (
    <AuthComponent
      mode="register"
      loginLink={ROUTES.login}
      registerLink={ROUTES.register}
      homeLink={ROUTES.home}
      onLoginSubmit={async () => {}}
      onRegisterSubmit={handleRegister}
      onRegisterComplete={() => router.replace(ROUTES.dashboard)}
    />
  );
}
