import { NextRequest, NextResponse } from "next/server";
import { getHistoricalSeries } from "@/lib/providers/crypto";
import { getOrSet, TTL } from "@/lib/cache";
import { ProviderError } from "@/lib/providers/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id") ?? "bitcoin";
  const vs = (searchParams.get("vs") ?? "usd").toLowerCase();
  const days = Math.min(Number(searchParams.get("days") ?? "90") || 90, 365 * 5);
  try {
    const { value, cached } = await getOrSet(
      `crypto:history:${id}:${vs}:${days}`,
      TTL.CRYPTO_HISTORY,
      () => getHistoricalSeries(id, vs, days)
    );
    return NextResponse.json({ data: value, cached }, { status: 200 });
  } catch (err) {
    if (err instanceof ProviderError)
      return NextResponse.json({ error: err.message, provider: err.provider }, { status: 502 });
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
