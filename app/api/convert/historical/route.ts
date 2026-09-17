import { NextRequest, NextResponse } from "next/server";
import { convert } from "@/lib/convert";
import { ProviderError } from "@/lib/providers/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { fromType, from, toType, to, amount, date } = body as Record<
    string,
    unknown
  >;
  if (
    (fromType !== "fiat" && fromType !== "crypto") ||
    (toType !== "fiat" && toType !== "crypto") ||
    typeof from !== "string" ||
    typeof to !== "string" ||
    typeof amount !== "number" ||
    !Number.isFinite(amount) ||
    amount < 0 ||
    typeof date !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date)
  ) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (new Date(date).getTime() > Date.now()) {
    return NextResponse.json(
      { error: "Date cannot be in the future" },
      { status: 400 }
    );
  }

  try {
    const result = await convert({ fromType, from, toType, to, amount, date });
    return NextResponse.json({ data: result }, { status: 200 });
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
