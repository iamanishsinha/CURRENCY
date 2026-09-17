import { NextRequest, NextResponse } from "next/server";
import { getHistoricalSeries } from "@/lib/providers/fx";
import { getOrSet, TTL } from "@/lib/cache";
import { ProviderError } from "@/lib/providers/types";
import { isoDateDaysAgo, todayIso } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const base = (searchParams.get("base") ?? "USD").toUpperCase();
  const symbol = (searchParams.get("symbol") ?? "INR").toUpperCase();
  const days = Math.min(Number(searchParams.get("days") ?? "90") || 90, 365 * 20);
  const start = isoDateDaysAgo(days);
  const end = todayIso();
  try {
    const { value, cached } = await getOrSet(
      `fx:history:${base}:${symbol}:${days}`,
      TTL.FX_HISTORY,
      () => getHistoricalSeries(base, symbol, start, end)
    );
    return NextResponse.json({ data: value, cached }, { status: 200 });
  } catch (err) {
    if (err instanceof ProviderError)
      return NextResponse.json({ error: err.message, provider: err.provider }, { status: 502 });
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
