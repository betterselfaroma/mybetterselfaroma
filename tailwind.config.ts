import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Approved design system: warm cream · deep forest green · muted gold
        cream: {
          DEFAULT: "#F7F3E8",
          50: "#FBF9F2",
          100: "#F7F3E8",
          200: "#EFE7DA",
          300: "#E4D9C5",
        },
        sage: {
          50: "#EEF2EB",
          100: "#DFE8DA",
          200: "#C4D5BC",
          300: "#A4BE98",
          400: "#84A579",
          500: "#6B8E75",
          600: "#4E6E57",
          700: "#34543F",
          800: "#264230",
          900: "#1F3D2E",
        },
        taupe: {
          100: "#EFE7DA",
          200: "#DBCFBE",
          300: "#C3AD93",
          400: "#A98D6E",
          500: "#857158",
          600: "#5F6A57",
          700: "#3F4A38",
        },
        gold: {
          300: "#E3D0A6",
          400: "#D6BD8A",
          500: "#C8A96E",
          600: "#AA8B50",
        },
        ink: "#2E3A29",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 18px 48px -24px rgba(82, 67, 47, 0.35)",
        card: "0 24px 60px -32px rgba(82, 67, 47, 0.28)",
        lift: "0 36px 80px -40px rgba(44, 55, 36, 0.5)",
        glow: "0 0 0 1px rgba(198, 163, 99, 0.22), 0 40px 90px -45px rgba(44, 55, 36, 0.55)",
        "inset-hair": "inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      backgroundImage: {
        "gold-sheen":
          "linear-gradient(135deg, #E3D0A6 0%, #C8A96E 45%, #AA8B50 100%)",
        "forest-depth":
          "linear-gradient(160deg, #2A4D38 0%, #1F3D2E 58%, #17301F 100%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-14px)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "0.5", transform: "scale(1)" },
          "50%": { opacity: "0.85", transform: "scale(1.06)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s ease-out both",
        "float-slow": "float-slow 9s ease-in-out infinite",
        "pulse-soft": "pulse-soft 7s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
