# NOTES — data source quirks discovered by probing

Read alongside CLAUDE.md. Every entry here came from a real probe run
(`scripts/probe-*.ts`), not from guessed schemas. Re-run probes before
trusting anything below after a long gap.

## Frankfurter (FX — no key)

- `https://api.frankfurter.dev/v1/{start}..{end}?base=X&symbols=Y,Z`
- Returns `{ amount, base, start_date, end_date, rates: { "YYYY-MM-DD": { SYM: n } } }`.
- Quirk: the returned window **snaps to the nearest prior banking day** — asking
  from 2026-05-03 returned data from 2026-04-30. Dates are TARGET business days
  only (no weekends/holidays).
- Rates are ECB reference rates, published ~16:00 CET; today's value appears
  during the afternoon.
- One request can carry several symbols; GBP/USD, EUR/USD+EUR/GBP, USD/JPY
  cost three requests total.

## CoinGecko (crypto — no key)

- `/api/v3/coins/{id}/market_chart?vs_currency=usd&days=30&interval=daily`
- Returns `{ prices: [[ms_epoch, price], …], market_caps, total_volumes }`.
- Quirk: with `interval=daily` you get 31 points where the **last point is the
  live price right now** (timestamp = request time), not a midnight close. Drop
  or treat the final point as "today so far".
- Free tier 429s under bursts; two requests/refresh is fine.

## Stooq (indices/commodities CSV) — **BLOCKED, do not use server-side**

- Probed 2026-07-02: every `stooq.com/q/d/l/` request returns an HTML
  JavaScript proof-of-work challenge ("This site requires JavaScript to verify
  your browser"), never CSV, regardless of symbol. Unusable from a server.
- Fallback in use: **Yahoo Finance chart API** (below). Revisit if Stooq drops
  the challenge, or replace with Twelve Data/Finnhub free keys (WHITEPAPER §5
  names those as the equity primaries).

## Yahoo Finance chart API (indices/commodities fallback — no key, unofficial)

- `https://query1.finance.yahoo.com/v8/finance/chart/{sym}?range=2mo&interval=1d`
  with a browser-ish User-Agent header.
- Verified symbols: `^FTSE` (FTSE 100, GBP), `^GSPC` (S&P 500), `^IXIC`
  (Nasdaq Composite), `BZ=F` (Brent front month), `GC=F` (gold front month).
- Shape: `chart.result[0] = { meta: { symbol, currency, shortName, … },
  timestamp: [unix_s, …], indicators: { quote: [{ close: [n|null, …] }] } }`.
- Close arrays can contain `null` on half-days — filter them.
- `BZ=F`/`GC=F` are futures front months: contract rolls can cause price jumps
  unrelated to spot (Brent printed 114 → 71 over May–Jul 2026 in the probe).
- Unofficial endpoint: degrade honestly if it breaks; official-primary rule
  (WHITEPAPER §13) says this should eventually sit behind a keyed primary.

## Bank of England IADB (Bank Rate + gilts — no key)

- CSV: `bankofengland.co.uk/boeapps/iadb/fromshowcolumns.asp?csv.x=yes&Datefrom=DD/Mon/YYYY&Dateto=DD/Mon/YYYY&SeriesCodes=…&CSVF=TN&UsingCodes=Y`
- Dates in `DD Mon YYYY` (e.g. `30 Jun 2026`); header row `DATE,<code>,…`.
- Needs a User-Agent header (default fetch UA is fine, we send one anyway).
- Verified codes: `IUDBEDR` Bank Rate; nominal par gilt yields `IUDSNPY` (5y),
  `IUDMNPY` (10y), `IUDLNPY` (20y).
- **There is no 2y par-yield quick code.** The curve card therefore shows
  5y/10y with a 5s10s readout, honestly labelled. Phase 5's full curve should
  use the BoE yield-curve dataset (ZIP download) which has all tenors.
- Bank Rate series repeats the same value daily; yields lag by one business day.

## ECB Data Portal (euro-area policy rates — no key)

- `data-api.ecb.europa.eu/service/data/FM/D.U2.EUR.4F.KR.DFR.LEV?format=csvdata&lastNObservations=N`
- CSV with ~40 columns; `TIME_PERIOD` and `OBS_VALUE` sit before any quoted
  field, so index-based parsing of the leading cells is safe.
- The deposit-facility series repeats daily between changes — good for
  deriving "last change" honestly from the data.

## Vercel cron (vercel.json)

- Hobby-tier crons fire at some point WITHIN THE HOUR after the scheduled
  minute, not exactly on it. The snapshot is scheduled at 21:05 UTC so that
  even a maximal delay stays inside the same UK calendar day in BST
  (22:05 UTC + 55min would cross UK midnight and stamp tomorrow's date).
- Vercel sends `Authorization: Bearer $CRON_SECRET` automatically when an
  env var with that exact name exists on the project.
- Without BLOB_READ_WRITE_TOKEN the store falls back to the repo's /data
  folder, which is read-only on Vercel — the cron will 500. A Blob store is
  required in production.

## Curated calendars (lib/central-banks.ts, lib/diary.ts)

- Meeting dates and release dates are curated from the official calendars
  (BoE, Fed, ECB, BLS, ONS) — see the `curated` stamps in each file. They are
  published facts, but they DO go stale: re-verify when each institution
  publishes its next calendar year, and after any rescheduling announcement.
- bankofengland.co.uk and bls.gov 403 generic fetchers; search or use the
  press-release pages instead.
- Consensus expectations are commercial data (WHITEPAPER §13): the diary
  omits them and scores surprise direction against the prior print only.

## Wires — official RSS feeds (no key)

- Verified feeds: BBC Business/World (`feeds.bbci.co.uk/news/{business,world}/rss.xml`),
  BoE news (`bankofengland.co.uk/rss/news`), Fed press
  (`federalreserve.gov/feeds/press_all.xml`), ECB press
  (`ecb.europa.eu/rss/press.html`).
- Quirks: BBC wraps titles in CDATA; the Fed wraps pubDate in CDATA;
  timezone formats vary (GMT vs +0100 vs +0200) — Date.parse copes.
- Headlines only, always linked out (WHITEPAPER §5). The AI receives them as
  labelled context and may explain a move with hedged language, but the
  salience ranking alone decides what leads; the news-aware headline is
  parsed out of the desk-note call so the cron stays ≤3 AI calls/day.

## Gemini (GEMINI_API_KEY)

- `gemini-2.0-flash` 429s on the current free tier; `gemini-2.5-flash` works
  (as of Jul 2026). 2.5-series models spend "thinking" tokens from
  maxOutputTokens — set `thinkingConfig.thinkingBudget: 0` or briefings
  truncate mid-sentence.

## FRED (US Treasury yields — key in FRED_API_KEY)

- API: `/fred/series/observations?series_id=DGS2&api_key=…&file_type=json`
  → `{ observations: [{ date: "YYYY-MM-DD", value: "4.14" }, …] }` — values are
  **strings**, missing days are `"."`.
- Without a key the API 400s. The provider then serves the recorded fixture
  (real DGS2/DGS10 values captured from the keyless one-off
  `fred.stlouisfed.org/graph/fredgraph.csv` export) marked `stale`.
- fredgraph.csv quirk: with multiple ids, `cosd`/`coed` were ignored — it
  returned the full history from 1962. Slice what you need.
- DGS series lag ~2 business days behind today.
