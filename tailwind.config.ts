import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: "#F5EDDA",
          raised: "#FDF8EE",
          sunken: "#EDE3CC",
          deep: "#E4D8BA"
        },
        night: {
          DEFAULT: "#0D1117",
          raised: "#161B25",
          sunken: "#080C12",
          deep: "#060A0F"
        },
        ink: {
          DEFAULT: "#1A1F2E",
          soft: "#5C5445",
          muted: "#9E9080",
          onnight: "#EDE4CE",
          onnightSoft: "#8A8B88",
          onnightMuted: "#565A5F"
        },
        amber: {
          DEFAULT: "#C28A1E",
          bright: "#F0B429",
          dim: "#8A6010",
          glow: "#FFD06633"
        },
        teal: {
          DEFAULT: "#2D7B6F",
          bright: "#3DD6C3",
          dim: "#1A5047"
        },
        gain: {
          DEFAULT: "#2D7B6F",
          bright: "#3DD6C3",
          soft: "#2D7B6F22"
        },
        loss: {
          DEFAULT: "#C0392B",
          bright: "#E8604E",
          soft: "#C0392B22"
        },
        hairline: {
          DEFAULT: "#D9CFAE",
          strong: "#C4B896",
          night: "#1E2535",
          nightStrong: "#2A3347"
        }
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"]
      },
      borderRadius: {
        xs: "3px",
        sm: "6px",
        DEFAULT: "8px",
        md: "10px",
        lg: "14px",
        xl: "20px"
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" }
        },
        "flash-gain": {
          "0%, 100%": { color: "inherit" },
          "50%": { color: "#3DD6C3" }
        },
        "flash-loss": {
          "0%, 100%": { color: "inherit" },
          "50%": { color: "#E8604E" }
        },
        "draw-line": {
          "0%": { strokeDashoffset: "1000" },
          "100%": { strokeDashoffset: "0" }
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" }
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" }
        },
        ticker: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" }
        }
      },
      animation: {
        "fade-up": "fade-up 0.4s ease-out forwards",
        "fade-in": "fade-in 0.3s ease-out forwards",
        shimmer: "shimmer 1.6s infinite linear",
        "flash-gain": "flash-gain 0.6s ease-out",
        "flash-loss": "flash-loss 0.6s ease-out",
        "draw-line": "draw-line 1.2s ease-out forwards",
        pulse: "pulse 2s ease-in-out infinite",
        "spin-slow": "spin-slow 3s linear infinite",
        ticker: "ticker 40s linear infinite"
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)"
      },
      backgroundImage: {
        "graph-paper-light":
          "linear-gradient(#D9CFAE33 1px, transparent 1px), linear-gradient(90deg, #D9CFAE33 1px, transparent 1px)",
        "graph-paper-dark":
          "linear-gradient(#1E253533 1px, transparent 1px), linear-gradient(90deg, #1E253533 1px, transparent 1px)"
      },
      backgroundSize: {
        "graph-paper": "32px 32px"
      }
    }
  },
  plugins: []
};

export default config;
