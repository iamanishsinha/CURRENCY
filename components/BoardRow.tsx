import { memo } from "react";
import Link from "next/link";
import { MarketObservation } from "@/lib/providers/types";
import { formatRate, formatPrice } from "@/lib/format";
import { RateBadge } from "./RateBadge";
import { MiniSparkline } from "./MiniSparkline";
import { WatchlistStar } from "./WatchlistStar";

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$", EUR: "€", GBP: "£", JPY: "¥", INR: "₹",
  CNY: "¥", CHF: "₣", CAD: "$", AUD: "$", SGD: "$"
};

const CRYPTO_SYMBOLS: Record<string, string> = {
  BTC: "₿", ETH: "Ξ", BNB: "B", SOL: "◎",
  XRP: "✕", ADA: "₳", DOGE: "Ð", USDT: "₮"
};

interface BoardRowProps {
  href: string;
  code: string;
  name: string;
  observation: MarketObservation;
  isCrypto?: boolean;
  highlight?: boolean;
}

function BoardRowBase({
  href, code, name, observation, isCrypto = false, highlight = false
}: BoardRowProps) {
  const sym = isCrypto ? (CRYPTO_SYMBOLS[code] ?? code[0]) : (CURRENCY_SYMBOLS[code] ?? code[0]);
  const displayValue = isCrypto ? formatPrice(observation.value) : formatRate(observation.value);

  return (
    <Link
      href={href}
      className={`group grid grid-cols-[auto_1fr_auto_auto] sm:grid-cols-[auto_1fr_96px_auto_auto] items-center gap-3 px-4 py-3.5 transition-colors duration-200 border-b border-hairline last:border-b-0 dark:border-hairline-night hover:bg-amber/4 dark:hover:bg-amber-bright/4 ${
        highlight ? "bg-amber/5 dark:bg-amber-bright/5" : ""
      }`}
    >
      {/* Star + Symbol badge */}
      <div className="flex items-center gap-1.5">
        <WatchlistStar id={observation.asset_id} type={observation.asset_type} label={code} />
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg font-bold transition-transform duration-200 group-hover:scale-110 ${
          highlight
            ? "bg-amber/20 text-amber dark:bg-amber-bright/20 dark:text-amber-bright"
            : "bg-paper-sunken dark:bg-night-sunken text-ink-soft dark:text-ink-onnightSoft"
        }`}>
          {sym}
        </div>
      </div>

      {/* Name */}
      <div className="min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-sm font-semibold tracking-wide">{code}</span>
          <span className="hidden sm:inline truncate text-xs text-ink-soft dark:text-ink-onnightSoft">{name}</span>
        </div>
        {highlight && (
          <span className="font-mono text-[9px] uppercase tracking-widest text-amber dark:text-amber-bright">Featured</span>
        )}
      </div>

      {/* Sparkline */}
      <div className="hidden sm:block">
        <MiniSparkline values={observation.sparkline} />
      </div>

      {/* Rate */}
      <div className="tnum text-right font-mono text-sm font-medium">
        {isCrypto ? "$" : ""}{displayValue}
      </div>

      {/* Change */}
      <div className="text-right">
        <RateBadge changePct={observation.change_pct} />
      </div>
    </Link>
  );
}

export function areBoardRowPropsEqual(prev: BoardRowProps, next: BoardRowProps) {
  if (
    prev.href !== next.href ||
    prev.code !== next.code ||
    prev.name !== next.name ||
    prev.isCrypto !== next.isCrypto ||
    prev.highlight !== next.highlight
  ) return false;

  const a = prev.observation;
  const b = next.observation;
  if (a === b) return true;
  if (a.value !== b.value || a.change_pct !== b.change_pct || a.freshness.status !== b.freshness.status) {
    return false;
  }
  if (a.sparkline === b.sparkline) return true;
  if (!a.sparkline || !b.sparkline) return a.sparkline === b.sparkline;
  if (a.sparkline.length !== b.sparkline.length) return false;
  return a.sparkline.every((v, i) => v === b.sparkline![i]);
}

export const BoardRow = memo(BoardRowBase, areBoardRowPropsEqual);
