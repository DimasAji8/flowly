"use client";

import { useEffect } from "react";

/** Apply stored theme on mount — no script injection, no hydration mismatch. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark") document.documentElement.classList.add("dark");
  }, []);

  return <>{children}</>;
}
