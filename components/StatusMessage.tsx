export function LoadingRows({ count = 4 }: { count?: number }) {
  return (
    <div className="divide-y divide-hairline dark:divide-hairline-night">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3.5">
          <div className="skeleton h-3.5 w-24 rounded-xs" style={{ animationDelay: `${i * 80}ms` }} />
          <div className="skeleton ml-2 h-3.5 w-32 rounded-xs" style={{ animationDelay: `${i * 80 + 40}ms` }} />
          <div className="skeleton ml-auto h-3.5 w-16 rounded-xs" style={{ animationDelay: `${i * 80 + 80}ms` }} />
        </div>
      ))}
    </div>
  );
}

export function ErrorMessage({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-start gap-3 px-4 py-6">
      <div className="flex items-center gap-2 text-loss dark:text-loss-bright text-sm">
        <span>⚠</span>
        <span>Couldn&apos;t load this data. {message}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-3 py-1.5 rounded-md border border-hairline dark:border-hairline-night font-mono text-[11px] uppercase tracking-wide hover:border-amber/60 dark:hover:border-amber-bright/60 transition duration-200 active:scale-95"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyMessage({ message }: { message: string }) {
  return (
    <div className="px-4 py-8 text-sm text-ink-soft dark:text-ink-onnightSoft text-center">
      {message}
    </div>
  );
}
