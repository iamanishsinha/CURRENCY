"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import {
  createChart,
  ColorType,
  AreaSeries,
  IChartApi,
  ISeriesApi,
  Time
} from "lightweight-charts";
import { useTheme } from "./ThemeProvider";
import { HistoricalPoint } from "@/lib/providers/types";
import { formatRate, formatPrice } from "@/lib/format";

interface ChartPoint {
  time: string;
  value: number;
}

export function PriceChart({
  points,
  isCrypto = false
}: {
  points: HistoricalPoint[];
  isCrypto?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Area"> | null>(null);

  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [hovered, setHovered] = useState<{
    date: string;
    value: number;
    pctChange: number;
  } | null>(null);

  // Clean, sorted, deduplicated data for lightweight-charts
  const chartData: ChartPoint[] = useMemo(() => {
    if (!points || points.length < 2) return [];
    const map = new Map<string, number>();
    for (const p of points) {
      const d = p.timestamp.slice(0, 10);
      map.set(d, p.value);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([time, value]) => ({ time, value }));
  }, [points]);

  const baseValue = chartData[0]?.value ?? 0;
  const lastValue = chartData[chartData.length - 1]?.value ?? 0;
  const isUp = lastValue >= baseValue;

  const activeValue = hovered ? hovered.value : lastValue;
  const activePct = hovered
    ? hovered.pctChange
    : baseValue
    ? ((lastValue - baseValue) / baseValue) * 100
    : 0;
  const activeDate = hovered ? hovered.date : chartData[chartData.length - 1]?.time ?? "";

  useEffect(() => {
    const container = containerRef.current;
    if (!container || chartData.length < 2) return;

    const textColor = isDark ? "#8A8B88" : "#5C5445";
    const gridColor = isDark ? "rgba(30, 37, 53, 0.45)" : "rgba(217, 207, 174, 0.4)";
    const amberColor = isDark ? "#F0B429" : "#C28A1E";
    const lineColor = isUp
      ? isDark
        ? "#3DD6C3"
        : "#2D7B6F"
      : isDark
      ? "#E8604E"
      : "#C0392B";
    const topFill = isUp
      ? isDark
        ? "rgba(61, 214, 195, 0.28)"
        : "rgba(45, 123, 111, 0.24)"
      : isDark
      ? "rgba(232, 96, 78, 0.28)"
      : "rgba(192, 57, 43, 0.24)";
    const bottomFill = "rgba(0, 0, 0, 0)";

    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
      seriesRef.current = null;
    }

    const chart = createChart(container, {
      width: container.clientWidth,
      height: 288,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor,
        fontFamily: 'var(--font-mono), "IBM Plex Mono", monospace',
        fontSize: 11
      },
      grid: {
        vertLines: { color: gridColor, style: 2 },
        horzLines: { color: gridColor, style: 2 }
      },
      crosshair: {
        vertLine: {
          color: amberColor,
          width: 1,
          style: 3,
          labelBackgroundColor: isDark ? "#161B25" : "#FDF8EE"
        },
        horzLine: {
          color: amberColor,
          width: 1,
          style: 3,
          labelBackgroundColor: isDark ? "#161B25" : "#FDF8EE"
        }
      },
      rightPriceScale: {
        borderColor: gridColor,
        scaleMargins: { top: 0.12, bottom: 0.12 }
      },
      timeScale: {
        borderColor: gridColor,
        fixLeftEdge: true,
        fixRightEdge: true
      },
      handleScroll: false,
      handleScale: false
    });

    const series = chart.addSeries(AreaSeries, {
      topColor: topFill,
      bottomColor: bottomFill,
      lineColor,
      lineWidth: 2,
      priceFormat: {
        type: "custom",
        formatter: (price: number) => (isCrypto ? `$${formatPrice(price)}` : formatRate(price))
      }
    });

    series.setData(chartData.map((d) => ({ time: d.time as Time, value: d.value })));
    chart.timeScale().fitContent();

    chart.subscribeCrosshairMove((param) => {
      if (!param.time || !param.seriesData.get(series)) {
        setHovered(null);
        return;
      }
      const data = param.seriesData.get(series) as { value: number } | undefined;
      if (data && typeof data.value === "number") {
        const dateStr = String(param.time);
        const change = data.value - baseValue;
        const pct = baseValue ? (change / baseValue) * 100 : 0;
        setHovered({
          date: dateStr,
          value: data.value,
          pctChange: pct
        });
      }
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const handleResize = () => {
      if (container && chartRef.current) {
        chartRef.current.applyOptions({ width: container.clientWidth });
        chartRef.current.timeScale().fitContent();
      }
    };
    const observer = new ResizeObserver(handleResize);
    observer.observe(container);

    return () => {
      observer.disconnect();
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
        seriesRef.current = null;
      }
    };
  }, [chartData, isDark, isUp, isCrypto, baseValue]);

  if (chartData.length < 2) {
    return (
      <div className="flex h-72 items-center justify-center text-sm text-ink-soft dark:text-ink-onnightSoft font-mono">
        Not enough history for this period.
      </div>
    );
  }

  const isPositive = activePct >= 0;

  return (
    <div className="relative w-full">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 px-1">
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-ink-soft dark:text-ink-onnightSoft">
            {hovered ? "Observed on:" : "Latest:"}
          </span>
          <span className="font-semibold text-ink dark:text-ink-onnight">{activeDate}</span>
        </div>
        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="font-bold text-base text-ink dark:text-ink-onnight">
            {isCrypto ? "$" : ""}
            {isCrypto ? formatPrice(activeValue) : formatRate(activeValue)}
          </span>
          <span
            className={`font-semibold px-2 py-0.5 rounded ${
              isPositive
                ? "bg-teal/15 text-teal dark:text-teal-bright"
                : "bg-loss/15 text-loss dark:text-loss-bright"
            }`}
          >
            {isPositive ? "▲ +" : "▼ "}
            {activePct.toFixed(2)}%
          </span>
        </div>
      </div>

      <div
        ref={containerRef}
        className="h-72 w-full select-none"
        onMouseLeave={() => setHovered(null)}
      />
    </div>
  );
}
