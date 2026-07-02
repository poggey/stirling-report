// Probe: Yahoo Finance chart API (no key, unofficial) — candidate fallback
// for index/commodity daily closes while Stooq challenges non-browser clients.
// Usage: npx tsx scripts/probe-yahoo.ts

const candidates = [
  ["FTSE 100", "^FTSE"],
  ["S&P 500", "^GSPC"],
  ["Nasdaq Composite", "^IXIC"],
  ["Brent front month", "BZ=F"],
  ["Gold front month", "GC=F"],
];

async function probe(label: string, sym: string) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?range=2mo&interval=1d`;
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  console.log(`\n=== ${label} ${sym} | ${res.status}`);
  if (!res.ok) {
    console.log("body:", (await res.text()).slice(0, 200));
    return;
  }
  const body = await res.json();
  const r = body.chart?.result?.[0];
  console.log("meta.symbol:", r?.meta?.symbol, "| currency:", r?.meta?.currency, "| name:", r?.meta?.shortName);
  const ts = r?.timestamp ?? [];
  const close = r?.indicators?.quote?.[0]?.close ?? [];
  console.log("n points:", ts.length, "| n closes:", close.length);
  console.log("first:", new Date(ts[0] * 1000).toISOString().slice(0, 10), close[0]);
  console.log("last:", new Date(ts.at(-1) * 1000).toISOString().slice(0, 10), close.at(-1));
}

async function main() {
  for (const [label, sym] of candidates) await probe(label, sym);
}

main();
