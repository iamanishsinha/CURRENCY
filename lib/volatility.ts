/**
 * Volatility engine. Every step here is a documented, reproducible formula
 * (Golden Rule for Analytics: "can the score be reproduced from documented
 * inputs and methodology?") -- nothing here is a black box.
 */

export type VolatilityTier = "Low" | "Moderate" | "Elevated" | "High";

/** Day-over-day log returns: ln(P_t / P_t-1). Log returns are used instead
 *  of simple returns because they are time-additive and symmetric for
 *  gains/losses, which is what the annualization step below assumes. */
export function logReturns(prices: number[]): number[] {
  const out: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    if (prices[i - 1] > 0 && prices[i] > 0) {
      out.push(Math.log(prices[i] / prices[i - 1]));
    }
  }
  return out;
}

/** Population standard deviation of a series. */
export function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((a, b) => a + (b - mean) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

export interface VolatilityResult {
  dailyStdDev: number;
  annualizedVolatilityPct: number;
  tier: VolatilityTier;
  sampleSize: number;
  annualizationFactor: number;
}

/**
 * Annualized volatility (%) = daily stdev of log returns * sqrt(periods/yr) * 100.
 * `periodsPerYear` defaults to 365 for assets that trade every day (crypto);
 * pass 252 for fiat pairs, which only have ECB reference rates on business days.
 */
export function computeVolatility(
  prices: number[],
  periodsPerYear: 252 | 365 = 365
): VolatilityResult {
  const returns = logReturns(prices);
  const daily = stdDev(returns);
  const annualizedVolatilityPct = daily * Math.sqrt(periodsPerYear) * 100;
  return {
    dailyStdDev: daily,
    annualizedVolatilityPct,
    tier: tierFor(annualizedVolatilityPct),
    sampleSize: returns.length,
    annualizationFactor: periodsPerYear
  };
}

/**
 * Tier thresholds (annualized volatility %). These are documented,
 * fixed cutoffs -- not a percentile against a live population -- so they
 * stay stable and explainable release to release. Roughly calibrated so
 * major fiat pairs land "Low" and small-cap crypto lands "High".
 */
const TIERS: { max: number; tier: VolatilityTier }[] = [
  { max: 8, tier: "Low" },
  { max: 20, tier: "Moderate" },
  { max: 45, tier: "Elevated" },
  { max: Infinity, tier: "High" }
];

export function tierFor(annualizedVolatilityPct: number): VolatilityTier {
  return TIERS.find((t) => annualizedVolatilityPct <= t.max)!.tier;
}

export const TIER_COLOR: Record<VolatilityTier, string> = {
  Low: "gain",
  Moderate: "brass",
  Elevated: "loss",
  High: "loss"
};
