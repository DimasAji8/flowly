// Design tokens for the landing page (Apple-inspired base from DESIGN.md,
// applied with a calmer Bibit-style soft-colored layout).

export const T = {
  primary: "#0066cc",
  primaryFocus: "#0071e3",
  primaryDeep: "#0a4ea3",
  ink: "#1d1d1f",
  textMuted: "#6e6e73",
  canvas: "#ffffff",
  canvasParchment: "#f5f5f7",
  surfaceBlack: "#000000",
  onDark: "#ffffff",
  hairline: "#e3e3e8",
  income: "#16a34a",
  incomeSoft: "#dcfce7",
  expense: "#dc2626",
  expenseSoft: "#fee2e2",
  primarySoft: "#eaf1fb",
  // Soft tinted section backgrounds (Bibit-style, not plain white)
  tintBlue: "#eef4fc",
  tintBlueDeep: "#e4eefb",
  tintMint: "#eaf6ef",
  tintLilac: "#f1edfb",
  tintPeach: "#fcf2ec",
  fontDisplay: `"SF Pro Display", system-ui, -apple-system, sans-serif`,
  fontText: `"SF Pro Text", system-ui, -apple-system, sans-serif`,
} as const;

// Unsplash placeholder images (sementara — akan diganti aset final).
export const IMG = {
  coffeeReceipt:
    "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?auto=format&fit=crop&w=1200&q=80",
  planning:
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80",
  savingJar:
    "https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?auto=format&fit=crop&w=1200&q=80",
  calmDesk:
    "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1600&q=80",
} as const;
