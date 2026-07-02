// Probe: Frankfurter FX time series (no key).
// Usage: npx tsx scripts/probe-frankfurter.ts

const end = new Date().toISOString().slice(0, 10);
const start = new Date(Date.now() - 60 * 86400_000).toISOString().slice(0, 10);

async function probe(base: string, symbols: string) {
  const url = `https://api.frankfurter.dev/v1/${start}..${end}?base=${base}&symbols=${symbols}`;
  const res = await fetch(url);
  const body = await res.json();
  console.log(`\n=== ${base} -> ${symbols} | ${res.status} ${url}`);
  const dates = Object.keys(body.rates ?? {});
  console.log("keys:", Object.keys(body));
  console.log("n dates:", dates.length, "| first:", dates[0], "| last:", dates.at(-1));
  console.log("first entry:", JSON.stringify(body.rates?.[dates[0] ?? ""]));
  console.log("last entry:", JSON.stringify(body.rates?.[dates.at(-1) ?? ""]));
}

async function main() {
  await probe("GBP", "USD");
  await probe("EUR", "USD,GBP");
  await probe("USD", "JPY");
}

main();
