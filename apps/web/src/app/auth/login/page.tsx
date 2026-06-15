"use client";

import { useRouter } from "next/navigation";
import { AuthComponent } from "@/components/ui/sign-up";
import { ROUTES } from "@/constants/routes";
import { ApiError } from "@/lib/api-client";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { useRedirectIfAuthed } from "@/hooks/use-auth";

export default function LoginPage() {
  const router = useRouter();
  const { isReady, isAuthed } = useRedirectIfAuthed();
  const setSession = useAuthStore((s) => s.setSession);

  if (!isReady || isAuthed) {
    return null;
  }

  const handleLogin = async ({ email, password }: { email: string; password: string }) => {
    try {
      const session = await authService.login({ email, password });
      setSession(session);
      const isDev = session.user.role === "developer";
      router.replace(isDev ? ROUTES.developer : ROUTES.dashboard);
    } catch (e) {
      if (e instanceof ApiError) throw new Error(e.message);
      throw new Error("Terjadi kesalahan. Coba lagi.");
    }
  };

  return (
    <div className="relative">
      <AuthComponent
        mode="login"
        loginLink={ROUTES.login}
        registerLink={ROUTES.register}
        homeLink={ROUTES.home}
        onLoginSubmit={handleLogin}
        onRegisterSubmit={async () => {}}
      />
    </div>
  );
}

