import { cachedFetch } from "./cached-fetch";
import type { InstrumentSeries, Provider, SeriesPoint } from "./types";

// Stooq is the specified source for index/commodity closes, but it now serves
// a JavaScript anti-bot challenge to non-browser clients (see NOTES.md), so
// this provider uses Yahoo Finance's keyless chart API as the named fallback.
// Revisit when Stooq unblocks or when a keyed primary (Twelve Data/Finnhub)
// is added.
const SOURCE = "Yahoo Finance";

interface YahooChartResponse {
  chart: {
    result: {
      timestamp?: number[];
      indicators: { quote: { close: (number | null)[] }[] };
    }[];
  };
}

/** Zip timestamps with closes; half-days can carry null closes — drop them. */
export function parseYahoo(body: YahooChartResponse): SeriesPoint[] {
  const result = body.chart.result?.[0];
  const timestamps = result?.timestamp ?? [];
  const closes = result?.indicators.quote[0]?.close ?? [];
  const points: SeriesPoint[] = [];
  for (let i = 0; i < timestamps.length; i++) {
    const value = closes[i];
    if (value == null) continue;
    points.push({
      date: new Date(timestamps[i] * 1000).toISOString().slice(0, 10),
      value,
    });
  }
  return points.sort((a, b) => a.date.localeCompare(b.date));
}

const INSTRUMENTS = [
  { symbol: "^FTSE", id: "ftse", label: "FTSE 100", class: "index" as const, precision: 1 },
  { symbol: "^GSPC", id: "spx", label: "S&P 500", class: "index" as const, precision: 1 },
  { symbol: "^IXIC", id: "nasdaq", label: "Nasdaq", class: "index" as const, precision: 1 },
  { symbol: "BZ=F", id: "brent", label: "Brent Crude", class: "commodity" as const, precision: 2 },
  { symbol: "GC=F", id: "gold", label: "Gold", class: "commodity" as const, precision: 1 },
];

export const yahoo: Provider = {
  name: "yahoo",
  async fetchDaily(): Promise<InstrumentSeries[]> {
    return Promise.all(
      INSTRUMENTS.map(async ({ symbol, ...base }): Promise<InstrumentSeries> => {
        try {
          const res = await cachedFetch(
            `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=2mo&interval=1d`,
            { "User-Agent": "Mozilla/5.0" },
          );
          const points = parseYahoo((await res.json()) as YahooChartResponse);
          return {
            ...base,
            source: SOURCE,
            points,
            health: points.length
              ? { status: "ok", asOf: points[points.length - 1].date }
              : { status: "down", reason: "empty response" },
          };
        } catch (err) {
          return {
            ...base,
            source: SOURCE,
            points: [],
            health: { status: "down", reason: String(err) },
          };
        }
      }),
    );
  },
};
