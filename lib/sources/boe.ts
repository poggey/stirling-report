import { cachedFetch } from "./cached-fetch";
import type { InstrumentSeries, Provider, SeriesPoint } from "./types";

const SOURCE = "Bank of England IADB";

const MONTHS: Record<string, string> = {
  Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
  Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12",
};

/**
 * IADB CSV: header `DATE,CODE1,CODE2,…`, dates as `05 May 2026`. Cells can be
 * empty when one series lags another (yields lag Bank Rate by a day) — skip
 * blanks per column. Returns a series per code, ascending.
 */
export function parseBoE(csv: string): Record<string, SeriesPoint[]> {
  const lines = csv.trim().split(/\r?\n/);
  const header = lines[0].split(",");
  const codes = header.slice(1);
  const out: Record<string, SeriesPoint[]> = Object.fromEntries(
    codes.map((c) => [c, []]),
  );
  for (const line of lines.slice(1)) {
    const cells = line.split(",");
    const [dd, mon, yyyy] = cells[0].split(" ");
    const month = MONTHS[mon];
    if (!month) continue;
    const date = `${yyyy}-${month}-${dd.padStart(2, "0")}`;
    codes.forEach((code, i) => {
      const raw = cells[i + 1];
      if (raw === undefined || raw.trim() === "") return;
      const value = Number(raw);
      if (!Number.isFinite(value)) return;
      out[code].push({ date, value });
    });
  }
  for (const code of codes) {
    out[code].sort((a, b) => a.date.localeCompare(b.date));
  }
  return out;
}

// No 2y par-yield quick code exists in IADB (see NOTES.md) — the short gilt
// tenor is the 5y nominal par yield, labelled honestly throughout the UI.
const SERIES = [
  { code: "IUDBEDR", id: "bankrate", label: "UK Bank Rate" },
  { code: "IUDSNPY", id: "gilt5y", label: "UK 5y Gilt" },
  { code: "IUDMNPY", id: "gilt10y", label: "UK 10y Gilt" },
  { code: "IUDLNPY", id: "gilt20y", label: "UK 20y Gilt" },
];

function fmtIadbDate(d: Date): string {
  const mon = Object.keys(MONTHS)[d.getUTCMonth()];
  return `${String(d.getUTCDate()).padStart(2, "0")}/${mon}/${d.getUTCFullYear()}`;
}

export const boe: Provider = {
  name: "boe",
  async fetchDaily(): Promise<InstrumentSeries[]> {
    const base = SERIES.map(({ id, label }) => ({
      id,
      label,
      class: "rate" as const,
      precision: 2,
      source: SOURCE,
    }));
    try {
      // 400 days back so the curve card can draw a one-year-ago comparator.
      const from = fmtIadbDate(new Date(Date.now() - 400 * 86400_000));
      const to = fmtIadbDate(new Date());
      const res = await cachedFetch(
        "https://www.bankofengland.co.uk/boeapps/iadb/fromshowcolumns.asp?csv.x=yes" +
          `&Datefrom=${from}&Dateto=${to}` +
          `&SeriesCodes=${SERIES.map((s) => s.code).join(",")}` +
          "&CSVF=TN&UsingCodes=Y&VPD=Y&VFD=N",
        { "User-Agent": "stirling/0.1 (daily economic briefing)" },
      );
      const series = parseBoE(await res.text());
      return SERIES.map(({ code }, i) => {
        const points = series[code] ?? [];
        return {
          ...base[i],
          points,
          health: points.length
            ? ({ status: "ok", asOf: points[points.length - 1].date } as const)
            : ({ status: "down", reason: `series ${code} empty` } as const),
        };
      });
    } catch (err) {
      return base.map((b) => ({
        ...b,
        points: [],
        health: { status: "down", reason: String(err) },
      }));
    }
  },
};
