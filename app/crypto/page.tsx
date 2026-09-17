"use client";
import { useApi } from "@/hooks/useApi";
import { Board } from "@/components/Board";
import { BoardRow } from "@/components/BoardRow";
import { LoadingRows, ErrorMessage, EmptyMessage } from "@/components/StatusMessage";
import { FadeIn, StaggerList, StaggerItem } from "@/components/PageTransition";
import { MAJOR_CRYPTO } from "@/lib/constants";
import { MarketObservation } from "@/lib/providers/types";

export default function CryptoPage() {
  const cryptoData = useApi<MarketObservation[]>("/api/crypto/latest", 45 * 1000);

  return (
    <div className="flex flex-col gap-6">
      <FadeIn>
        <div>
          <h1 className="font-display text-3xl font-bold">Crypto</h1>
          <p className="mt-1 text-sm text-ink-soft dark:text-ink-onnightSoft">
            Prices in USD via CoinGecko — refreshed every ~45 seconds.
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={0.08}>
        <Board title="Market">
          {cryptoData.loading && !cryptoData.data ? (
            <LoadingRows count={MAJOR_CRYPTO.length} />
          ) : cryptoData.error ? (
            <ErrorMessage message={cryptoData.error} onRetry={cryptoData.refetch} />
          ) : cryptoData.data && cryptoData.data.length > 0 ? (
            <StaggerList>
              {cryptoData.data.map((o) => {
                const meta = MAJOR_CRYPTO.find((c) => c.id === o.asset_id);
                return (
                  <StaggerItem key={o.asset_id}>
                    <BoardRow
                      href={`/crypto/${o.asset_id}`}
                      code={meta?.symbol ?? o.asset_id}
                      name={meta?.name ?? o.asset_id}
                      observation={o}
                      isCrypto
                    />
                  </StaggerItem>
                );
              })}
            </StaggerList>
          ) : (
            <EmptyMessage message="No crypto data available." />
          )}
        </Board>
      </FadeIn>
    </div>
  );
}
