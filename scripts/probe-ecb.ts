// Probe: ECB Data Portal API (no key) — deposit facility rate.
// Usage: npx tsx scripts/probe-ecb.ts

async function probe(label: string, key: string) {
  const url = `https://data-api.ecb.europa.eu/service/data/FM/${key}?format=csvdata&lastNObservations=15`;
  const res = await fetch(url);
  const text = (await res.text()).trim();
  const lines = text.split("\n");
  console.log(`\n=== ${label} ${key} | ${res.status} | ${lines.length} lines`);
  console.log(lines.slice(0, 3).join("\n"));
  console.log("…");
  console.log(lines.slice(-2).join("\n"));
}

async function main() {
  await probe("Deposit facility rate", "D.U2.EUR.4F.KR.DFR.LEV");
  await probe("Main refinancing rate", "D.U2.EUR.4F.KR.MRR_FR.LEV");
}

main();
