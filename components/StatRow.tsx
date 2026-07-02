"use client";

import { useEffect, useState } from "react";
import { Sparkline } from "./Sparkline";
import { formatChange, formatLevel } from "@/lib/format";
import type { MarketInstrument } from "@/lib/market-data";

const PILL_TONE = {
  rise: "bg-rise/10 text-rise",
  fall: "bg-fall/10 text-fall",
  flat: "border border-line text-muted",
} as const;

const WATCHLIST_KEY = "stirling.watchlist";
const ONLY_KEY = "stirling.watchlist-only";

/**
 * The markets strip with the watchlist (WHITEPAPER §4.13): star any tile to
 * pin it to the front; optionally show the watchlist alone. Preferences live
 * in localStorage only — no accounts, no cookies. The green ledger stays
 * salience-driven: what mattered is never personalisable.
 */
export function StatRow({ instruments }: { instruments: MarketInstrument[] }) {
  const [starred, setStarred] = useState<string[]>([]);
  const [onlyWatchlist, setOnlyWatchlist] = useState(false);

  useEffect(() => {
    // Hydrate once from localStorage after mount — the server renders the
    // unpersonalised board, so a lazy initializer would mismatch.
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStarred(JSON.parse(localStorage.getItem(WATCHLIST_KEY) ?? "[]"));
    } catch {
      // ignore a corrupt entry
    }
    setOnlyWatchlist(localStorage.getItem(ONLY_KEY) === "on");
  }, []);

  const toggleStar = (id: string) => {
    setStarred((prev) => {
      const next = prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id];
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(next));
      return next;
    });
  };

  const toggleOnly = () => {
    setOnlyWatchlist((prev) => {
      localStorage.setItem(ONLY_KEY, prev ? "off" : "on");
      return !prev;
    });
  };

  const starredSet = new Set(starred);
  const pinned = instruments.filter((i) => starredSet.has(i.id));
  const rest = instruments.filter((i) => !starredSet.has(i.id));
  const shown = onlyWatchlist && pinned.length > 0 ? pinned : [...pinned, ...rest];

  return (
    <section aria-label="Market board" className="mt-6">
      {pinned.length > 0 && (
        <div className="mb-2.5 flex items-center gap-3">
          <span className="caps text-muted">
            <span className="text-brass">★</span> {pinned.length} on your watchlist
          </span>
          <button
            type="button"
            onClick={toggleOnly}
            aria-pressed={onlyWatchlist}
            className={`caps rounded-full border px-2.5 py-1 !text-[9.5px] transition-colors ${
              onlyWatchlist
                ? "border-brg bg-brg text-cream"
                : "border-line text-muted hover:text-brg"
            }`}
          >
            Watchlist only
          </button>
        </div>
      )}

      <ul className="grid grid-cols-2 gap-3.5 min-[960px]:grid-cols-4 xl:grid-cols-6">
        {shown.map((instrument) => {
          const change = formatChange(instrument);
          const isStarred = starredSet.has(instrument.id);
          return (
            <li
              key={instrument.id}
              className={`flex flex-col gap-1.5 rounded-card border bg-ivory-1 px-4 py-3.5 shadow-card ${
                isStarred ? "border-brass/60" : "border-line"
              }`}
            >
              <div className="flex items-baseline justify-between gap-1">
                <h3 className="caps truncate text-muted">{instrument.label}</h3>
                <button
                  type="button"
                  onClick={() => toggleStar(instrument.id)}
                  aria-pressed={isStarred}
                  aria-label={
                    isStarred
                      ? `Remove ${instrument.label} from watchlist`
                      : `Add ${instrument.label} to watchlist`
                  }
                  title={isStarred ? "On your watchlist" : "Pin to watchlist"}
                  className={`-mr-1 -mt-0.5 shrink-0 px-1 text-[13px] leading-none transition-colors ${
                    isStarred ? "text-brass" : "text-line hover:text-brass"
                  }`}
                >
                  {isStarred ? "★" : "☆"}
                </button>
              </div>
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
                precision={instrument.precision}
                isRate={instrument.class === "rate"}
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
