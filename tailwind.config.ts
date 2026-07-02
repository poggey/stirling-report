import type { Config } from "tailwindcss";

// Racing Ink design tokens — the single source of truth for colour.
// See WHITEPAPER.md §8.2. Do not add colours outside this palette.
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "ivory-0": "#F6F4EC",
        "ivory-1": "#FCFBF6",
        sage: "#ECEFE4",
        brg: "#0C3B2A",
        "brg-600": "#1E5C43",
        ink: "#17251E",
        muted: "#66716A",
        line: "#DFE0D3",
        brass: "#A9853F",
        cream: "#F2EFDF",
        rise: "#177A4E",
        fall: "#BC4B32",
      },
      borderRadius: {
        card: "14px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(23,37,30,.04), 0 8px 24px rgba(23,37,30,.05)",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        sans: ["var(--font-archivo)", "sans-serif"],
        narrow: ["var(--font-archivo-narrow)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
