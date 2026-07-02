/**
 * Learn Mode glossary (WHITEPAPER §4.10): two-sentence definitions written
 * for intelligent beginners, each with a "why it matters" line. Terms are
 * matched case-insensitively in chipped text; longest match wins.
 */

export interface GlossaryTerm {
  slug: string;
  term: string;
  /** Phrases that trigger a chip in running text (lowercase). */
  matches: string[];
  definition: string;
  why: string;
}

export const GLOSSARY: GlossaryTerm[] = [
  {
    slug: "z-score",
    term: "z-score",
    matches: ["z-score", "standard deviations", "σ"],
    definition:
      "A move expressed in standard deviations against its own recent history — here, the trailing month of daily moves. A z of 2 means today was twice as violent as a typical day for that instrument.",
    why: "It separates 'big number' from 'unusual number': 1% is a quiet day for Bitcoin and a wild one for EUR/GBP.",
  },
  {
    slug: "basis-point",
    term: "basis point",
    matches: ["basis point", "basis points", "bp"],
    definition:
      "One hundredth of a percentage point. A yield moving from 4.50% to 4.61% has risen 11 basis points.",
    why: "Rates move in tiny increments with huge consequences — bp keeps the arithmetic honest.",
  },
  {
    slug: "yield-curve",
    term: "yield curve",
    matches: ["yield curve", "gilt curve", "treasury curve"],
    definition:
      "The line traced by a government's borrowing costs across maturities, from short bills to long bonds. Its shape encodes what markets expect policy and growth to do.",
    why: "It is the market's macro forecast, updated every trading day.",
  },
  {
    slug: "inversion",
    term: "curve inversion",
    matches: ["inverted", "inversion"],
    definition:
      "When short-dated yields sit above long-dated ones — lenders are paid more for two years than ten. It signals that policy is tight relative to expected growth.",
    why: "Inversions have preceded every US recession of the past half-century, with long and variable lags.",
  },
  {
    slug: "2s10s",
    term: "2s10s spread",
    matches: ["2s10s", "5s10s"],
    definition:
      "The gap between the 10-year and 2-year yield (here 5s10s where no 2-year series exists). Positive means an upward-sloping curve; negative means inversion.",
    why: "One number that summarises the whole curve's message about the cycle.",
  },
  {
    slug: "gilt",
    term: "gilt",
    matches: ["gilt", "gilts"],
    definition:
      "A UK government bond, named for the gilt-edged certificates they were once printed on. The 10-year gilt yield is Britain's benchmark borrowing cost.",
    why: "Gilt yields set the tone for UK mortgages, corporate borrowing and the pound.",
  },
  {
    slug: "bank-rate",
    term: "Bank Rate",
    matches: ["bank rate"],
    definition:
      "The Bank of England's policy interest rate, set by the Monetary Policy Committee eight times a year. It anchors overnight money and, through expectations, much of the curve.",
    why: "It is the single most consequential administered price in the UK economy.",
  },
  {
    slug: "mpc",
    term: "MPC",
    matches: ["mpc", "monetary policy committee"],
    definition:
      "The Bank of England's nine-member Monetary Policy Committee, which votes on Bank Rate. Vote splits are read as a signal of the path ahead.",
    why: "A 5–4 vote moves markets even when the rate itself does not change.",
  },
  {
    slug: "fomc",
    term: "FOMC",
    matches: ["fomc"],
    definition:
      "The Federal Open Market Committee — the Fed's rate-setting body, meeting roughly every six weeks. Its target is a range, currently expressed as an upper and lower bound.",
    why: "US policy sets the world's discount rate; every asset reprices off it.",
  },
  {
    slug: "cpi",
    term: "CPI",
    matches: ["cpi", "consumer price inflation"],
    definition:
      "The Consumer Prices Index — the headline measure of how fast the price of a representative basket is rising. Central banks target it, usually at 2%.",
    why: "Hot CPI prints lift yields and reprice rate expectations within minutes.",
  },
  {
    slug: "nfp",
    term: "non-farm payrolls",
    matches: ["non-farm payrolls", "payrolls", "employment situation"],
    definition:
      "The monthly count of US jobs added outside farming — the first Friday ritual of macro markets. It arrives with the unemployment rate and wage growth.",
    why: "It is the fastest broad read on the US economy and routinely the month's biggest data event.",
  },
  {
    slug: "salience",
    term: "salience",
    matches: ["salience", "highest-salience"],
    definition:
      "Stirling's deterministic ranking of what mattered: the size of a move in standard deviations, weighted by how systemically important the asset class is.",
    why: "It is auditable editorial judgement — code decides the headline, not the AI.",
  },
  {
    slug: "risk-off",
    term: "risk-off",
    matches: ["risk-off", "risk-on", "risk appetite", "safe-haven"],
    definition:
      "Shorthand for correlated selling of growth-sensitive assets (equities, crypto, commodity currencies) and buying of havens (Treasuries, gold, yen). Risk-on is the reverse.",
    why: "Single names move on stories; whole boards move on risk appetite.",
  },
  {
    slug: "front-month",
    term: "front month",
    matches: ["front month", "futures"],
    definition:
      "The nearest-dated futures contract for a commodity — the price quoted as 'Brent' or 'gold' on most screens. Contracts expire monthly, and prices can jump at the roll.",
    why: "A 'move' in Brent can occasionally be the calendar, not the oil.",
  },
  {
    slug: "reference-rate",
    term: "ECB reference rate",
    matches: ["reference rate", "ecb reference"],
    definition:
      "The European Central Bank's once-daily published FX fixes, set around 16:00 CET. They are the standard for daily-close FX data.",
    why: "Free, official and stable — exactly the granularity a daily briefing needs.",
  },
  {
    slug: "deposit-rate",
    term: "deposit facility rate",
    matches: ["deposit facility", "deposit rate"],
    definition:
      "The rate the ECB pays banks for parking money overnight — since 2019, the euro area's effective policy rate.",
    why: "When commentators say 'the ECB cut', this is usually the number that moved.",
  },
  {
    slug: "standfirst",
    term: "standfirst",
    matches: ["standfirst"],
    definition:
      "Newspaper anatomy: the sentence or two under the headline that carries the story's substance. Stirling generates one deterministically from the day's top movers.",
    why: "Reading like a newsroom teaches you to summarise like one.",
  },
  {
    slug: "surprise-index",
    term: "surprise index",
    matches: ["surprise index", "surprise direction"],
    definition:
      "A rolling score of whether economic data has been arriving better or worse than expected. Stirling scores against the prior print, since consensus data is commercial.",
    why: "Markets move on surprises, not levels — good news is only news if it wasn't priced.",
  },
];

export function glossaryBySlug(slug: string): GlossaryTerm | undefined {
  return GLOSSARY.find((g) => g.slug === slug);
}

/** Deterministic Concept of the Day: rotates through the glossary by date. */
export function conceptOfTheDay(date: Date): GlossaryTerm {
  const dayOfYear = Math.floor(
    (date.getTime() - Date.UTC(date.getUTCFullYear(), 0, 0)) / 86400_000,
  );
  return GLOSSARY[dayOfYear % GLOSSARY.length];
}
