import { formatLevel } from "@/lib/format";
import type { MarketInstrument } from "@/lib/market-data";

/**
 * Phase 1 shows the one policy rate we hold real data for (Bank Rate, BoE
 * IADB). Fed/ECB rows, decision countdowns and vote splits arrive with the
 * Phase 5 providers — shown here as honest placeholders, never invented.
 */
export function CentralBankWatch({ bankRate }: { bankRate?: MarketInstrument }) {
  return (
    <section
      aria-label="Central bank watch"
      className="rounded-card border border-line bg-ivory-1 p-6 shadow-card sm:px-7"
    >
      <div className="mb-4 flex items-baseline justify-between">
        <h3 className="coachline-under font-display text-[19px] font-[540] text-ink">
          Central bank watch
        </h3>
        <span className="caps !font-medium text-muted">policy rates</span>
      </div>

      <div className="flex items-center justify-between border-b border-line py-3.5">
        <div>
          <div className="text-[14.5px] font-semibold">Bank of England</div>
          <div className="text-xs text-muted">
            Bank Rate ·{" "}
            {bankRate && bankRate.health.status !== "down"
              ? `as of ${bankRate.health.asOf}`
              : "unavailable"}
          </div>
        </div>
        <div className="figures text-right text-[19px] font-bold">
          {bankRate ? formatLevel(bankRate) : "—"}
        </div>
      </div>

      {["Federal Reserve", "European Central Bank"].map((bank) => (
        <div key={bank} className="flex items-center justify-between border-b border-line py-3.5 last:border-b-0">
          <div>
            <div className="text-[14.5px] font-semibold text-muted">{bank}</div>
            <div className="text-xs text-muted">provider arrives in Phase 5</div>
          </div>
          <div className="text-right text-[19px] font-bold text-line">—</div>
        </div>
      ))}

      <div className="mt-4 rounded-lg bg-sage px-4 py-3 text-xs leading-relaxed text-muted">
        Decision countdowns, vote splits and the market-implied path join in
        Phase 5 — no numbers shown here until they are real.
      </div>
    </section>
  );
}
