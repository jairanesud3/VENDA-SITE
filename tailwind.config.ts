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
        // HYPER SPEED: Animações muito rápidas (2s e 3s) com muito movimento
        "blob-hyper": "blob 3s infinite ease-in-out", 
        "side-to-side-hyper": "sideToSide 3s infinite ease-in-out alternate",
        "spin-slow": "spin 3s linear infinite",
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
        // Movimento lateral agressivo para o background "vivo"
        sideToSide: {
          "0%": { transform: "translateX(-20%) translateY(-10%) scale(1)" },
          "100%": { transform: "translateX(20%) translateY(10%) scale(1.1)" },
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