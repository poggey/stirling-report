import { dayChange, zScore, type ChangeMode } from "@/lib/compute";
import { boe } from "@/lib/sources/boe";
import { coingecko } from "@/lib/sources/coingecko";
import { ecb } from "@/lib/sources/ecb";
import { frankfurter } from "@/lib/sources/frankfurter";
import { fred } from "@/lib/sources/fred";
import { yahoo } from "@/lib/sources/yahoo";
import type { InstrumentSeries, Provider } from "@/lib/sources/types";

export interface MarketInstrument extends InstrumentSeries {
  level: number | null;
  /** Day change in the instrument's own unit (index points, rate pp, …). */
  change: number | null;
  changePct: number | null;
  /** z-score of today's move vs the trailing 30 daily moves; 0 = unremarkable. */
  z: number;
}

export interface MarketData {
  instruments: MarketInstrument[];
  fetchedAt: string;
}

const PROVIDERS: Provider[] = [frankfurter, coingecko, yahoo, boe, fred, ecb];

/** Policy rates live in Central Bank Watch, curve-only tenors in the curve
 * cards — neither belongs on the market board or in the story ranking. */
export const POLICY_IDS = new Set(["bankrate", "fedtarget", "ecbdeposit"]);
export const CURVE_ONLY_IDS = new Set(["gilt20y", "ust5y", "ust30y"]);

export function changeMode(instrument: InstrumentSeries): ChangeMode {
  return instrument.class === "rate" ? "abs" : "pct";
}

export function toMarketInstrument(series: InstrumentSeries): MarketInstrument {
  const mode = changeMode(series);
  const change = dayChange(series.points);
  return {
    ...series,
    level: series.points.length
      ? series.points[series.points.length - 1].value
      : null,
    change: change?.abs ?? null,
    changePct: change?.pct ?? null,
    z: zScore(series.points, mode),
  };
}

/**
 * The single server-side assembly point. A failed provider degrades its own
 * instruments to a down state — it never rejects, and never takes the page
 * with it.
 */
export async function getMarketData(): Promise<MarketData> {
  const settled = await Promise.allSettled(PROVIDERS.map((p) => p.fetchDaily()));
  const instruments = settled.flatMap((result, i) => {
    if (result.status === "fulfilled") {
      return result.value.map(toMarketInstrument);
    }
    // Providers catch internally, so this is a belt-and-braces path.
    console.error(`provider ${PROVIDERS[i].name} rejected:`, result.reason);
    return [];
  });
  return { instruments, fetchedAt: new Date().toISOString() };
}
