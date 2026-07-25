export const colors = {
  background: "#FFF7E8",
  surface: "#FFFDF8",
  surfaceSoft: "#FAF1E2",
  primary: "#D94B24",
  secondary: "#2E7D70",
  accent: "#F2B84B",
  textPrimary: "#2F241F",
  textSecondary: "#6E5D53",
  textMuted: "#9B887B",
  border: "#E8D9C7",
  error: "#B53434",
  white: "#FFFFFF",
} as const;

export type ColorName = keyof typeof colors;
