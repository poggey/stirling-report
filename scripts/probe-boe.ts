// Probe: Bank of England IADB CSV (no key).
// Series candidates: IUDBEDR (Bank Rate), IUDSNPY (5y gilt nominal par yield),
// IUDMNPY (10y), IUDLNPY (20y). Checking whether a 2y series exists is the point.
// Usage: npx tsx scripts/probe-boe.ts

const fmt = (d: Date) =>
  `${String(d.getDate()).padStart(2, "0")}/${d.toLocaleString("en-GB", { month: "short" })}/${d.getFullYear()}`;

const now = new Date();
const from = new Date(Date.now() - 60 * 86400_000);

async function probe(codes: string) {
  const url =
    "https://www.bankofengland.co.uk/boeapps/iadb/fromshowcolumns.asp?csv.x=yes" +
    `&Datefrom=${fmt(from)}&Dateto=${fmt(now)}` +
    `&SeriesCodes=${codes}&CSVF=TN&UsingCodes=Y&VPD=Y&VFD=N`;
  const res = await fetch(url, { headers: { "User-Agent": "stirling-probe/0.1" } });
  const text = (await res.text()).trim();
  const lines = text.split("\n");
  console.log(`\n=== ${codes} | ${res.status} | ${lines.length} lines`);
  console.log(lines.slice(0, 3).join("\n"));
  console.log("…");
  console.log(lines.slice(-2).join("\n"));
}

async function main() {
  await probe("IUDBEDR");
  await probe("IUDSNPY,IUDMNPY,IUDLNPY");
}

main();
