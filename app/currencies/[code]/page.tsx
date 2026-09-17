"use client";
import { Suspense, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { PriceChart } from "@/components/PriceChart";
import { RiskGauge } from "@/components/RiskGauge";
import { DataFreshness } from "@/components/DataFreshness";
import { RateBadge } from "@/components/RateBadge";
import { LoadingRows, ErrorMessage } from "@/components/StatusMessage";
import { Button } from "@/components/Button";
import { FadeIn } from "@/components/PageTransition";
import { currencyMeta, MAJOR_CURRENCIES } from "@/lib/constants";
import { formatRate } from "@/lib/format";
import { computeVolatility } from "@/lib/volatility";
import { MarketObservation, HistoricalSeries } from "@/lib/providers/types";
import Link from "next/link";

const TIMEFRAMES = [
  { label: "5D", days: 5 },
  { label: "30D", days: 30 },
  { label: "1Y", days: 365 },
  { label: "5Y", days: 365 * 5 }
];

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$", EUR: "€", GBP: "£", JPY: "¥", INR: "₹",
  CNY: "¥", CHF: "₣", CAD: "$", AUD: "$", SGD: "$"
};

export default function CurrencyDetailPage() {
  return <Suspense fallback={<LoadingRows count={4} />}><Detail /></Suspense>;
}

