export const colors = {
  ink: "#10261d",
  forest: "#17392a",
  forestDeep: "#0f2a20",
  forestSoft: "#2f5d46",
  forestMist: "#e7efe6",
  cream: "#f7f1e6",
  ivory: "#fffaf0",
  surface: "#fffdf7",
  gold: "#c8a968",
  goldSoft: "#eadbb8",
  champagne: "#f3e6c5",
  muted: "#7b7669",
  mutedSoft: "#a59d8b",
  border: "rgba(47, 93, 70, 0.14)",
  borderStrong: "rgba(47, 93, 70, 0.24)",
  danger: "#9f3a38",
  dangerSoft: "#fff0ec",
  success: "#2f6f4e",
  successSoft: "#e7f3eb",
  white: "#ffffff",
};

export const radius = {
  sm: 12,
  md: 18,
  lg: 26,
  pill: 999,
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 22,
  xl: 30,
};

export const shadow = {
  soft: {
    shadowColor: "#0f2a20",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  lifted: {
    shadowColor: "#0f2a20",
    shadowOpacity: 0.16,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
};

export const typography = {
  eyebrow: {
    fontSize: 11,
    fontWeight: "900" as const,
    letterSpacing: 1.1,
    textTransform: "uppercase" as const,
  },
};
