import { AppShell } from "@/components/layout/app-shell";

export default function RecurringLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
