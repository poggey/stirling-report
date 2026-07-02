import { ArchiveStrip } from "@/components/ArchiveStrip";
import { CentralBankWatch } from "@/components/CentralBankWatch";
import { EconomicDiary } from "@/components/EconomicDiary";
import { FooterBand } from "@/components/FooterBand";
import { GiltCurveCard } from "@/components/GiltCurveCard";
import { LedgerPanel } from "@/components/LedgerPanel";
import { NotesColumn } from "@/components/NotesColumn";
import { StatRow } from "@/components/StatRow";
import { StoryOfTheDay } from "@/components/StoryOfTheDay";
import { WiresPanel } from "@/components/WiresPanel";
import { getLatestEdition } from "@/lib/editions/store";
import { getEditionSummaries } from "@/lib/editions/summaries";
import { ukDateOf } from "@/lib/editions/types";
import { getMarketData, CURVE_ONLY_IDS, POLICY_IDS } from "@/lib/market-data";
import { rankBySalience } from "@/lib/salience";
import { fetchWires } from "@/lib/sources/wires";
import { buildStory } from "@/lib/story";

// Light intraday cache: the page re-renders at most every 30 minutes; all
// source fetches inside are tagged with the same revalidation window.
// The header, weather chip and report sheet live in SiteChrome (layout).
export const revalidate = 1800;

// Instruments that sit in the curve cards / Central Bank Watch, not the board.
const OFF_BOARD = new Set([...CURVE_ONLY_IDS, ...POLICY_IDS]);

export default async function Home() {
  const [{ instruments, fetchedAt }, latestEdition, summaries, wires] =
    await Promise.all([
      getMarketData(),
      getLatestEdition(),
      getEditionSummaries(30),
      fetchWires(),
    ]);

  // The roundel carries today's issued number, or the number the evening
  // snapshot will take if it has not run yet.
  const today = ukDateOf(new Date());
  const edition = latestEdition
    ? latestEdition.date === today
      ? latestEdition.number
      : latestEdition.number + 1
    : 1;

  const withData = instruments.filter((i) => i.level !== null);
  const ranked = rankBySalience(withData.filter((i) => !OFF_BOARD.has(i.id)));
  const ledger = ranked.slice(0, 4);
  const ledgerIds = new Set(ledger.map((i) => i.id));
  const board = instruments.filter(
    (i) => !ledgerIds.has(i.id) && !OFF_BOARD.has(i.id),
  );

  // Once the evening snapshot locks the day, its story (with the AI's
  // news-aware headline) leads; before that the live deterministic one does.
  const issuedToday = latestEdition?.date === today ? latestEdition : null;
  const story = issuedToday?.story ?? buildStory(ranked);

  const byId = (id: string) => instruments.find((i) => i.id === id);
  const gilt5y = byId("gilt5y");
  const gilt10y = byId("gilt10y");
  const gilt20y = byId("gilt20y");
  const sources = [...new Set(instruments.map((i) => i.source))];
  const now = new Date();

  return (
    <main className="mx-auto max-w-[1200px] px-4 sm:px-7">
      <div className="mt-[30px] grid grid-cols-1 gap-6 min-[960px]:grid-cols-[7.2fr_4.8fr]">
        <StoryOfTheDay
          story={story}
          edition={edition}
          topZ={ranked[0]?.z ?? 0}
          fetchedAt={fetchedAt}
          instrumentCount={withData.length}
          sourceCount={sources.length}
        />
        <LedgerPanel instruments={ledger} />
      </div>

      <WiresPanel headlines={wires} mode="live" />

      <StatRow instruments={board} />

      <div className="mt-6 grid grid-cols-1 gap-6 min-[960px]:grid-cols-[7fr_5fr]">
        {gilt5y && gilt10y && gilt20y && (
          <GiltCurveCard
            gilt5y={gilt5y}
            gilt10y={gilt10y}
            gilt20y={gilt20y}
            fetchedAt={fetchedAt}
          />
        )}
        <CentralBankWatch
          rates={
            new Map(
              instruments.filter((i) => POLICY_IDS.has(i.id)).map((i) => [i.id, i]),
            )
          }
          today={today}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 min-[960px]:grid-cols-[7fr_5fr]">
        <EconomicDiary today={today} limit={5} />
        <NotesColumn date={now} />
      </div>

      <ArchiveStrip summaries={summaries} date={now} />

      <FooterBand edition={edition} sources={sources} fetchedAt={fetchedAt} />
    </main>
  );
}
