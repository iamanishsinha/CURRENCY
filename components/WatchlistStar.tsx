"use client";
import React from "react";
import { useWatchlist } from "@/hooks/useWatchlist";
import { toast } from "./Toast";

interface WatchlistStarProps {
  id: string;
  type: "fiat" | "crypto";
  label?: string;
  className?: string;
}

export function WatchlistStar({ id, type, label, className = "" }: WatchlistStarProps) {
  const { isWatched, toggle } = useWatchlist();
  const watched = isWatched(id, type);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(id, type);
    if (watched) {
      toast.info(`Removed ${label ?? id} from watchlist`);
    } else {
      toast.gain(`Added ${label ?? id} to watchlist`);
    }
  };

  return (
    <button
      onClick={handleClick}
      aria-label={watched ? `Remove ${label ?? id} from watchlist` : `Add ${label ?? id} to watchlist`}
      title={watched ? "Remove from watchlist" : "Add to watchlist"}
      className={`inline-flex items-center justify-center p-1 rounded hover:bg-paper-sunken dark:hover:bg-night-sunken transition-all duration-150 active:scale-75 ${className}`}
    >
      <svg
        className={`w-4 h-4 transition-colors duration-200 ${
          watched
            ? "fill-amber dark:fill-amber-bright text-amber dark:text-amber-bright"
            : "fill-transparent text-ink-muted dark:text-ink-onnightMuted hover:text-amber dark:hover:text-amber-bright"
        }`}
        stroke="currentColor"
        strokeWidth="1.75"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
        />
      </svg>
    </button>
  );
}
