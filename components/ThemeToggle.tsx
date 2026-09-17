"use client";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to day mode" : "Switch to night mode"}
      aria-pressed={isDark}
      className="relative flex h-8 w-16 items-center rounded-full border transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber"
      style={{
        backgroundColor: isDark ? "#0D1117" : "#C28A1E",
        borderColor: isDark ? "#1E2535" : "#8A6010"
      }}
    >
      {/* Track icons */}
      <span className="absolute left-1.5 text-[11px] select-none opacity-90">☀️</span>
      <span className="absolute right-1.5 text-[11px] select-none opacity-90">🌙</span>

      {/* Sliding pill */}
      <span
        className="absolute flex h-6 w-6 items-center justify-center rounded-full shadow-md transition duration-300 ease-spring"
        style={{
          left: isDark ? "calc(100% - 28px)" : "2px",
          backgroundColor: isDark ? "#1E2535" : "#FDF8EE",
          boxShadow: isDark
            ? "0 1px 4px rgba(0,0,0,0.6)"
            : "0 1px 4px rgba(0,0,0,0.25)"
        }}
      >
        <span className="text-[11px] leading-none select-none">
          {isDark ? "🌙" : "☀️"}
        </span>
      </span>
    </button>
  );
}
