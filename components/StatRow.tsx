import { Sparkline } from "./Sparkline";
import { formatChange, formatLevel } from "@/lib/format";
import type { MarketInstrument } from "@/lib/market-data";

const PILL_STYLES = {
  rise: "bg-rise/10 text-rise",
  fall: "bg-fall/10 text-fall",
  flat: "border border-line text-muted",
} as const;

/** The markets strip: every instrument not promoted to the green ledger. */
export function StatRow({ instruments }: { instruments: MarketInstrument[] }) {
  return (
    <section aria-label="Market board">
      <ul className="grid grid-cols-1 gap-4 min-[430px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {instruments.map((instrument) => {
          const change = formatChange(instrument);
          return (
            <li
              key={instrument.id}
              className="rounded-card border border-line bg-ivory-1 p-4 shadow-card"
            >
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="truncate text-sm font-medium text-ink">
                  {instrument.label}
                </h3>
                <span
                  className={`figures shrink-0 rounded-full px-2 py-0.5 text-xs ${PILL_STYLES[change.direction]}`}
                >
                  <span aria-hidden="true">{change.glyph}</span>
                  <span className="sr-only">
                    {change.direction === "rise" ? "up" : change.direction === "fall" ? "down" : "unchanged"}
                  </span>{" "}
                  {change.text}
                </span>
              </div>
              <p className="figures mt-2 text-xl text-ink">{formatLevel(instrument)}</p>
              <div className="mt-2">
                <Sparkline
                  points={instrument.points.slice(-30)}
                  stroke="#17251E"
                  strokeWidth={1.2}
                  width={120}
                  height={26}
                />
              </div>
              {instrument.health.status !== "ok" && (
                <p className="mt-2 rounded bg-sage px-2 py-1 text-[11px] text-muted">
                  {instrument.health.status === "stale"
                    ? `Stale since ${instrument.health.asOf} — ${instrument.health.reason}`
                    : `Unavailable — ${instrument.health.reason}`}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
