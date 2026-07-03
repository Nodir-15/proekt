import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        royal: {
          DEFAULT: "#1E3A8A",
          600: "#1E40AF",
          700: "#1D3A8A",
          800: "#172554",
        },
      },
      boxShadow: {
        card: "0 2px 8px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)",
      },
    },
  },
  plugins: [],
} satisfies Config;
