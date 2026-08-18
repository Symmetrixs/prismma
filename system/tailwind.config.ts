import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontSize: {
        xs: ["0.875rem", { lineHeight: "1.4" }],
        sm: ["1.0625rem", { lineHeight: "1.55" }],
        base: ["1.1875rem", { lineHeight: "1.6" }],
        lg: ["1.3125rem", { lineHeight: "1.6" }],
        xl: ["1.4375rem", { lineHeight: "1.5" }],
      },
      colors: {
        brand: {
          orange: "#FF6600",
          navy: "#000066",
          green: "#16A34A",
        },
        bg: "rgb(var(--color-bg) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        "surface-alt": "rgb(var(--color-surface-alt) / <alpha-value>)",
        heading: "rgb(var(--color-heading) / <alpha-value>)",
        body: "rgb(var(--color-body) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        border: "rgb(var(--color-border) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
        display: ["var(--font-display)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
