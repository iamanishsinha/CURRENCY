"use client";
import React from "react";
import Link from "next/link";
import { useApi } from "@/hooks/useApi";
import { MarketObservation } from "@/lib/providers/types";
import { formatRate, formatPrice } from "@/lib/format";
import { MAJOR_CRYPTO } from "@/lib/constants";

export function TickerTape() {
  const fx = useApi<MarketObservation[]>("/api/rates/latest?base=USD", 5 * 60 * 1000);
  const cryptoData = useApi<MarketObservation[]>("/api/crypto/latest", 60 * 1000);

  const fxItems = (fx.data ?? []).slice(0, 7);
  const cryptoItems = (cryptoData.data ?? []).slice(0, 6);
  const allItems = [...fxItems, ...cryptoItems];

  if (allItems.length === 0) return null;

  // Duplicate for seamless infinite loop
  const tapeItems = [...allItems, ...allItems];

  return (
    <div className="w-full overflow-hidden border-b border-hairline/60 dark:border-hairline-night/60 bg-paper-sunken/40 dark:bg-night-sunken/40 backdrop-blur-xs py-1.5 select-none relative group">
      {/* Edge gradient fades */}
      <div className="absolute left-0 top-0 bottom-0 w-8 z-10 pointer-events-none bg-gradient-to-r from-paper dark:from-night to-transparent" />
      <div className="absolute right-0 top-0 bottom-0 w-8 z-10 pointer-events-none bg-gradient-to-l from-paper dark:from-night to-transparent" />

      <div className="flex w-max animate-ticker group-hover:[animation-play-state:paused]">
        {tapeItems.map((o, idx) => {
          const isCrypto = o.asset_type === "crypto";
          const symbol = isCrypto
            ? (MAJOR_CRYPTO.find((c) => c.id === o.asset_id)?.symbol ?? o.asset_id)
            : `USD/${o.asset_id}`;
          const isUp = (o.change_pct ?? 0) >= 0;
          const href = isCrypto ? `/crypto/${o.asset_id}` : `/currencies/${o.asset_id}`;

          return (
            <Link
              key={`${o.asset_id}-${idx}`}
              href={href}
              className="inline-flex items-center gap-2 px-4 py-0.5 mx-1 font-mono text-[11px] rounded hover:bg-paper-raised dark:hover:bg-night-raised transition-colors duration-150"
            >
              <span className="font-semibold text-ink dark:text-ink-onnight">{symbol}</span>
              <span className="tnum text-ink-soft dark:text-ink-onnightSoft">
                {isCrypto ? `$${formatPrice(o.value)}` : formatRate(o.value)}
              </span>
              <span
                className={`text-[10px] font-medium ${
                  isUp ? "text-teal dark:text-teal-bright" : "text-loss dark:text-loss-bright"
                }`}
              >
                {isUp ? "▲ +" : "▼ "}
                {Math.abs(o.change_pct ?? 0).toFixed(2)}%
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
