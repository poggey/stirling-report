import { Sparkline } from "./Sparkline";
import { formatChange, formatLevel } from "@/lib/format";
import type { MarketInstrument } from "@/lib/market-data";

const PILL_TONE = {
  rise: "bg-rise/10 text-rise",
  fall: "bg-fall/10 text-fall",
  flat: "border border-line text-muted",
} as const;

/** The markets strip: compact tiles for everything not promoted to the ledger. */
export function StatRow({ instruments }: { instruments: MarketInstrument[] }) {
  return (
    <section aria-label="Market board" className="mt-6">
      <ul className="grid grid-cols-2 gap-3.5 min-[960px]:grid-cols-4 xl:grid-cols-6">
        {instruments.map((instrument) => {
          const change = formatChange(instrument);
          return (
            <li
              key={instrument.id}
              className="flex flex-col gap-1.5 rounded-card border border-line bg-ivory-1 px-4 py-3.5 shadow-card"
            >
              <h3 className="caps text-muted">{instrument.label}</h3>
              <div className="flex items-baseline justify-between gap-2">
                <span className="figures text-base font-semibold text-ink">
                  {formatLevel(instrument)}
                </span>
                <span
                  className={`figures rounded-full px-2 py-0.5 text-[11px] font-bold ${PILL_TONE[change.tone]}`}
                >
                  <span aria-hidden="true">{change.glyph}</span>
                  <span className="sr-only">
                    {change.direction === "rise" ? "up" : change.direction === "fall" ? "down" : "unchanged"}
                  </span>{" "}
                  {change.text}
                </span>
              </div>
              <Sparkline
                points={instrument.points.slice(-30)}
                stroke="#17251E"
                strokeWidth={1.4}
                width={100}
                height={20}
                className="w-full"
                preserveAspectRatio="none"
              />
              {instrument.health.status !== "ok" && (
                <p className="rounded bg-sage px-1.5 py-0.5 text-[10px] leading-snug text-muted">
                  {instrument.health.status === "stale"
                    ? `stale since ${instrument.health.asOf}`
                    : "unavailable"}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
