"use client";
import { useEffect, useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { MAJOR_CURRENCIES, MAJOR_CRYPTO } from "@/lib/constants";
import { formatRate, formatPrice, todayIso, isoDateDaysAgo } from "@/lib/format";
import { Button } from "./Button";
import { toast } from "./Toast";
import { ConversionTimeline } from "./ConversionTimeline";
import { AnimatedNumber } from "./AnimatedNumber";

type AssetType = "fiat" | "crypto";
interface ConvertResponse { amount: number; result: number; rate: number; date: string; isHistorical: boolean; note?: string; }

function AssetSelect({ type, value, onChange }: { type: AssetType; value: string; onChange: (v: string) => void }) {
  const options = type === "fiat"
    ? MAJOR_CURRENCIES.map((c) => ({ value: c.code, label: `${c.code} — ${c.name}` }))
    : MAJOR_CRYPTO.map((c) => ({ value: c.id, label: `${c.symbol} — ${c.name}` }));
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2.5 rounded-lg border border-hairline dark:border-hairline-night bg-paper-raised dark:bg-night-raised font-mono text-sm focus:outline-none focus:border-amber dark:focus:border-amber-bright transition-colors">
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function TypeTabs({ value, onChange }: { value: AssetType; onChange: (t: AssetType) => void }) {
  return (
    <div className="flex rounded-md overflow-hidden border border-hairline dark:border-hairline-night w-fit">
      {(["fiat", "crypto"] as const).map((t) => (
        <button key={t} onClick={() => onChange(t)}
          className={`px-3 py-1 font-mono text-[10px] uppercase tracking-widest transition duration-200 ${
            value === t ? "bg-amber text-white dark:bg-amber-bright dark:text-night" : "text-ink-soft dark:text-ink-onnightSoft hover:bg-paper-sunken dark:hover:bg-night-sunken"
          }`}>
          {t}
        </button>
      ))}
    </div>
  );
}

function labelFor(type: AssetType, id: string) {
  if (type === "fiat") return id;
  return MAJOR_CRYPTO.find((c) => c.id === id)?.symbol ?? id;
}

export function Converter({ initialFromType = "fiat", initialFrom = "USD", initialToType = "fiat", initialTo = "INR" }: {
  initialFromType?: AssetType; initialFrom?: string; initialToType?: AssetType; initialTo?: string;
}) {
  const [fromType, setFromType] = useState<AssetType>(initialFromType);
  const [from, setFrom] = useState(initialFrom);
  const [toType, setToType] = useState<AssetType>(initialToType);
  const [to, setTo] = useState(initialTo);
  const [amount, setAmount] = useState("1");
  const [historical, setHistorical] = useState(false);
  const [date, setDate] = useState(isoDateDaysAgo(30));
  const [result, setResult] = useState<ConvertResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTimeline, setShowTimeline] = useState(false);

  useEffect(() => {
    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed < 0 || from === to) { setResult(null); return; }
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    const path = historical ? "/api/convert/historical" : "/api/convert";
    const body: Record<string, unknown> = { fromType, from, toType, to, amount: parsed };
    if (historical) body.date = date;
    fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal: controller.signal })
      .then(async (res) => { const json = await res.json(); if (!res.ok) throw new Error(json.error ?? "Failed"); setResult(json.data); })
      .catch((err) => { if (err.name !== "AbortError") setError(err.message); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [fromType, from, toType, to, amount, historical, date]);

  const swap = () => { setFromType(toType); setToType(fromType); setFrom(to); setTo(from); };

  const copyRate = () => {
    if (!result) return;
    const text = `1 ${labelFor(fromType, from)} = ${formatRate(result.rate)} ${labelFor(toType, to)} (${result.date})`;
    navigator.clipboard.writeText(text).catch(() => {});
    toast.gain("Rate copied to clipboard!");
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="surface px-6 py-6 flex flex-col gap-6">
        {/* From / To */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_48px_1fr] items-end gap-4">
          <div className="flex flex-col gap-2">
            <label className="font-mono text-[10px] uppercase tracking-widest text-ink-muted dark:text-ink-onnightMuted">From</label>
            <TypeTabs value={fromType} onChange={(t) => { setFromType(t); setFrom(t === "fiat" ? "USD" : "bitcoin"); }} />
            <AssetSelect type={fromType} value={from} onChange={setFrom} />
          </div>

          <div className="flex justify-center pb-1">
            <button onClick={swap} aria-label="Swap currencies" className="w-10 h-10 rounded-full border border-hairline dark:border-hairline-night flex items-center justify-center font-mono text-lg hover:border-amber dark:hover:border-amber-bright hover:text-amber dark:hover:text-amber-bright transition duration-200 active:scale-90 active:rotate-180">
              ⇄
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-mono text-[10px] uppercase tracking-widest text-ink-muted dark:text-ink-onnightMuted">To</label>
            <TypeTabs value={toType} onChange={(t) => { setToType(t); setTo(t === "fiat" ? "INR" : "bitcoin"); }} />
            <AssetSelect type={toType} value={to} onChange={setTo} />
          </div>
        </div>

        {/* Amount + date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="font-mono text-[10px] uppercase tracking-widest text-ink-muted dark:text-ink-onnightMuted">Amount</label>
            <input type="number" min="0" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)}
              className="px-3 py-2.5 rounded-lg border border-hairline dark:border-hairline-night bg-paper-raised dark:bg-night-raised font-mono text-sm tnum focus:outline-none focus:border-amber dark:focus:border-amber-bright transition-colors" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-ink-muted dark:text-ink-onnightMuted cursor-pointer">
              <input type="checkbox" checked={historical} onChange={(e) => setHistorical(e.target.checked)} className="accent-amber" />
              Historical date
            </label>
            <input type="date" value={date} max={todayIso()} disabled={!historical} onChange={(e) => setDate(e.target.value)}
              className="px-3 py-2.5 rounded-lg border border-hairline dark:border-hairline-night bg-paper-raised dark:bg-night-raised font-mono text-sm tnum focus:outline-none focus:border-amber dark:focus:border-amber-bright transition-colors disabled:opacity-40" />
          </div>
        </div>

        {/* Result */}
        <div className="border-t border-hairline dark:border-hairline-night pt-5">
          <AnimatePresence mode="wait">
            {from === to && fromType === toType ? (
              <m.p key="same" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm text-ink-soft dark:text-ink-onnightSoft">
                Pick two different assets.
              </m.p>
            ) : loading ? (
              <m.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3">
                <div className="skeleton h-10 w-48 rounded" />
              </m.div>
            ) : error ? (
              <m.p key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-loss dark:text-loss-bright">⚠ {error}</m.p>
            ) : result ? (
              <m.div key="result" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <div className="flap text-4xl font-bold">
                  <AnimatedNumber value={result.result} formatFn={formatPrice} />
                  <span className="text-base font-normal ml-2 text-ink-soft dark:text-ink-onnightSoft">{labelFor(toType, to)}</span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <span className="font-mono text-xs text-ink-soft dark:text-ink-onnightSoft">
                    1 {labelFor(fromType, from)} = {formatRate(result.rate)} {labelFor(toType, to)}
                  </span>
                  <span className="font-mono text-[10px] text-ink-muted dark:text-ink-onnightMuted">
                    {result.isHistorical ? `Rate on ${result.date}` : `Rate as of ${result.date}`}
                  </span>
                  <button onClick={copyRate} title="Copy rate to clipboard"
                    className="font-mono text-[10px] text-amber dark:text-amber-bright hover:underline">
                    Copy rate
                  </button>
                  <button
                    onClick={() => setShowTimeline((prev) => !prev)}
                    className="font-mono text-[10px] text-ink-soft dark:text-ink-onnightSoft underline hover:text-amber dark:hover:text-amber-bright ml-2"
                  >
                    {showTimeline ? "Hide timeline" : "Show 1-year history"}
                  </button>
                </div>
                {result.note && <p className="mt-2 font-mono text-[11px] text-ink-muted dark:text-ink-onnightMuted">{result.note}</p>}
              </m.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      {/* Historical conversion timeline */}
      {showTimeline && (
        <ConversionTimeline fromType={fromType} from={from} toType={toType} to={to} />
      )}
    </div>
  );
}
