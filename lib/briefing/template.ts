import type { Edition } from "@/lib/editions/types";
import { formatChange, formatLevel } from "@/lib/format";
import type { MarketInstrument } from "@/lib/market-data";
import { WEATHER_LABEL } from "@/lib/weather";

/**
 * The deterministic fallback briefing (WHITEPAPER §6.2): built purely from
 * the snapshot so the product never shows a blank if AI quota fails. Ends
 * with "What to watch tomorrow", same as the AI register requires.
 */

export const WATCH_HEADING = "What to watch tomorrow";

function describe(i: MarketInstrument): string {
  const c = formatChange(i);
  return `${i.label} ${c.direction === "rise" ? "rose" : c.direction === "fall" ? "fell" : "was unchanged"} ${c.text} to ${formatLevel(i)}`;
}

export function templateBriefing(edition: Edition): string {
  const byId = new Map(edition.instruments.map((i) => [i.id, i]));
  const ranked = edition.salience
    .map((s) => byId.get(s.id))
    .filter((i): i is MarketInstrument => Boolean(i) && i!.level !== null);
  const [top, second, third] = ranked;

  const paragraphs: string[] = [];

  if (top) {
    paragraphs.push(
      `${describe(top)}, a move of ${Math.abs(top.z).toFixed(1)} standard deviations against its trailing month and the day's highest-salience print. ${
        second ? `${describe(second)}, the session's second story.` : ""
      }`.trim(),
    );
  }

  const risers = ranked.filter((i) => (i.change ?? 0) > 0).length;
  const fallers = ranked.filter((i) => (i.change ?? 0) < 0).length;
  paragraphs.push(
    `Across the ${ranked.length}-instrument board, ${risers} rose and ${fallers} fell — conditions consistent with the day's ${WEATHER_LABEL[edition.weather.state]} reading (average move ${edition.weather.intensity.toFixed(1)}σ, risk breadth ${edition.weather.breadth >= 0 ? "+" : ""}${edition.weather.breadth.toFixed(2)}).${third ? ` Elsewhere, ${describe(third)}.` : ""}`,
  );

  const gilt5 = byId.get("gilt5y");
  const gilt10 = byId.get("gilt10y");
  if (gilt5?.level != null && gilt10?.level != null) {
    const spread = Math.round((gilt10.level - gilt5.level) * 100);
    paragraphs.push(
      `In rates, the UK 5y gilt yielded ${formatLevel(gilt5)} and the 10y ${formatLevel(gilt10)}, a 5s10s slope of ${spread >= 0 ? "+" : ""}${spread}bp — ${spread < 0 ? "an inverted stretch of the curve" : "an upward-sloping curve"}.`,
    );
  }

  const watch = ranked
    .slice(0, 3)
    .map(
      (i, n) =>
        `${n + 1}. Whether ${i.label}'s move extends or retraces — today printed ${Math.abs(i.z).toFixed(1)}σ against its trailing month`,
    );
  watch.push(`${watch.length + 1}. Tomorrow evening's edition at 22:05 UK — the next snapshot locks in the day`);

  return `${paragraphs.join("\n\n")}\n\n${WATCH_HEADING}\n${watch.join("\n")}`;
}

/** Splits a briefing into body paragraphs and the watch list for the sheet. */
export function parseBriefing(text: string): { paragraphs: string[]; watch: string[] } {
  const idx = text.indexOf(WATCH_HEADING);
  if (idx === -1) {
    return { paragraphs: text.split("\n\n").filter(Boolean), watch: [] };
  }
  const body = text.slice(0, idx).trim();
  const tail = text.slice(idx + WATCH_HEADING.length).replace(/^[:\s]+/, "");
  return {
    paragraphs: body.split("\n\n").filter(Boolean),
    watch: tail
      .split("\n")
      .map((l) => l.replace(/^\s*(?:\d+[.)]\s*|[-•]\s*)/, "").trim())
      .filter(Boolean),
  };
}
