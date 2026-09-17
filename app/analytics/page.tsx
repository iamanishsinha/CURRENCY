"use client";
import { useState, useMemo } from "react";
import { useApi } from "@/hooks/useApi";
import { MAJOR_CURRENCIES } from "@/lib/constants";
import { MarketObservation } from "@/lib/providers/types";
import { formatRate } from "@/lib/format";
import { FadeIn, StaggerList, StaggerItem } from "@/components/PageTransition";
import { LoadingRows, ErrorMessage } from "@/components/StatusMessage";
import Link from "next/link";

export default function AnalyticsPage() {
  const [base, setBase] = useState("USD");
  const fx = useApi<MarketObservation[]>(`/api/rates/latest?base=${base}`, 5 * 60 * 1000);

  const sortedByStrength = useMemo(() => {
    if (!fx.data) return [];
    return [...fx.data]
      .filter((o) => typeof o.change_pct === "number")
      .sort((a, b) => (b.change_pct ?? 0) - (a.change_pct ?? 0));
  }, [fx.data]);

  const maxAbsChange = useMemo(() => {
    if (sortedByStrength.length === 0) return 1;
    return Math.max(...sortedByStrength.map((o) => Math.abs(o.change_pct ?? 0))) || 1;
  }, [sortedByStrength]);

  return (
    <div className="flex flex-col gap-8">
      <FadeIn>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold">Currency Strength Index</h1>
            <p className="mt-1.5 text-sm text-ink-soft dark:text-ink-onnightSoft max-w-xl">
              Relative currency performance ranked by day-over-day movement against {base}.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-ink-muted dark:text-ink-onnightMuted">
              Base:
            </span>
            <select
              value={base}
              onChange={(e) => setBase(e.target.value)}
              className="px-3 py-1.5 rounded-md border border-hairline dark:border-hairline-night bg-paper-raised dark:bg-night-raised font-mono text-xs focus:outline-none focus:border-amber dark:focus:border-amber-bright"
            >
              {MAJOR_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} — {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </FadeIn>

      {/* Strength ranking card */}
      <FadeIn delay={0.08}>
        <div className="surface p-6">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-hairline dark:border-hairline-night">
            <span className="font-mono text-xs uppercase tracking-widest font-semibold text-ink-soft dark:text-ink-onnightSoft">
              Rank & Relative Movement vs {base}
            </span>
            <span className="font-mono text-[10px] text-ink-muted dark:text-ink-onnightMuted">
              Normalized relative to highest mover
            </span>
          </div>

          {fx.loading && !fx.data ? (
            <LoadingRows count={8} />
          ) : fx.error ? (
            <ErrorMessage message={fx.error} onRetry={fx.refetch} />
          ) : (
            <div className="flex flex-col gap-3">
              {sortedByStrength.map((o, idx) => {
                const meta = MAJOR_CURRENCIES.find((c) => c.code === o.asset_id);
                const pct = o.change_pct ?? 0;
                const isPositive = pct >= 0;
                const barWidth = Math.min((Math.abs(pct) / maxAbsChange) * 100, 100);

                return (
                  <Link
                    key={o.asset_id}
                    href={`/currencies/${o.asset_id}?base=${base}`}
                    className="group grid grid-cols-[36px_100px_1fr_90px] items-center gap-4 py-2 px-3 rounded-md hover:bg-paper-sunken dark:hover:bg-night-sunken transition-colors duration-150"
                  >
                    {/* Rank */}
                    <span className="font-mono text-xs text-ink-muted dark:text-ink-onnightMuted">
                      #{idx + 1}
                    </span>

                    {/* Code & Name */}
                    <div className="min-w-0">
                      <span className="font-mono text-sm font-bold text-ink dark:text-ink-onnight group-hover:text-amber dark:group-hover:text-amber-bright transition-colors">
                        {o.asset_id}
                      </span>
                      <div className="truncate text-[10px] text-ink-soft dark:text-ink-onnightSoft">
                        {meta?.name}
                      </div>
                    </div>

                    {/* Visual Bar representation */}
                    <div className="w-full bg-paper-sunken dark:bg-night-sunken h-3 rounded-full overflow-hidden relative">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ease-out ${
                          isPositive
                            ? "bg-teal dark:bg-teal-bright"
                            : "bg-loss dark:bg-loss-bright"
                        }`}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>

                    {/* Percentage */}
                    <div className="text-right font-mono text-xs font-semibold">
                      <span
                        className={
                          isPositive
                            ? "text-teal dark:text-teal-bright"
                            : "text-loss dark:text-loss-bright"
                        }
                      >
                        {isPositive ? "+" : ""}
                        {pct.toFixed(2)}%
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </FadeIn>
    </div>
  );
}
