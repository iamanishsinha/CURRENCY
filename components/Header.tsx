"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { CommandPalette } from "./CommandPalette";
import { MobileDrawer } from "./MobileDrawer";
import { KeyboardShortcuts } from "./KeyboardShortcuts";
import { useEffect, useState } from "react";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/currencies", label: "Currencies" },
  { href: "/crypto", label: "Crypto" },
  { href: "/convert", label: "Convert" },
  { href: "/compare", label: "Compare" },
  { href: "/analytics", label: "Strength" },
  { href: "/watchlist", label: "Watchlist" }
];

export function Header() {
  const pathname = usePathname();
  const [cmdOpen, setCmdOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-hairline dark:border-hairline-night bg-paper-raised/90 dark:bg-night-raised/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 sm:px-6 py-3">
          {/* Mobile hamburger */}
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation menu"
            className="flex sm:hidden p-1.5 rounded-md border border-hairline dark:border-hairline-night text-ink-soft dark:text-ink-onnightSoft hover:text-ink dark:hover:text-ink-onnight"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Wordmark */}
          <Link href="/" className="shrink-0 group">
            <span className="font-display text-xl font-bold tracking-tight transition-opacity group-hover:opacity-80">
              CU<span className="text-amber dark:text-amber-bright">₹₹€</span>NC<span className="text-amber dark:text-amber-bright">¥</span>
            </span>
          </Link>

          {/* Nav */}
          <nav className="hidden sm:flex items-center gap-0.5 flex-1">
            {NAV.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-2.5 py-1.5 rounded-md font-mono text-[11px] uppercase tracking-widest transition duration-200 ${
                    active
                      ? "bg-amber/10 text-amber dark:bg-amber-bright/10 dark:text-amber-bright font-semibold"
                      : "text-ink-soft dark:text-ink-onnightSoft hover:text-ink dark:hover:text-ink-onnight hover:bg-paper-sunken dark:hover:bg-night-sunken"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right controls */}
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setCmdOpen(true)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-hairline dark:border-hairline-night text-ink-soft dark:text-ink-onnightSoft font-mono text-[11px] hover:border-amber/50 dark:hover:border-amber-bright/50 transition duration-200"
            >
              <span>Search</span>
              <kbd className="hidden sm:inline text-[10px] opacity-60">⌘K</kbd>
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOpenSearch={() => setCmdOpen(true)}
        items={NAV}
      />

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
      <KeyboardShortcuts />
    </>
  );
}
