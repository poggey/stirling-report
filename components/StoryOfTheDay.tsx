import type { Story } from "@/lib/story";

interface StoryOfTheDayProps {
  story: Story;
  edition: number;
  topZ: number;
  fetchedAt: string;
  instrumentCount: number;
  sourceCount: number;
}

const ORDINALS = ["Second", "Third"];

export function StoryOfTheDay({
  story,
  edition,
  topZ,
  fetchedAt,
  instrumentCount,
  sourceCount,
}: StoryOfTheDayProps) {
  const snapshotTime = new Date(fetchedAt).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return (
    <article className="animate-settle relative rounded-card border border-line bg-ivory-1 px-6 py-7 shadow-card sm:px-[42px] sm:py-[38px]">
      {/* Door roundel — the edition as the day's race number */}
      <div
        className="absolute right-7 top-[26px] flex h-[46px] w-[46px] flex-col items-center justify-center rounded-full border-2 border-brg bg-ivory-1 leading-none"
        title="Edition number — one issued per day, archived forever"
      >
        <b className="figures text-[15px] font-bold text-brg">{edition}</b>
        <span className="mt-0.5 text-[6.5px] font-bold tracking-[0.14em] text-brass">
          EDITION
        </span>
      </div>

      <p className="caps mb-4 flex items-center gap-2.5 text-brg">
        <span aria-hidden="true" className="inline-block h-0.5 w-[26px] rounded bg-brg" />
        {story.kicker}
      </p>

      <h1 className="max-w-[20ch] font-display text-[clamp(32px,4.2vw,50px)] font-[540] leading-[1.08] tracking-[-0.014em] text-ink">
        {story.headlinePlain}{" "}
        {story.headlineEm && (
          <em className="font-[480] italic text-brg">{story.headlineEm}</em>
        )}
      </h1>

      <p className="mt-[18px] max-w-[58ch] text-base text-[#42504A]">
        {story.standfirst}
      </p>

      <dl className="mt-[22px] flex flex-wrap gap-x-[22px] gap-y-1 border-t border-line pt-4 text-xs text-muted">
        <div>
          <dt className="inline">Top move </dt>
          <dd className="figures inline font-semibold text-ink">
            {Math.abs(topZ).toFixed(1)}σ
          </dd>
        </div>
        <div>
          <dt className="inline">Edition </dt>
          <dd className="figures inline font-semibold text-ink">Nº {edition}</dd>
        </div>
        <div>
          <dt className="inline">Coverage </dt>
          <dd className="figures inline font-semibold text-ink">
            {instrumentCount} instruments · {sourceCount} sources
          </dd>
        </div>
        <div>
          <dt className="inline">Snapshot </dt>
          <dd className="figures inline font-semibold text-ink">{snapshotTime}</dd>
        </div>
      </dl>

      {story.subplots.length > 0 && (
        <ul className="mt-4">
          {story.subplots.map((text, i) => (
            <li
              key={text}
              className="flex items-baseline gap-3.5 border-t border-line py-2.5 font-display text-[17.5px] text-ink"
            >
              <span className="caps shrink-0 !text-[9.5px] !font-bold !tracking-[0.16em] font-sans text-brass">
                {ORDINALS[i] ?? "Also"}
              </span>
              {text}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
