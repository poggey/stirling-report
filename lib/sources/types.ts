export interface SeriesPoint {
  date: string; // ISO YYYY-MM-DD
  value: number;
}

export type SourceHealth =
  | { status: "ok"; asOf: string }
  | { status: "stale"; asOf: string; reason: string }
  | { status: "down"; reason: string };

export type InstrumentClass = "index" | "fx" | "commodity" | "crypto" | "rate";

export interface InstrumentSeries {
  id: string;
  label: string;
  class: InstrumentClass;
  /** Display decimal places: indices 1dp, FX 4dp, rates as % 2dp. */
  precision: number;
  source: string;
  /** Ascending by date. Empty when the source is down. */
  points: SeriesPoint[];
  health: SourceHealth;
}

export interface Provider {
  name: string;
  fetchDaily(): Promise<InstrumentSeries[]>;
}
