/**
 * The Economic Diary needs the curated release calendar and consensus
 * handling that Phase 5 builds (§4.7). Until then the card holds its place
 * honestly — headers real, rows empty, nothing invented.
 */
export function EconomicDiary() {
  return (
    <section
      aria-label="The economic diary"
      className="rounded-card border border-line bg-ivory-1 p-6 shadow-card sm:px-7"
    >
      <div className="mb-4 flex items-baseline justify-between">
        <h3 className="coachline-under font-display text-[19px] font-[540] text-ink">
          The economic diary
        </h3>
        <span className="caps !font-medium text-muted">today&rsquo;s releases</span>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr>
            {["Time", "Release", "Prior", "Cons.", "Result"].map((h, i) => (
              <th
                key={h}
                className={`caps border-b border-line pb-2 !text-[9.5px] !font-bold text-muted ${i >= 2 ? "text-right" : "text-left"}`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
      </table>

      <div className="mt-4 rounded-lg bg-sage px-4 py-6 text-center text-[13px] leading-relaxed text-muted">
        The release schedule — ONS, BLS and ECB calendars with prior, consensus
        and BEAT / MISS / DUE pills — arrives in Phase 5, alongside the
        surprise index it feeds.
      </div>
    </section>
  );
}
