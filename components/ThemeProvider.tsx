"use client";
import { createContext, useContext, useSyncExternalStore, useCallback } from "react";
import { LazyMotion, domAnimation } from "framer-motion";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function subscribeTheme(callback: () => void) {
  const handler = (e: StorageEvent) => {
    if (e.key === "currency-theme") callback();
  };
  window.addEventListener("storage", handler);
  window.addEventListener("currency-theme-change", callback);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("currency-theme-change", callback);
  };
}

function getThemeSnapshot(): Theme {
  if (typeof window === "undefined") return "light";
  try {
    const stored = window.localStorage.getItem("currency-theme") as Theme | null;
    if (stored === "dark" || stored === "light") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } catch {
    return "light";
  }
}

function getThemeServerSnapshot(): Theme {
  return "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getThemeServerSnapshot);

  const toggle = useCallback(() => {
    const next: Theme = theme === "light" ? "dark" : "light";
    try {
      window.localStorage.setItem("currency-theme", next);
      window.dispatchEvent(new Event("currency-theme-change"));
    } catch {
      // Session-only
    }
    document.documentElement.classList.toggle("dark", next === "dark");
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      <LazyMotion features={domAnimation}>
        {children}
      </LazyMotion>
    </ThemeContext.Provider>
  );
}

const DEFAULT_THEME: ThemeContextValue = { theme: "light", toggle: () => {} };

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  // During SSR / pre-render ThemeProvider hasn't mounted yet — return a safe default.
  return ctx ?? DEFAULT_THEME;
}
