import type { MarketInstrument } from "@/lib/market-data";
import { formatChange } from "@/lib/format";
import type { InstrumentClass } from "@/lib/sources/types";

/**
 * Phase 1's deterministic Story of the Day: rank by |z| and template the
 * headline, standfirst and sub-plots from the top movers. The Phase 2
 * salience engine (size × systemic weight × calendar) replaces this ranking;
 * the AI layer never decides what mattered.
 */

export interface Story {
  kicker: string;
  /** Roman first clause + italic second clause, per the concept headline. */
  headlinePlain: string;
  headlineEm: string | null;
  standfirst: string;
  subplots: string[];
}

const SECTION: Record<InstrumentClass, string> = {
  index: "Equities",
  fx: "Currencies",
  commodity: "Commodities",
  crypto: "Crypto",
  rate: "Rates",
};

function verb(instrument: MarketInstrument): string {
  const rising = (instrument.change ?? 0) > 0;
  const magnitude = Math.abs(instrument.z);
  if (magnitude >= 2.5) return rising ? "surges" : "slumps";
  if (magnitude >= 1.5) return rising ? "climbs" : "slides";
  return rising ? "edges higher" : "drifts lower";
}

function moveText(instrument: MarketInstrument): string {
  const change = formatChange(instrument);
  return `${change.glyph === "—" ? "" : change.glyph} ${change.text}`.trim();
}

function subplot(instrument: MarketInstrument): string {
  return `${instrument.label} ${verb(instrument)} — ${moveText(instrument)} on the day, ${Math.abs(instrument.z).toFixed(1)}σ against its trailing month`;
}

/** Instruments must arrive ranked by |z|, highest first. */
export function buildStory(ranked: MarketInstrument[]): Story {
  const [top, second, third] = ranked;
  if (!top) {
    return {
      kicker: "Story of the day",
      headlinePlain: "A quiet board",
      headlineEm: null,
      standfirst: "No instrument moved unusually against its trailing month.",
      subplots: [],
    };
  }

  const sections = [
    ...new Set([top, second].filter(Boolean).map((i) => SECTION[i!.class])),
  ].join(" & ");
  const kicker = `${sections} · today's session`;

  const standfirstParts = [
    `${top.label} moved ${moveText(top)} on the day — ${Math.abs(top.z).toFixed(1)}σ against its trailing month, the board's most unusual print.`,
  ];
  if (second) {
    standfirstParts.push(
      `${second.label} followed at ${moveText(second)} (${Math.abs(second.z).toFixed(1)}σ)${third ? `, with ${third.label} ${moveText(third)} behind it` : ""}.`,
    );
  }
  standfirstParts.push("The rest of the board was quieter.");

  return {
    kicker,
    headlinePlain: `${top.label} ${verb(top)}`,
    headlineEm: second ? `as ${second.label} ${verb(second)}` : null,
    standfirst: standfirstParts.join(" "),
    subplots: [second, third].filter(Boolean).map((i) => subplot(i!)),
  };
}
