"use client";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { PriceChart } from "@/components/PriceChart";
import { RiskGauge } from "@/components/RiskGauge";
import { DataFreshness } from "@/components/DataFreshness";
import { RateBadge } from "@/components/RateBadge";
import { LoadingRows, ErrorMessage } from "@/components/StatusMessage";
import { Button } from "@/components/Button";
import { FadeIn } from "@/components/PageTransition";
import { cryptoMeta } from "@/lib/constants";
import { formatPrice } from "@/lib/format";
import { computeVolatility } from "@/lib/volatility";
import { MarketObservation, HistoricalSeries } from "@/lib/providers/types";
import Link from "next/link";

const TIMEFRAMES = [
  { label: "5D", days: 5 },
  { label: "30D", days: 30 },
  { label: "1Y", days: 365 },
  { label: "5Y", days: 365 * 5 }
];

const CRYPTO_GLYPHS: Record<string, string> = {
  bitcoin: "₿", ethereum: "Ξ", binancecoin: "B", solana: "◎",
  ripple: "✕", cardano: "₳", dogecoin: "Ð", tether: "₮"
};

export default function CryptoDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id ?? "";
  const [days, setDays] = useState(30);
  const meta = cryptoMeta(id);
  const glyph = CRYPTO_GLYPHS[id] ?? "◆";

  const latest = useApi<MarketObservation[]>(`/api/crypto/latest?ids=${id}`, 45 * 1000);
  const obs = latest.data?.[0];

  const history = useApi<HistoricalSeries>(`/api/crypto/historical?id=${id}&days=${days}`);

  const volatility = useMemo(() => {
    if (!history.data || history.data.points.length < 3) return null;
    return computeVolatility(history.data.points.map((p) => p.value), 365);
  }, [history.data]);

  const rangeStats = useMemo(() => {
    if (!history.data || history.data.points.length === 0) return null;
    const vals = history.data.points.map((p) => p.value);
    const hi = Math.max(...vals), lo = Math.min(...vals), first = vals[0], last = vals[vals.length - 1];
    return { hi, lo, periodReturn: first ? ((last - first) / first) * 100 : null };
  }, [history.data]);

  return (
    <div className="flex flex-col gap-8">
      <FadeIn>
        <div className="surface px-6 py-6 relative overflow-hidden">
          {/* Faint decorative watermark (background texture only) */}
          <span className="absolute -right-4 -bottom-6 font-display text-[180px] font-black opacity-[0.05] select-none leading-none text-amber dark:text-amber-bright pointer-events-none">
            {glyph}
          </span>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5 relative z-10">
            <div className="flex items-start gap-4">
              {/* Big, solid, unmistakably visible symbol badge */}
              <div className="shrink-0 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-amber/15 dark:bg-amber-bright/15 border-2 border-amber/30 dark:border-amber-bright/30">
                <span className="font-display text-3xl sm:text-4xl font-bold text-amber dark:text-amber-bright">
                  {glyph}
                </span>
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-ink-muted dark:text-ink-onnightMuted mb-1">
                  Cryptocurrency
                </div>
                <h1 className="font-display text-3xl font-bold">{meta?.name ?? id}</h1>
                <div className="text-sm text-ink-soft dark:text-ink-onnightSoft font-mono">{meta?.symbol}</div>
              </div>
            </div>

            {obs ? (
              <div className="text-right">
                <div className="flap text-5xl font-bold">${formatPrice(obs.value)}</div>
                <div className="flex items-center justify-end gap-2 mt-1 flex-wrap">
                  <RateBadge changePct={obs.change_pct} />
                  <DataFreshness freshness={obs.freshness} compact />
                </div>
              </div>
            ) : latest.loading ? (
              <div className="skeleton h-14 w-48 rounded" />
            ) : null}
          </div>

          {obs && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-hairline dark:border-hairline-night relative z-10">
              <Stat label="24h High" value={obs.day_high ? `$${formatPrice(obs.day_high)}` : "—"} />
              <Stat label="24h Low" value={obs.day_low ? `$${formatPrice(obs.day_low)}` : "—"} />
              {rangeStats && <Stat label="Period High" value={`$${formatPrice(rangeStats.hi)}`} />}
              {rangeStats && <Stat label="Period Return" value={rangeStats.periodReturn !== null ? `${rangeStats.periodReturn > 0 ? "+" : ""}${rangeStats.periodReturn.toFixed(1)}%` : "—"} colored={rangeStats.periodReturn} />}
            </div>
          )}

          {obs && rangeStats && (
            <div className="mt-4 text-xs text-ink-soft dark:text-ink-onnightSoft font-mono relative z-10">
              {meta?.name ?? id} is trading at ${formatPrice(obs.value)} —
              {obs.value >= rangeStats.hi * 0.99 ? " near its period high." : obs.value <= rangeStats.lo * 1.01 ? " near its period low." : ` midrange over the selected period.`}
            </div>
          )}
        </div>
      </FadeIn>

      <div className="flex items-center gap-2">
        {TIMEFRAMES.map((t) => (
          <Button key={t.label} variant="ghost" size="sm" active={days === t.days} onClick={() => setDays(t.days)}>
            {t.label}
          </Button>
        ))}
      </div>

      <FadeIn key={days} delay={0.05}>
        <div className="surface px-4 py-4">
          {history.loading && !history.data ? (
            <div className="h-72 flex items-center justify-center">
              <div className="skeleton h-48 w-full rounded" />
            </div>
          ) : history.error ? (
            <ErrorMessage message={history.error} onRetry={history.refetch} />
          ) : history.data ? (
            <PriceChart points={history.data.points} isCrypto />
          ) : null}
        </div>
      </FadeIn>

      {volatility && (
        <FadeIn delay={0.1}>
          <div className="surface px-6 py-5">
            <h2 className="font-display text-lg font-semibold mb-4">Volatility</h2>
            <RiskGauge result={volatility} />
          </div>
        </FadeIn>
      )}

      <FadeIn delay={0.15}>
        <div className="flex gap-2">
          <Link href={`/convert?fromType=crypto&from=${id}`} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-amber text-white dark:bg-amber-bright dark:text-night font-mono text-xs uppercase tracking-wide hover:brightness-110 transition active:scale-95">
            Convert {meta?.symbol} →
          </Link>
          <Link href="/compare" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md border border-hairline dark:border-hairline-night font-mono text-xs uppercase tracking-wide hover:border-amber/60 dark:hover:border-amber-bright/60 transition active:scale-95">
            Compare
          </Link>
        </div>
      </FadeIn>
    </div>
  );
}

function Stat({ label, value, colored }: { label: string; value: string; colored?: number | null }) {
  const colorClass = colored != null ? colored > 0 ? "text-teal dark:text-teal-bright" : colored < 0 ? "text-loss dark:text-loss-bright" : "" : "";
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-widest text-ink-muted dark:text-ink-onnightMuted mb-1">{label}</div>
      <div className={`tnum font-mono text-sm font-semibold ${colorClass}`}>{value}</div>
    </div>
  );
}
