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
        "kitsune-accent": "#FF0000",
        "kitsune-visited": "#008000",
        "kitsune-black": "#000000",
        "kitsune-bg": "#FAFAFA",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "futura-pt", "Jost", "sans-serif"],
        body: ["var(--font-body)", "proxima-nova", "DM Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
