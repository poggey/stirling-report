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
import {
  IssueButton,
  ReportProvider,
  ReportSheet,
  type ReportPayload,
} from "@/components/report/ReportSheet";
import { templateBriefing } from "@/lib/briefing/template";
import { getLatestEdition } from "@/lib/editions/store";
import { ukDateOf, type Edition } from "@/lib/editions/types";
import { formatChange, formatUkDate } from "@/lib/format";
import { getMarketData } from "@/lib/market-data";
import { rankBySalience, salienceTable } from "@/lib/salience";
import { buildStory } from "@/lib/story";
import { readWeather, WEATHER_LABEL, WEATHER_SUB } from "@/lib/weather";

// Light intraday cache: the page re-renders at most every 30 minutes; all
// source fetches inside are tagged with the same revalidation window.
export const revalidate = 1800;

// Presented inside the curve card rather than the market board.
const CURVE_ONLY = new Set(["gilt20y"]);

export default async function Home() {
  const [{ instruments, fetchedAt }, latestEdition] = await Promise.all([
    getMarketData(),
    getLatestEdition(),
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
  const ranked = rankBySalience(withData.filter((i) => !CURVE_ONLY.has(i.id)));
  const ledger = ranked.slice(0, 4);
  const ledgerIds = new Set(ledger.map((i) => i.id));
  const board = instruments.filter(
    (i) => !ledgerIds.has(i.id) && !CURVE_ONLY.has(i.id),
  );

  const story = buildStory(ranked);
  const weather = readWeather(instruments);

  const byId = (id: string) => instruments.find((i) => i.id === id);
  const gilt5y = byId("gilt5y");
  const gilt10y = byId("gilt10y");
  const gilt20y = byId("gilt20y");
  const sources = [...new Set(instruments.map((i) => i.source))];
  const now = new Date();

  // The report sheet serves today's cached edition when the 22:05 snapshot
  // has run; before that it issues an honestly-labelled intraday edition
  // built from the same deterministic engine (WHITEPAPER §4.1).
  const issuedToday = latestEdition?.date === today ? latestEdition : null;
  const reportSource: Edition = issuedToday ?? {
    schema: 1,
    date: today,
    number: edition,
    generatedAt: fetchedAt,
    weather,
    story,
    salience: salienceTable(instruments.filter((i) => !CURVE_ONLY.has(i.id))),
    instruments,
    sources,
  };
  const reportStory = reportSource.story;
  const reportPayload: ReportPayload = {
    dateLabel: formatUkDate(now),
    edition: reportSource.number,
    weatherLabel: WEATHER_LABEL[reportSource.weather.state],
    petals: petalsFromZ(reportSource.weather.intensity),
    storm: reportSource.weather.state === "storm",
    headline: `${reportStory.headlinePlain}${reportStory.headlineEm ? ` ${reportStory.headlineEm}` : ""}`,
    intraday: !issuedToday,
    asOf: new Date(reportSource.generatedAt).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    stats: reportSource.salience.slice(0, 4).map((s) => {
      const i = reportSource.instruments.find((x) => x.id === s.id)!;
      const c = formatChange(i);
      return { label: i.label, text: `${c.glyph} ${c.text}`, tone: c.tone };
    }),
    briefings: reportSource.briefings ?? {
      template: templateBriefing(reportSource),
      ai: false,
    },
  };

  return (
    <ReportProvider>
      <HeaderBar
        weather={WEATHER_LABEL[weather.state]}
        weatherSub={WEATHER_SUB[weather.state]}
        petals={petalsFromZ(weather.intensity)}
        storm={weather.state === "storm"}
        date={now}
        issueSlot={<IssueButton />}
      />
      <ReportSheet payload={reportPayload} />

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

        <ArchiveStrip edition={edition} date={now} />

        <FooterBand edition={edition} sources={sources} fetchedAt={fetchedAt} />
      </main>
    </ReportProvider>
  );
}
