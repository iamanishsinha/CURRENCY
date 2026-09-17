"use client";
import { useEffect, useMemo, useState } from "react";
import { ComparisonChart } from "@/components/ComparisonChart";
import { LoadingRows, ErrorMessage } from "@/components/StatusMessage";
import { Button } from "@/components/Button";
import { FadeIn } from "@/components/PageTransition";
import { MAJOR_CURRENCIES, MAJOR_CRYPTO } from "@/lib/constants";
import { toDailyMap, normalizeToHundred, mergeForChart } from "@/lib/normalize";
import { HistoricalSeries } from "@/lib/providers/types";

type Asset = { type: "fiat" | "crypto"; id: string; label: string };

const ALL_ASSETS: Asset[] = [
  ...MAJOR_CURRENCIES.map((c) => ({ type: "fiat" as const, id: c.code, label: c.code })),
  ...MAJOR_CRYPTO.map((c) => ({ type: "crypto" as const, id: c.id, label: c.symbol }))
];

const TIMEFRAMES = [
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
  { label: "1Y", days: 365 },
  { label: "5Y", days: 365 * 5 },
  { label: "10Y", days: 365 * 10 },
  { label: "20Y", days: 365 * 20 }
];

// Pearson correlation between two equal-length arrays
function pearson(a: number[], b: number[]): number {
  if (a.length < 2) return NaN;
  const n = a.length;
  const ma = a.reduce((s, v) => s + v, 0) / n;
  const mb = b.reduce((s, v) => s + v, 0) / n;
  const num = a.reduce((s, v, i) => s + (v - ma) * (b[i] - mb), 0);
  const da = Math.sqrt(a.reduce((s, v) => s + (v - ma) ** 2, 0));
  const db = Math.sqrt(b.reduce((s, v) => s + (v - mb) ** 2, 0));
  return da && db ? num / (da * db) : NaN;
}

