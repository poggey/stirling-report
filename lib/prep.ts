import type { Edition } from "@/lib/editions/types";
import { formatChange, formatLevel } from "@/lib/format";
import type { MarketInstrument } from "@/lib/market-data";
import { WEATHER_LABEL } from "@/lib/weather";

/**
 * Interview Prep Mode (WHITEPAPER §4.11). Everything here is deterministic
 * and traceable: each sentence of the model answer carries a footnote naming
 * the exact data point it derives from — the demo moment for a risk-minded
 * interviewer.
 */

export interface AnsweredSentence {
  sentence: string;
  /** The data point the sentence derives from. */
  footnote: string;
}

function cite(i: MarketInstrument): string {
  const c = formatChange(i);
  return `${i.label} ${formatLevel(i)}, ${c.glyph} ${c.text}, z ${i.z.toFixed(1)} — ${i.source}, as of ${i.health.status !== "down" ? i.health.asOf : "n/a"}`;
}

/** "Talk me through markets today" — built from the edition, sentence by sentence. */
export function modelAnswer(edition: Edition): AnsweredSentence[] {
  const byId = new Map(edition.instruments.map((i) => [i.id, i]));
  const ranked = edition.salience
    .map((s) => byId.get(s.id))
    .filter((i): i is MarketInstrument => Boolean(i) && i!.level !== null);
  const [top, second] = ranked;
  const out: AnsweredSentence[] = [];

  if (top) {
    const c = formatChange(top);
    out.push({
      sentence: `The story of the day is ${top.label}: it moved ${c.glyph} ${c.text}, which is ${Math.abs(top.z).toFixed(1)} standard deviations against its trailing month — the most unusual print on the board.`,
      footnote: cite(top),
    });
  }
  if (second) {
    const c = formatChange(second);
    out.push({
      sentence: `Behind it, ${second.label} moved ${c.glyph} ${c.text}; the two together set the session's tone.`,
      footnote: cite(second),
    });
  }

  const risers = ranked.filter((i) => (i.change ?? 0) > 0).length;
  out.push({
    sentence: `Breadth was ${edition.weather.breadth >= 0 ? "constructive" : "defensive"} — ${risers} of ${ranked.length} instruments rose — and the day reads as ${WEATHER_LABEL[edition.weather.state]} on the weather gauge.`,
    footnote: `Weather composite: intensity ${edition.weather.intensity}σ, breadth ${edition.weather.breadth} — computed from the full board, edition Nº ${edition.number}`,
  });

  const gilt5 = byId.get("gilt5y");
  const gilt10 = byId.get("gilt10y");
  if (gilt5?.level != null && gilt10?.level != null) {
    const spread = Math.round((gilt10.level - gilt5.level) * 100);
    out.push({
      sentence: `In rates, the gilt curve slopes ${spread >= 0 ? "upward" : "inverted"} — the 10-year at ${formatLevel(gilt10)} against the 5-year at ${formatLevel(gilt5)}, a ${Math.abs(spread)}bp gap — so the market is ${spread >= 0 ? "not" : ""} flagging recession from the curve today.`,
      footnote: `UK 5y ${formatLevel(gilt5)}, UK 10y ${formatLevel(gilt10)} — Bank of England IADB, as of ${gilt10.health.status !== "down" ? gilt10.health.asOf : "n/a"}`,
    });
  }

  out.push({
    sentence: `I'd frame the day cautiously: the moves are consistent with the ranking above, and tomorrow's calendar decides whether they extend.`,
    footnote: `Editorial register per the briefing rules — hedged causality, no invented figures (edition ${edition.date})`,
  });

  return out;
}

export interface Flashcard {
  question: string;
  answer: string;
}

/** Drill cards from the archive: one per edition, plus concept checks. */
export function flashcardsFromEditions(
  editions: { date: string; number: number; headline: string; topLabel?: string; topMove?: string }[],
): Flashcard[] {
  return editions.map((e) => ({
    question: `${new Date(`${e.date}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} — Edition Nº ${e.number}. What led the board, and what was the story?`,
    answer: `${e.topLabel ? `${e.topLabel}${e.topMove ? ` (${e.topMove})` : ""} led. ` : ""}Headline: "${e.headline}"`,
  }));
}
