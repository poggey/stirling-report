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

      {instruments.map((instrument) => {
        const change = formatChange(instrument);
        const hot = Math.abs(instrument.z) >= 2;
        return (
          <div
            key={instrument.id}
            className="relative z-[2] flex items-center gap-3.5 border-b border-cream/10 py-3.5 last:border-b-0"
          >
            {Math.abs(instrument.z) >= 2.5 && (
              <span className="absolute -top-1.5 right-0 font-display text-[11.5px] italic text-brass">
                {Math.abs(instrument.z).toFixed(1)}σ day against its month
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="caps truncate text-cream/60">{instrument.label}</p>
              <p className={`figures mt-px text-xl ${hot ? "font-bold" : "font-semibold"}`}>
                {formatLevel(instrument)}
              </p>
              {instrument.health.status !== "ok" && (
                <p className="text-[11px] text-cream/60">
                  {instrument.health.status === "stale"
                    ? `stale since ${instrument.health.asOf}`
                    : "unavailable"}
                </p>
              )}
            </div>
            <Sparkline
              points={instrument.points.slice(-30)}
              stroke="#F2EFDF"
              strokeWidth={strokeFromZ(instrument.z)}
              width={72}
              height={24}
              className={hot ? "opacity-95" : "opacity-80"}
            />
            <p className={`figures min-w-[72px] text-right text-[13px] font-bold ${CHANGE_TONE[change.tone]}`}>
              <span aria-hidden="true">{change.glyph}</span>
              <span className="sr-only">
                {change.direction === "rise" ? "up" : change.direction === "fall" ? "down" : "unchanged"}
              </span>{" "}
              {change.text}
            </p>
          </div>
        );
      })}
    </aside>
  );
}
