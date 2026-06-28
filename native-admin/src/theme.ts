export const colors = {
  ink: "#10251f",
  forest: "#1E473B",
  forestDeep: "#16382F",
  forestSoft: "#2f5d46",
  forestMist: "#E8F0EA",
  cream: "#F6F1E8",
  ivory: "#FFFDF8",
  surface: "#FFFCF5",
  gold: "#C8AE6A",
  goldSoft: "#eadbb8",
  champagne: "#F0E1BC",
  muted: "#6F7A70",
  mutedSoft: "#9AA293",
  border: "rgba(30, 71, 59, 0.12)",
  borderStrong: "rgba(30, 71, 59, 0.22)",
  goldBorder: "rgba(200, 174, 106, 0.42)",
  danger: "#9f3a38",
  dangerSoft: "#fff0ec",
  success: "#2f6f4e",
  successSoft: "#e7f3eb",
  white: "#ffffff",
};

export const radius = {
  sm: 12,
  md: 20,
  lg: 28,
  xl: 34,
  pill: 999,
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 22,
  xl: 30,
  xxl: 42,
};

export const shadow = {
  soft: {
    shadowColor: "#16382F",
    shadowOpacity: 0.07,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  lifted: {
    shadowColor: "#16382F",
    shadowOpacity: 0.13,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 16 },
    elevation: 8,
  },
  glow: {
    shadowColor: "#C8AE6A",
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
};

export const typography = {
  eyebrow: {
    fontSize: 11,
    fontWeight: "900" as const,
    letterSpacing: 1.8,
    textTransform: "uppercase" as const,
  },
};
