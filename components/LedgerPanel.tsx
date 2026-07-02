import { Sparkline } from "./Sparkline";
import { formatChange, formatLevel } from "@/lib/format";
import type { MarketInstrument } from "@/lib/market-data";

/** Cream sparkline stroke weight scales with |z| — ink weight is meaning. */
function strokeFromZ(z: number): number {
  return Math.min(3, 1.2 + Math.abs(z) * 0.55);
}

// Tinted rise/fall for figures set on the green panel (AA against racing-900).
const CHANGE_TONE = {
  rise: "text-[#8FD8B4]",
  fall: "text-[#F2A48F]",
  flat: "text-cream/70",
} as const;

/**
 * Today's Ledger — the single saturated green surface on the page
 * (WHITEPAPER §8.5). No other component may use a filled green panel.
 */
export function LedgerPanel({ instruments }: { instruments: MarketInstrument[] }) {
  return (
    <aside
      aria-label="Today's Ledger — the day's most unusual moves"
      className="animate-settle relative flex flex-col overflow-hidden rounded-card p-7 text-cream shadow-card"
      style={{
        background: "linear-gradient(168deg,#0E4230 0%, #0C3B2A 55%, #0A3123 100%)",
      }}
    >
      {/* Faint brass dot-grid medallion watermark, cropped by the panel edge */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-[70px] -right-[70px] h-[260px] w-[260px] rounded-full border border-brass/25"
        style={{
          background:
            "radial-gradient(circle, rgba(169,133,63,.14) 0 1px, transparent 1.5px) 0 0/9px 9px",
        }}
      />

      <div className="mb-1 flex items-center justify-between border-b border-cream/20 pb-3">
        <h2 className="font-display text-[19px] font-[540]">Today&rsquo;s ledger</h2>
        <span className="caps text-cream/55">highest salience</span>
      </div>

      <div>
      {instruments.map((instrument) => {
        const change = formatChange(instrument);
        const hot = Math.abs(instrument.z) >= 2;
        return (
          <div
            key={instrument.id}
            className="relative z-[2] border-b border-cream/10 py-3 last:border-b-0"
          >
            <div className="flex items-baseline justify-between gap-3">
              <p className="caps truncate text-cream/60">{instrument.label}</p>
              {Math.abs(instrument.z) >= 2.5 && (
                <p className="shrink-0 font-display text-[11.5px] italic leading-none text-brass">
                  {Math.abs(instrument.z).toFixed(1)}σ vs its month
                </p>
              )}
            </div>
            <div className="mt-1 flex items-center gap-3.5">
              <p className={`figures min-w-0 flex-1 truncate text-xl leading-none ${hot ? "font-bold" : "font-semibold"}`}>
                {formatLevel(instrument)}
              </p>
              <Sparkline
                points={instrument.points.slice(-30)}
                stroke="#F2EFDF"
                strokeWidth={strokeFromZ(instrument.z)}
                width={72}
                height={24}
                className={hot ? "opacity-95" : "opacity-80"}
                precision={instrument.precision}
                isRate={instrument.class === "rate"}
              />
              <p className={`figures min-w-[68px] shrink-0 text-right text-[13px] font-bold ${CHANGE_TONE[change.tone]}`}>
                <span aria-hidden="true">{change.glyph}</span>
                <span className="sr-only">
                  {change.direction === "rise" ? "up" : change.direction === "fall" ? "down" : "unchanged"}
                </span>{" "}
                {change.text}
              </p>
            </div>
            {instrument.health.status !== "ok" && (
              <p className="mt-0.5 text-[11px] text-cream/60">
                {instrument.health.status === "stale"
                  ? `stale since ${instrument.health.asOf}`
                  : "unavailable"}
              </p>
            )}
          </div>
        );
      })}
      </div>
    </aside>
  );
}
