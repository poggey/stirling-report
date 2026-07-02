// Probe: FRED API for DGS2/DGS10 (key in FRED_API_KEY).
// Without a key it shows the API's error shape, then probes the public
// fredgraph.csv export used once to record the stale fixture.
// Usage: npx tsx scripts/probe-fred.ts

const key = process.env.FRED_API_KEY;

const end = new Date().toISOString().slice(0, 10);
const start = new Date(Date.now() - 60 * 86400_000).toISOString().slice(0, 10);

async function main() {
for (const series of ["DGS2", "DGS10"]) {
  const url =
    `https://api.stlouisfed.org/fred/series/observations?series_id=${series}` +
    `&api_key=${key ?? "MISSING"}&file_type=json&observation_start=${start}&observation_end=${end}`;
  const res = await fetch(url);
  const text = await res.text();
  console.log(`\n=== FRED API ${series} | key ${key ? "present" : "ABSENT"} | ${res.status}`);
  if (res.ok) {
    const body = JSON.parse(text);
    console.log("keys:", Object.keys(body));
    console.log("n obs:", body.observations?.length);
    console.log("first:", JSON.stringify(body.observations?.[0]));
    console.log("last:", JSON.stringify(body.observations?.at(-1)));
  } else {
    console.log("body:", text.slice(0, 200));
  }
}

// Keyless one-off export, used only to record the fixture — never called by the app.
const g = await fetch(`https://fred.stlouisfed.org/graph/fredgraph.csv?id=DGS2,DGS10&cosd=${start}&coed=${end}`);
const lines = (await g.text()).trim().split("\n");
console.log(`\n=== fredgraph.csv | ${g.status} | ${lines.length} lines`);
console.log(lines.slice(0, 3).join("\n"));
console.log("…");
console.log(lines.slice(-2).join("\n"));
}

main();
