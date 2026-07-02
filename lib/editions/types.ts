import type { MarketInstrument } from "@/lib/market-data";
import type { SalienceEntry } from "@/lib/salience";
import type { Headline } from "@/lib/sources/wires";
import type { Story } from "@/lib/story";
import type { WeatherReading } from "@/lib/weather";

/** The three cached AI tones plus the deterministic fallback (Phase 3). */
export interface Briefings {
  /** Always present — the product never shows a blank. */
  template: string;
  deskNote?: string;
  plainEnglish?: string;
  studyMode?: string;
  ai: boolean;
  model?: string;
}

/**
 * One immutable numbered edition per day — the JSON snapshot that drives the
 * whole product. Never rewritten once the day closes.
 */
export interface Edition {
  schema: 1;
  /** UK calendar date, YYYY-MM-DD. */
  date: string;
  /** Increments from launch day, never changes. */
  number: number;
  generatedAt: string;
  weather: WeatherReading;
  story: Story;
  salience: SalienceEntry[];
  instruments: MarketInstrument[];
  sources: string[];
  /** The wires as they stood at snapshot time — headlines only, linked out. */
  wires?: Headline[];
  briefings?: Briefings;
}

export function ukDateOf(date: Date): string {
  return date.toLocaleDateString("en-CA", { timeZone: "Europe/London" });
}
