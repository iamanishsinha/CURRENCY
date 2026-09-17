"use client";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// In-memory client cache for fast tab-switching and instant hydration
const clientCache = new Map<string, unknown>();

export function useApi<T>(url: string | null, pollMs?: number): UseApiResult<T> {
  const cached = url ? (clientCache.get(url) as T | undefined) : undefined;
  const [data, setData] = useState<T | null>(cached ?? null);
  const [loading, setLoading] = useState<boolean>(Boolean(url && !cached));
  const [error, setError] = useState<string | null>(null);

  const requestId = useRef(0);
  const hasLoaded = useRef(Boolean(cached));
  const lastSerialized = useRef<string>(cached ? JSON.stringify(cached) : "");

  const load = useCallback(async (isPoll = false) => {
    if (!url) {
      setLoading(false);
      return;
    }
    const thisId = ++requestId.current;

    // Only show loading spinner on initial load when there is no cached data
    if (!hasLoaded.current && !isPoll) {
      setLoading(true);
    }
    setError(null);

    try {
      const res = await fetch(url);
      const json = await res.json();
      if (thisId !== requestId.current) return;

      if (!res.ok) {
        setError(json.error ?? `Error ${res.status}`);
        if (!hasLoaded.current) setData(null);
      } else {
        const serialized = JSON.stringify(json.data);
        // Only trigger React state update if data actually changed
        if (serialized !== lastSerialized.current) {
          lastSerialized.current = serialized;
          clientCache.set(url, json.data);
          setData(json.data as T);
        }
        hasLoaded.current = true;
      }
    } catch (err) {
      if (thisId === requestId.current) {
        setError((err as Error).message || "Network error");
      }
    } finally {
      if (thisId === requestId.current) {
        setLoading(false);
      }
    }
  }, [url]);

  useEffect(() => {
    hasLoaded.current = Boolean(url && clientCache.has(url));
    void load(false);

    if (!pollMs) return;
    const id = setInterval(() => void load(true), pollMs);
    return () => clearInterval(id);
  }, [load, pollMs, url]);

  return { data, loading, error, refetch: () => load(false) };
}

