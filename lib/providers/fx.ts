import {
  MarketObservation,
  HistoricalSeries,
  ProviderError
} from "./types";

/**
 * FX adapter: Frankfurter (https://frankfurter.dev), which republishes the
 * European Central Bank's daily reference rates. Free, no API key.
 *
 * Honesty about freshness: the ECB publishes once per business day around
 * 16:00 CET. This is NOT live or near-live data -- it is correctly labeled
 * REFERENCE everywhere in this file, per the freshness model in the spec.
 * Weekends/holidays repeat the last business day's rates.
 */

const BASE_URL = "https://api.frankfurter.app";
const SOURCE_NAME = "Frankfurter (ECB reference rates)";
const FREQUENCY = "Daily, ~16:00 CET on ECB business days";

async function fx<T>(path: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      signal: controller.signal,
      // Frankfurter payloads are tiny and change at most once/day; let the
      // platform edge cache them briefly on top of our own TTL cache.
      next: { revalidate: 300 }
    });
    if (!res.ok) {
      throw new ProviderError(
        `Frankfurter request failed: ${res.status}`,
        "frankfurter",
        res.status
      );
    }
    return (await res.json()) as T;
  } catch (err) {
    if (err instanceof ProviderError) throw err;
    throw new ProviderError(
      `Frankfurter request errored: ${(err as Error).message}`,
      "frankfurter"
    );
  } finally {
    clearTimeout(timeout);
  }
}

interface FrankfurterCurrencies {
  [code: string]: string;
}

interface FrankfurterRange {
  amount: number;
  base: string;
  start_date: string;
  end_date: string;
  rates: Record<string, Record<string, number>>;
}

interface FrankfurterLatest {
  amount: number;
  base: string;
  date: string;
  rates: Record<string, number>;
}

let currencyNameCache: FrankfurterCurrencies | null = null;

export async function listSupportedCurrencies(): Promise<FrankfurterCurrencies> {
  if (currencyNameCache) return currencyNameCache;
  currencyNameCache = await fx<FrankfurterCurrencies>("/currencies");
  return currencyNameCache;
}

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

/**
 * Latest rates for `base` against `symbols`, plus day-over-day change and a
 * short sparkline, derived from a single ranged request (Frankfurter has no
 * dedicated "change" field, so we compute it from the two most recent
 * available business days).
 */
export async function getLatestWithChange(
  base: string,
  symbols: string[]
): Promise<MarketObservation[]> {
  const start = isoDaysAgo(10);
  const end = isoDaysAgo(0);
  const data = await fx<FrankfurterRange>(
    `/${start}..${end}?from=${base}&to=${symbols.join(",")}`
  );

  const dates = Object.keys(data.rates).sort();
  if (dates.length === 0) {
    throw new ProviderError("No rate data in range", "frankfurter");
  }
  const latestDate = dates[dates.length - 1];
  const prevDate = dates.length > 1 ? dates[dates.length - 2] : latestDate;
  const retrievedAt = new Date().toISOString();

  return symbols.map((symbol) => {
    const value = data.rates[latestDate]?.[symbol];
    const prev = data.rates[prevDate]?.[symbol];
    const sparkline = dates
      .map((d) => data.rates[d]?.[symbol])
      .filter((v): v is number => typeof v === "number");

    if (typeof value !== "number") {
      return {
        asset_id: symbol,
        asset_type: "fiat",
        base,
        quote: symbol,
        value: NaN,
        change_abs: null,
        change_pct: null,
        day_high: null,
        day_low: null,
        sparkline: null,
        freshness: {
          retrieved_at: retrievedAt,
          provider_timestamp: latestDate,
          status: "UNAVAILABLE",
          source: SOURCE_NAME,
          frequency: FREQUENCY
        }
      } satisfies MarketObservation;
    }

    const changeAbs = typeof prev === "number" ? value - prev : null;
    const changePct =
      typeof prev === "number" && prev !== 0
        ? ((value - prev) / prev) * 100
        : null;

    return {
      asset_id: symbol,
      asset_type: "fiat",
      base,
      quote: symbol,
      value,
      change_abs: changeAbs,
      change_pct: changePct,
      day_high: null, // Frankfurter is a daily reference rate; no honest intraday high/low exists
      day_low: null,
      sparkline: sparkline.length > 1 ? sparkline : null,
      freshness: {
        retrieved_at: retrievedAt,
        provider_timestamp: latestDate,
        status: "REFERENCE",
        source: SOURCE_NAME,
        frequency: FREQUENCY
      }
    } satisfies MarketObservation;
  });
}

export async function getHistoricalSeries(
  base: string,
  symbol: string,
  startDate: string,
  endDate: string
): Promise<HistoricalSeries> {
  const data = await fx<FrankfurterRange>(
    `/${startDate}..${endDate}?from=${base}&to=${symbol}`
  );
  const dates = Object.keys(data.rates).sort();
  return {
    asset_id: symbol,
    base,
    quote: symbol,
    points: dates
      .filter((d) => typeof data.rates[d]?.[symbol] === "number")
      .map((d) => ({ timestamp: d, value: data.rates[d][symbol] })),
    freshness: {
      retrieved_at: new Date().toISOString(),
      provider_timestamp: dates[dates.length - 1] ?? endDate,
      status: "HISTORICAL",
      source: SOURCE_NAME,
      frequency: FREQUENCY
    }
  };
}

/** Convert an amount using the latest published rate. */
export async function convertLatest(
  from: string,
  to: string,
  amount: number
): Promise<{ result: number; rate: number; date: string }> {
  const data = await fx<FrankfurterLatest>(
    `/latest?amount=${amount}&from=${from}&to=${to}`
  );
  const result = data.rates[to];
  if (typeof result !== "number") {
    throw new ProviderError(`No rate for ${from}->${to}`, "frankfurter");
  }
  return { result, rate: result / amount, date: data.date };
}

/** Convert using the rate published on (or immediately before) a specific date. */
export async function convertHistorical(
  from: string,
  to: string,
  amount: number,
  date: string
): Promise<{ result: number; rate: number; date: string }> {
  const data = await fx<FrankfurterLatest>(
    `/${date}?amount=${amount}&from=${from}&to=${to}`
  );
  const result = data.rates[to];
  if (typeof result !== "number") {
    throw new ProviderError(`No rate for ${from}->${to} on ${date}`, "frankfurter");
  }
  return { result, rate: result / amount, date: data.date };
}
