/**
 * The Economic Diary (WHITEPAPER §4.7). The schedule is curated from the
 * official release calendars — dates are facts, published months ahead.
 * Consensus expectations are commercial data and are omitted gracefully
 * (WHITEPAPER §13); where an entry carries both actual and prior, the
 * surprise direction is scored against the prior print instead.
 *
 * Curated 2 July 2026 from: bls.gov/schedule, ons.gov.uk/releasecalendar,
 * and the central-bank calendars in lib/central-banks.ts.
 */

export type Economy = "UK" | "US" | "EA";

export interface DiaryEntry {
  /** Release date, YYYY-MM-DD, and UK wall-clock time. */
  date: string;
  time: string;
  economy: Economy;
  name: string;
  /** Prior print, when the previous bulletin's figure is on record. */
  prior?: string;
  /**
   * Consensus expectation — commercial data, so recorded only when a figure
   * is publicly citable (WHITEPAPER §13 sanctions manual entry); otherwise
   * the column shows an honest em-dash.
   */
  expected?: string;
  /** Actual print, recorded once the release is out. */
  actual?: string;
  /** Numeric actual/prior for surprise scoring, in the release's own unit. */
  priorValue?: number;
  actualValue?: number;
}

export const SCHEDULE_CURATED_AT = "2026-07-02";

// Priors verified against the official releases on the curation date:
// US CPI May 2026 4.2% y/y (BLS, 10 Jun); UK CPI May 2026 2.8% y/y
// (ONS, 17 Jun); policy priors are the standing rates from our own data.
export const DIARY: DiaryEntry[] = [
  {
    date: "2026-07-02",
    time: "13:30",
    economy: "US",
    name: "US Employment Situation, June (non-farm payrolls)",
    actual: "+57k · u/e 4.2%",
    // Prior omitted: May's initial print is superseded by revisions and
    // was not re-recorded — no number is shown that we cannot source.
  },
  {
    date: "2026-07-14",
    time: "13:30",
    economy: "US",
    name: "US CPI, June (y/y)",
    prior: "4.2%",
    priorValue: 4.2,
  },
  {
    date: "2026-07-22",
    time: "07:00",
    economy: "UK",
    name: "UK consumer price inflation, June (y/y)",
    prior: "2.8%",
    priorValue: 2.8,
  },
  {
    date: "2026-07-23",
    time: "13:15",
    economy: "EA",
    name: "ECB policy decision (deposit rate)",
    prior: "2.25%",
    priorValue: 2.25,
  },
  {
    date: "2026-07-29",
    time: "19:00",
    economy: "US",
    name: "US FOMC policy decision (target upper)",
    prior: "3.75%",
    priorValue: 3.75,
  },
  {
    date: "2026-07-30",
    time: "12:00",
    economy: "UK",
    name: "UK MPC policy decision (Bank Rate)",
    prior: "3.75%",
    priorValue: 3.75,
  },
];

export type DiaryStatus = "due" | "printed" | "beat" | "miss";

export function diaryStatus(entry: DiaryEntry, today: string): DiaryStatus {
  if (entry.actualValue !== undefined && entry.priorValue !== undefined) {
    return entry.actualValue >= entry.priorValue ? "beat" : "miss";
  }
  if (entry.actual) return "printed";
  if (entry.date <= today) return "printed"; // date passed, print pending record
  return "due";
}

/**
 * First-pass surprise index: mean of ±1 direction scores (actual vs prior)
 * over recorded prints per economy. Returns null until any release carries
 * both numbers — the panel states that honestly rather than plotting noise.
 */
export function surpriseIndex(entries: DiaryEntry[], economy: Economy): number | null {
  const scored = entries.filter(
    (e) =>
      e.economy === economy &&
      e.actualValue !== undefined &&
      e.priorValue !== undefined,
  );
  if (scored.length === 0) return null;
  const sum = scored.reduce(
    (s, e) => s + Math.sign(e.actualValue! - e.priorValue!),
    0,
  );
  return sum / scored.length;
}
