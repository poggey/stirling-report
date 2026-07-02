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
}

const FEEDS = [
  { source: "BBC Business", url: "https://feeds.bbci.co.uk/news/business/rss.xml" },
  { source: "BBC World", url: "https://feeds.bbci.co.uk/news/world/rss.xml" },
  { source: "Bank of England", url: "https://www.bankofengland.co.uk/rss/news" },
  { source: "Federal Reserve", url: "https://www.federalreserve.gov/feeds/press_all.xml" },
  { source: "ECB", url: "https://www.ecb.europa.eu/rss/press.html" },
];

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
    out.push({
      title,
      link,
      source,
      publishedAt: new Date(ts).toISOString(),
    });
  }
  return out;
}

/**
 * Newest first across all feeds, deduplicated by title, capped. A failed
 * feed degrades silently to the others — an empty wires panel states the
 * reason honestly at the render site.
 */
export async function fetchWires(limit = 8): Promise<Headline[]> {
  const settled = await Promise.allSettled(
    FEEDS.map(async ({ source, url }) => {
      const res = await cachedFetch(url, { "User-Agent": "stirling/0.1 (daily economic briefing)" });
      return parseRss(await res.text(), source);
    }),
  );
  const seen = new Set<string>();
  return settled
    .flatMap((r) => (r.status === "fulfilled" ? r.value : []))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .filter((h) => {
      const key = h.title.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, limit);
}
