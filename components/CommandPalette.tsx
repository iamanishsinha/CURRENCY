"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, m } from "framer-motion";
import { MAJOR_CURRENCIES, MAJOR_CRYPTO } from "@/lib/constants";

interface Result {
  code: string;
  name: string;
  type: "fiat" | "crypto";
  href: string;
  symbol?: string;
}

const ALL: Result[] = [
  ...MAJOR_CURRENCIES.map((c) => ({
    code: c.code,
    name: c.name,
    type: "fiat" as const,
    href: `/currencies/${c.code}`,
    symbol: c.symbol
  })),
  ...MAJOR_CRYPTO.map((c) => ({
    code: c.symbol,
    name: c.name,
    type: "crypto" as const,
    href: `/crypto/${c.id}`
  }))
];

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [idx, setIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const results = query.trim()
    ? ALL.filter(
        (r) =>
          r.code.toLowerCase().includes(query.toLowerCase()) ||
          r.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 7)
    : ALL.slice(0, 7);

  useEffect(() => { setIdx(0); }, [query]);

  useEffect(() => {
    if (open) { setTimeout(() => inputRef.current?.focus(), 50); setQuery(""); }
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") setIdx((i) => Math.min(i + 1, results.length - 1));
      if (e.key === "ArrowUp") setIdx((i) => Math.max(i - 1, 0));
      if (e.key === "Enter" && results[idx]) { router.push(results[idx].href); onClose(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose, results, idx, router]);

  return (
    <AnimatePresence>
      {open && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-ink/30 dark:bg-black/60 backdrop-blur-sm"
        >
          <m.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg surface overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-hairline dark:border-hairline-night">
              <span className="text-ink-soft dark:text-ink-onnightSoft text-sm">🔍</span>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search currencies & crypto..."
                className="flex-1 bg-transparent font-body text-sm outline-none placeholder:text-ink-muted dark:placeholder:text-ink-onnightMuted"
              />
              <kbd className="font-mono text-[10px] text-ink-muted dark:text-ink-onnightMuted border border-hairline dark:border-hairline-night px-1.5 py-0.5 rounded-xs">ESC</kbd>
            </div>
            <ul className="py-1.5 max-h-80 overflow-y-auto">
              {results.map((r, i) => (
                <li key={r.href}>
                  <button
                    onClick={() => { router.push(r.href); onClose(); }}
                    onMouseEnter={() => setIdx(i)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-100 ${
                      i === idx ? "bg-amber/8 dark:bg-amber-bright/8" : ""
                    }`}
                  >
                    <span className="font-mono text-xs font-semibold w-10 text-amber dark:text-amber-bright">{r.code}</span>
                    <span className="text-sm flex-1">{r.name}</span>
                    <span className="font-mono text-[10px] text-ink-muted dark:text-ink-onnightMuted border border-hairline dark:border-hairline-night px-1.5 py-0.5 rounded-xs uppercase">
                      {r.type}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
