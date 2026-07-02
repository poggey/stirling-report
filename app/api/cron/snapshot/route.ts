import { NextResponse, type NextRequest } from "next/server";
import { buildBriefings } from "@/lib/briefing/gemini";
import { buildEdition } from "@/lib/editions/build";
import { getEdition, putEdition } from "@/lib/editions/store";
import { ukDateOf } from "@/lib/editions/types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * The 22:05 snapshot cron (vercel.json). Gathers every provider, computes
 * z-scores, salience and weather, and writes the immutable numbered edition.
 * Vercel Cron calls with `Authorization: Bearer ${CRON_SECRET}`.
 */
function authorised(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    // No secret configured: permit local development only, never production.
    return process.env.NODE_ENV !== "production";
  }
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!authorised(req)) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }

  const today = ukDateOf(new Date());
  const existing = await getEdition(today);
  if (existing) {
    return NextResponse.json(
      { ok: true, skipped: true, date: today, number: existing.number },
      { status: 200 },
    );
  }

  const edition = await buildEdition();
  edition.briefings = await buildBriefings(edition);
  const down = edition.instruments.filter((i) => i.health.status === "down");
  const { stored } = await putEdition(edition);

  return NextResponse.json({
    ok: true,
    date: edition.date,
    number: edition.number,
    stored,
    ai: edition.briefings.ai,
    weather: edition.weather.state,
    headline: `${edition.story.headlinePlain}${edition.story.headlineEm ? ` ${edition.story.headlineEm}` : ""}`,
    degraded: down.map((i) => ({ id: i.id, reason: i.health.status === "down" ? i.health.reason : "" })),
  });
}
