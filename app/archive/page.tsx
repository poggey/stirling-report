import type { Metadata } from "next";
import Link from "next/link";
import { PlayWeek } from "@/components/PlayWeek";
import { WeatherTile } from "@/components/WeatherTile";
import { getEditionSummaries } from "@/lib/editions/summaries";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "The Archive — Stirling",
  description: "Every edition ever issued, replayable exactly as it stood.",
};

/** Group summaries into "July 2026" buckets, newest month first. */
function byMonth(summaries: Awaited<ReturnType<typeof getEditionSummaries>>) {
  const months = new Map<string, typeof summaries>();
  for (const s of summaries) {
    const key = s.date.slice(0, 7);
    months.set(key, [...(months.get(key) ?? []), s]);
  }
  return [...months.entries()].sort((a, b) => b[0].localeCompare(a[0]));
}

export default async function ArchivePage() {
  const summaries = await getEditionSummaries();
  const months = byMonth(summaries);

  return (
    <main className="mx-auto max-w-[1200px] px-4 pb-16 sm:px-7">
      <div className="mt-[30px] flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="caps flex items-center gap-2.5 text-brg">
            <span aria-hidden="true" className="inline-block h-0.5 w-[26px] rounded bg-brg" />
            The Time Machine
          </p>
          <h1 className="mt-3 font-display text-4xl font-[540] text-ink">The archive</h1>
          <p className="mt-2 max-w-[52ch] text-[15px] text-muted">
            One immutable edition per day since launch. Click any tile to
            replay that evening exactly as it stood — same numbers, same
            story, same briefing.
          </p>
        </div>
        <Link href="/" className="text-sm font-semibold text-brg-600 hover:underline">
          ← Today
        </Link>
      </div>

      <section className="mt-8 rounded-card border border-line bg-ivory-1 p-6 shadow-card sm:px-7">
        <h2 className="coachline-under font-display text-[19px] font-[540] text-ink">
          Play week
        </h2>
        <div className="mt-4">
          <PlayWeek week={summaries.slice(-5)} />
        </div>
      </section>

      {months.length === 0 ? (
        <p className="mt-8 rounded-card bg-sage px-5 py-6 text-sm text-muted">
          No editions stored yet — the first arrives with tonight&rsquo;s 22:05 snapshot.
        </p>
      ) : (
        months.map(([month, entries]) => (
          <section key={month} className="mt-8">
            <h2 className="caps mb-3 text-muted">
              {new Date(`${month}-01T12:00:00Z`).toLocaleDateString("en-GB", {
                month: "long",
                year: "numeric",
              })}
              {" · "}
              <span className="figures">
                {entries.length} edition{entries.length === 1 ? "" : "s"}
              </span>
            </h2>
            <div className="grid grid-cols-5 gap-2.5 sm:grid-cols-8 lg:grid-cols-12">
              {entries.map((s) => (
                <WeatherTile key={s.date} summary={s} size="calendar" />
              ))}
            </div>
          </section>
        ))
      )}

      <p className="mt-10 text-xs text-muted">
        Weather key: tiles tint from clear green through storm vermilion —
        the same five-state gauge as the daily chip. The archive is also an
        open dataset at{" "}
        <span className="figures rounded bg-sage px-1.5 py-0.5 font-medium">/api/editions/index</span>.
      </p>
    </main>
  );
}
