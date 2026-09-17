"use client";
import React, { useEffect, useState } from "react";
import { useTheme } from "./ThemeProvider";

export function KeyboardShortcuts() {
  const [open, setOpen] = useState(false);
  const { toggle } = useTheme();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;

      if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setOpen((prev) => !prev);
      } else if (e.key.toLowerCase() === "t" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        toggle();
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, toggle]);

  if (!open) return null;

  const shortcuts = [
    { key: "⌘ K / Ctrl K", desc: "Search currencies & crypto" },
    { key: "T", desc: "Toggle Day / Night theme" },
    { key: "?", desc: "Show / hide keyboard shortcuts" },
    { key: "Esc", desc: "Close dialogs & overlays" }
  ];

  return (
    <div
      onClick={() => setOpen(false)}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 dark:bg-black/70 backdrop-blur-xs animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm surface p-6 flex flex-col gap-4 shadow-2xl"
      >
        <div className="flex items-center justify-between pb-3 border-b border-hairline dark:border-hairline-night">
          <h3 className="font-display text-base font-bold">Keyboard Shortcuts</h3>
          <button
            onClick={() => setOpen(false)}
            className="p-1 font-mono text-sm text-ink-muted hover:text-ink dark:hover:text-ink-onnight"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {shortcuts.map((s) => (
            <div key={s.key} className="flex items-center justify-between font-mono text-xs">
              <span className="text-ink-soft dark:text-ink-onnightSoft">{s.desc}</span>
              <kbd className="px-2 py-1 rounded bg-paper-sunken dark:bg-night-sunken border border-hairline dark:border-hairline-night text-[11px] font-semibold">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
