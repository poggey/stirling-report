// Probe: CoinGecko market_chart daily history (no key).
// Usage: npx tsx scripts/probe-coingecko.ts

async function probe(id: string) {
  const url = `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=30&interval=daily`;
  const res = await fetch(url);
  console.log(`\n=== ${id} | ${res.status} ${url}`);
  if (!res.ok) {
    console.log("body:", (await res.text()).slice(0, 300));
    return;
  }
  const body = await res.json();
  console.log("keys:", Object.keys(body));
  const prices = body.prices ?? [];
  console.log("n prices:", prices.length);
  console.log("first:", JSON.stringify(prices[0]), "=>", new Date(prices[0]?.[0]).toISOString());
  console.log("last:", JSON.stringify(prices.at(-1)), "=>", new Date(prices.at(-1)?.[0]).toISOString());
}

async function main() {
  await probe("bitcoin");
  await probe("ethereum");
}

main();
