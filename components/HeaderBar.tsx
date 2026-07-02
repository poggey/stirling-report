import Link from "next/link";
import { Medallion } from "./Medallion";
import { formatShortDateTime } from "@/lib/format";

const NAV = ["Today", "Archive", "Curve", "Diary", "Learn"] as const;

interface HeaderBarProps {
  weather: string;
  weatherSub: string;
  petals: number;
  storm?: boolean;
  date: Date;
}

export function HeaderBar({ weather, weatherSub, petals, storm, date }: HeaderBarProps) {
  return (
    <header
      className="sticky top-0 z-40 border-b border-line border-t-[3px] border-t-brg bg-ivory-0/90 backdrop-blur-[10px]"
      style={{ boxShadow: "inset 0 1px 0 #A9853F" }}
    >
      <div className="mx-auto flex min-h-[66px] max-w-[1200px] flex-wrap items-center gap-x-6 gap-y-2 px-4 py-2 min-[960px]:py-0 sm:px-7 lg:gap-x-[34px]">
        <p className="font-display text-2xl font-semibold tracking-[0.05em] text-brg">
          Stirling<span className="not-italic text-brass">.</span>
        </p>

        <nav aria-label="Primary" className="hidden min-[960px]:flex min-[960px]:gap-[26px]">
          {NAV.map((item) =>
            item === "Today" ? (
              <Link
                key={item}
                href="/"
                aria-current="page"
                className="caps border-b-2 border-brass py-1 !text-xs text-brg"
              >
                {item}
              </Link>
            ) : (
              <span
                key={item}
                className="caps cursor-default border-b-2 border-transparent py-1 !text-xs text-muted"
                title="Coming in a later phase"
              >
                {item}
              </span>
            ),
          )}
        </nav>

        <div className="ml-auto flex flex-wrap items-center justify-end gap-3 sm:gap-4">
          <time
            dateTime={date.toISOString()}
            className="hidden text-xs font-medium text-muted min-[960px]:block"
          >
            {formatShortDateTime(date)}
          </time>

          <span className="flex items-center gap-2 rounded-full border border-line bg-ivory-1 py-1.5 pl-2 pr-3.5">
            <Medallion petals={petals} storm={storm} size={22} />
            <span className="leading-tight">
              <span className="block text-[11px] font-bold tracking-[0.07em] text-brg">
                {weather.toUpperCase()}
              </span>
              <span className="block text-[10px] text-muted">{weatherSub}</span>
            </span>
          </span>

          <button
            type="button"
            disabled
            title="Phase 3"
            className="whitespace-nowrap rounded-[10px] bg-brg px-3 py-[11px] text-[13px] font-semibold text-cream opacity-60 sm:px-5"
          >
            Issue today&rsquo;s report
          </button>
        </div>
      </div>
    </header>
  );
}
