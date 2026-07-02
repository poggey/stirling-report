import type { MarketInstrument } from "@/lib/market-data";

interface SpreadTrackerProps {
  label: string;
  short: MarketInstrument;
  long: MarketInstrument;
  /** e.g. "the most-watched US recession signal" */
  note: string;
}

/**
 * The persistent spread tracker (WHITEPAPER §4.6): current slope, today's
 * change, inversion status and — when inverted — consecutive sessions
 * inverted, counted from the stored history.
 */
export function SpreadTracker({ label, short, long, note }: SpreadTrackerProps) {
  if (short.level === null || long.level === null) {
    return (
      <div className="rounded-card border border-line bg-ivory-1 p-6 shadow-card">
        <div className="caps text-muted">{label}</div>
        <p className="mt-2 text-sm text-muted">Source unavailable.</p>
      </div>
    );
  }

  const spreadBp = Math.round((long.level - short.level) * 100);
  const inverted = spreadBp < 0;

  // Pair the two series by date, walk back counting inverted sessions.
  const shortByDate = new Map(short.points.map((p) => [p.date, p.value]));
  const sharedDates = long.points
    .map((p) => p.date)
    .filter((d) => shortByDate.has(d))
    .sort();
  let invertedRun = 0;
  for (let i = sharedDates.length - 1; i >= 0; i--) {
    const d = sharedDates[i];
    const s = shortByDate.get(d)!;
    const l = long.points.find((p) => p.date === d)!.value;
    if (l - s < 0) invertedRun += 1;
    else break;
  }
  const windowCapped = invertedRun === sharedDates.length && invertedRun > 0;

  const prevIdx = sharedDates.length - 2;
  const deltaBp =
    prevIdx >= 0
      ? Math.round(
          (long.points.find((p) => p.date === sharedDates[prevIdx + 1])!.value -
            shortByDate.get(sharedDates[prevIdx + 1])! -
            (long.points.find((p) => p.date === sharedDates[prevIdx])!.value -
              shortByDate.get(sharedDates[prevIdx])!)) *
            100,
        )
      : null;

  return (
    <div className="rounded-card border border-line bg-ivory-1 p-6 shadow-card">
      <div className="caps text-muted">{label}</div>
      <div className="mt-2 flex flex-wrap items-baseline gap-x-6 gap-y-2">
        <span className={`figures text-3xl font-bold ${inverted ? "text-fall" : "text-ink"}`}>
          {spreadBp >= 0 ? "+" : ""}
          {spreadBp}bp
        </span>
        {deltaBp !== null && (
          <span className="figures text-sm font-semibold text-muted">
            {deltaBp >= 0 ? "+" : "−"}
            {Math.abs(deltaBp)}bp {deltaBp >= 0 ? "steeper" : "flatter"} today
          </span>
        )}
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
            inverted ? "bg-fall/10 text-fall" : "border border-line text-muted"
          }`}
        >
          {inverted
            ? `INVERTED · ${invertedRun}${windowCapped ? "+" : ""} session${invertedRun === 1 ? "" : "s"}`
            : "Not inverted"}
        </span>
      </div>
      <p className="mt-3 text-[12.5px] leading-relaxed text-muted">{note}</p>
    </div>
  );
}
