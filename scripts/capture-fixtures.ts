// Captures real API responses into lib/sources/__fixtures__/ for unit tests
// (tests never make live calls). Re-run to refresh fixtures after API drift.
// Usage: npx tsx scripts/capture-fixtures.ts

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const DIR = path.join(__dirname, "..", "lib", "sources", "__fixtures__");
const end = new Date().toISOString().slice(0, 10);
const start = new Date(Date.now() - 60 * 86400_000).toISOString().slice(0, 10);

async function save(name: string, content: string) {
  await writeFile(path.join(DIR, name), content);
  console.log("wrote", name, `${content.length} bytes`);
}

async function main() {
  await mkdir(DIR, { recursive: true });

  // Frankfurter — GBP base
  const fx = await fetch(
    `https://api.frankfurter.dev/v1/${start}..${end}?base=GBP&symbols=USD`,
  );
  await save("frankfurter-gbp-usd.json", JSON.stringify(await fx.json(), null, 2));

  // CoinGecko — bitcoin
  const cg = await fetch(
    "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=30&interval=daily",
  );
  await save("coingecko-bitcoin.json", JSON.stringify(await cg.json(), null, 2));

  // Yahoo — FTSE 100, trimmed to the fields the parser reads
  const ya = await fetch(
    "https://query1.finance.yahoo.com/v8/finance/chart/%5EFTSE?range=2mo&interval=1d",
    { headers: { "User-Agent": "Mozilla/5.0" } },
  );
  const yaBody = await ya.json();
  const r = yaBody.chart.result[0];
  const trimmed = {
    chart: {
      result: [
        {
          meta: { symbol: r.meta.symbol, currency: r.meta.currency },
          timestamp: r.timestamp,
          indicators: { quote: [{ close: r.indicators.quote[0].close }] },
        },
      ],
      error: null,
    },
  };
  await save("yahoo-ftse.json", JSON.stringify(trimmed, null, 2));

  // Bank of England — all four series in one request, as the provider fetches them
  const fmt = (d: Date) =>
    `${String(d.getDate()).padStart(2, "0")}/${d.toLocaleString("en-GB", { month: "short" })}/${d.getFullYear()}`;
  const boe = await fetch(
    "https://www.bankofengland.co.uk/boeapps/iadb/fromshowcolumns.asp?csv.x=yes" +
      `&Datefrom=${fmt(new Date(Date.now() - 60 * 86400_000))}&Dateto=${fmt(new Date())}` +
      "&SeriesCodes=IUDBEDR,IUDSNPY,IUDMNPY&CSVF=TN&UsingCodes=Y&VPD=Y&VFD=N",
    { headers: { "User-Agent": "stirling-fixture-capture/0.1" } },
  );
  await save("boe-iadb.csv", (await boe.text()).trim());

  // FRED — real DGS2/DGS10 values via the keyless fredgraph export, recast into
  // the documented observations shape the API returns (values as strings,
  // missing days "."). Re-verify against the real API once a key exists.
  const fg = await fetch("https://fred.stlouisfed.org/graph/fredgraph.csv?id=DGS2,DGS10");
  const rows = (await fg.text()).trim().split("\n").slice(1); // drop header
  const recent = rows.slice(-45).map((line) => line.split(","));
  const toObs = (col: number) =>
    recent.map(([date, ...vals]) => ({
      realtime_start: date,
      realtime_end: date,
      date,
      value: vals[col] === "" ? "." : vals[col],
    }));
  await save(
    "fred-dgs2.json",
    JSON.stringify({ units: "lin", observations: toObs(0) }, null, 2),
  );
  await save(
    "fred-dgs10.json",
    JSON.stringify({ units: "lin", observations: toObs(1) }, null, 2),
  );
}

main();
