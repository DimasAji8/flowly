"use client";

import { useCallback, useEffect, useState } from "react";

type Theme = "light" | "dark";
const KEY = "theme";

function getStored(): Theme {
  if (typeof window === "undefined") return "light";
  return (localStorage.getItem(KEY) as Theme) ?? "light";
}

function apply(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.classList.toggle("light", theme === "light");
}

export function useTheme() {
  const [resolvedTheme, setResolvedTheme] = useState<Theme>("light");

  useEffect(() => {
    const t = getStored();
    // setState di effect disengaja: localStorage tidak tersedia saat SSR,
    // jadi tema dibaca setelah mount untuk menghindari hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setResolvedTheme(t);
    apply(t);
  }, []);

  const setTheme = useCallback((theme: Theme) => {
    localStorage.setItem(KEY, theme);
    setResolvedTheme(theme);
    apply(theme);
  }, []);

  return { resolvedTheme, setTheme };
}
