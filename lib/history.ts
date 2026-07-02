/**
 * This Day in Economic History (§4.14): a small curated dataset shipped with
 * the app. Keyed MM-DD. Grows over time; dates without an entry render an
 * honest empty state rather than a filler fact.
 */

export interface HistoryVignette {
  year: number;
  text: string;
}

const VIGNETTES: Record<string, HistoryVignette> = {
  "01-01": { year: 1999, text: "The euro launches as an accounting currency across eleven member states — notes and coins follow three years later." },
  "02-04": { year: 1994, text: "The Fed begins the 1994 tightening cycle with a 25bp rise — the year the bond market crashed and convexity entered the vocabulary." },
  "03-16": { year: 2020, text: "The Fed cuts to zero and restarts QE on a Sunday night as COVID panic peaks; the S&P falls 12% the next day anyway." },
  "04-02": { year: 1792, text: "The US Coinage Act establishes the dollar and the mint — the start of American monetary policy." },
  "05-06": { year: 2010, text: "The Flash Crash: the Dow drops nearly 1,000 points in minutes as liquidity evaporates, then mostly recovers within the hour." },
  "06-23": { year: 2016, text: "The UK votes to leave the European Union; sterling falls over 8% against the dollar overnight — its worst day on record." },
  "07-02": { year: 1997, text: "Thailand floats the baht after exhausting its reserves defending the peg — the spark of the Asian Financial Crisis." },
  "08-15": { year: 1971, text: "Nixon closes the gold window, ending Bretton Woods convertibility — the birth of the modern fiat era." },
  "09-15": { year: 2008, text: "Lehman Brothers files for bankruptcy — the largest in US history and the pivot of the Global Financial Crisis." },
  "09-16": { year: 1992, text: "Black Wednesday: sterling crashes out of the ERM despite 15% rates; the Treasury's defence costs billions." },
  "10-19": { year: 1987, text: "Black Monday: the Dow falls 22.6% in a single session — still the largest one-day percentage loss on record." },
  "10-24": { year: 1929, text: "Black Thursday opens the Wall Street Crash; within weeks the Roaring Twenties are over." },
  "11-30": { year: 2022, text: "ChatGPT launches, and within months markets begin pricing an AI capital-spending cycle." },
  "12-01": { year: 2008, text: "The NBER declares the US recession began a full year earlier — a reminder that turning points are only visible in hindsight." },
};

export function historyFor(date: Date): HistoryVignette | null {
  const key = `${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  return VIGNETTES[key] ?? null;
}
