"use client";
import { memo } from "react";
import { formatPct } from "@/lib/format";

function RateBadgeBase({ changePct }: { changePct: number | null }) {
  if (changePct === null || !Number.isFinite(changePct)) {
    return <span className="font-mono text-xs text-ink-muted dark:text-ink-onnightMuted">—</span>;
  }
  const isUp = changePct > 0;
  const isFlat = changePct === 0;

  if (isFlat) return (
    <span className="tnum font-mono text-xs text-ink-muted dark:text-ink-onnightMuted">→ 0.00%</span>
  );

  return (
    <span className={`tnum font-mono text-xs font-medium inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-xs ${
      isUp
        ? "bg-gain/10 text-teal dark:text-teal-bright"
        : "bg-loss/10 text-loss dark:text-loss-bright"
    }`}>
      {isUp ? "▲" : "▼"} {formatPct(changePct)}
    </span>
  );
}

function areEqual(
  prev: { changePct: number | null },
  next: { changePct: number | null }
) {
  return prev.changePct === next.changePct;
}

export const RateBadge = memo(RateBadgeBase, areEqual);
