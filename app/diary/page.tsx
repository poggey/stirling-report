import type { Metadata } from "next";
import { EconomicDiary } from "@/components/EconomicDiary";
import { CentralBankWatch } from "@/components/CentralBankWatch";
import { ukDateOf } from "@/lib/editions/types";
import { getMarketData, POLICY_IDS } from "@/lib/market-data";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "The Economic Diary — Stirling",
  description:
    "Scheduled UK, US and euro-area releases and central bank decisions.",
};

export default async function DiaryPage() {
  const { instruments } = await getMarketData();
  const today = ukDateOf(new Date());
  const rates = new Map(
    instruments.filter((i) => POLICY_IDS.has(i.id)).map((i) => [i.id, i]),
  );

  return (
    <main className="mx-auto max-w-[1200px] px-4 pb-16 sm:px-7">
      <div className="mt-[30px]">
        <p className="caps flex items-center gap-2.5 text-brg">
          <span aria-hidden="true" className="inline-block h-0.5 w-[26px] rounded bg-brg" />
          Releases &amp; decisions
        </p>
        <h1 className="mt-3 font-display text-4xl font-[540] text-ink">The diary</h1>
        <p className="mt-2 max-w-[58ch] text-[15px] text-muted">
          The scheduled prints that move the board: UK, US and euro-area
          releases with central bank decision days. Dates come from the
          official calendars; consensus figures are commercial data and are
          omitted rather than guessed.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 min-[960px]:grid-cols-[7fr_5fr]">
        <EconomicDiary today={today} />
        <CentralBankWatch rates={rates} today={today} />
      </div>
    </main>
  );
}
