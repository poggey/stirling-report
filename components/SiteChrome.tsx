import { HeaderBar } from "./HeaderBar";
import { petalsFromZ } from "./Medallion";
import {
  IssueButton,
  ReportProvider,
  ReportSheet,
  type ReportPayload,
} from "./report/ReportSheet";
import { templateBriefing } from "@/lib/briefing/template";
import { getLatestEdition } from "@/lib/editions/store";
import { ukDateOf, type Edition } from "@/lib/editions/types";
import { formatChange, formatUkDate } from "@/lib/format";
import { CURVE_ONLY_IDS, getMarketData, POLICY_IDS } from "@/lib/market-data";
import { rankBySalience, salienceTable } from "@/lib/salience";
import { buildStory } from "@/lib/story";
import { readWeather, WEATHER_LABEL, WEATHER_SUB } from "@/lib/weather";

const OFF_BOARD = new Set([...CURVE_ONLY_IDS, ...POLICY_IDS]);

/**
 * The persistent header — wordmark, nav, date, Learn toggle, weather chip
 * and the Issue button with today's report sheet — rendered from the root
 * layout so it travels to every page. Data fetches share the same tagged
 * 30-minute cache as the Today page.
 */
export async function SiteChrome() {
  const [{ instruments, fetchedAt }, latestEdition] = await Promise.all([
    getMarketData(),
    getLatestEdition(),
  ]);

  const today = ukDateOf(new Date());
  const editionNumber = latestEdition
    ? latestEdition.date === today
      ? latestEdition.number
      : latestEdition.number + 1
    : 1;

  const weather = readWeather(instruments);
  const ranked = rankBySalience(
    instruments.filter((i) => i.level !== null && !OFF_BOARD.has(i.id)),
  );
  const story = buildStory(ranked);

  const issuedToday = latestEdition?.date === today ? latestEdition : null;
  const reportSource: Edition = issuedToday ?? {
    schema: 1,
    date: today,
    number: editionNumber,
    generatedAt: fetchedAt,
    weather,
    story,
    salience: salienceTable(instruments.filter((i) => !OFF_BOARD.has(i.id))),
    instruments,
    sources: [...new Set(instruments.map((i) => i.source))],
  };
  const reportStory = reportSource.story;
  const payload: ReportPayload = {
    dateLabel: formatUkDate(new Date()),
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
    stats: reportSource.salience.slice(0, 4).flatMap((s) => {
      const i = reportSource.instruments.find((x) => x.id === s.id);
      if (!i) return [];
      const c = formatChange(i);
      return [{ label: i.label, text: `${c.glyph} ${c.text}`, tone: c.tone }];
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
        date={new Date()}
        issueSlot={<IssueButton />}
      />
      <ReportSheet payload={payload} />
    </ReportProvider>
  );
}
