"use client";
import { useEffect, useState, useCallback } from "react";

export interface WatchlistItem {
  id: string;
  type: "fiat" | "crypto";
}

const STORAGE_KEY = "currency-watchlist";
const EVENT_NAME = "currency-watchlist-change";

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setWatchlist(JSON.parse(stored));
    } catch {
      // ignore
    }

    const handler = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) setWatchlist(JSON.parse(stored));
      } catch {
        // ignore
      }
    };

    window.addEventListener(EVENT_NAME, handler);
    return () => window.removeEventListener(EVENT_NAME, handler);
  }, []);

  const isWatched = useCallback(
    (id: string, type: "fiat" | "crypto") => {
      return watchlist.some(
        (item) => item.id.toLowerCase() === id.toLowerCase() && item.type === type
      );
    },
    [watchlist]
  );

  const toggle = useCallback(
    (id: string, type: "fiat" | "crypto") => {
      setWatchlist((prev) => {
        const exists = prev.some(
          (item) => item.id.toLowerCase() === id.toLowerCase() && item.type === type
        );
        const next = exists
          ? prev.filter(
              (item) => !(item.id.toLowerCase() === id.toLowerCase() && item.type === type)
            )
          : [...prev, { id, type }];

        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          window.dispatchEvent(new Event(EVENT_NAME));
        } catch {
          // ignore
        }
        return next;
      });
    },
    []
  );

  return { watchlist, isWatched, toggle };
}
