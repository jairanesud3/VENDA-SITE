import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "hero-glow": "radial-gradient(circle at 50% 0%, #2e1065 0%, #0B0518 50%)",
        "shimmer-gradient": "linear-gradient(to right, #ffffff 0%, #a855f7 20%, #ffffff 40%, #ffffff 100%)"
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "blob": "blob 7s infinite",
        // Nova animação rápida (10x mais dinâmica)
        "blob-fast": "blob 3s infinite ease-in-out", 
        "side-to-side": "sideToSide 4s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "border-spin": "border-spin 3s linear infinite",
        "text-shimmer": "shimmer 3s linear infinite",
        "ripple": "ripple 1.5s infinite",
      },
      keyframes: {
        blob: {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" },
        },
        // Nova keyframe para movimento lateral agressivo/rápido
        sideToSide: {
          "0%, 100%": { transform: "translateX(-25%) translateY(-10%)" },
          "50%": { transform: "translateX(25%) translateY(10%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "border-spin": {
            "0%": { transform: "rotate(0deg)" },
            "100%": { transform: "rotate(360deg)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% center" },
          "100%": { backgroundPosition: "-200% center" }
        },
        ripple: {
          "0%": { transform: "scale(1)", opacity: "0.5" },
          "100%": { transform: "scale(1.5)", opacity: "0" }
        }
      },
    },
  },
  plugins: [],
};
export default config;