import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FooterBand } from "@/components/FooterBand";
import { GiltCurveCard } from "@/components/GiltCurveCard";
import { LedgerPanel } from "@/components/LedgerPanel";
import { petalsFromZ } from "@/components/Medallion";
import {
  IssueButton,
  ReportProvider,
  ReportSheet,
  type ReportPayload,
} from "@/components/report/ReportSheet";
import { StatRow } from "@/components/StatRow";
import { StoryOfTheDay } from "@/components/StoryOfTheDay";
import { WiresPanel } from "@/components/WiresPanel";
import { templateBriefing } from "@/lib/briefing/template";
import { getEdition } from "@/lib/editions/store";
import { formatChange } from "@/lib/format";
import type { MarketInstrument } from "@/lib/market-data";
import { WEATHER_LABEL } from "@/lib/weather";

export const revalidate = 3600;

interface Params {
  params: Promise<{ date: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { date } = await params;
  return {
    title: `Replay · ${date} — Stirling`,
    openGraph: { images: [`/api/og/${date}`] },
  };
}

/**
 * The Time Machine replay: reconstructs the dashboard exactly as it stood
 * that evening, under a banner that makes sure past is never mistaken for
 * present (WHITEPAPER §9.3).
 */
export default async function ReplayPage({ params }: Params) {
  const { date } = await params;
  const edition = await getEdition(date);
  if (!edition) notFound();

  const byId = new Map(edition.instruments.map((i) => [i.id, i]));
  const ranked = edition.salience
    .map((s) => byId.get(s.id))
    .filter((i): i is MarketInstrument => Boolean(i) && i!.level !== null)
    .filter((i) => i.id !== "gilt20y");
  const ledger = ranked.slice(0, 4);
  const ledgerIds = new Set(ledger.map((i) => i.id));
  const board = edition.instruments.filter(
    (i) => !ledgerIds.has(i.id) && i.id !== "gilt20y",
  );
  const gilt5y = byId.get("gilt5y");
  const gilt10y = byId.get("gilt10y");
  const gilt20y = byId.get("gilt20y");

  const dateLabel = new Date(`${edition.date}T12:00:00Z`).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const payload: ReportPayload = {
    dateLabel,
    edition: edition.number,
    weatherLabel: WEATHER_LABEL[edition.weather.state],
    petals: petalsFromZ(edition.weather.intensity),
    storm: edition.weather.state === "storm",
    headline:
      edition.story.aiHeadline ??
      `${edition.story.headlinePlain}${edition.story.headlineEm ? ` ${edition.story.headlineEm}` : ""}`,
    intraday: false,
    asOf: "",
    stats: edition.salience.slice(0, 4).flatMap((s) => {
      const i = byId.get(s.id);
      if (!i) return [];
      const c = formatChange(i);
      return [{ label: i.label, text: `${c.glyph} ${c.text}`, tone: c.tone }];
    }),
    briefings: edition.briefings ?? { template: templateBriefing(edition), ai: false },
  };

  return (
    <ReportProvider>
      {/* The replay banner: past must never be mistaken for present.
          Sticks just below the persistent site header. */}
      <div className="sticky top-[70px] z-30 bg-brg text-cream">
        <div className="mx-auto flex min-h-[52px] max-w-[1200px] flex-wrap items-center gap-x-5 gap-y-2 px-4 py-2 sm:px-7">
          <span className="caps text-brass">Replay</span>
          <span className="text-sm font-semibold">
            {dateLabel} · Edition Nº {edition.number} ·{" "}
            {WEATHER_LABEL[edition.weather.state]}
          </span>
          <span className="ml-auto flex items-center gap-4">
            <Link href="/archive" className="text-xs font-semibold text-cream/80 hover:text-cream">
              ← Archive
            </Link>
            <IssueButton label="Read this report" />
          </span>
        </div>
      </div>
      <ReportSheet payload={payload} />

      <main className="mx-auto max-w-[1200px] px-4 sm:px-7">
        <div className="mt-[30px] grid grid-cols-1 gap-6 min-[960px]:grid-cols-[7.2fr_4.8fr]">
          <StoryOfTheDay
            story={edition.story}
            edition={edition.number}
            topZ={edition.salience[0]?.z ?? 0}
            fetchedAt={edition.generatedAt}
            instrumentCount={ranked.length}
            sourceCount={edition.sources.length}
          />
          <LedgerPanel instruments={ledger} />
        </div>

        {edition.wires && edition.wires.length > 0 && (
          <WiresPanel headlines={edition.wires} mode="archived" />
        )}

        <StatRow instruments={board} />

        {gilt5y && gilt10y && gilt20y && (
          <div className="mt-6 grid grid-cols-1 gap-6 min-[960px]:grid-cols-[7fr_5fr]">
            <GiltCurveCard
              gilt5y={gilt5y}
              gilt10y={gilt10y}
              gilt20y={gilt20y}
              fetchedAt={edition.generatedAt}
            />
          </div>
        )}

        <FooterBand
          edition={edition.number}
          sources={edition.sources}
          fetchedAt={edition.generatedAt}
        />
      </main>
    </ReportProvider>
  );
}
