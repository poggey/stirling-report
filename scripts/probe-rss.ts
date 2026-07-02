// Probe: official RSS feeds for the wires panel (WHITEPAPER §5 —
// headlines only, linked out, no scraping).
// Usage: npx tsx scripts/probe-rss.ts

const FEEDS = [
  ["BBC Business", "https://feeds.bbci.co.uk/news/business/rss.xml"],
  ["BBC World", "https://feeds.bbci.co.uk/news/world/rss.xml"],
  ["Bank of England news", "https://www.bankofengland.co.uk/rss/news"],
  ["Federal Reserve press", "https://www.federalreserve.gov/feeds/press_all.xml"],
  ["ECB press", "https://www.ecb.europa.eu/rss/press.html"],
];

async function probe(label: string, url: string) {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "stirling-probe/0.1" },
      signal: AbortSignal.timeout(15000),
    });
    const text = await res.text();
    const items = text.match(/<item[\s>]/g)?.length ?? 0;
    const firstTitle = text.match(/<item[\s\S]*?<title>([\s\S]*?)<\/title>/)?.[1]?.trim();
    const firstDate = text.match(/<item[\s\S]*?<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim();
    console.log(`\n=== ${label} | ${res.status} | ${items} items | ${text.length} bytes`);
    console.log("first title:", firstTitle?.slice(0, 120));
    console.log("first pubDate:", firstDate);
  } catch (err) {
    console.log(`\n=== ${label} | FAILED: ${String(err).slice(0, 100)}`);
  }
}

async function main() {
  for (const [label, url] of FEEDS) await probe(label, url);
}

main();
