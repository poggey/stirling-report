import type { MarketInstrument } from "@/lib/market-data";

/**
 * Scheduled policy decision dates, curated 2 July 2026 from the official
 * calendars (decision day):
 * - BoE:  bankofengland.co.uk/monetary-policy/upcoming-mpc-dates
 * - Fed:  federalreserve.gov/monetarypolicy/fomccalendars.htm
 * - ECB:  ecb.europa.eu/press/calendars/mgcgc
 * Update when each institution publishes the next year's calendar.
 */
export const BANKS = [
  {
    id: "bankrate",
    name: "Bank of England",
    body: "MPC",
    meetings: ["2026-07-30", "2026-09-17", "2026-11-05", "2026-12-17"],
  },
  {
    id: "fedtarget",
    name: "Federal Reserve",
    body: "FOMC",
    meetings: ["2026-07-29", "2026-09-16", "2026-10-28", "2026-12-09"],
  },
  {
    id: "ecbdeposit",
    name: "European Central Bank",
    body: "Governing Council",
    meetings: ["2026-07-23", "2026-10-29", "2026-12-17"],
  },
] as const;

export function nextMeeting(
  meetings: readonly string[],
  today: string,
): { date: string; daysAway: number } | null {
  const next = meetings.find((m) => m >= today);
  if (!next) return null;
  const days = Math.round(
    (Date.parse(`${next}T12:00:00Z`) - Date.parse(`${today}T12:00:00Z`)) / 86400_000,
  );
  return { date: next, daysAway: days };
}

export interface LastChange {
  date: string;
  deltaBp: number;
}

/** The most recent change in a policy-rate series — real, from the data. */
export function lastRateChange(instrument: MarketInstrument): LastChange | null {
  const points = instrument.points;
  if (points.length < 2) return null;
  const latest = points[points.length - 1].value;
  for (let i = points.length - 2; i >= 0; i--) {
    if (points[i].value !== latest) {
      return {
        date: points[i + 1].date,
        deltaBp: Math.round((latest - points[i].value) * 100),
      };
    }
  }
  return null;
}