export default function ComparePage() {
  const [selected, setSelected] = useState<Asset[]>([
    { type: "fiat", id: "INR", label: "INR" },
    { type: "fiat", id: "EUR", label: "EUR" },
    { type: "crypto", id: "bitcoin", label: "BTC" }
  ]);
  const [days, setDays] = useState(90);
  const [seriesByAsset, setSeriesByAsset] = useState<Record<string, HistoricalSeries>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all(
      selected.map(async (a) => {
        const url = a.type === "fiat"
          ? `/api/rates/historical?base=USD&symbol=${a.id}&days=${days}`
          : `/api/crypto/historical?id=${a.id}&days=${days}`;
        const res = await fetch(url);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? `Failed: ${a.label}`);
        return [a.label, json.data as HistoricalSeries] as const;
      })
    )
      .then((entries) => { if (!cancelled) setSeriesByAsset(Object.fromEntries(entries)); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [selected, days]);

  const { chartRows, chartLabels, normalizedMaps } = useMemo(() => {
    const normalized = selected
      .filter((a) => seriesByAsset[a.label])
      .map((a) => ({ label: a.label, daily: normalizeToHundred(toDailyMap(seriesByAsset[a.label].points)) }));
    return {
      chartRows: mergeForChart(normalized),
      chartLabels: normalized.map((n) => n.label),
      normalizedMaps: normalized
    };
  }, [selected, seriesByAsset]);

  // Correlation matrix from normalized series
  const correlations = useMemo(() => {
    if (normalizedMaps.length < 2) return null;
    // Find common dates
    const allDates = new Set<string>();
    normalizedMaps.forEach((s) => s.daily.forEach((_, d) => allDates.add(d)));
    const dates = [...allDates].sort();
    const vectors = normalizedMaps.map((s) =>
      dates.map((d) => s.daily.get(d) ?? NaN).filter((v) => !isNaN(v))
    );
    // For each pair compute pearson on overlapping windows
    const matrix: number[][] = normalizedMaps.map((_, i) =>
      normalizedMaps.map((_, j) => {
        if (i === j) return 1;
        const common = dates
          .map((d) => [normalizedMaps[i].daily.get(d), normalizedMaps[j].daily.get(d)] as const)
          .filter(([a, b]) => a !== undefined && b !== undefined) as [number, number][];
        return pearson(common.map(([a]) => a), common.map(([, b]) => b));
      })
    );
    return matrix;
  }, [normalizedMaps]);

  const toggleAsset = (asset: Asset) => {
    setSelected((prev) => {
      const exists = prev.some((p) => p.id === asset.id && p.type === asset.type);
      if (exists) return prev.filter((p) => !(p.id === asset.id && p.type === asset.type));
      if (prev.length >= 4) return prev;
      return [...prev, asset];
    });
  };

  const PALETTE = ["#C28A1E", "#2D7B6F", "#C0392B", "#5B4FCF"];

  return (
    <div className="flex flex-col gap-8">
      <FadeIn>
        <div>
          <h1 className="font-display text-3xl font-bold">Compare</h1>
          <p className="mt-1.5 text-sm text-ink-soft dark:text-ink-onnightSoft max-w-lg">
            Every asset rebased to 100 at period start, in USD — so a currency and a crypto can share one chart. Pick up to 4.
          </p>
        </div>
      </FadeIn>

      {/* Asset picker */}
      <FadeIn delay={0.05}>
        <div className="surface px-5 py-4">
          <div className="font-mono text-[10px] uppercase tracking-widest text-ink-muted dark:text-ink-onnightMuted mb-3">Currencies</div>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {ALL_ASSETS.filter((a) => a.type === "fiat").map((a) => {
              const active = selected.some((p) => p.id === a.id && p.type === a.type);
              const selIdx = selected.findIndex((p) => p.id === a.id && p.type === a.type);
              return (
                <button
                  key={a.id}
                  onClick={() => toggleAsset(a)}
                  style={active ? { borderColor: PALETTE[selIdx % PALETTE.length], color: PALETTE[selIdx % PALETTE.length], backgroundColor: PALETTE[selIdx % PALETTE.length] + "15" } : {}}
                  className={`px-2.5 py-1 rounded font-mono text-[11px] uppercase tracking-wide border transition duration-200 active:scale-95 ${
                    active ? "border-current font-semibold" : "border-hairline dark:border-hairline-night text-ink-soft dark:text-ink-onnightSoft hover:border-amber/60 dark:hover:border-amber-bright/60"
                  }`}
                >
                  {a.label}
                </button>
              );
            })}
          </div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-ink-muted dark:text-ink-onnightMuted mb-3">Crypto</div>
          <div className="flex flex-wrap gap-1.5">
            {ALL_ASSETS.filter((a) => a.type === "crypto").map((a) => {
              const active = selected.some((p) => p.id === a.id && p.type === a.type);
              const selIdx = selected.findIndex((p) => p.id === a.id && p.type === a.type);
              return (
                <button
                  key={a.id}
                  onClick={() => toggleAsset(a)}
                  style={active ? { borderColor: PALETTE[selIdx % PALETTE.length], color: PALETTE[selIdx % PALETTE.length], backgroundColor: PALETTE[selIdx % PALETTE.length] + "15" } : {}}
                  className={`px-2.5 py-1 rounded font-mono text-[11px] uppercase tracking-wide border transition duration-200 active:scale-95 ${
                    active ? "border-current font-semibold" : "border-hairline dark:border-hairline-night text-ink-soft dark:text-ink-onnightSoft hover:border-amber/60 dark:hover:border-amber-bright/60"
                  }`}
                >
                  {a.label}
                </button>
              );
            })}
          </div>
        </div>
      </FadeIn>

      {/* Timeframe */}
      <div className="flex items-center gap-2 flex-wrap">
        {TIMEFRAMES.map((t) => (
          <Button key={t.label} variant="ghost" size="sm" active={days === t.days} onClick={() => setDays(t.days)}>
            {t.label}
          </Button>
        ))}
      </div>

      {/* Chart */}
      <FadeIn key={`${days}-${selected.map((s) => s.id).join()}`} delay={0.05}>
        <div className="surface px-4 py-4">
          {loading && chartRows.length === 0 ? (
            <LoadingRows count={1} />
          ) : error ? (
            <ErrorMessage message={error} />
          ) : (
            <ComparisonChart data={chartRows} seriesLabels={chartLabels} />
          )}
        </div>
      </FadeIn>

      {/* Correlation heatmap */}
      {correlations && chartLabels.length >= 2 && (
        <FadeIn delay={0.1}>
          <div className="surface px-5 py-5">
            <h2 className="font-display text-lg font-semibold mb-1">Correlation</h2>
            <p className="text-xs text-ink-soft dark:text-ink-onnightSoft mb-4 font-mono">
              Pearson correlation on normalized daily returns over the selected period. +1 = move together, −1 = move opposite.
            </p>
            <div className="overflow-x-auto">
              <table className="font-mono text-xs border-collapse">
                <thead>
                  <tr>
                    <th className="px-3 py-2 text-ink-muted dark:text-ink-onnightMuted font-normal" />
                    {chartLabels.map((l) => (
                      <th key={l} className="px-3 py-2 text-center font-semibold">{l}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {correlations.map((row, i) => (
                    <tr key={chartLabels[i]}>
                      <td className="px-3 py-2 font-semibold text-right">{chartLabels[i]}</td>
                      {row.map((val, j) => {
                        const isNaN_ = isNaN(val);
                        const diag = i === j;
                        const intensity = Math.abs(val);
                        const bg = diag ? "bg-paper-sunken dark:bg-night-sunken"
                          : val > 0.6 ? "bg-teal/20 text-teal dark:text-teal-bright"
                          : val < -0.6 ? "bg-loss/20 text-loss dark:text-loss-bright"
                          : "bg-paper-raised dark:bg-night-raised";
                        return (
                          <td key={j} className={`px-3 py-2 text-center rounded-xs ${bg}`}>
                            {diag ? "—" : isNaN_ ? "?" : val.toFixed(2)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </FadeIn>
      )}
    </div>
  );
}
