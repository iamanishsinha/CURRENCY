"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import {
  createChart,
  ColorType,
  LineSeries,
  IChartApi,
  ISeriesApi,
  Time
} from "lightweight-charts";
import { useTheme } from "./ThemeProvider";

const PALETTE_LIGHT = ["#C28A1E", "#2D7B6F", "#C0392B", "#5B4FCF"];
const PALETTE_DARK  = ["#F0B429", "#3DD6C3", "#E8604E", "#8B7FEF"];

export function ComparisonChart({
  data,
  seriesLabels
}: {
  data: Array<Record<string, string | number | undefined> & { date: string }>;
  seriesLabels: string[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  const { theme } = useTheme();
  const isDark = theme === "dark";
  const palette = isDark ? PALETTE_DARK : PALETTE_LIGHT;

  const [hoveredData, setHoveredData] = useState<{
    date: string;
    values: Record<string, number>;
  } | null>(null);

  // Filter and sort input data
  const validData = useMemo(() => {
    if (!data || data.length < 2) return [];
    return [...data].sort((a, b) => a.date.localeCompare(b.date));
  }, [data]);

  // Latest values for legend default
  const latestValues = useMemo(() => {
    const res: Record<string, number> = {};
    for (let i = validData.length - 1; i >= 0; i--) {
      const row = validData[i];
      for (const label of seriesLabels) {
        if (res[label] === undefined && typeof row[label] === "number") {
          res[label] = row[label] as number;
        }
      }
    }
    return res;
  }, [validData, seriesLabels]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || validData.length < 2) return;

    const textColor = isDark ? "#8A8B88" : "#5C5445";
    const gridColor = isDark ? "rgba(30, 37, 53, 0.45)" : "rgba(217, 207, 174, 0.4)";
    const amberColor = isDark ? "#F0B429" : "#C28A1E";

    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const chart = createChart(container, {
      width: container.clientWidth,
      height: 320,
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
        scaleMargins: { top: 0.1, bottom: 0.1 }
      },
      timeScale: {
        borderColor: gridColor,
        fixLeftEdge: true,
        fixRightEdge: true
      },
      handleScroll: false,
      handleScale: false
    });

    const seriesMap = new Map<string, ISeriesApi<"Line">>();

    seriesLabels.forEach((label, i) => {
      const series = chart.addSeries(LineSeries, {
        color: palette[i % palette.length],
        lineWidth: 2,
        priceFormat: {
          type: "custom",
          formatter: (price: number) => price.toFixed(2)
        }
      });

      // Prepare ascending deduplicated data
      const datesSeen = new Set<string>();
      const lineData: { time: Time; value: number }[] = [];
      for (const row of validData) {
        const val = row[label];
        if (typeof val === "number" && !isNaN(val) && !datesSeen.has(row.date)) {
          datesSeen.add(row.date);
          lineData.push({ time: row.date as Time, value: val });
        }
      }

      series.setData(lineData);
      seriesMap.set(label, series);
    });

    chart.timeScale().fitContent();

    // Crosshair hover subscriber to update interactive legend
    chart.subscribeCrosshairMove((param) => {
      if (!param.time) {
        setHoveredData(null);
        return;
      }
      const values: Record<string, number> = {};
      seriesMap.forEach((series, label) => {
        const point = param.seriesData.get(series) as { value: number } | undefined;
        if (point && typeof point.value === "number") {
          values[label] = point.value;
        }
      });
      setHoveredData({
        date: String(param.time),
        values
      });
    });

    chartRef.current = chart;

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
      }
    };
  }, [validData, seriesLabels, isDark, palette]);

  if (validData.length < 2) {
    return (
      <div className="flex h-80 items-center justify-center text-sm text-ink-soft dark:text-ink-onnightSoft font-mono">
        Not enough overlapping data to compare.
      </div>
    );
  }

  const activeValues = hoveredData ? hoveredData.values : latestValues;
  const activeDate = hoveredData ? hoveredData.date : validData[validData.length - 1]?.date;

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Interactive Legend & Current / Hovered Normalized Values */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1 py-1 border-b border-hairline/60 dark:border-hairline-night/60">
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-ink-soft dark:text-ink-onnightSoft">
            {hoveredData ? "Point in time:" : "Normalized to 100:"}
          </span>
          <span className="font-semibold text-ink dark:text-ink-onnight">{activeDate}</span>
        </div>

        <div className="flex flex-wrap items-center gap-4 font-mono text-xs">
          {seriesLabels.map((label, i) => {
            const val = activeValues[label];
            const color = palette[i % palette.length];
            const changeFrom100 = val !== undefined ? val - 100 : null;
            return (
              <div key={label} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                <span className="font-semibold">{label}:</span>
                <span className="font-bold">
                  {val !== undefined ? val.toFixed(2) : "—"}
                </span>
                {changeFrom100 !== null && (
                  <span
                    className={`text-[10px] ${
                      changeFrom100 >= 0
                        ? "text-teal dark:text-teal-bright"
                        : "text-loss dark:text-loss-bright"
                    }`}
                  >
                    ({changeFrom100 >= 0 ? "+" : ""}
                    {changeFrom100.toFixed(1)}%)
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Chart Canvas */}
      <div
        ref={containerRef}
        className="h-80 w-full select-none"
        onMouseLeave={() => setHoveredData(null)}
      />
    </div>
  );
}
