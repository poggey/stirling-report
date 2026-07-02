import { EditionRoundel } from "./EditionRoundel";
import type { Story } from "@/lib/story";
import { formatUkDate } from "@/lib/format";

interface StoryOfTheDayProps {
  story: Story;
  edition: number;
  date: Date;
  instrumentCount: number;
  sourceCount: number;
}

export function StoryOfTheDay({
  story,
  edition,
  date,
  instrumentCount,
  sourceCount,
}: StoryOfTheDayProps) {
  return (
    <article className="animate-settle relative rounded-card border border-line bg-ivory-1 p-6 shadow-card sm:p-8">
      <div className="absolute right-5 top-5">
        <EditionRoundel edition={edition} />
      </div>

      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-brass">
        {story.kicker}
      </p>
      {/* Twin brass hairlines — the coachline as a short title accent */}
      <div className="mt-1.5 w-10 border-t border-brass" aria-hidden="true" />
      <div className="mt-[3px] w-10 border-t border-brass" aria-hidden="true" />

      <h2 className="mt-4 max-w-[16ch] font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl">
        {story.headline}
      </h2>

      <p className="mt-4 max-w-prose text-[15px] leading-relaxed text-muted">
        {story.standfirst}
      </p>

      <dl className="mt-6 flex flex-wrap gap-x-6 gap-y-1 border-t border-line pt-4 text-xs text-muted">
        <div>
          <dt className="sr-only">Date</dt>
          <dd>{formatUkDate(date)}</dd>
        </div>
        <div className="figures">
          <dt className="sr-only">Coverage</dt>
          <dd>
            {instrumentCount} instruments · {sourceCount} sources
          </dd>
        </div>
        <div>
          <dt className="sr-only">Method</dt>
          <dd>Ranked deterministically by 30-day z-score</dd>
        </div>
      </dl>
    </article>
  );
}
