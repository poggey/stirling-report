import { FooterBand } from "@/components/FooterBand";
import { GiltCurveCard } from "@/components/GiltCurveCard";
import { HeaderBar } from "@/components/HeaderBar";
import { LedgerPanel } from "@/components/LedgerPanel";
import { petalsFromZ } from "@/components/Medallion";
import { StatRow } from "@/components/StatRow";
import { StoryOfTheDay } from "@/components/StoryOfTheDay";
import { getMarketData } from "@/lib/market-data";
import { buildStory } from "@/lib/story";

// Light intraday cache: the page re-renders at most every 30 minutes; all
// source fetches inside are tagged with the same revalidation window.
export const revalidate = 1800;

const EDITION = 1; // Real numbering starts with the Phase 2 snapshot pipeline.

export default async function Home() {
  const { instruments, fetchedAt } = await getMarketData();

  const withData = instruments.filter((i) => i.level !== null);
  const ranked = [...withData].sort((a, b) => Math.abs(b.z) - Math.abs(a.z));
  const ledger = ranked.slice(0, 4);
  const ledgerIds = new Set(ledger.map((i) => i.id));
  const board = instruments.filter((i) => !ledgerIds.has(i.id));

  const story = buildStory(ranked);
  const avgAbsZ =
    withData.reduce((sum, i) => sum + Math.abs(i.z), 0) / (withData.length || 1);

  const gilt5y = instruments.find((i) => i.id === "gilt5y");
  const gilt10y = instruments.find((i) => i.id === "gilt10y");
  const sources = [...new Set(instruments.map((i) => i.source))];

  return (
    <>
      {/* The coachline: green over brass, full width, top of viewport */}
      <div aria-hidden="true">
        <div className="h-[3px] bg-brg" />
        <div className="h-px bg-brass" />
      </div>

      <HeaderBar weather="Fair" petals={petalsFromZ(avgAbsZ)} date={new Date()} />

      <main className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <StoryOfTheDay
              story={story}
              edition={EDITION}
              date={new Date()}
              instrumentCount={withData.length}
              sourceCount={sources.length}
            />
          </div>
          <div className="lg:col-span-5">
            <LedgerPanel instruments={ledger} />
          </div>
        </div>

        <div className="mt-6">
          <StatRow instruments={board} />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {gilt5y && gilt10y && (
            <GiltCurveCard gilt5y={gilt5y} gilt10y={gilt10y} fetchedAt={fetchedAt} />
          )}
        </div>
      </main>

      <FooterBand edition={EDITION} sources={sources} fetchedAt={fetchedAt} />
    </>
  );
}
