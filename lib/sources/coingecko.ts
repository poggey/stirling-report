import { cachedFetch } from "./cached-fetch";
import type { InstrumentSeries, Provider, SeriesPoint } from "./types";

const SOURCE = "CoinGecko";

interface MarketChartResponse {
  prices: [number, number][];
}

/**
 * CoinGecko daily prices are midnight-UTC points except the final one, which
 * is the live price at request time. Collapse to one point per date, keeping
 * the latest — today's entry is "today so far".
 */
export function parseCoinGecko(body: MarketChartResponse): SeriesPoint[] {
  const byDate = new Map<string, number>();
  for (const [ms, value] of body.prices) {
    byDate.set(new Date(ms).toISOString().slice(0, 10), value);
  }
  return [...byDate.entries()]
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

const COINS = [
  { coin: "bitcoin", id: "btc", label: "Bitcoin", precision: 0 },
  { coin: "ethereum", id: "eth", label: "Ethereum", precision: 0 },
];

export const coingecko: Provider = {
  name: "coingecko",
  async fetchDaily(): Promise<InstrumentSeries[]> {
    return Promise.all(
      COINS.map(async ({ coin, id, label, precision }): Promise<InstrumentSeries> => {
        const base = { id, label, class: "crypto" as const, precision, source: SOURCE };
        try {
          const res = await cachedFetch(
            `https://api.coingecko.com/api/v3/coins/${coin}/market_chart?vs_currency=usd&days=30&interval=daily`,
          );
          const points = parseCoinGecko((await res.json()) as MarketChartResponse);
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
