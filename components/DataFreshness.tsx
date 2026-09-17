import { Freshness } from "@/lib/providers/types";
import { relativeTime } from "@/lib/format";

const STATUS_DOT: Record<Freshness["status"], string> = {
  LIVE: "bg-teal-bright animate-pulse",
  NEAR_LIVE: "bg-teal dark:bg-teal-bright",
  DELAYED: "bg-amber dark:bg-amber-bright",
  REFERENCE: "bg-ink-soft dark:bg-ink-onnightSoft",
  HISTORICAL: "bg-ink-muted dark:bg-ink-onnightMuted",
  STALE: "bg-loss dark:bg-loss-bright",
  UNAVAILABLE: "bg-loss dark:bg-loss-bright"
};

const STATUS_LABEL: Record<Freshness["status"], string> = {
  LIVE: "Live", NEAR_LIVE: "Near-live", DELAYED: "Delayed",
  REFERENCE: "Reference", HISTORICAL: "Historical", STALE: "Stale", UNAVAILABLE: "Unavailable"
};

export function DataFreshness({ freshness, compact = false }: { freshness: Freshness; compact?: boolean }) {
  const title = `${freshness.source} · ${freshness.frequency} · fetched ${relativeTime(freshness.retrieved_at)}`;

  if (compact) return (
    <span title={title} className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-ink-muted dark:text-ink-onnightMuted">
      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[freshness.status]}`} />
      {STATUS_LABEL[freshness.status]}
    </span>
  );

  return (
    <div title={title} className="flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono text-[11px] text-ink-soft dark:text-ink-onnightSoft">
      <span className="inline-flex items-center gap-1">
        <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[freshness.status]}`} />
        <span className="uppercase tracking-widest">{STATUS_LABEL[freshness.status]}</span>
      </span>
      <span aria-hidden>·</span>
      <span>{freshness.source}</span>
      <span aria-hidden>·</span>
      <span>updated {relativeTime(freshness.provider_timestamp)}</span>
    </div>
  );
}
