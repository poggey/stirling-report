import { cachedFetch } from "./cached-fetch";
import type { InstrumentSeries, Provider, SeriesPoint } from "./types";
import dgs2Fixture from "./__fixtures__/fred-dgs2.json";
import dgs5Fixture from "./__fixtures__/fred-dgs5.json";
import dgs10Fixture from "./__fixtures__/fred-dgs10.json";
import dgs30Fixture from "./__fixtures__/fred-dgs30.json";
import dfedtaruFixture from "./__fixtures__/fred-dfedtaru.json";

const SOURCE = "FRED (St. Louis Fed)";

interface FredObservations {
  observations: { date: string; value: string }[];
}

/** FRED values are strings; missing days are ".". */
export function parseFred(body: FredObservations): SeriesPoint[] {
  return body.observations
    .filter((o) => o.value !== ".")
    .map((o) => ({ date: o.date, value: Number(o.value) }))
    .filter((p) => Number.isFinite(p.value))
    .sort((a, b) => a.date.localeCompare(b.date));
}

const SERIES = [
  { seriesId: "DGS2", id: "ust2y", label: "US 2y Treasury", fixture: dgs2Fixture },
  { seriesId: "DGS5", id: "ust5y", label: "US 5y Treasury", fixture: dgs5Fixture },
  { seriesId: "DGS10", id: "ust10y", label: "US 10y Treasury", fixture: dgs10Fixture },
  { seriesId: "DGS30", id: "ust30y", label: "US 30y Treasury", fixture: dgs30Fixture },
  { seriesId: "DFEDTARU", id: "fedtarget", label: "Fed Funds Target (upper)", fixture: dfedtaruFixture },
];

export const fred: Provider = {
  name: "fred",
  async fetchDaily(): Promise<InstrumentSeries[]> {
    const key = process.env.FRED_API_KEY;
    const end = new Date().toISOString().slice(0, 10);
    // 400 days back: the curve page needs year-ago comparators and the
    // 2s10s tracker counts consecutive inverted sessions.
    const start = new Date(Date.now() - 400 * 86400_000).toISOString().slice(0, 10);

    return Promise.all(
      SERIES.map(async ({ seriesId, id, label, fixture }): Promise<InstrumentSeries> => {
        const base = {
          id,
          label,
          class: "rate" as const,
          precision: 2,
          source: SOURCE,
        };
        if (!key) {
          // Spec'd degradation: without a key the app still runs end to end
          // on real recorded values, honestly marked stale.
          const points = parseFred(fixture as FredObservations);
          return {
            ...base,
            points,
            health: {
              status: "stale",
              asOf: points[points.length - 1]?.date ?? "unknown",
              reason: "FRED_API_KEY not set — showing recorded fixture",
            },
          };
        }
        try {
          const res = await cachedFetch(
            `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}` +
              `&api_key=${key}&file_type=json&observation_start=${start}&observation_end=${end}`,
          );
          const points = parseFred((await res.json()) as FredObservations);
          return {
            ...base,
            points,
            health: points.length
              ? { status: "ok", asOf: points[points.length - 1].date }
              : { status: "down", reason: "empty response" },
          };
        } catch (err) {
          return { ...base, points: [], health: { status: "down", reason: String(err) } };
        }
      }),
    );
  },
};
