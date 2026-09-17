import { MarketObservation, HistoricalSeries, ProviderError } from "./types";

/**
 * Crypto adapter: CoinGecko public API. Free, no API key, but rate-limited
 * (roughly 10-30 req/min on the public tier) -- every call site goes
 * through lib/cache.ts so a burst of page loads doesn't burn the quota.
 */

const BASE_URL = "https://api.coingecko.com/api/v3";
const SOURCE_NAME = "CoinGecko";
const FREQUENCY = "~ every 1-5 min (CoinGecko public tier)";

async function cg<T>(path: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      signal: controller.signal,
      next: { revalidate: 45 }
    });
    if (!res.ok) {
      throw new ProviderError(
        `CoinGecko request failed: ${res.status}`,
        "coingecko",
        res.status
      );
    }
    return (await res.json()) as T;
  } catch (err) {
    if (err instanceof ProviderError) throw err;
    throw new ProviderError(
      `CoinGecko request errored: ${(err as Error).message}`,
      "coingecko"
    );
  } finally {
    clearTimeout(timeout);
  }
}

interface CoinGeckoMarket {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  high_24h: number | null;
  low_24h: number | null;
  price_change_24h: number | null;
  price_change_percentage_24h: number | null;
  market_cap: number | null;
  total_volume: number | null;
  last_updated: string;
  sparkline_in_7d?: { price: number[] };
}

export async function getLatestMarkets(
  ids: string[],
  vsCurrency = "usd"
): Promise<MarketObservation[]> {
  const data = await cg<CoinGeckoMarket[]>(
    `/coins/markets?vs_currency=${vsCurrency}&ids=${ids.join(
      ","
    )}&sparkline=true&price_change_percentage=24h`
  );
  const retrievedAt = new Date().toISOString();

  // preserve caller's requested order; CoinGecko does not guarantee it
  const byId = new Map(data.map((d) => [d.id, d]));
  return ids
    .map((id) => byId.get(id))
    .filter((d): d is CoinGeckoMarket => Boolean(d))
    .map((d) => ({
      asset_id: d.id,
      asset_type: "crypto",
      base: d.id,
      quote: vsCurrency.toUpperCase(),
      value: d.current_price,
      change_abs: d.price_change_24h,
      change_pct: d.price_change_percentage_24h,
      day_high: d.high_24h,
      day_low: d.low_24h,
      sparkline: d.sparkline_in_7d?.price ?? null,
      freshness: {
        retrieved_at: retrievedAt,
        provider_timestamp: d.last_updated,
        status: "NEAR_LIVE",
        source: SOURCE_NAME,
        frequency: FREQUENCY
      }
    }));
}

interface MarketChart {
  prices: [number, number][];
}

export async function getHistoricalSeries(
  id: string,
  vsCurrency: string,
  days: number
): Promise<HistoricalSeries> {
  const data = await cg<MarketChart>(
    `/coins/${id}/market_chart?vs_currency=${vsCurrency}&days=${days}`
  );
  return {
    asset_id: id,
    base: id,
    quote: vsCurrency.toUpperCase(),
    points: data.prices.map(([ts, value]) => ({
      timestamp: new Date(ts).toISOString(),
      value
    })),
    freshness: {
      retrieved_at: new Date().toISOString(),
      provider_timestamp:
        data.prices.length > 0
          ? new Date(data.prices[data.prices.length - 1][0]).toISOString()
          : new Date().toISOString(),
      status: "HISTORICAL",
      source: SOURCE_NAME,
      frequency: FREQUENCY
    }
  };
}

interface CoinGeckoHistory {
  market_data?: { current_price: Record<string, number> };
}

/** Price of `id` in `vsCurrency` on a specific past date (dd-mm-yyyy). */
export async function getHistoricalPrice(
  id: string,
  vsCurrency: string,
  ddmmyyyy: string
): Promise<number> {
  const data = await cg<CoinGeckoHistory>(
    `/coins/${id}/history?date=${ddmmyyyy}&localization=false`
  );
  const price = data.market_data?.current_price?.[vsCurrency.toLowerCase()];
  if (typeof price !== "number") {
    throw new ProviderError(
      `No historical price for ${id} on ${ddmmyyyy}`,
      "coingecko"
    );
  }
  return price;
}

export function toDdMmYyyy(isoDate: string): string {
  const [y, m, d] = isoDate.split("-");
  return `${d}-${m}-${y}`;
}
