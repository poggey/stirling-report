import { getEdition, listEditionDates } from "./store";
import type { WeatherState } from "@/lib/weather";

/** The slice of an edition the archive tiles and Play Week need. */
export interface EditionSummary {
  date: string;
  number: number;
  weather: WeatherState;
  intensity: number;
  headline: string;
}

export async function getEditionSummaries(limit?: number): Promise<EditionSummary[]> {
  const dates = await listEditionDates();
  const wanted = limit ? dates.slice(-limit) : dates;
  const editions = await Promise.all(wanted.map((d) => getEdition(d)));
  return editions
    .filter((e): e is NonNullable<typeof e> => e !== null)
    .map((e) => ({
      date: e.date,
      number: e.number,
      weather: e.weather.state,
      intensity: e.weather.intensity,
      headline: `${e.story.headlinePlain}${e.story.headlineEm ? ` ${e.story.headlineEm}` : ""}`,
    }));
}
