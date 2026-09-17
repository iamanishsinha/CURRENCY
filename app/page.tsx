"use client";
import { useApi } from "@/hooks/useApi";
import { Board } from "@/components/Board";
import { BoardRow } from "@/components/BoardRow";
import { RateBadge } from "@/components/RateBadge";
import { DataFreshness } from "@/components/DataFreshness";
import { LoadingRows, ErrorMessage, EmptyMessage } from "@/components/StatusMessage";
import { FadeIn, StaggerList, StaggerItem } from "@/components/PageTransition";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { LazySection } from "@/components/LazySection";
import { MAJOR_CURRENCIES, MAJOR_CRYPTO, DEFAULT_BASE, HIGHLIGHT_CODE } from "@/lib/constants";
import { formatRate } from "@/lib/format";
import { MarketObservation } from "@/lib/providers/types";
import Link from "next/link";
import { m } from "framer-motion";

export default function HomePage() {
  const fx = useApi<MarketObservation[]>(`/api/rates/latest?base=${DEFAULT_BASE}`, 5 * 60 * 1000);
  const cryptoData = useApi<MarketObservation[]>("/api/crypto/latest", 45 * 1000);

  const featured = fx.data?.find((o) => o.asset_id === HIGHLIGHT_CODE);

  return (
    <div className="flex flex-col gap-10">
      {/* Hero */}
      <FadeIn>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-[1.4fr_1fr]">
          <div className="flex flex-col justify-center gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber/10 border border-amber/30 dark:bg-amber-bright/10 dark:border-amber-bright/30 w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-amber dark:bg-amber-bright animate-pulse" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-amber dark:text-amber-bright">
                Market data live
              </span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold leading-tight">
              See the<br />
              <span className="text-amber dark:text-amber-bright">world move.</span>
            </h1>
            <p className="text-sm text-ink-soft dark:text-ink-onnightSoft max-w-xs leading-relaxed">
              Currencies, crypto and market context in one board — every number carries its source and the moment it was observed.
            </p>
            <div className="flex gap-2 mt-1">
              <Link href="/convert" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-amber text-white dark:bg-amber-bright dark:text-night font-mono text-xs uppercase tracking-wide hover:brightness-110 transition active:scale-95 shadow-sm">
                Convert →
              </Link>
              <Link href="/compare" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md border border-hairline dark:border-hairline-night font-mono text-xs uppercase tracking-wide hover:border-amber/60 dark:hover:border-amber-bright/60 transition active:scale-95">
                Compare
              </Link>
            </div>
          </div>

          {/* Featured rate card */}
          <div className="surface px-6 py-5 flex flex-col justify-center gap-3 relative overflow-hidden group">
            {/* Background watermark */}
            <span className="absolute right-3 bottom-0 font-display text-[120px] font-bold opacity-5 select-none leading-none text-amber dark:text-amber-bright pointer-events-none group-hover:scale-105 transition-transform duration-500">
              ₹
            </span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink-muted dark:text-ink-onnightMuted">
              {DEFAULT_BASE} / {HIGHLIGHT_CODE}
            </span>
            {fx.loading && !featured ? (
              <div className="skeleton h-12 w-48 rounded" />
            ) : featured ? (
              <>
                <div className="text-5xl font-bold">
                  <AnimatedNumber value={featured.value} formatFn={formatRate} className="flap text-5xl font-bold" />
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <RateBadge changePct={featured.change_pct} />
                  <DataFreshness freshness={featured.freshness} compact />
                </div>
              </>
            ) : (
              <span className="text-sm text-loss dark:text-loss-bright">Rate unavailable.</span>
            )}
          </div>
        </div>
      </FadeIn>

      {/* Top movers (Lazy-loaded below the fold) */}
      <LazySection fallback={<div className="h-44 surface skeleton rounded-lg" />}>
        <MoversSection />
      </LazySection>

      {/* Crypto highlight strip */}
      {cryptoData.data && cryptoData.data.length > 0 && (
        <FadeIn delay={0.15}>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {cryptoData.data.slice(0, 6).map((o) => {
              const meta = MAJOR_CRYPTO.find((c) => c.id === o.asset_id);
              const isUp = (o.change_pct ?? 0) >= 0;
              return (
                <Link
                  key={o.asset_id}
                  href={`/crypto/${o.asset_id}`}
                  className="surface shrink-0 px-4 py-3 min-w-[140px] hover:scale-[1.02] hover:border-amber/50 dark:hover:border-amber-bright/50 transition duration-200 active:scale-95"
                >
                  <div className="font-mono text-xs font-bold text-amber dark:text-amber-bright">{meta?.symbol}</div>
                  <div className="tnum font-mono text-base font-semibold mt-1">${formatRate(o.value)}</div>
                  <div className={`font-mono text-[11px] mt-0.5 ${isUp ? "text-teal dark:text-teal-bright" : "text-loss dark:text-loss-bright"}`}>
                    {isUp ? "▲" : "▼"} {Math.abs(o.change_pct ?? 0).toFixed(2)}%
                  </div>
                </Link>
              );
            })}
          </div>
        </FadeIn>
      )}

      {/* FX Board */}
      <FadeIn delay={0.2}>
        <Board title={`Currency rates · ${DEFAULT_BASE} base`}>
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
                      href={`/currencies/${o.asset_id}`}
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

      {/* Crypto Board */}
      <FadeIn delay={0.25}>
        <Board title="Crypto market">
          {cryptoData.loading && !cryptoData.data ? (
            <LoadingRows count={MAJOR_CRYPTO.length} />
          ) : cryptoData.error ? (
            <ErrorMessage message={cryptoData.error} onRetry={cryptoData.refetch} />
          ) : cryptoData.data && cryptoData.data.length > 0 ? (
            <StaggerList>
              {cryptoData.data.map((o) => {
                const meta = MAJOR_CRYPTO.find((c) => c.id === o.asset_id);
                return (
                  <StaggerItem key={o.asset_id}>
                    <BoardRow
                      href={`/crypto/${o.asset_id}`}
                      code={meta?.symbol ?? o.asset_id}
                      name={meta?.name ?? o.asset_id}
                      observation={o}
                      isCrypto
                    />
                  </StaggerItem>
                );
              })}
            </StaggerList>
          ) : (
            <EmptyMessage message="No crypto data available." />
          )}
        </Board>
      </FadeIn>
    </div>
  );
}

