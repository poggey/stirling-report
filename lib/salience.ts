import type { MarketInstrument } from "@/lib/market-data";
import type { InstrumentClass } from "@/lib/sources/types";

/**
 * The salience engine (WHITEPAPER §4.2): score = |z| × systemic weight.
 * Calendar significance multiplies in once the diary can flag release days
 * (Phase 5 wires isReleaseDay). Fully deterministic — the AI layer writes
 * prose around this ranking but never decides what mattered.
 */

// Systemic weight: how much a 1σ move in this class matters to the macro
// story. Rates anchor everything; crypto is a sentiment barometer only.
const CLASS_WEIGHT: Record<InstrumentClass, number> = {
  rate: 1.3,
  fx: 1.15,
  index: 1.0,
  commodity: 0.9,
  crypto: 0.6,
};

export interface SalienceEntry {
  id: string;
  label: string;
  score: number;
  z: number;
}

export function salienceScore(
  instrument: MarketInstrument,
  releaseDayBoost = 1,
): number {
  return Math.abs(instrument.z) * CLASS_WEIGHT[instrument.class] * releaseDayBoost;
}

/** Instruments ranked by salience, highest first. Excludes empty series. */
export function rankBySalience(instruments: MarketInstrument[]): MarketInstrument[] {
  return instruments
    .filter((i) => i.level !== null)
    .sort((a, b) => salienceScore(b) - salienceScore(a));
}

export function salienceTable(instruments: MarketInstrument[]): SalienceEntry[] {
  return rankBySalience(instruments).map((i) => ({
    id: i.id,
    label: i.label,
    score: Number(salienceScore(i).toFixed(3)),
    z: Number(i.z.toFixed(3)),
  }));
}
