"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { ChevronRight, Tag, Wallet, LogOut, Repeat, Sun, Moon, Target, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import { useAuthStore } from "@/store/auth.store";

export default function ProfilePage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const clear = useAuthStore((s) => s.clear);
  const { resolvedTheme, setTheme } = useTheme();

  const handleLogout = () => {
    clear();
    router.replace(ROUTES.login);
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <h1 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
        Profil
      </h1>

      <Card padding="md">
        <div className="flex flex-col gap-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
            Masuk sebagai
          </p>
          <p className="text-base font-medium text-foreground">
            {user?.name}
          </p>
          <p className="text-sm text-secondary">
            {user?.email}
          </p>
        </div>
      </Card>

      <section className="flex flex-col gap-2">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
          Tampilan
        </h2>
        <Card padding="none">
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
                {resolvedTheme === "dark"
                  ? <Moon className="size-4" aria-hidden />
                  : <Sun className="size-4" aria-hidden />}
              </span>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">
                  {resolvedTheme === "dark" ? "Mode gelap" : "Mode terang"}
                </span>
                <span className="text-xs text-muted">Ketuk untuk ganti</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className={["h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors", resolvedTheme === "dark" ? "bg-accent" : "bg-border"].join(" ")}
              aria-pressed={resolvedTheme === "dark"}
              aria-label="Toggle dark mode"
            >
              <span className={["block size-5 rounded-full bg-white shadow transition-transform", resolvedTheme === "dark" ? "translate-x-5" : "translate-x-0.5"].join(" ")} />
            </button>
          </div>
        </Card>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
          Kelola
        </h2>
        <Card padding="none">
          <ul className="divide-y divide-border-subtle">
            <ManageRow
              href={ROUTES.wallets}
              icon={<Wallet className="size-4" aria-hidden />}
              label="Dompet"
              description="Kelola sumber uang"
            />
            <ManageRow
              href={ROUTES.savingsGoals}
              icon={<Target className="size-4" aria-hidden />}
              label="Target Tabungan"
              description="Kelola tujuan dan progress menabung"
            />
            <ManageRow
              href={ROUTES.categories}
              icon={<Tag className="size-4" aria-hidden />}
              label="Kategori"
              description="Kelola kategori pemasukan & pengeluaran"
            />
            <ManageRow
              href={ROUTES.recurring}
              icon={<Repeat className="size-4" aria-hidden />}
              label="Berulang"
              description="Transaksi berulang otomatis"
            />
            <ManageRow
              href={ROUTES.profileAllocation}
              icon={<PieChart className="size-4" aria-hidden />}
              label="Target Alokasi"
              description="Atur target kebutuhan, keinginan & tabungan"
            />
          </ul>
        </Card>
      </section>

      <Button
        variant="secondary"
        onClick={handleLogout}
        leftIcon={<LogOut className="size-4" aria-hidden />}
        className="md:self-start md:px-8"
      >
        Keluar
      </Button>
    </div>
  );
}

function ManageRow({
  href,
  icon,
  label,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  description: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-card-subtle"
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
          {icon}
        </span>
        <div className="flex flex-1 flex-col">
          <span className="text-sm font-medium text-foreground">
            {label}
          </span>
          <span className="text-xs text-muted">
            {description}
          </span>
        </div>
        <ChevronRight
          className="size-4 text-muted"
          aria-hidden
        />
      </Link>
    </li>
  );
}
