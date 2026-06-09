"use client";

import Link from "next/link";
import { Target, Tag, Repeat, PieChart, BarChart2 } from "lucide-react";
import { ROUTES } from "@/constants/routes";

const ACTIONS = [
  { href: ROUTES.reports,          icon: BarChart2, label: "Laporan"   },
  { href: ROUTES.savingsGoals,     icon: Target,    label: "Tabungan"  },
  { href: ROUTES.categories,       icon: Tag,       label: "Kategori"  },
  { href: ROUTES.profileAllocation,icon: PieChart,  label: "Alokasi"   },
  { href: ROUTES.recurring,        icon: Repeat,    label: "Berulang"  },
];

export function QuickActions() {
  return (
    <section>
      <div className="grid grid-cols-5 gap-3">
        {ACTIONS.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-1.5 rounded-2xl p-3 transition-colors hover:bg-card-subtle"
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
