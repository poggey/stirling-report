import type { Metadata } from "next";
import { CurveChart } from "@/components/CurveChart";
import { SpreadTracker } from "@/components/SpreadTracker";
import { getMarketData } from "@/lib/market-data";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "The Yield Curve Observatory — Stirling",
  description:
    "UK gilt and US Treasury curves against one month and one year ago, with the 2s10s recession signal.",
};

export default async function CurvePage() {
  const { instruments, fetchedAt } = await getMarketData();
  const byId = (id: string) => instruments.find((i) => i.id === id);

  const gilt5y = byId("gilt5y");
  const gilt10y = byId("gilt10y");
  const gilt20y = byId("gilt20y");
  const ust2y = byId("ust2y");
  const ust5y = byId("ust5y");
  const ust10y = byId("ust10y");
  const ust30y = byId("ust30y");

  return (
    <main className="mx-auto max-w-[1200px] px-4 pb-16 sm:px-7">
      <div className="mt-[30px]">
        <p className="caps flex items-center gap-2.5 text-brg">
          <span aria-hidden="true" className="inline-block h-0.5 w-[26px] rounded bg-brg" />
          The Yield Curve Observatory
        </p>
        <h1 className="mt-3 font-display text-4xl font-[540] text-ink">The curve</h1>
        <p className="mt-2 max-w-[58ch] text-[15px] text-muted">
          Today&rsquo;s UK gilt and US Treasury curves against their shapes
          one month and one year ago. An inverted curve — short yields above
          long — has preceded every US recession of the past half-century,
          which is why the 2s10s spread is the most-watched signal in
          markets.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 min-[960px]:grid-cols-2">
        {gilt5y && gilt10y && gilt20y && (
          <CurveChart
            title="UK gilts"
            sourceNote="Bank of England IADB"
            fetchedAt={fetchedAt}
            footnote="Nominal par yields · no 2Y IADB series"
            tenors={[
              { tenor: 5, instrument: gilt5y },
              { tenor: 10, instrument: gilt10y },
              { tenor: 20, instrument: gilt20y },
            ]}
          />
        )}
        {ust2y && ust5y && ust10y && ust30y && (
          <CurveChart
            title="US Treasuries"
            sourceNote="FRED (St. Louis Fed)"
            fetchedAt={fetchedAt}
            footnote="Constant-maturity yields"
            tenors={[
              { tenor: 2, instrument: ust2y },
              { tenor: 5, instrument: ust5y },
              { tenor: 10, instrument: ust10y },
              { tenor: 30, instrument: ust30y },
            ]}
          />
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 min-[960px]:grid-cols-2">
        {gilt5y && gilt10y && (
          <SpreadTracker
            label="UK 5s10s spread"
            short={gilt5y}
            long={gilt10y}
            note="The gilt curve's slope between five and ten years. The classic UK signal is 2s10s, but the IADB publishes no 2-year par yield — the 5-year stands in, honestly labelled."
          />
        )}
        {ust2y && ust10y && (
          <SpreadTracker
            label="US 2s10s spread"
            short={ust2y}
            long={ust10y}
            note="The most-watched recession signal in markets: when two-year Treasuries out-yield tens, policy is restrictive relative to long-run growth expectations. Inversions have preceded US recessions with long and variable lags."
          />
        )}
      </div>
    </main>
  );
}
