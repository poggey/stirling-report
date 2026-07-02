import type { SeriesPoint } from "@/lib/sources/types";

/**
 * Change mode per instrument class: prices move in percent, rates move in
 * absolute percentage points (rendered as basis points).
 */
export type ChangeMode = "pct" | "abs";

/** Consecutive day-on-day changes, oldest first. */
export function dailyChanges(points: SeriesPoint[], mode: ChangeMode): number[] {
  const changes: number[] = [];
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1].value;
    const curr = points[i].value;
    changes.push(mode === "pct" ? ((curr - prev) / prev) * 100 : curr - prev);
  }
  return changes;
}

export interface DayChange {
  abs: number;
  pct: number;
}

/** Latest close vs the close before it. */
export function dayChange(points: SeriesPoint[]): DayChange | null {
  if (points.length < 2) return null;
  const prev = points[points.length - 2].value;
  const curr = points[points.length - 1].value;
  return { abs: curr - prev, pct: ((curr - prev) / prev) * 100 };
}

/**
 * z-score of the latest move against the trailing distribution of daily
 * moves (the latest move is excluded from the baseline). Returns 0 when
 * there is too little history or no variance — a flat series is, by
 * definition, unremarkable.
 */
export function zScore(points: SeriesPoint[], mode: ChangeMode): number {
  const changes = dailyChanges(points, mode);
  if (changes.length < 10) return 0;
  const latest = changes[changes.length - 1];
  const trailing = changes.slice(0, -1);
  const mean = trailing.reduce((a, b) => a + b, 0) / trailing.length;
  const variance =
    trailing.reduce((a, b) => a + (b - mean) ** 2, 0) / trailing.length;
  const sd = Math.sqrt(variance);
  if (sd === 0) return 0;
  return (latest - mean) / sd;
}
