import { ArchiveStrip } from "@/components/ArchiveStrip";
import { CentralBankWatch } from "@/components/CentralBankWatch";
import { EconomicDiary } from "@/components/EconomicDiary";
import { FooterBand } from "@/components/FooterBand";
import { GiltCurveCard } from "@/components/GiltCurveCard";
import { HeaderBar } from "@/components/HeaderBar";
import { LedgerPanel } from "@/components/LedgerPanel";
import { petalsFromZ } from "@/components/Medallion";
import { NotesColumn } from "@/components/NotesColumn";
import { StatRow } from "@/components/StatRow";
import { StoryOfTheDay } from "@/components/StoryOfTheDay";
import { getMarketData } from "@/lib/market-data";
import { buildStory } from "@/lib/story";

// Light intraday cache: the page re-renders at most every 30 minutes; all
// source fetches inside are tagged with the same revalidation window.
export const revalidate = 1800;

const EDITION = 1; // Real numbering starts with the Phase 2 snapshot pipeline.

// Presented inside the curve card rather than the market board.
const CURVE_ONLY = new Set(["gilt20y"]);

export default async function Home() {
  const { instruments, fetchedAt } = await getMarketData();

  const withData = instruments.filter((i) => i.level !== null);
  const ranked = [...withData]
    .filter((i) => !CURVE_ONLY.has(i.id))
    .sort((a, b) => Math.abs(b.z) - Math.abs(a.z));
  const ledger = ranked.slice(0, 4);
  const ledgerIds = new Set(ledger.map((i) => i.id));
  const board = instruments.filter(
    (i) => !ledgerIds.has(i.id) && !CURVE_ONLY.has(i.id),
  );

  const story = buildStory(ranked);
  const avgAbsZ =
    withData.reduce((sum, i) => sum + Math.abs(i.z), 0) / (withData.length || 1);

  const byId = (id: string) => instruments.find((i) => i.id === id);
  const gilt5y = byId("gilt5y");
  const gilt10y = byId("gilt10y");
  const gilt20y = byId("gilt20y");
  const sources = [...new Set(instruments.map((i) => i.source))];
  const now = new Date();

  return (
    <>
      <HeaderBar weather="Fair" weatherSub="steady" petals={petalsFromZ(avgAbsZ)} date={now} />

      <main className="mx-auto max-w-[1200px] px-4 sm:px-7">
        <div className="mt-[30px] grid grid-cols-1 gap-6 min-[960px]:grid-cols-[7.2fr_4.8fr]">
          <StoryOfTheDay
            story={story}
            edition={EDITION}
            topZ={ranked[0]?.z ?? 0}
            fetchedAt={fetchedAt}
            instrumentCount={withData.length}
            sourceCount={sources.length}
          />
          <LedgerPanel instruments={ledger} />
        </div>

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
          <CentralBankWatch bankRate={byId("bankrate")} />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 min-[960px]:grid-cols-[7fr_5fr]">
          <EconomicDiary />
          <NotesColumn date={now} />
        </div>

        <ArchiveStrip edition={EDITION} date={now} />

        <FooterBand edition={EDITION} sources={sources} fetchedAt={fetchedAt} />
      </main>
    </>
  );
}
