import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "kitsune-rust": "var(--color-action)",
        "kitsune-tea": "var(--color-tea-green)",
        "kitsune-gold": "var(--color-soft-gold)",
        "kitsune-brown": "var(--color-ink)",
        "kitsune-cedar": "var(--color-cedar)",
        "kitsune-cream": "var(--color-cream-paper)",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "Georgia", "serif"],
        body: ["var(--font-body)", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
