import type { MarketInstrument } from "@/lib/market-data";

/** Level per precision rules: indices 1dp, FX 4dp, rates as %. */
export function formatLevel(instrument: MarketInstrument): string {
  if (instrument.level === null) return "—";
  const formatted = instrument.level.toLocaleString("en-GB", {
    minimumFractionDigits: instrument.precision,
    maximumFractionDigits: instrument.precision,
  });
  return instrument.class === "rate" ? `${formatted}%` : formatted;
}

export interface FormattedChange {
  glyph: "▲" | "▼" | "—";
  text: string;
  direction: "rise" | "fall" | "flat";
}

/** Rates move in basis points, everything else in percent — glyph always present. */
export function formatChange(instrument: MarketInstrument): FormattedChange {
  const { change, changePct } = instrument;
  if (change === null || changePct === null) {
    return { glyph: "—", text: "no data", direction: "flat" };
  }
  const value =
    instrument.class === "rate"
      ? `${Math.abs(change * 100).toFixed(1)}bp`
      : `${Math.abs(changePct).toFixed(2)}%`;
  if (change === 0) return { glyph: "—", text: value, direction: "flat" };
  return change > 0
    ? { glyph: "▲", text: value, direction: "rise" }
    : { glyph: "▼", text: value, direction: "fall" };
}

export function formatUkDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
