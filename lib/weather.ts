import type { MarketInstrument } from "@/lib/market-data";

/**
 * First-pass Economic Weather (WHITEPAPER §4.9): a deterministic composite of
 * move intensity and risk breadth. Credit proxies and the surprise indices
 * join the blend in later phases; the formula is disclosed because
 * auditability is part of the brand.
 */

export type WeatherState = "clear" | "fair" | "overcast" | "storm" | "fog";

export interface WeatherReading {
  state: WeatherState;
  /** Average |z| across the board — how loudly the day moved. */
  intensity: number;
  /** Risk breadth in [-1, 1]: +1 all risk assets rising, −1 all falling. */
  breadth: number;
}

export const WEATHER_LABEL: Record<WeatherState, string> = {
  clear: "Clear",
  fair: "Fair",
  overcast: "Overcast",
  storm: "Storm",
  fog: "Fog",
};

export const WEATHER_SUB: Record<WeatherState, string> = {
  clear: "risk-on",
  fair: "mixed",
  overcast: "caution",
  storm: "risk-off",
  fog: "directionless",
};

export function readWeather(instruments: MarketInstrument[]): WeatherReading {
  const withData = instruments.filter((i) => i.level !== null);
  const intensity = withData.length
    ? withData.reduce((s, i) => s + Math.abs(i.z), 0) / withData.length
    : 0;

  // Breadth over risk assets only — yields rising is not "risk up".
  const risk = withData.filter((i) => i.class !== "rate" && i.change !== null);
  const breadth = risk.length
    ? risk.reduce((s, i) => s + Math.sign(i.change!), 0) / risk.length
    : 0;

  let state: WeatherState;
  if (intensity < 0.35) state = "fog";
  else if (intensity >= 1.6 && breadth <= -0.2) state = "storm";
  else if (intensity >= 0.9 && breadth < 0) state = "overcast";
  else if (intensity >= 0.55 && breadth >= 0.15) state = "clear";
  else state = "fair";

  return {
    state,
    intensity: Number(intensity.toFixed(3)),
    breadth: Number(breadth.toFixed(3)),
  };
}
