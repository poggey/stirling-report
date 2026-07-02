import type { MarketInstrument } from "@/lib/market-data";
import { formatChange } from "@/lib/format";

/**
 * Phase 1's deterministic Story of the Day: rank by |z| and template a
 * headline from the top movers. The Phase 2 salience engine (size × systemic
 * weight × calendar) replaces this ranking; the AI layer never decides what
 * mattered.
 */

export interface Story {
  kicker: string;
  headline: string;
  standfirst: string;
}

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

/** Instruments must arrive ranked by |z|, highest first. */
export function buildStory(ranked: MarketInstrument[]): Story {
  const [top, second] = ranked;
  if (!top) {
    return {
      kicker: "Story of the day",
      headline: "A quiet board",
      standfirst: "No instrument moved unusually against its trailing month.",
    };
  }
  // Labels are proper nouns (FTSE 100, GBP/USD) — no case-mangling.
  const headline = second
    ? `${top.label} ${verb(top)} as ${second.label} ${verb(second)}`
    : `${top.label} ${verb(top)}`;

  const standfirst = second
    ? `${top.label} moved ${moveText(top)} on the day — ${Math.abs(top.z).toFixed(1)}σ against its trailing month. ${second.label} followed at ${moveText(second)} (${Math.abs(second.z).toFixed(1)}σ). The rest of the board was quieter.`
    : `${top.label} moved ${moveText(top)} on the day, ${Math.abs(top.z).toFixed(1)}σ against its trailing month.`;

  return { kicker: "Story of the day", headline, standfirst };
}
