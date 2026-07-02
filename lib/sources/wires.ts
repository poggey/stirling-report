import { cachedFetch } from "./cached-fetch";

/**
 * The wires (WHITEPAPER §5): official RSS feeds, headlines only, always
 * linked out — no scraping, no body text. Refreshes on the same 30-minute
 * cache as the market data; each evening's edition freezes the wires as
 * they stood at snapshot time.
 */

export interface Headline {
  title: string;
  link: string;
  source: string;
  /** ISO timestamp. */
  publishedAt: string;
  /** Wire salience — see scoreHeadline. The leader is pinned first. */
  score: number;
}

const FEEDS = [
  { source: "BBC Business", url: "https://feeds.bbci.co.uk/news/business/rss.xml" },
  { source: "BBC World", url: "https://feeds.bbci.co.uk/news/world/rss.xml" },
  { source: "Bank of England", url: "https://www.bankofengland.co.uk/rss/news" },
  { source: "Federal Reserve", url: "https://www.federalreserve.gov/feeds/press_all.xml" },
  { source: "ECB", url: "https://www.ecb.europa.eu/rss/press.html" },
];

/**
 * Wire salience, the same philosophy as the instrument ranking: a
 * transparent, auditable formula instead of editorial whim or raw recency.
 *
 *   score = keyword tier × source weight × 0.5^(age_hours / 12)
 *
 * A tier-3 story (war, rate decision, crash) twelve hours old still beats a
 * fresh tier-1 story, so the day's big story cannot be buried by later
 * trivia. Tune the tables freely — they are the editorial judgement, kept
 * in code where it can be audited.
 */
const TIER_3 = [
  "war", "invasion", "invades", "attack", "strikes", "missile", "nuclear",
  "sanction", "default", "crash", "collapse", "crisis", "bailout",
  "emergency", "escalat", "ceasefire",
];
const TIER_2 = [
  "rate", "inflation", "cpi", "gdp", "recession", "unemployment", "tariff",
  "opec", "oil", "gas", "central bank", "federal reserve", "ecb",
  "bank of england", "budget", "deficit", "election", "bond", "gilt",
  "treasury", "sterling", "dollar", "euro", "markets",
];

// Central-bank feeds carry policy news by definition.
const SOURCE_WEIGHT: Record<string, number> = {
  "Bank of England": 1.5,
  "Federal Reserve": 1.5,
  ECB: 1.5,
};

const HALF_LIFE_HOURS = 12;

export function scoreHeadline(
  title: string,
  source: string,
  publishedAt: string,
  now = Date.now(),
): number {
  const lower = title.toLowerCase();
  const tier = TIER_3.some((k) => lower.includes(k))
    ? 3
    : TIER_2.some((k) => lower.includes(k))
      ? 2
      : 1;
  const ageHours = Math.max(0, (now - Date.parse(publishedAt)) / 3_600_000);
  const decay = Math.pow(0.5, ageHours / HALF_LIFE_HOURS);
  return tier * (SOURCE_WEIGHT[source] ?? 1) * decay;
}

function stripCdata(value: string): string {
  return value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim();
}

function decodeEntities(value: string): string {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#x27;", "'")
    .replaceAll("&#39;", "'")
    .replaceAll("&apos;", "'")
    .replaceAll("&nbsp;", " ");
}

function tag(block: string, name: string): string | null {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i"));
  return m ? decodeEntities(stripCdata(m[1])) : null;
}

/** Parses RSS 2.0 items: titles are often CDATA-wrapped (BBC), pubDates
 * sometimes too (Fed), timezone formats vary — Date.parse handles RFC 822. */
export function parseRss(xml: string, source: string): Headline[] {
  const items = xml.match(/<item[\s>][\s\S]*?<\/item>/g) ?? [];
  const out: Headline[] = [];
  for (const item of items) {
    const title = tag(item, "title");
    const link = tag(item, "link");
    const pubDate = tag(item, "pubDate");
    if (!title || !link) continue;
    const ts = pubDate ? Date.parse(pubDate) : NaN;
    if (!Number.isFinite(ts)) continue;
    const publishedAt = new Date(ts).toISOString();
    out.push({
      title,
      link,
      source,
      publishedAt,
      score: Number(scoreHeadline(title, source, publishedAt).toFixed(3)),
    });
  }
  return out;
}

/**
 * The leader — highest wire salience — is pinned first so the day's big
 * story cannot be buried by later trivia; the rest run newest-first.
 * Deduplicated by title, capped; a failed feed degrades silently to the
 * others and an empty panel states the reason honestly at the render site.
 */
export async function fetchWires(limit = 8): Promise<Headline[]> {
  const settled = await Promise.allSettled(
    FEEDS.map(async ({ source, url }) => {
      const res = await cachedFetch(url, { "User-Agent": "stirling/0.1 (daily economic briefing)" });
      return parseRss(await res.text(), source);
    }),
  );
  const seen = new Set<string>();
  const pool = settled
    .flatMap((r) => (r.status === "fulfilled" ? r.value : []))
    .filter((h) => {
      const key = h.title.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  if (pool.length === 0) return [];

  const leader = pool.reduce((a, b) => (b.score > a.score ? b : a));
  const rest = pool
    .filter((h) => h !== leader)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, limit - 1);
  return [leader, ...rest];
}
