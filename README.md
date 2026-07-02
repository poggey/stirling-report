<div align="center">

<img src="docs/screenshots/briefing-card.png" alt="Stirling — a daily briefing card: racing green, guilloché medallion, the day's headline and key numbers" width="720" />

# Stirling.

**A free, automated daily economic briefing — one immutable edition a day, at £0/month.**

**[→ stirling-report.vercel.app](https://stirling-report.vercel.app/)**

*Named after Stirling Moss — a homophone of sterling.*

</div>

---

## Who built this

I'm **Padraig** — going into my second year of an Economics and Finance degree.

- The problem: staying on top of markets as a student is awkward. Bloomberg is unaffordable, free finance sites are a wall of tickers, and news tells you what happened but not *how unusual it was*.
- So I built the tool I'd actually use: a page that says what mattered yesterday, in numbers first and words second, and files every day away permanently.
- It's useful to me in an ordinary way — a quick daily read that builds the market fluency my degree assumes, plus an archive I can revise from before interviews.
- It's also a portfolio piece: a deployed, automated production system, not a notebook.

Built with the help of **Claude (Fable 5)**, Anthropic's coding model — the design spec and editorial rules are mine; a lot of the implementation was pair-built with it.

---

## The front page

<img src="docs/screenshots/today.png" alt="The Today page: story of the day, the green ledger of highest-salience moves, and the wires" width="900" />

- **Story of the Day** — a deterministic engine ranks every move by salience (size in standard deviations × how systemically important the asset class is) and writes the headline. Code decides what mattered, never the AI.
- **Today's Ledger** — the four most unusual moves, cream on racing green. Sparkline stroke weight scales with how abnormal the move is.
- **On the wires** — headlines from official feeds (BBC, BoE, Fed, ECB), linked out. Anything above an auditable salience threshold *leads*, so a big morning story can't be buried by afternoon trivia.
- **The market board** — FX, indices, commodities, crypto, rates. Scrub any sparkline for exact values. Star tiles to build a watchlist (browser-only, no accounts).

## The daily report

<img src="docs/screenshots/report.png" alt="The report sheet: green header band with medallion seal, tone tabs, stat bar and the briefing" width="900" />

- Written once per day by AI at snapshot time, cached for every reader — three tones: **Desk note**, **Plain English**, **Study mode**.
- Hard rules: only numbers from the day's snapshot, hedged causality ("consistent with…"), always ends with *What to watch tomorrow*.
- News may only be cited if it actually appeared on the wires — with a plausibility gate so it never forces a causal link.
- If AI quota fails, a deterministic template briefing takes over. The product never shows a blank.

## The Yield Curve Observatory

<img src="docs/screenshots/curve.png" alt="The curve page: UK gilt and US Treasury curves with month and year-ago comparators and 2s10s spread trackers" width="900" />

- UK gilt and US Treasury curves vs one month and one year ago.
- 2s10s spread trackers flag inversion — the classic recession signal — and count consecutive inverted sessions.
- Hover anywhere to scrub exact yields.

## The diary & central bank watch

<img src="docs/screenshots/diary.png" alt="The economic diary with prior and expected columns, and Central Bank Watch with decision countdowns" width="900" />

- Scheduled UK / US / euro-area releases with priors from the official prints.
- Live policy rates for the BoE, Fed and ECB, with real decision countdowns from their published calendars.
- Consensus is commercial data — shown only when publicly citable, never guessed.

## The archive — the Time Machine

- One immutable edition per day, forever. Click any date and the whole dashboard reconstructs exactly as it stood that evening, under a green *Replay* banner.
- **Play Week** animates through five sessions — a narrative arc in ten seconds.
- The archive is an open dataset: [`/api/editions/index`](https://stirling-report.vercel.app/api/editions/index), mirrored nightly into [`/data`](data/editions).
- This is the point of the whole thing: the product improves every day it's deployed, because the archive only grows.

## Learn mode & interview prep

- One toggle and every technical term grows a dotted brass underline — click for a two-sentence definition and why it matters today.
- Opened terms build a personal glossary (localStorage only).
- **Interview Prep Mode**: a model "talk me through markets today" answer where every sentence footnotes the exact data point it derives from, flashcards built from the archive, and a printable Last-30-Days one-pager.

## Mobile

<div align="center">
<img src="docs/screenshots/mobile.png" alt="Stirling on mobile: compact header, hamburger menu, single-column layout" width="300" />
</div>

---

## How it works

```
07:00–21:30  Live edition — tiles refresh via ISR every 30 minutes
22:05        Snapshot cron: fetch all sources → compute z-scores, salience,
             weather → freeze the wires → ≤3 Gemini calls (one per tone)
             → write the immutable numbered edition JSON to Vercel Blob
22:20        GitHub Action mirrors the edition into /data — an open dataset
```

- **Snapshot-first**: page requests never fan out to external APIs. One JSON per day drives everything.
- **Immutable by construction**: the storage layer refuses to overwrite an existing edition.
- **Honest degradation**: a failed source shows *"stale since…"* with the reason — never a crash, never an invented number.

The trust model, in one table:

| Judgement | Made by |
|---|---|
| What mattered today (the ranking) | Deterministic code — `\|z\| × class weight`, auditable |
| The weather gauge (Clear → Storm) | Deterministic composite of intensity × breadth |
| Which wire headline leads | Deterministic score — keyword tier × source × recency half-life |
| How it's *worded* | AI, once per day, from the snapshot only |
| When AI is unavailable | A template briefing built from the same numbers |

## The data — everything free, everything cited

| Domain | Source | Key needed |
|---|---|---|
| FX | [Frankfurter](https://frankfurter.dev) (ECB reference rates) | No |
| Indices & commodities | Yahoo Finance chart API *(see NOTES.md)* | No |
| Crypto | CoinGecko | No |
| UK Bank Rate & gilts | Bank of England IADB | No |
| US Treasuries & Fed target | FRED (St. Louis Fed) | Free key |
| Euro-area policy rate | ECB Data Portal | No |
| News wires | BBC / BoE / Fed / ECB official RSS — headlines only | No |
| AI briefings | Google Gemini Flash — 3 calls/day, cached | Free key |

- Every provider: recorded-fixture unit tests (no live calls), a health state, a named fallback.
- API quirks found while building: [`NOTES.md`](NOTES.md).
- **Total running cost: £0.00/month.**

## The design — "Racing Ink"

- British racing green on warm ivory, brass detail — coachlines, a door-number roundel for the edition.
- A generative **guilloché medallion** redrawn daily from the data: volatility sets the petal count, storm days weave in a vermilion thread.
- Exactly one saturated green surface per view. Gains emerald, losses vermilion, always with ▲/▼ glyphs.
- No dark mode, no monospace — tabular figures do the terminal's job without the costume.
- Full spec: [`WHITEPAPER.md`](WHITEPAPER.md).

## Run it yourself

```bash
git clone https://github.com/poggey/stirling-report.git
cd stirling-report
npm install
cp .env.example .env.local   # FRED_API_KEY + GEMINI_API_KEY (both free) — optional
npm run dev                  # runs keyless too, with honestly-labelled fallbacks
npm test                     # 46 tests, fixture-backed, no live calls
```

- Issue an edition locally: `curl localhost:3000/api/cron/snapshot`
- In production: Vercel Cron runs it nightly — set `CRON_SECRET`, add a Blob store, set the `SITE_URL` repo variable for the mirror action.

---

<div align="center">

**[stirling-report.vercel.app](https://stirling-report.vercel.app/)**

*Informational only — not investment advice.*
*Sources: Frankfurter (ECB) · CoinGecko · Yahoo Finance · Bank of England · FRED · ECB · BBC News*

</div>
