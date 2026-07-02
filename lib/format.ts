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
  /** Raw direction of the number — drives the glyph. */
  direction: "rise" | "fall" | "flat";
  /**
   * Ink tone — bond-price convention: a rising yield prints in fall-vermilion
   * even though its glyph points up (the concept ledger's colouring).
   */
  tone: "rise" | "fall" | "flat";
}

/** Rates move in basis points, everything else in percent — glyph always present. */
export function formatChange(instrument: MarketInstrument): FormattedChange {
  const { change, changePct } = instrument;
  if (change === null || changePct === null) {
    return { glyph: "—", text: "no data", direction: "flat", tone: "flat" };
  }
  const value =
    instrument.class === "rate"
      ? `${Math.abs(change * 100).toFixed(1)}bp`
      : `${Math.abs(changePct).toFixed(2)}%`;
  if (change === 0) return { glyph: "—", text: value, direction: "flat", tone: "flat" };
  const direction = change > 0 ? "rise" : "fall";
  const tone =
    instrument.class === "rate" ? (change > 0 ? "fall" : "rise") : direction;
  return { glyph: change > 0 ? "▲" : "▼", text: value, direction, tone };
}

export function formatUkDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Header-bar form: "Thu 2 Jul 2026 · 07:42" */
export function formatShortDateTime(date: Date): string {
  const day = date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const time = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${day} · ${time}`;
}
