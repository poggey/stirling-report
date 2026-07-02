import { cachedFetch } from "./cached-fetch";
import type { InstrumentSeries, Provider, SeriesPoint } from "./types";

const SOURCE = "ECB Data Portal";

/**
 * ECB Data Portal csvdata: header row names ~40 columns; TIME_PERIOD and
 * OBS_VALUE sit before any quoted field, so column-index parsing on the
 * leading cells is safe (see scripts/probe-ecb.ts).
 */
export function parseEcb(csv: string): SeriesPoint[] {
  const lines = csv.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const header = lines[0].split(",");
  const dateIdx = header.indexOf("TIME_PERIOD");
  const valueIdx = header.indexOf("OBS_VALUE");
  if (dateIdx === -1 || valueIdx === -1) return [];
  const points: SeriesPoint[] = [];
  for (const line of lines.slice(1)) {
    const cells = line.split(",");
    const value = Number(cells[valueIdx]);
    const date = cells[dateIdx];
    if (!Number.isFinite(value) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    points.push({ date, value });
  }
  return points.sort((a, b) => a.date.localeCompare(b.date));
}

export const ecb: Provider = {
  name: "ecb",
  async fetchDaily(): Promise<InstrumentSeries[]> {
    const base = {
      id: "ecbdeposit",
      label: "ECB Deposit Rate",
      class: "rate" as const,
      precision: 2,
      source: SOURCE,
    };
    try {
      const res = await cachedFetch(
        "https://data-api.ecb.europa.eu/service/data/FM/D.U2.EUR.4F.KR.DFR.LEV?format=csvdata&lastNObservations=400",
      );
      const points = parseEcb(await res.text());
      return [
        {
          ...base,
          points,
          health: points.length
            ? { status: "ok", asOf: points[points.length - 1].date }
            : { status: "down", reason: "empty response" },
        },
      ];
    } catch (err) {
      return [{ ...base, points: [], health: { status: "down", reason: String(err) } }];
    }
  },
};
