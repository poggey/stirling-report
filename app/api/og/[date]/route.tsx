import { ImageResponse } from "next/og";
import { Medallion, petalsFromZ } from "@/components/Medallion";
import { getEdition, getLatestEdition } from "@/lib/editions/store";
import { formatChange, formatLevel } from "@/lib/format";
import { WEATHER_LABEL } from "@/lib/weather";

export const revalidate = 3600;

/**
 * The shareable briefing card (WHITEPAPER §4.12): 1200×630, racing-green
 * ground, the brass medallion, headline in cream serif, three key numbers
 * and the edition numeral. /api/og/latest or /api/og/YYYY-MM-DD.
 */

async function loadGoogleFont(css2Family: string, text: string): Promise<ArrayBuffer | null> {
  try {
    const cssRes = await fetch(
      `https://fonts.googleapis.com/css2?family=${css2Family}&text=${encodeURIComponent(text)}`,
      // A non-modern UA makes Google return TTF, which Satori can read.
      { headers: { "User-Agent": "Mozilla/5.0 (compatible; curl)" } },
    );
    const css = await cssRes.text();
    const url = css.match(/src:\s*url\(([^)]+)\)/)?.[1];
    if (!url) return null;
    const fontRes = await fetch(url);
    return fontRes.ok ? await fontRes.arrayBuffer() : null;
  } catch {
    return null;
  }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ date: string }> },
) {
  const { date } = await params;
  const edition = date === "latest" ? await getLatestEdition() : await getEdition(date);

  if (!edition) {
    return new Response("no edition", { status: 404 });
  }

  const headline = `${edition.story.headlinePlain}${edition.story.headlineEm ? ` ${edition.story.headlineEm}` : ""}`;
  const byId = new Map(edition.instruments.map((i) => [i.id, i]));
  const stats = edition.salience.slice(0, 3).flatMap((s) => {
    const i = byId.get(s.id);
    if (!i || i.level === null) return [];
    const c = formatChange(i);
    // Archivo has no ▲/▼ glyphs — signs carry direction on the card.
    const sign = c.direction === "rise" ? "+" : c.direction === "fall" ? "−" : "±";
    return [{ label: i.label, level: formatLevel(i), change: `${sign}${c.text}`, tone: c.tone }];
  });

  const dateLabel = new Date(`${edition.date}T12:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const textForFonts = `${headline}Stirling.Edition Nº ${edition.number}0123456789`;
  const [fraunces, archivo] = await Promise.all([
    loadGoogleFont("Fraunces:wght@600", textForFonts),
    loadGoogleFont("Archivo:wght@400;700", "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 +−±.%,/·º—"),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(168deg,#0E4230 0%, #0C3B2A 55%, #0A3123 100%)",
          color: "#F2EFDF",
          padding: "56px 64px",
          fontFamily: "Archivo, sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 34, fontFamily: "Fraunces, serif", fontWeight: 600 }}>
              Stirling<span style={{ color: "#A9853F" }}>.</span>
            </div>
            <div style={{ display: "flex", fontSize: 17, color: "rgba(242,239,223,.65)", marginTop: 6, letterSpacing: 2, textTransform: "uppercase" }}>
              {dateLabel} · {WEATHER_LABEL[edition.weather.state]}
            </div>
          </div>
          <Medallion
            petals={petalsFromZ(edition.weather.intensity)}
            storm={edition.weather.state === "storm"}
            size={120}
            background={false}
          />
        </div>

        <div
          style={{
            display: "flex",
            fontFamily: "Fraunces, serif",
            fontSize: 62,
            fontWeight: 600,
            lineHeight: 1.12,
            maxWidth: 980,
          }}
        >
          {headline}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ display: "flex", gap: 36 }}>
            {stats.map((s) => (
              <div key={s.label} style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: 15, letterSpacing: 2, textTransform: "uppercase", color: "rgba(242,239,223,.6)" }}>
                  {s.label}
                </span>
                <span style={{ fontSize: 27, fontWeight: 700, marginTop: 4 }}>{s.level}</span>
                <span style={{ fontSize: 18, marginTop: 2, color: s.tone === "fall" ? "#F2A48F" : s.tone === "rise" ? "#8FD8B4" : "rgba(242,239,223,.7)" }}>
                  {s.change}
                </span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <span style={{ fontSize: 15, letterSpacing: 2, textTransform: "uppercase", color: "rgba(242,239,223,.6)" }}>
              Edition
            </span>
            <span style={{ fontSize: 44, fontFamily: "Fraunces, serif", fontWeight: 600, color: "#A9853F" }}>
              Nº {edition.number}
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        ...(fraunces ? [{ name: "Fraunces", data: fraunces, weight: 600 as const }] : []),
        ...(archivo ? [{ name: "Archivo", data: archivo, weight: 400 as const }] : []),
      ],
    },
  );
}
