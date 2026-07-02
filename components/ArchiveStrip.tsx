import Link from "next/link";
import { WeatherTile } from "./WeatherTile";
import type { EditionSummary } from "@/lib/editions/summaries";
import { ukDateOf } from "@/lib/editions/types";

/**
 * The last 30 sessions as weather-tinted tiles. Days without an edition
 * render as dashed empty slots — the archive only ever grows.
 */
export function ArchiveStrip({
  summaries,
  date,
}: {
  summaries: EditionSummary[];
  date: Date;
}) {
  const byDate = new Map(summaries.map((s) => [s.date, s]));
  const today = ukDateOf(date);
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(date);
    d.setDate(d.getDate() - (29 - i));
    return ukDateOf(d);
  });

  return (
    <section
      aria-label="The archive"
      className="mt-6 rounded-card border border-line bg-ivory-1 px-6 py-[22px] shadow-card sm:px-7"
    >
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="coachline-under font-display text-[19px] font-[540] text-ink">
          The archive
        </h3>
        <span className="caps !font-medium text-muted">
          last 30 sessions · click to replay ·{" "}
          <Link href="/archive" className="font-bold text-brg hover:text-brg-600">
            ⚑ full archive
          </Link>
        </span>
      </div>
      <div className="flex gap-[9px] overflow-x-auto px-0.5 pb-0.5 pt-1.5">
        {days.map((d) => {
          const summary = byDate.get(d);
          return summary ? (
            <WeatherTile key={d} summary={summary} isToday={d === today} />
          ) : (
            <div
              key={d}
              title="No edition for this date"
              className="flex h-12 w-[42px] shrink-0 flex-col items-center justify-center rounded-[10px] border border-dashed border-line bg-ivory-0"
            >
              <span className="figures text-[10px] font-bold text-line">
                {Number(d.slice(8, 10))}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