function MoversSection() {
  const movers = useApi<{ gainers: MarketObservation[]; losers: MarketObservation[]; mostActive: MarketObservation[] }>("/api/movers", 60 * 1000);

  return (
    <FadeIn delay={0.1}>
      <div>
        <h2 className="font-display text-xl font-semibold mb-4">Today&apos;s movers</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(["gainers", "losers", "mostActive"] as const).map((key, i) => (
            <MoversPanel
              key={key}
              title={key === "gainers" ? "Gainers" : key === "losers" ? "Losers" : "Most Active"}
              items={movers.data?.[key]}
              loading={movers.loading}
              error={movers.error}
              index={i}
            />
          ))}
        </div>
      </div>
    </FadeIn>
  );
}

function MoversPanel({ title, items, loading, error, index }: {
  title: string;
  items?: MarketObservation[];
  loading: boolean;
  error: string | null;
  index: number;
}) {
  const accent = index === 0 ? "text-teal dark:text-teal-bright" : index === 1 ? "text-loss dark:text-loss-bright" : "text-amber dark:text-amber-bright";
  const barBg = index === 0 ? "bg-teal/15 dark:bg-teal-bright/15" : index === 1 ? "bg-loss/15 dark:bg-loss-bright/15" : "bg-amber/15 dark:bg-amber-bright/15";

  return (
    <m.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 + index * 0.07 }}
      className="surface overflow-hidden"
    >
      <div className="px-4 py-3 border-b border-hairline dark:border-hairline-night">
        <h3 className={`font-mono text-[11px] uppercase tracking-widest font-semibold ${accent}`}>{title}</h3>
      </div>
      {loading && !items ? (
        <LoadingRows count={4} />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : items && items.length > 0 ? (
        <ul>
          {items.map((o) => {
            const label = o.asset_type === "crypto"
              ? (MAJOR_CRYPTO.find((c) => c.id === o.asset_id)?.symbol ?? o.asset_id)
              : o.asset_id;
            const barWidth = Math.min(Math.abs(o.change_pct ?? 0) * 12, 100);

            return (
              <li
                key={`${o.asset_type}-${o.asset_id}`}
                className="relative flex items-center justify-between px-4 py-2.5 border-b border-hairline last:border-b-0 dark:border-hairline-night overflow-hidden group"
              >
                {/* Ranking magnitude bar */}
                <div
                  className={`absolute left-0 top-0 bottom-0 ${barBg} transition-[width] duration-500 ease-out`}
                  style={{ width: `${barWidth}%` }}
                />
                <span className="relative z-10 font-mono text-xs font-semibold tracking-wide">
                  {label}
                </span>
                <span className="relative z-10">
                  <RateBadge changePct={o.change_pct} />
                </span>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyMessage message="—" />
      )}
    </m.div>
  );
}

