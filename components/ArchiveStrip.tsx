/**
 * The archive holds one tile per issued edition. Editions begin accumulating
 * when the Phase 2 snapshot cron ships — today there is exactly one, so the
 * strip shows it honestly beside the empty run it will grow into.
 */
export function ArchiveStrip({ edition, date }: { edition: number; date: Date }) {
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(date);
    d.setDate(d.getDate() - (29 - i));
    return d;
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
          editions accumulate from Phase 2 · <span className="text-brg">⚑ play week — Phase 4</span>
        </span>
      </div>
      <div className="flex gap-[9px] overflow-x-auto px-0.5 pb-0.5 pt-1.5">
        {days.map((d, i) => {
          const isToday = i === days.length - 1;
          return (
            <div
              key={d.toISOString()}
              title={
                isToday
                  ? `Edition Nº ${edition} — today`
                  : "No edition — archive begins with the Phase 2 snapshot cron"
              }
              className={`flex h-12 w-[42px] shrink-0 flex-col items-center justify-center gap-[3px] rounded-[10px] border ${
                isToday
                  ? "border-[1.5px] border-brass bg-[#E2EEE2]"
                  : "border-dashed border-line bg-ivory-0"
              }`}
            >
              <span
                className={`figures text-[10px] font-bold ${isToday ? "text-ink/75" : "text-line"}`}
              >
                {d.getDate()}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
