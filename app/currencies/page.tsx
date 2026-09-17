"use client";
import { useState } from "react";
import { useApi } from "@/hooks/useApi";
import { Board } from "@/components/Board";
import { BoardRow } from "@/components/BoardRow";
import { LoadingRows, ErrorMessage, EmptyMessage } from "@/components/StatusMessage";
import { Button } from "@/components/Button";
import { FadeIn, StaggerList, StaggerItem } from "@/components/PageTransition";
import { MAJOR_CURRENCIES, HIGHLIGHT_CODE } from "@/lib/constants";
import { MarketObservation } from "@/lib/providers/types";

export default function CurrenciesPage() {
  const [base, setBase] = useState("USD");
  const fx = useApi<MarketObservation[]>(`/api/rates/latest?base=${base}`, 5 * 60 * 1000);

  return (
    <div className="flex flex-col gap-6">
      <FadeIn>
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-3xl font-bold">Currencies</h1>
            <p className="mt-1 text-sm text-ink-soft dark:text-ink-onnightSoft">
              Daily ECB reference rates — updated each business day ~16:00 CET.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink-muted dark:text-ink-onnightMuted">Base</span>
            <select
              value={base}
              onChange={(e) => setBase(e.target.value)}
              className="px-3 py-2 rounded-lg border border-hairline dark:border-hairline-night bg-paper-raised dark:bg-night-raised font-mono text-xs focus:outline-none focus:border-amber dark:focus:border-amber-bright transition-colors"
            >
              {MAJOR_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>{c.code} — {c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.08}>
        <Board title={`All currencies vs ${base}`}>
          {fx.loading && !fx.data ? (
            <LoadingRows count={MAJOR_CURRENCIES.length - 1} />
          ) : fx.error ? (
            <ErrorMessage message={fx.error} onRetry={fx.refetch} />
          ) : fx.data && fx.data.length > 0 ? (
            <StaggerList>
              {fx.data.map((o) => {
                const meta = MAJOR_CURRENCIES.find((c) => c.code === o.asset_id);
                return (
                  <StaggerItem key={o.asset_id}>
                    <BoardRow
                      href={`/currencies/${o.asset_id}?base=${base}`}
                      code={o.asset_id}
                      name={meta?.name ?? o.asset_id}
                      observation={o}
                      highlight={o.asset_id === HIGHLIGHT_CODE}
                    />
                  </StaggerItem>
                );
              })}
            </StaggerList>
          ) : (
            <EmptyMessage message="No currency data available." />
          )}
        </Board>
      </FadeIn>
    </div>
  );
}
