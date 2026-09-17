"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  onOpenSearch: () => void;
  items: { href: string; label: string; icon?: string }[];
}

export function MobileDrawer({ open, onClose, onOpenSearch, items }: MobileDrawerProps) {
  const pathname = usePathname();

  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex sm:hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-ink/40 dark:bg-black/70 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer content */}
      <div className="relative w-4/5 max-w-xs h-full bg-paper-raised dark:bg-night-raised border-r border-hairline dark:border-hairline-night flex flex-col justify-between p-6 shadow-2xl z-10 animate-fade-in">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Link href="/" onClick={onClose} className="font-display text-xl font-bold tracking-tight">
              CU<span className="text-amber dark:text-amber-bright">₹₹€</span>NC<span className="text-amber dark:text-amber-bright">¥</span>
            </Link>
            <button
              onClick={onClose}
              aria-label="Close menu"
              className="p-1 rounded font-mono text-base text-ink-muted hover:text-ink dark:hover:text-ink-onnight"
            >
              ✕
            </button>
          </div>

          {/* Quick search button */}
          <button
            onClick={() => {
              onClose();
              onOpenSearch();
            }}
            className="flex items-center justify-between w-full px-3 py-2 rounded-lg border border-hairline dark:border-hairline-night text-ink-soft dark:text-ink-onnightSoft font-mono text-xs bg-paper-sunken/40 dark:bg-night-sunken/40"
          >
            <span className="flex items-center gap-2">
              <span>🔍</span>
              <span>Search assets...</span>
            </span>
            <kbd className="text-[10px] opacity-60">⌘K</kbd>
          </button>

          {/* Nav links */}
          <nav className="flex flex-col gap-1">
            {items.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-mono text-xs uppercase tracking-wider transition ${
                    active
                      ? "bg-amber/15 text-amber dark:bg-amber-bright/15 dark:text-amber-bright font-semibold"
                      : "text-ink-soft dark:text-ink-onnightSoft hover:bg-paper-sunken dark:hover:bg-night-sunken"
                  }`}
                >
                  {item.icon && <span>{item.icon}</span>}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer controls */}
        <div className="pt-4 border-t border-hairline dark:border-hairline-night flex items-center justify-between">
          <span className="font-mono text-xs text-ink-soft dark:text-ink-onnightSoft">Theme</span>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
