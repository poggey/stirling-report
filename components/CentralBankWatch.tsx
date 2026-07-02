import { BANKS, lastRateChange, nextMeeting } from "@/lib/central-banks";
import { formatLevel } from "@/lib/format";
import type { MarketInstrument } from "@/lib/market-data";

interface CentralBankWatchProps {
  /** The three policy-rate instruments, keyed by id. */
  rates: Map<string, MarketInstrument>;
  /** Today's UK date, YYYY-MM-DD — countdowns are computed against it. */
  today: string;
}

function fmtMeeting(date: string): string {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

/** Live policy rates from BoE/FRED/ECB with real decision countdowns. */
export function CentralBankWatch({ rates, today }: CentralBankWatchProps) {
  return (
    <section
      aria-label="Central bank watch"
      className="rounded-card border border-line bg-ivory-1 p-6 shadow-card sm:px-7"
    >
      <div className="mb-4 flex items-baseline justify-between">
        <h3 className="coachline-under font-display text-[19px] font-[540] text-ink">
          Central bank watch
        </h3>
        <span className="caps !font-medium text-muted">next decisions</span>
      </div>

      {BANKS.map((bank) => {
        const rate = rates.get(bank.id);
        const change = rate ? lastRateChange(rate) : null;
        const meeting = nextMeeting(bank.meetings, today);
        const down = !rate || rate.health.status === "down";
        return (
          <div
            key={bank.id}
            className="flex items-center justify-between gap-3 border-b border-line py-3.5 last:border-b-0"
          >
            <div>
              <div className="text-[14.5px] font-semibold">{bank.name}</div>
              <div className="text-xs text-muted">
                {down
                  ? `rate source unavailable`
                  : change
                    ? `Last: ${change.deltaBp > 0 ? "+" : ""}${change.deltaBp}bp on ${fmtMeeting(change.date)}`
                    : `Unchanged across the stored window`}
                {rate?.health.status === "stale" && " · stale"}
              </div>
            </div>
            <div className="text-right">
              <div className="figures text-[19px] font-bold">
                {rate ? formatLevel(rate) : "—"}
              </div>
              {meeting && (
                <div className="caps mt-px !text-[9.5px] !font-bold !tracking-[0.1em] text-brass">
                  {bank.body} in {meeting.daysAway} day{meeting.daysAway === 1 ? "" : "s"}
                </div>
              )}
            </div>
          </div>
        );
      })}

      <p className="mt-3.5 border-t border-line pt-2.5 text-[11px] text-muted">
        Rates: Bank of England IADB · FRED · ECB Data Portal. Meeting dates
        from each institution&rsquo;s published calendar. Vote splits and the
        market-implied path are future work.
      </p>
    </section>
  );
}
