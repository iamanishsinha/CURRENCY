"use client";
import { useSyncExternalStore, useCallback } from "react";

export interface WatchlistItem {
  id: string;
  type: "fiat" | "crypto";
}

const STORAGE_KEY = "currency-watchlist";
const EVENT_NAME = "currency-watchlist-change";

let cachedRaw: string | null = null;
let cachedParsed: WatchlistItem[] = [];

function getSnapshot(): WatchlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      cachedParsed = raw ? JSON.parse(raw) : [];
    }
    return cachedParsed;
  } catch {
    return [];
  }
}

function getServerSnapshot(): WatchlistItem[] {
  return [];
}

function subscribe(callback: () => void) {
  window.addEventListener(EVENT_NAME, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT_NAME, callback);
    window.removeEventListener("storage", callback);
  };
}

export function useWatchlist() {
  const watchlist = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

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
      const current = getSnapshot();
      const exists = current.some(
        (item) => item.id.toLowerCase() === id.toLowerCase() && item.type === type
      );
      const next = exists
        ? current.filter(
            (item) => !(item.id.toLowerCase() === id.toLowerCase() && item.type === type)
          )
        : [...current, { id, type }];

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        window.dispatchEvent(new Event(EVENT_NAME));
      } catch {
        // ignore
      }
    },
    []
  );

  return { watchlist, isWatched, toggle };
}