function Detail() {
  const params = useParams<{ code: string }>();
  const searchParams = useSearchParams();
  const code = (params.code ?? "").toUpperCase();
  const base = (searchParams.get("base") ?? "USD").toUpperCase();
  const [days, setDays] = useState(30);

  const meta = currencyMeta(code);

  const latest = useApi<MarketObservation[]>(
    code !== base ? `/api/rates/latest?base=${base}&symbols=${code}` : null,
    5 * 60 * 1000
  );
  const obs = latest.data?.[0];

  const history = useApi<HistoricalSeries>(
    code !== base ? `/api/rates/historical?base=${base}&symbol=${code}&days=${days}` : null
  );

  const volatility = useMemo(() => {
    if (!history.data || history.data.points.length < 3) return null;
    return computeVolatility(history.data.points.map((p) => p.value), 252);
  }, [history.data]);

  const rangeStats = useMemo(() => {
    if (!history.data || history.data.points.length === 0) return null;
    const vals = history.data.points.map((p) => p.value);
    const hi = Math.max(...vals), lo = Math.min(...vals), first = vals[0], last = vals[vals.length - 1];
    return { hi, lo, periodReturn: first ? ((last - first) / first) * 100 : null };
  }, [history.data]);

  const currSym = CURRENCY_SYMBOLS[code] ?? code[0];

  if (code === base) return (
    <div className="text-sm text-ink-soft dark:text-ink-onnightSoft">
      {code} is the base. <Link href="/currencies" className="underline">Pick a different base.</Link>
    </div>
  );

  return (
    <div className="flex flex-col gap-8">
      {/* Hero */}
      <FadeIn>
        <div className="surface px-6 py-6 relative overflow-hidden">
          {/* Faint decorative watermark (background texture only) */}
          <span className="absolute -right-4 -bottom-6 font-display text-[180px] font-black opacity-[0.05] select-none leading-none text-amber dark:text-amber-bright pointer-events-none">
            {currSym}
          </span>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5 relative z-10">
            <div className="flex items-start gap-4">
              {/* Big, solid, unmistakably visible symbol badge */}
              <div className="shrink-0 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-amber/15 dark:bg-amber-bright/15 border-2 border-amber/30 dark:border-amber-bright/30">
                <span className="font-display text-3xl sm:text-4xl font-bold text-amber dark:text-amber-bright">
                  {currSym}
                </span>
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-ink-muted dark:text-ink-onnightMuted mb-1">
                  {meta?.country ?? "—"}
                </div>
                <h1 className="font-display text-3xl font-bold">
                  {base} / {code}
                </h1>
                <div className="text-sm text-ink-soft dark:text-ink-onnightSoft">{meta?.name}</div>
              </div>
            </div>

            {obs && (
              <div className="text-right">
                <div className="flap text-5xl font-bold">{formatRate(obs.value)}</div>
                <div className="flex items-center justify-end gap-2 mt-1 flex-wrap">
                  <RateBadge changePct={obs.change_pct} />
                  <DataFreshness freshness={obs.freshness} compact />
                </div>
              </div>
            )}
            {latest.loading && !obs && <div className="skeleton h-14 w-48 rounded" />}
          </div>

          {/* Stats row */}
          {obs && rangeStats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-hairline dark:border-hairline-night relative z-10">
              <Stat label="Period high" value={formatRate(rangeStats.hi)} />
              <Stat label="Period low" value={formatRate(rangeStats.lo)} />
              <Stat label="Period return" value={rangeStats.periodReturn !== null ? `${rangeStats.periodReturn > 0 ? "+" : ""}${rangeStats.periodReturn.toFixed(2)}%` : "—"} colored={rangeStats.periodReturn} />
              <Stat label="Change 1d" value={obs.change_abs !== null ? formatRate(Math.abs(obs.change_abs)) : "—"} colored={obs.change_pct} />
            </div>
          )}

          {/* Context sentence */}
          {obs && rangeStats && (
            <div className="mt-4 text-xs text-ink-soft dark:text-ink-onnightSoft font-mono relative z-10">
              1 {base} = {formatRate(obs.value)} {code} —
              {obs.value >= rangeStats.hi * 0.99
                ? " near its period high."
                : obs.value <= rangeStats.lo * 1.01
                ? " near its period low."
                : ` midrange between ${formatRate(rangeStats.lo)} and ${formatRate(rangeStats.hi)}.`}
            </div>
          )}
        </div>
      </FadeIn>

      {/* Timeframe selector */}
      <div className="flex items-center gap-2">
        {TIMEFRAMES.map((t) => (
          <Button key={t.label} variant="ghost" size="sm" active={days === t.days} onClick={() => setDays(t.days)}>
            {t.label}
          </Button>
        ))}
      </div>

      {/* Chart */}
      <FadeIn key={days} delay={0.05}>
        <div className="surface px-4 py-4">
          {history.loading && !history.data ? (
            <div className="h-72 flex items-center justify-center">
              <div className="skeleton h-48 w-full rounded" />
            </div>
          ) : history.error ? (
            <ErrorMessage message={history.error} onRetry={history.refetch} />
          ) : history.data ? (
            <PriceChart points={history.data.points} />
          ) : null}
        </div>
      </FadeIn>

      {/* Volatility */}
      {volatility && (
        <FadeIn delay={0.1}>
          <div className="surface px-6 py-5">
            <h2 className="font-display text-lg font-semibold mb-4">Volatility</h2>
            <RiskGauge result={volatility} />
          </div>
        </FadeIn>
      )}

      {/* Other currencies quick nav */}
      <FadeIn delay={0.15}>
        <div>
          <h3 className="font-mono text-[11px] uppercase tracking-widest text-ink-muted dark:text-ink-onnightMuted mb-3">
            Compare with
          </h3>
          <div className="flex flex-wrap gap-2">
            {MAJOR_CURRENCIES.filter((c) => c.code !== code && c.code !== base).slice(0, 6).map((c) => (
              <Link
                key={c.code}
                href={`/currencies/${c.code}?base=${base}`}
                className="px-3 py-1.5 surface font-mono text-xs hover:border-amber/60 dark:hover:border-amber-bright/60 transition active:scale-95"
              >
                {c.code}
              </Link>
            ))}
            <Link href="/compare" className="px-3 py-1.5 surface font-mono text-xs text-amber dark:text-amber-bright hover:border-amber/60 transition active:scale-95">
              Full compare →
            </Link>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}

function Stat({ label, value, colored }: { label: string; value: string; colored?: number | null }) {
  const colorClass = colored != null
    ? colored > 0 ? "text-teal dark:text-teal-bright" : colored < 0 ? "text-loss dark:text-loss-bright" : ""
    : "";
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-widest text-ink-muted dark:text-ink-onnightMuted mb-1">{label}</div>
      <div className={`tnum font-mono text-sm font-semibold ${colorClass}`}>{value}</div>
    </div>
  );
}
