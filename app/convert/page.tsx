"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Converter } from "@/components/Converter";
import { LoadingRows } from "@/components/StatusMessage";
import { FadeIn } from "@/components/PageTransition";

export default function ConvertPage() {
  return (
    <Suspense fallback={<LoadingRows count={1} />}>
      <ConvertContent />
    </Suspense>
  );
}

function ConvertContent() {
  const searchParams = useSearchParams();
  const fromType = (searchParams.get("fromType") as "fiat" | "crypto") ?? "fiat";
  const from = searchParams.get("from") ?? "USD";
  const toType = (searchParams.get("toType") as "fiat" | "crypto") ?? "fiat";
  const to = searchParams.get("to") ?? "INR";

  return (
    <div className="flex flex-col gap-8">
      <FadeIn>
        <div>
          <h1 className="font-display text-3xl font-bold">Convert</h1>
          <p className="mt-1.5 text-sm text-ink-soft dark:text-ink-onnightSoft">
            Fiat ↔ crypto ↔ fiat — live rates or a specific past date.
          </p>
        </div>
      </FadeIn>
      <FadeIn delay={0.08}>
        <Converter initialFromType={fromType} initialFrom={from} initialToType={toType} initialTo={to} />
      </FadeIn>
    </div>
  );
}
