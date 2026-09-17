"use client";
import { memo, useEffect, useRef, useState } from "react";
import { formatRate } from "@/lib/format";

interface Props {
  values: number[] | null;
  width?: number;
  height?: number;
}

function MiniSparklineBase({ values, width = 96, height = 28 }: Props) {
  const pathRef = useRef<SVGPolylineElement>(null);
  const hasDrawnRef = useRef(false);
  const [hover, setHover] = useState<{ x: number; i: number } | null>(null);

  // Draw-on animation plays exactly once, on first real data arrival --
  // not on every poll refresh. Re-running getTotalLength()/getBoundingClientRect()
  // on every data tick forces a synchronous layout on every visible sparkline
  // simultaneously (there are ~17 on the home page), which is real jank, and
  // replaying the animation every 45s also just looks like the UI glitching.
  useEffect(() => {
    if (hasDrawnRef.current) return;
    const el = pathRef.current;
    if (!el || !values || values.length < 2) return;
    hasDrawnRef.current = true;
    const len = el.getTotalLength?.() ?? 200;
    el.style.strokeDasharray = `${len}`;
    el.style.strokeDashoffset = `${len}`;
    requestAnimationFrame(() => {
      el.style.transition = "stroke-dashoffset 0.9s ease-out";
      el.style.strokeDashoffset = "0";
    });
  }, [values]);

  if (!values || values.length < 2) {
    return (
      <div style={{ width, height }} className="opacity-30 text-[9px] font-mono text-center leading-7 text-ink-soft">
        —
      </div>
    );
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const trendUp = values[values.length - 1] >= values[0];
  const pad = 2;
  const gradId = `spark-grad-${trendUp ? "up" : "dn"}-${width}`;

  const coords = values.map((v, i) => {
    const x = (i / (values.length - 1)) * (width - pad * 2) + pad;
    const y = height - pad - ((v - min) / range) * (height - pad * 2);
    return { x, y, v };
  });
  const linePts = coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");
  const areaPts = `${coords[0].x.toFixed(1)},${height} ${linePts} ${coords[coords.length - 1].x.toFixed(1)},${height}`;

  const handleMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const relX = e.nativeEvent.offsetX;
    let nearest = 0;
    let best = Infinity;
    for (let i = 0; i < coords.length; i++) {
      const d = Math.abs(coords[i].x - relX);
      if (d < best) {
        best = d;
        nearest = i;
      }
    }
    setHover({ x: coords[nearest].x, i: nearest });
  };

  const hoverPoint = hover ? coords[hover.i] : null;
  const pctFromStart = hoverPoint ? ((hoverPoint.v - values[0]) / values[0]) * 100 : 0;

  return (
    <div className="relative" style={{ width, height }}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        onMouseMove={handleMove}
        onMouseLeave={() => setHover(null)}
        className="cursor-crosshair overflow-visible"
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor={trendUp ? "#2D7B6F" : "#C0392B"}
              stopOpacity="0.25"
            />
            <stop
              offset="100%"
              stopColor={trendUp ? "#2D7B6F" : "#C0392B"}
              stopOpacity="0"
            />
          </linearGradient>
        </defs>

        {/* Gradient Area Fill */}
        <polygon points={areaPts} fill={`url(#${gradId})`} />

        {/* Line */}
        <polyline
          ref={pathRef}
          points={linePts}
          fill="none"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={trendUp ? "stroke-teal dark:stroke-teal-bright" : "stroke-loss dark:stroke-loss-bright"}
        />

        {hoverPoint && (
          <>
            <line
              x1={hoverPoint.x}
              y1={0}
              x2={hoverPoint.x}
              y2={height}
              stroke="currentColor"
              strokeWidth={1}
              strokeDasharray="2 2"
              className="text-amber dark:text-amber-bright opacity-70"
            />
            <circle
              cx={hoverPoint.x}
              cy={hoverPoint.y}
              r={2.5}
              className={trendUp ? "fill-teal dark:fill-teal-bright" : "fill-loss dark:fill-loss-bright"}
            />
          </>
        )}
      </svg>

      {hoverPoint && (
        <div
          className="absolute z-20 pointer-events-none whitespace-nowrap rounded-md border border-hairline dark:border-hairline-night bg-paper-raised dark:bg-night-raised px-2 py-1 font-mono text-[10px] shadow-lg -translate-x-1/2 transition-all duration-75"
          style={{ left: Math.min(Math.max(hoverPoint.x, 30), width - 10), top: -34 }}
        >
          {formatRate(hoverPoint.v)}{" "}
          <span className={pctFromStart >= 0 ? "text-teal dark:text-teal-bright" : "text-loss dark:text-loss-bright"}>
            {pctFromStart >= 0 ? "▲" : "▼"} {Math.abs(pctFromStart).toFixed(2)}%
          </span>
        </div>
      )}
    </div>
  );
}

function areEqual(prev: Props, next: Props) {
  if (prev.width !== next.width || prev.height !== next.height) return false;
  if (prev.values === next.values) return true;
  if (!prev.values || !next.values) return prev.values === next.values;
  if (prev.values.length !== next.values.length) return false;
  return prev.values.every((v, i) => v === next.values![i]);
}

export const MiniSparkline = memo(MiniSparklineBase, areEqual);
