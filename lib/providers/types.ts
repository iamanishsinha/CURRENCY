/**
 * Normalized internal data model. Every provider adapter (FX, crypto, ...)
 * must translate its own response shape into this before it reaches the
 * frontend. The frontend never sees provider-specific JSON directly.
 */

export type DataStatus =
  | "LIVE"
  | "NEAR_LIVE"
  | "DELAYED"
  | "REFERENCE"
  | "HISTORICAL"
  | "STALE"
  | "UNAVAILABLE";

export interface Freshness {
  retrieved_at: string; // ISO timestamp, when CURRENCY fetched this
  provider_timestamp: string; // ISO timestamp, when the provider says the value is from
  status: DataStatus;
  source: string; // human-readable provider name
  frequency: string; // e.g. "daily (ECB reference rate)" or "~ every 2-5 min"
}

export interface MarketObservation {
  asset_id: string; // e.g. "USD", "bitcoin"
  asset_type: "fiat" | "crypto";
  base: string;
  quote: string;
  value: number;
  change_abs: number | null;
  change_pct: number | null;
  day_high: number | null;
  day_low: number | null;
  sparkline: number[] | null; // recent series, same quote unit as value
  freshness: Freshness;
}

export interface HistoricalPoint {
  timestamp: string; // ISO date
  value: number;
}

export interface HistoricalSeries {
  asset_id: string;
  base: string;
  quote: string;
  points: HistoricalPoint[];
  freshness: Freshness;
}

export class ProviderError extends Error {
  constructor(
    message: string,
    public provider: string,
    public status?: number
  ) {
    super(message);
    this.name = "ProviderError";
  }
}
