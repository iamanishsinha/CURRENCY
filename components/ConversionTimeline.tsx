"use client";
import { useEffect, useState, useMemo } from "react";
import { HistoricalSeries } from "@/lib/providers/types";
import { PriceChart } from "./PriceChart";
import { LoadingRows } from "./StatusMessage";

interface ConversionTimelineProps {
  fromType: "fiat" | "crypto";
  from: string;
  toType: "fiat" | "crypto";
  to: string;
}

export function ConversionTimeline({
  fromType,
  from,
  toType,
  to
}: ConversionTimelineProps) {
  const [data, setData] = useState<HistoricalSeries | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const url =
    fromType === "fiat" && toType === "fiat"
      ? `/api/rates/historical?base=${from}&symbol=${to}&days=365`
      : fromType === "crypto"
      ? `/api/crypto/historical?id=${from}&days=365`
      : null;

  const activeData = url ? data : null;

  useEffect(() => {
    let cancelled = false;
    if (!url) return;

    setLoading(true);
    setError(null);

    fetch(url)
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        if (json.data) setData(json.data);
        else setError(json.error ?? "Failed to load history");
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  if (!activeData && !loading) return null;

  return (
    <div className="surface p-4 mt-2">
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="font-mono text-xs font-semibold uppercase tracking-wider text-ink-soft dark:text-ink-onnightSoft">
          1-Year Rate History: {from} → {to}
        </span>
      </div>
      {loading && !activeData ? (
        <LoadingRows count={3} />
      ) : error ? (
        <span className="text-xs text-loss dark:text-loss-bright font-mono">{error}</span>
      ) : activeData ? (
        <PriceChart points={activeData.points} isCrypto={fromType === "crypto"} />
      ) : null}
    </div>
  );
}
