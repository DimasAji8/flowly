"use client";

import Link from "next/link";
import { HandCoins, Tag, Repeat, PieChart, BarChart2, Sparkles } from "lucide-react";
import { ROUTES } from "@/constants/routes";

const ACTIONS = [
  { href: ROUTES.reports,          icon: BarChart2, label: "Laporan"   },
  { href: ROUTES.ai,               icon: Sparkles,  label: "Analisis AI" },
  { href: ROUTES.savingsGoals,     icon: HandCoins, label: "Tabungan"  },
  { href: ROUTES.categories,       icon: Tag,       label: "Kategori"  },
  { href: ROUTES.profileAllocation,icon: PieChart,  label: "Alokasi"   },
  { href: ROUTES.recurring,        icon: Repeat,    label: "Berulang"  },
];

export function QuickActions() {
  return (
    <section className="quick-actions">
      <div className="grid grid-cols-3 gap-x-2 gap-y-1.5 sm:grid-cols-6 sm:gap-3">
        {ACTIONS.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-1 rounded-2xl py-1.5 sm:py-3 px-1 transition-colors hover:bg-card-subtle"
          >
            <span className="grid size-11 place-items-center rounded-2xl bg-card-subtle border border-border-subtle text-accent dark:text-secondary">
              <Icon className="size-5" strokeWidth={1.75} aria-hidden />
            </span>
            <span className="text-[11px] font-medium text-secondary leading-tight text-center">
              {label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
