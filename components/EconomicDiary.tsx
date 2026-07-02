import Link from "next/link";
import {
  DIARY,
  SCHEDULE_CURATED_AT,
  diaryStatus,
  surpriseIndex,
  type DiaryEntry,
} from "@/lib/diary";

const PILL = {
  due: "border border-line text-muted",
  printed: "bg-sage text-ink",
  beat: "bg-rise/10 text-rise",
  miss: "bg-fall/10 text-fall",
} as const;

function Pill({ entry, today }: { entry: DiaryEntry; today: string }) {
  const status = diaryStatus(entry, today);
  const label =
    status === "due"
      ? entry.time
      : status === "printed"
        ? (entry.actual ?? "printed")
        : status.toUpperCase();
  return (
    <span
      className={`figures inline-block rounded-full px-2.5 py-[3px] text-[9.5px] font-bold tracking-[0.08em] ${PILL[status]}`}
    >
      {label}
    </span>
  );
}

/** The release diary: curated official schedule, honest about what's missing. */
export function EconomicDiary({ today, limit }: { today: string; limit?: number }) {
  const entries = [...DIARY]
    .filter((e) => e.date >= today || e.actual)
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  const shown = limit ? entries.slice(0, limit) : entries;
  const surprises = (["UK", "US", "EA"] as const).map((e) => surpriseIndex(DIARY, e));
  const anySurprise = surprises.some((s) => s !== null);

  return (
    <section
      aria-label="The economic diary"
      className="rounded-card border border-line bg-ivory-1 p-6 shadow-card sm:px-7"
    >
      <div className="mb-4 flex items-baseline justify-between">
        <h3 className="coachline-under font-display text-[19px] font-[540] text-ink">
          The economic diary
        </h3>
        <Link href="/diary" className="caps !font-medium text-muted hover:text-brg">
          full diary →
        </Link>
      </div>

      <table className="w-full border-collapse font-narrow">
        <thead>
          <tr>
            {(["Date", "Release", "Prior", "Exp.", "Result"] as const).map((h, i) => (
              <th
                key={h}
                className={`caps border-b border-line pb-2 !text-[9.5px] !font-bold text-muted ${i >= 2 ? "text-right" : "text-left"}`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {shown.map((entry) => (
            <tr key={`${entry.date}${entry.name}`} className="border-b border-[#EAEBDF] last:border-b-0">
              <td className="figures py-3 pr-2 text-xs font-semibold text-muted">
                {new Date(`${entry.date}T12:00:00Z`).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                })}
              </td>
              <td className="py-3 pr-3 text-[13.5px]">
                <span className="caps mr-2 !text-[9px] !font-bold text-brass">{entry.economy}</span>
                {entry.name}
              </td>
              <td className="figures py-3 pl-2 text-right text-[13px] text-muted">
                {entry.prior ?? "—"}
              </td>
              <td
                className="figures py-3 pl-2 text-right text-[13px] text-muted"
                title={entry.expected ? undefined : "Consensus is commercial data — shown only when publicly citable"}
              >
                {entry.expected ?? "—"}
              </td>
              <td className="py-3 pl-3 text-right">
                <Pill entry={entry} today={today} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mt-3.5 border-t border-line pt-2.5 text-[11px] leading-relaxed text-muted">
        Schedule curated {SCHEDULE_CURATED_AT} from ONS, BLS and central-bank
        calendars; priors from the official releases. Consensus (Exp.) is
        commercial data — shown only when publicly citable, else surprise
        direction scores against the prior print.{" "}
        {anySurprise
          ? `Surprise readings — UK ${surprises[0] ?? "–"} · US ${surprises[1] ?? "–"} · EA ${surprises[2] ?? "–"}.`
          : "The surprise index begins once releases print against recorded priors."}
      </p>
    </section>
  );
}
