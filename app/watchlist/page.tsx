"use client";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useApi } from "@/hooks/useApi";
import { Board } from "@/components/Board";
import { BoardRow } from "@/components/BoardRow";
import { LoadingRows, EmptyMessage } from "@/components/StatusMessage";
import { FadeIn, StaggerList, StaggerItem } from "@/components/PageTransition";
import { MAJOR_CURRENCIES, MAJOR_CRYPTO, DEFAULT_BASE } from "@/lib/constants";
import { MarketObservation } from "@/lib/providers/types";
import Link from "next/link";

export default function WatchlistPage() {
  const { watchlist } = useWatchlist();
  const fx = useApi<MarketObservation[]>(`/api/rates/latest?base=${DEFAULT_BASE}`, 5 * 60 * 1000);
  const cryptoData = useApi<MarketObservation[]>("/api/crypto/latest", 45 * 1000);

  const watchedFiatCodes = new Set(
    watchlist.filter((w) => w.type === "fiat").map((w) => w.id.toUpperCase())
  );
  const watchedCryptoIds = new Set(
    watchlist.filter((w) => w.type === "crypto").map((w) => w.id.toLowerCase())
  );

  const watchedFx = (fx.data ?? []).filter((o) => watchedFiatCodes.has(o.asset_id));
  const watchedCrypto = (cryptoData.data ?? []).filter((o) => watchedCryptoIds.has(o.asset_id));

  const hasItems = watchlist.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <FadeIn>
        <div>
          <h1 className="font-display text-3xl font-bold">Watchlist</h1>
          <p className="mt-1 text-sm text-ink-soft dark:text-ink-onnightSoft">
            Your pinned currencies and cryptocurrencies saved locally.
          </p>
        </div>
      </FadeIn>

      {!hasItems ? (
        <FadeIn delay={0.1}>
          <div className="surface p-8 text-center flex flex-col items-center gap-3">
            <span className="text-3xl">★</span>
            <h3 className="font-display text-lg font-semibold">No items in your watchlist</h3>
            <p className="text-xs text-ink-soft dark:text-ink-onnightSoft max-w-sm">
              Click the star icon next to any currency or crypto to track its real-time prices right here.
            </p>
            <div className="flex gap-3 mt-2">
              <Link
                href="/currencies"
                className="px-3 py-1.5 rounded-md bg-amber text-white dark:bg-amber-bright dark:text-night font-mono text-xs uppercase"
              >
                Browse Currencies
              </Link>
              <Link
                href="/crypto"
                className="px-3 py-1.5 rounded-md border border-hairline dark:border-hairline-night font-mono text-xs uppercase"
              >
                Browse Crypto
              </Link>
            </div>
          </div>
        </FadeIn>
      ) : (
        <div className="flex flex-col gap-8">
          {watchedFiatCodes.size > 0 && (
            <FadeIn delay={0.1}>
              <Board title="Watched Currencies">
                {fx.loading && !fx.data ? (
                  <LoadingRows count={watchedFiatCodes.size} />
                ) : watchedFx.length > 0 ? (
                  <StaggerList>
                    {watchedFx.map((o) => {
                      const meta = MAJOR_CURRENCIES.find((c) => c.code === o.asset_id);
                      return (
                        <StaggerItem key={o.asset_id}>
                          <BoardRow
                            href={`/currencies/${o.asset_id}`}
                            code={o.asset_id}
                            name={meta?.name ?? o.asset_id}
                            observation={o}
                          />
                        </StaggerItem>
                      );
                    })}
                  </StaggerList>
                ) : (
                  <EmptyMessage message="Loading watched currencies..." />
                )}
              </Board>
            </FadeIn>
          )}

          {watchedCryptoIds.size > 0 && (
            <FadeIn delay={0.15}>
              <Board title="Watched Crypto">
                {cryptoData.loading && !cryptoData.data ? (
                  <LoadingRows count={watchedCryptoIds.size} />
                ) : watchedCrypto.length > 0 ? (
                  <StaggerList>
                    {watchedCrypto.map((o) => {
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
                  <EmptyMessage message="Loading watched crypto..." />
                )}
              </Board>
            </FadeIn>
          )}
        </div>
      )}
    </div>
  );
}
