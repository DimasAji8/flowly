import { AppShell } from "@/components/layout/app-shell";

export default function WalletsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
