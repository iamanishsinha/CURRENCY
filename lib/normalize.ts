import { HistoricalPoint } from "./providers/types";

/** Collapse a (possibly sub-daily) series to one value per calendar date. */
export function toDailyMap(points: HistoricalPoint[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const p of points) {
    map.set(p.timestamp.slice(0, 10), p.value); // later points overwrite earlier same-day ones
  }
  return map;
}

/** Rebase a daily map so the first available value equals 100. */
export function normalizeToHundred(daily: Map<string, number>): Map<string, number> {
  const dates = [...daily.keys()].sort();
  const base = dates.length > 0 ? daily.get(dates[0])! : null;
  const out = new Map<string, number>();
  if (!base) return out;
  for (const d of dates) {
    out.set(d, (daily.get(d)! / base) * 100);
  }
  return out;
}

export interface NamedSeries {
  label: string;
  daily: Map<string, number>;
}

export type ChartRow = Record<string, string | number | undefined> & { date: string };

/** Merge several normalized series into one recharts-friendly row-per-date array. */
export function mergeForChart(series: NamedSeries[]): ChartRow[] {
  const allDates = new Set<string>();
  series.forEach((s) => s.daily.forEach((_, d) => allDates.add(d)));
  const sortedDates = [...allDates].sort();

  return sortedDates.map((date) => {
    const row: ChartRow = { date };
    for (const s of series) {
      row[s.label] = s.daily.get(date);
    }
    return row;
  });
}
