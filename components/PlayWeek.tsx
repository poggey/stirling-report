"use client";

import { useEffect, useRef, useState } from "react";
import { WeatherTile } from "./WeatherTile";
import type { EditionSummary } from "@/lib/editions/summaries";

/**
 * Play Week (WHITEPAPER §4.4): animates through the last five sessions at
 * two seconds per day, surfacing each day's headline — a narrative arc in
 * ten seconds. Respects prefers-reduced-motion by stepping only on click.
 */
export function PlayWeek({ week }: { week: EditionSummary[] }) {
  const [active, setActive] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    setPlaying(false);
  };

  useEffect(() => stop, []);

  const play = () => {
    if (week.length === 0) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (playing) {
      stop();
      return;
    }
    if (reduced) {
      // Step manually rather than animating.
      setActive((a) => (a === null || a >= week.length - 1 ? 0 : a + 1));
      return;
    }
    setActive(0);
    setPlaying(true);
    let i = 0;
    timer.current = setInterval(() => {
      i += 1;
      if (i >= week.length) {
        stop();
        return;
      }
      setActive(i);
    }, 2000);
  };

  if (week.length < 2) {
    return (
      <p className="rounded-lg bg-sage px-4 py-3 text-[13px] text-muted">
        Play Week needs a few editions in the can — check back once the
        archive has grown.
      </p>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={play}
          className="rounded-[10px] bg-brg px-4 py-2 text-[13px] font-semibold text-cream transition-colors hover:bg-brg-600"
        >
          ⚑ {playing ? "Stop" : "Play week"}
        </button>
        <span className="text-xs text-muted">
          {week.length} sessions · 2s per day
        </span>
      </div>
      <div className="mt-4 flex gap-[9px]">
        {week.map((s, i) => (
          <WeatherTile key={s.date} summary={s} highlighted={active === i} />
        ))}
      </div>
      <p
        aria-live="polite"
        className="mt-3 min-h-[3.5em] max-w-[52ch] font-display text-[17px] leading-snug text-ink"
      >
        {active !== null && week[active] ? (
          <>
            <span className="caps mr-2 !font-bold font-sans text-brass">
              Nº {week[active].number}
            </span>
            {week[active].headline}
          </>
        ) : (
          <span className="text-muted">Press play to watch the week unfold.</span>
        )}
      </p>
    </div>
  );
}
