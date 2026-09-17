import { NextResponse } from "next/server";
import { getLatestWithChange } from "@/lib/providers/fx";
import { getLatestMarkets } from "@/lib/providers/crypto";
import { getOrSet, TTL } from "@/lib/cache";
import { MAJOR_CURRENCIES, MAJOR_CRYPTO, DEFAULT_BASE } from "@/lib/constants";
import { MarketObservation } from "@/lib/providers/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [fx, cryptoObs] = await Promise.all([
      getOrSet(
        `fx:latest:${DEFAULT_BASE}:movers`,
        TTL.FX_LATEST,
        () =>
          getLatestWithChange(
            DEFAULT_BASE,
            MAJOR_CURRENCIES.filter((c) => c.code !== DEFAULT_BASE).map(
              (c) => c.code
            )
          )
      ),
      getOrSet(
        `crypto:latest:movers`,
        TTL.CRYPTO_LATEST,
        () => getLatestMarkets(MAJOR_CRYPTO.map((c) => c.id), "usd")
      )
    ]);

    const all: MarketObservation[] = [...fx.value, ...cryptoObs.value].filter(
      (o) => o.change_pct !== null && Number.isFinite(o.change_pct)
    );
    const sorted = [...all].sort(
      (a, b) => Math.abs(b.change_pct!) - Math.abs(a.change_pct!)
    );

    return NextResponse.json(
      {
        data: {
          gainers: [...all]
            .filter((o) => (o.change_pct ?? 0) > 0)
            .sort((a, b) => (b.change_pct ?? 0) - (a.change_pct ?? 0))
            .slice(0, 5),
          losers: [...all]
            .filter((o) => (o.change_pct ?? 0) < 0)
            .sort((a, b) => (a.change_pct ?? 0) - (b.change_pct ?? 0))
            .slice(0, 5),
          mostActive: sorted.slice(0, 6)
        }
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
