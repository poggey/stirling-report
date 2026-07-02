import type { Metadata } from "next";
import Link from "next/link";
import { Flashcards } from "@/components/learn/Flashcards";
import { LearnToggle } from "@/components/learn/LearnProvider";
import { PersonalGlossary } from "@/components/learn/PersonalGlossary";
import { getLatestEdition } from "@/lib/editions/store";
import { getEditionSummaries } from "@/lib/editions/summaries";
import { conceptOfTheDay, GLOSSARY } from "@/lib/glossary";
import { flashcardsFromEditions, modelAnswer } from "@/lib/prep";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Learn — Stirling",
  description:
    "Learn mode, the glossary, and Interview Prep: a model answer with per-sentence data footnotes, flashcards from the archive, and the Last 30 Days one-pager.",
};

export default async function LearnPage() {
  const [latest, summaries] = await Promise.all([
    getLatestEdition(),
    getEditionSummaries(30),
  ]);
  const concept = conceptOfTheDay(new Date());
  const answer = latest ? modelAnswer(latest) : [];
  const cards = flashcardsFromEditions(
    [...summaries].reverse().map((s) => ({
      date: s.date,
      number: s.number,
      headline: s.headline,
    })),
  );

  return (
    <main className="mx-auto max-w-[1200px] px-4 pb-16 sm:px-7">
      <div className="mt-[30px] flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="caps flex items-center gap-2.5 text-brg">
            <span aria-hidden="true" className="inline-block h-0.5 w-[26px] rounded bg-brg" />
            The ambient tutor
          </p>
          <h1 className="mt-3 font-display text-4xl font-[540] text-ink">Learn</h1>
          <p className="mt-2 max-w-[58ch] text-[15px] text-muted">
            Switch Learn mode on and every technical term across Stirling
            grows a dotted brass underline — click for a two-sentence
            definition and why it matters today. Terms you open build your
            personal glossary, kept in this browser only.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <LearnToggle />
          <Link href="/" className="text-sm font-semibold text-brg-600 hover:underline">
            ← Today
          </Link>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 min-[960px]:grid-cols-[5fr_7fr]">
        <section className="rounded-card border border-line bg-ivory-1 p-6 shadow-card sm:px-7">
          <div className="caps text-muted">Concept of the day</div>
          <h2 className="mt-2 font-display text-2xl font-[540] text-ink">{concept.term}</h2>
          <p className="mt-2 text-[14px] leading-relaxed text-[#42504A]">{concept.definition}</p>
          <p className="mt-2.5 text-[13px] leading-relaxed text-muted">
            <span className="font-semibold text-brass">Why it matters:</span> {concept.why}
          </p>
        </section>

        <section className="rounded-card border border-line bg-ivory-1 p-6 shadow-card sm:px-7">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="coachline-under font-display text-[19px] font-[540] text-ink">
              Your glossary
            </h2>
            <span className="caps !font-medium text-muted">this browser only</span>
          </div>
          <PersonalGlossary />
        </section>
      </div>

      {/* ------- Interview Prep Mode ------- */}
      <section className="mt-10">
        <p className="caps flex items-center gap-2.5 text-brg">
          <span aria-hidden="true" className="inline-block h-0.5 w-[26px] rounded bg-brg" />
          Interview prep mode
        </p>
        <h2 className="mt-3 font-display text-3xl font-[540] text-ink">
          &ldquo;Talk me through markets today&rdquo;
        </h2>
        <p className="mt-2 max-w-[58ch] text-[14px] text-muted">
          A model answer built from the latest edition. Every sentence carries
          a footnote naming the exact data point it derives from — nothing in
          the answer is unsourced.
        </p>

        {answer.length > 0 ? (
          <div className="mt-5 grid grid-cols-1 gap-6 min-[960px]:grid-cols-[7fr_5fr]">
            <div className="rounded-card border border-line bg-ivory-1 p-6 shadow-card sm:px-7">
              {answer.map((s, i) => (
                <p key={s.footnote} className="mb-3 text-[15px] leading-[1.7] text-[#2A3830]">
                  {s.sentence}
                  <sup className="figures ml-0.5 font-bold text-brass">{i + 1}</sup>
                </p>
              ))}
            </div>
            <div className="rounded-card border border-line bg-sage p-6 sm:px-7">
              <div className="caps text-muted">Data footnotes</div>
              <ol className="mt-3 space-y-2.5">
                {answer.map((s, i) => (
                  <li key={s.footnote} className="figures flex gap-2 text-[12px] leading-relaxed text-[#42504A]">
                    <span className="font-bold text-brass">{i + 1}</span>
                    {s.footnote}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        ) : (
          <p className="mt-5 rounded-lg bg-sage px-4 py-3 text-[13px] text-muted">
            The model answer builds from the latest edition — issue one via the
            snapshot cron first.
          </p>
        )}
      </section>

      <div className="mt-10 grid grid-cols-1 gap-6 min-[960px]:grid-cols-2">
        <section className="rounded-card border border-line bg-ivory-1 p-6 shadow-card sm:px-7">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="coachline-under font-display text-[19px] font-[540] text-ink">
              The archive drill
            </h2>
            <span className="caps !font-medium text-muted">flashcards</span>
          </div>
          <Flashcards cards={cards} />
        </section>

        <section className="rounded-card border border-line bg-ivory-1 p-6 shadow-card sm:px-7">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="coachline-under font-display text-[19px] font-[540] text-ink">
              The last 30 days
            </h2>
            <span className="caps !font-medium text-muted">one-pager · print this page</span>
          </div>
          {summaries.length === 0 ? (
            <p className="rounded-lg bg-sage px-4 py-3 text-[13px] text-muted">
              Builds from the archive — one line per edition.
            </p>
          ) : (
            <ol className="space-y-2">
              {[...summaries].reverse().map((s) => (
                <li key={s.date} className="flex gap-3 border-b border-[#EAEBDF] pb-2 text-[13px] last:border-b-0">
                  <span className="figures shrink-0 font-semibold text-muted">
                    {new Date(`${s.date}T12:00:00Z`).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </span>
                  <span className="caps shrink-0 !text-[9px] !font-bold text-brass">
                    Nº {s.number}
                  </span>
                  <span className="text-ink">{s.headline}</span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

      <section className="mt-10">
        <h2 className="caps mb-3 text-muted">Full glossary · {GLOSSARY.length} terms</h2>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {GLOSSARY.map((t) => (
            <li key={t.slug} className="rounded-card border border-line bg-ivory-1 p-4 shadow-card">
              <p className="font-display text-base font-semibold text-ink">{t.term}</p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-muted">{t.definition}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
