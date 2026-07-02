import { Sparkline } from "./Sparkline";
import { formatChange, formatLevel } from "@/lib/format";
import type { MarketInstrument } from "@/lib/market-data";

/** Cream sparkline stroke weight scales with |z| — ink weight is meaning. */
function strokeFromZ(z: number): number {
  return Math.min(3.5, 1 + Math.abs(z) * 0.8);
}

/**
 * Today's Ledger — the single saturated green surface on the page
 * (WHITEPAPER §8.5). No other component may use a filled green panel.
 */
export function LedgerPanel({ instruments }: { instruments: MarketInstrument[] }) {
  return (
    <section
      aria-label="Today's Ledger — the day's most unusual moves"
      className="animate-settle relative overflow-hidden rounded-card bg-brg p-6 text-cream shadow-card sm:p-8"
    >
      {/* Faint brass dot-grid watermark, cropped by the panel edge */}
      <svg
        aria-hidden="true"
        className="absolute -bottom-6 -right-6 h-48 w-48 opacity-[0.13]"
      >
        <defs>
          <pattern id="dotgrid" width="12" height="12" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.4" fill="#A9853F" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dotgrid)" />
      </svg>

      <h2 className="font-display text-xl font-semibold">Today&rsquo;s Ledger</h2>
      <p className="mt-1 text-xs text-cream/70">
        The four most unusual moves vs each instrument&rsquo;s trailing month
      </p>

      <ul className="relative mt-5 divide-y divide-cream/15">
        {instruments.map((instrument) => {
          const change = formatChange(instrument);
          const unusual = Math.abs(instrument.z) >= 2;
          return (
            <li
              key={instrument.id}
              className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{instrument.label}</p>
                {unusual && (
                  <p className="figures text-[11px] text-brass">
                    {Math.abs(instrument.z).toFixed(1)}σ vs trailing month
                  </p>
                )}
                {instrument.health.status !== "ok" && (
                  <p className="text-[11px] text-cream/60">
                    stale since {instrument.health.status === "stale" ? instrument.health.asOf : "—"}
                  </p>
                )}
              </div>
              <Sparkline
                points={instrument.points.slice(-30)}
                stroke="#F2EFDF"
                strokeWidth={strokeFromZ(instrument.z)}
                width={84}
                height={26}
              />
              <div className="figures w-28 text-right">
                <p className="text-base font-medium">{formatLevel(instrument)}</p>
                <p className="text-xs text-cream/85">
                  <span aria-hidden="true">{change.glyph}</span>
                  <span className="sr-only">
                    {change.direction === "rise" ? "up" : change.direction === "fall" ? "down" : "unchanged"}
                  </span>{" "}
                  {change.text}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
