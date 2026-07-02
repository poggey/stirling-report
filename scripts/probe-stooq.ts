// Probe: Stooq daily-close CSV. Verifies which symbol maps to which instrument.
// Usage: npx tsx scripts/probe-stooq.ts

const d2 = new Date().toISOString().slice(0, 10).replaceAll("-", "");
const d1 = new Date(Date.now() - 60 * 86400_000)
  .toISOString()
  .slice(0, 10)
  .replaceAll("-", "");

// Candidates per instrument — the probe decides which is real.
const candidates = [
  ["FTSE 100?", "^ftse"],
  ["FTSE 100?", "^ukx"],
  ["S&P 500?", "^spx"],
  ["Nasdaq Composite?", "^ndq"],
  ["Nasdaq Composite?", "^ixic"],
  ["Brent?", "cb.f"],
  ["Gold spot?", "xauusd"],
  ["Gold futures?", "gc.f"],
];

async function main() {
  for (const [label, sym] of candidates) {
    const url = `https://stooq.com/q/d/l/?s=${encodeURIComponent(sym)}&i=d&d1=${d1}&d2=${d2}`;
    const res = await fetch(url);
    const text = (await res.text()).trim();
    const lines = text.split("\n");
    console.log(`\n=== ${label} ${sym} | ${res.status} | ${lines.length} lines`);
    console.log("head:", lines[0]);
    console.log("row1:", lines[1]);
    console.log("last:", lines.at(-1));
  }
}

main();
