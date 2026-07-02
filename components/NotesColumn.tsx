import Link from "next/link";
import { conceptOfTheDay } from "@/lib/glossary";
import { historyFor } from "@/lib/history";

/** The right-hand notes: This Day in Economic History + the Learn Mode teaser. */
export function NotesColumn({ date }: { date: Date }) {
  const vignette = historyFor(date);
  const concept = conceptOfTheDay(date);
  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-card border border-line bg-ivory-1 p-6 shadow-card sm:px-7">
        <div className="caps text-muted">This day in economic history</div>
        {vignette ? (
          <>
            <div className="caps mt-3 !text-[10px] !font-bold !tracking-[0.13em] text-brass">
              {date.toLocaleDateString("en-GB", { day: "numeric", month: "long" })}{" "}
              {vignette.year}
            </div>
            <p className="mt-1.5 font-display text-base leading-normal text-ink">
              {vignette.text}
            </p>
          </>
        ) : (
          <p className="mt-3 text-[13px] text-muted">
            No vignette in the archive for this date yet — the curated dataset
            grows edition by edition.
          </p>
        )}
      </section>

      <section className="rounded-card border border-line bg-ivory-1 p-6 shadow-card sm:px-7">
        <div className="caps text-muted">Concept of the day · Learn mode</div>
        <h4 className="mt-2.5 font-display text-lg font-[540] text-ink">{concept.term}</h4>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-[#42504A]">
          {concept.definition}
        </p>
        <p className="mt-2 text-[12.5px] leading-relaxed text-muted">
          <span className="font-semibold text-brass">Why it matters:</span> {concept.why}{" "}
          <Link href="/learn" className="font-semibold text-brg-600 hover:underline">
            Learn mode →
          </Link>
        </p>
      </section>
    </div>
  );
}
