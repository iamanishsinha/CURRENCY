import * as fx from "./providers/fx";
import * as crypto from "./providers/crypto";
import { toDdMmYyyy } from "./providers/crypto";
import { ProviderError } from "./providers/types";

export type AssetType = "fiat" | "crypto";

export interface ConvertRequest {
  fromType: AssetType;
  from: string; // ISO code for fiat, CoinGecko id for crypto
  toType: AssetType;
  to: string;
  amount: number;
  date?: string; // ISO yyyy-mm-dd; omit for latest
}

export interface ConvertResult {
  amount: number;
  result: number;
  rate: number;
  date: string;
  isHistorical: boolean;
  note?: string;
}

/**
 * Handles all four combinations (fiat->fiat, crypto->fiat, fiat->crypto,
 * crypto->crypto). Crypto legs always route through USD as a common unit
 * when the target isn't directly quotable, so the math stays auditable.
 */
export async function convert(req: ConvertRequest): Promise<ConvertResult> {
  const { fromType, from, toType, to, amount, date } = req;
  const isHistorical = Boolean(date);

  if (fromType === "fiat" && toType === "fiat") {
    const r = isHistorical
      ? await fx.convertHistorical(from, to, amount, date!)
      : await fx.convertLatest(from, to, amount);
    return { amount, result: r.result, rate: r.rate, date: r.date, isHistorical };
  }

  if (fromType === "crypto" && toType === "fiat") {
    const price = isHistorical
      ? await crypto.getHistoricalPrice(from, to, toDdMmYyyy(date!))
      : (await crypto.getLatestMarkets([from], to))[0]?.value;
    if (typeof price !== "number") {
      throw new ProviderError(`No price for ${from} in ${to}`, "coingecko");
    }
    return {
      amount,
      result: amount * price,
      rate: price,
      date: date ?? new Date().toISOString().slice(0, 10),
      isHistorical
    };
  }

  if (fromType === "fiat" && toType === "crypto") {
    // Invert a crypto->fiat quote rather than duplicating provider calls.
    const inverse = await convert({
      fromType: "crypto",
      from: to,
      toType: "fiat",
      to: from,
      amount: 1,
      date
    });
    const rate = 1 / inverse.result;
    return {
      amount,
      result: amount * rate,
      rate,
      date: inverse.date,
      isHistorical
    };
  }

  // crypto -> crypto: price both legs in USD, then take the ratio.
  const [fromUsd, toUsd] = await Promise.all([
    isHistorical
      ? crypto.getHistoricalPrice(from, "usd", toDdMmYyyy(date!))
      : (await crypto.getLatestMarkets([from], "usd"))[0]?.value,
    isHistorical
      ? crypto.getHistoricalPrice(to, "usd", toDdMmYyyy(date!))
      : (await crypto.getLatestMarkets([to], "usd"))[0]?.value
  ]);
  if (typeof fromUsd !== "number" || typeof toUsd !== "number" || toUsd === 0) {
    throw new ProviderError(`No USD price for ${from} or ${to}`, "coingecko");
  }
  const rate = fromUsd / toUsd;
  return {
    amount,
    result: amount * rate,
    rate,
    date: date ?? new Date().toISOString().slice(0, 10),
    isHistorical,
    note: "Derived via USD (CoinGecko does not directly quote every crypto pair)."
  };
}
