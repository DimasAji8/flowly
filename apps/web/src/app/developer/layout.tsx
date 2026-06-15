import { DeveloperShell } from "@/components/layout/developer-shell";

export default function DeveloperLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DeveloperShell>{children}</DeveloperShell>;
}
