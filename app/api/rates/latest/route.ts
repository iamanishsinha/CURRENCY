import { NextRequest, NextResponse } from "next/server";
import { getLatestWithChange } from "@/lib/providers/fx";
import { getOrSet, TTL } from "@/lib/cache";
import { ProviderError } from "@/lib/providers/types";
import { MAJOR_CURRENCIES } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const base = (searchParams.get("base") ?? "USD").toUpperCase();
  const symbolsParam = searchParams.get("symbols");
  const symbols = (
    symbolsParam
      ? symbolsParam.split(",")
      : MAJOR_CURRENCIES.map((c) => c.code)
  )
    .map((s) => s.toUpperCase())
    .filter((s) => s !== base);

  try {
    const { value, cached } = await getOrSet(
      `fx:latest:${base}:${symbols.join(",")}`,
      TTL.FX_LATEST,
      () => getLatestWithChange(base, symbols)
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
