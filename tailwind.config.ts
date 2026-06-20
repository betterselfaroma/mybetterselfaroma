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
        cream: {
          DEFAULT: "#FBF8F2",
          50: "#FDFBF7",
          100: "#FBF8F2",
          200: "#F4EEE3",
          300: "#EBE2D2",
        },
        sage: {
          50: "#F2F5EE",
          100: "#E4EBDB",
          200: "#CAD8B9",
          300: "#ADC097",
          400: "#92A878",
          500: "#7B9461",
          600: "#62784C",
          700: "#4D5E3C",
          800: "#3C4A30",
          900: "#2C3724",
        },
        taupe: {
          100: "#EFE7DC",
          200: "#DCCDBB",
          300: "#C3AD93",
          400: "#A98D6E",
          500: "#8C7257",
          600: "#6E5944",
          700: "#52432F",
        },
        gold: {
          300: "#E7D2A8",
          400: "#D9BE8E",
          500: "#C6A363",
          600: "#AE8A4C",
        },
        ink: "#3A2E22",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 18px 48px -24px rgba(82, 67, 47, 0.35)",
        card: "0 24px 60px -32px rgba(82, 67, 47, 0.28)",
      },
      borderRadius: {
        "4xl": "2rem",
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
      },
      animation: {
        "fade-up": "fade-up 0.7s ease-out both",
        "float-slow": "float-slow 9s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
