"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
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
      router.replace(ROUTES.dashboard);
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
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 lg:left-1/4 z-50">
        <Link 
          href="/auth/forgot-password" 
          className="text-sm text-muted-foreground hover:text-foreground underline"
        >
          Lupa password?
        </Link>
      </div>
    </div>
  );
}

