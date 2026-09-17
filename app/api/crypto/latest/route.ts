import { NextRequest, NextResponse } from "next/server";
import { getLatestMarkets } from "@/lib/providers/crypto";
import { getOrSet, TTL } from "@/lib/cache";
import { ProviderError } from "@/lib/providers/types";
import { MAJOR_CRYPTO } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const idsParam = searchParams.get("ids");
  const ids = idsParam ? idsParam.split(",") : MAJOR_CRYPTO.map((c) => c.id);
  const vs = (searchParams.get("vs") ?? "usd").toLowerCase();

  try {
    const { value, cached } = await getOrSet(
      `crypto:latest:${ids.join(",")}:${vs}`,
      TTL.CRYPTO_LATEST,
      () => getLatestMarkets(ids, vs)
    );
    return NextResponse.json({ data: value, cached }, { status: 200 });
  } catch (err) {
    if (err instanceof ProviderError) {
      return NextResponse.json(
        { error: err.message, provider: err.provider },
        { status: 502 }
      );
    }
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
