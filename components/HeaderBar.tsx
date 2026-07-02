import Link from "next/link";
import { Medallion } from "./Medallion";
import { formatUkDate } from "@/lib/format";

const NAV = ["Today", "Archive", "Curve", "Diary", "Learn"] as const;

interface HeaderBarProps {
  weather: string;
  petals: number;
  date: Date;
}

export function HeaderBar({ weather, petals, date }: HeaderBarProps) {
  return (
    <header className="border-b border-line bg-ivory-0">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-x-6 gap-y-3 px-4 py-4 sm:px-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-brg">
          Stirling<span className="text-brass">.</span>
        </h1>

        <nav aria-label="Primary" className="order-last w-full sm:order-none sm:w-auto">
          <ul className="flex gap-4 text-[11px] uppercase tracking-[0.12em]">
            {NAV.map((item) => (
              <li key={item}>
                {item === "Today" ? (
                  <Link
                    href="/"
                    aria-current="page"
                    className="border-b-2 border-brass pb-0.5 font-medium text-brg"
                  >
                    {item}
                  </Link>
                ) : (
                  <span className="cursor-default text-muted" title="Coming in a later phase">
                    {item}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <time
            dateTime={date.toISOString().slice(0, 10)}
            className="hidden text-sm text-muted md:block"
          >
            {formatUkDate(date)}
          </time>

          <span className="flex items-center gap-1.5 rounded-full border border-line bg-ivory-1 py-1 pl-1.5 pr-3 text-sm text-ink">
            <Medallion petals={petals} size={20} />
            {weather}
          </span>

          <button
            type="button"
            disabled
            title="Phase 3"
            className="rounded-[10px] bg-brg px-4 py-2 text-sm text-cream opacity-50"
          >
            Issue today&rsquo;s report
          </button>
        </div>
      </div>
    </header>
  );
}
