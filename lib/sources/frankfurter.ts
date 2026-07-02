import { cachedFetch } from "./cached-fetch";
import type { InstrumentSeries, Provider, SeriesPoint } from "./types";

const SOURCE = "Frankfurter (ECB reference rates)";

interface FrankfurterResponse {
  base: string;
  rates: Record<string, Record<string, number>>;
}

/** One dated rate series per symbol, ascending. Dates are TARGET business days. */
export function parseFrankfurter(
  body: FrankfurterResponse,
  symbol: string,
): SeriesPoint[] {
  return Object.entries(body.rates)
    .filter(([, syms]) => typeof syms[symbol] === "number")
    .map(([date, syms]) => ({ date, value: syms[symbol] }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// One request per base currency covers all four pairs in three calls.
const REQUESTS: { base: string; symbols: string[] }[] = [
  { base: "GBP", symbols: ["USD"] },
  { base: "EUR", symbols: ["USD", "GBP"] },
  { base: "USD", symbols: ["JPY"] },
];

const META: Record<string, { id: string; label: string }> = {
  "GBP/USD": { id: "gbpusd", label: "GBP/USD" },
  "EUR/USD": { id: "eurusd", label: "EUR/USD" },
  "EUR/GBP": { id: "eurgbp", label: "EUR/GBP" },
  "USD/JPY": { id: "usdjpy", label: "USD/JPY" },
};

function windowDates(): { start: string; end: string } {
  const end = new Date().toISOString().slice(0, 10);
  const start = new Date(Date.now() - 60 * 86400_000).toISOString().slice(0, 10);
  return { start, end };
}

export const frankfurter: Provider = {
  name: "frankfurter",
  async fetchDaily(): Promise<InstrumentSeries[]> {
    const { start, end } = windowDates();
    const out: InstrumentSeries[] = [];
    for (const { base, symbols } of REQUESTS) {
      const pairs = symbols.map((s) => `${base}/${s}`);
      try {
        const res = await cachedFetch(
          `https://api.frankfurter.dev/v1/${start}..${end}?base=${base}&symbols=${symbols.join(",")}`,
        );
        const body = (await res.json()) as FrankfurterResponse;
        for (const symbol of symbols) {
          const points = parseFrankfurter(body, symbol);
          const meta = META[`${base}/${symbol}`];
          out.push({
            ...meta,
            class: "fx",
            precision: 4,
            source: SOURCE,
            points,
            health: points.length
              ? { status: "ok", asOf: points[points.length - 1].date }
              : { status: "down", reason: "empty response" },
          });
        }
      } catch (err) {
        for (const pair of pairs) {
          out.push({
            ...META[pair],
            class: "fx",
            precision: 4,
            source: SOURCE,
            points: [],
            health: { status: "down", reason: String(err) },
          });
        }
      }
    }
    return out;
  },
};
