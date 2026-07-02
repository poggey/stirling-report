import { NextResponse } from "next/server";
import { getEdition, getLatestEdition, listEditionDates } from "@/lib/editions/store";

export const revalidate = 300;

/**
 * Public edition reader: /api/editions/2026-07-02, /api/editions/latest,
 * /api/editions/index (all stored dates). Feeds the archive, the GitHub
 * mirror action and anyone who wants the open dataset.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ date: string }> },
) {
  const { date } = await params;

  if (date === "index") {
    return NextResponse.json({ dates: await listEditionDates() });
  }

  const edition =
    date === "latest" ? await getLatestEdition() : await getEdition(date);
  if (!edition) {
    return NextResponse.json({ error: `no edition for ${date}` }, { status: 404 });
  }
  return NextResponse.json(edition, {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" },
  });
}
