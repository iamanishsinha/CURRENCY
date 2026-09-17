import { VolatilityResult } from "@/lib/volatility";

const TIERS = ["Low", "Moderate", "Elevated", "High"] as const;
const TIER_DESC = {
  Low: "This asset has been historically stable.",
  Moderate: "Normal market fluctuations expected.",
  Elevated: "Notable price swings — track carefully.",
  High: "High volatility — significant price swings common."
};

export function RiskGauge({ result }: { result: VolatilityResult }) {
  const activeIdx = TIERS.indexOf(result.tier);
  const pct = Math.min(result.annualizedVolatilityPct, 100);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-ink-soft dark:text-ink-onnightSoft mb-1">
            Annualized Volatility
          </div>
          <div className="flap text-3xl font-bold">
            {result.annualizedVolatilityPct.toFixed(1)}
            <span className="text-base font-normal ml-1 text-ink-soft dark:text-ink-onnightSoft">%</span>
          </div>
        </div>
        <div className={`px-3 py-1.5 rounded-md font-mono text-sm font-bold uppercase tracking-wide ${
          result.tier === "Low" ? "bg-teal/15 text-teal dark:text-teal-bright"
          : result.tier === "Moderate" ? "bg-amber/15 text-amber dark:text-amber-bright"
          : "bg-loss/15 text-loss dark:text-loss-bright"
        }`}>
          {result.tier}
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-2 w-full rounded-full bg-paper-sunken dark:bg-night-sunken overflow-hidden">
        <div
          className={`absolute left-0 top-0 h-full rounded-full transition-[width] duration-700 ${
            result.tier === "Low" ? "bg-teal dark:bg-teal-bright"
            : result.tier === "Moderate" ? "bg-amber dark:bg-amber-bright"
            : "bg-loss dark:bg-loss-bright"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Tier stops */}
      <div className="grid grid-cols-4 gap-1">
        {TIERS.map((tier, i) => (
          <div key={tier} className="flex flex-col gap-1">
            <div className={`h-1 rounded-full ${
              i <= activeIdx
                ? (activeIdx <= 1 ? "bg-amber dark:bg-amber-bright" : "bg-loss dark:bg-loss-bright")
                : "bg-paper-sunken dark:bg-night-sunken"
            }`} />
            <span className={`font-mono text-[10px] uppercase tracking-wide ${
              i === activeIdx
                ? "text-ink dark:text-ink-onnight font-semibold"
                : "text-ink-muted dark:text-ink-onnightMuted"
            }`}>{tier}</span>
          </div>
        ))}
      </div>

      <p className="text-xs text-ink-soft dark:text-ink-onnightSoft">
        {TIER_DESC[result.tier]} Based on {result.sampleSize} daily log returns,
        annualized with √{result.annualizationFactor}. Historical measure — not a forecast.
      </p>
    </div>
  );
}
