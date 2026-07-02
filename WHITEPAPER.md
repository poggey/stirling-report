# STIRLING
### The Daily Economic Intelligence Terminal

*One page. One story. The whole economy, every day.*

**White paper, product & design specification** · Version 1.0 · July 2026
Prepared by Padraig — BSc Economics & Finance
**Total build and running cost: £0.00**

---

## Contents

- **1. Executive Summary**
- **2. The Problem and the Vision**
  - 2.1 The problem
  - 2.2 The vision
  - 2.3 The name
  - 2.4 Guiding principles
- **3. Who It Is For — Personas and Use Cases**
- **4. Feature Specification**
  - 4.1 The Daily Briefing Engine — “Produce Daily Report”
  - 4.2 Story of the Day — the narrative engine
  - 4.3 The AI Analyst
  - 4.4 The Time Machine — calendar replay
  - 4.5 The Market Board
  - 4.6 The Yield Curve Observatory
  - 4.7 Economic Calendar and the Surprise Index
  - 4.8 Central Bank Watch
  - 4.9 The Economic Weather System
  - 4.10 Learn Mode — the ambient tutor
  - 4.11 Interview Prep Mode
  - 4.12 Shareable Briefing Cards
  - 4.13 Watchlist and Personalisation
  - 4.14 This Day in Economic History
- **5. Data Architecture — Everything Free, Everything Cited**
- **6. The AI Layer on a £0 Budget**
  - 6.1 The generate-once, read-many architecture
  - 6.2 Provider strategy
  - 6.3 Prompt design principles
- **7. Technical Architecture and Vercel Deployment**
  - 7.1 Stack
  - 7.2 The daily lifecycle
  - 7.3 Free-tier capacity audit
  - 7.4 Reliability and graceful degradation
- **8. Design System and Style Guide — “Racing Ink”**
  - 8.1 Design principles
  - 8.2 Colour palette
  - 8.3 Typography
  - 8.4 Grid, surfaces and spacing
  - 8.5 Component library
  - 8.6 Motion
  - 8.7 Data visualisation rules
  - 8.8 Livery details — the British GT influence
  - 8.9 What this identity buys
- **9. Page Anatomy**
  - 9.1 Today (home)
  - 9.2 The Daily Report
  - 9.3 The Archive (Time Machine)
  - 9.4 Interview Prep Mode
- **10. Cost Audit — Proving £0.00**
- **11. Build Roadmap**
- **12. STIRLING as a Portfolio Piece**
- **13. Risks, Limitations and Mitigations**
- **14. Appendix — Signals Reference**

---

# 1. Executive Summary

Every morning, tens of thousands of junior analysts across London, New York and Hong Kong perform the same ritual: they arrive before the market opens, pull overnight moves in equities, rates, FX and commodities, scan the economic calendar, read what the central banks said, and compress it all into a one-page morning briefing for their desk. It is one of the most valuable habits in finance — and one of the most mechanical.

STIRLING automates that ritual. It is a free, web-based economic intelligence terminal that ingests the day's market data and macroeconomic releases from public APIs, decomposes them into signals, and renders them as a professionally designed daily briefing: a dashboard that does not just display numbers, but tells the story of the day. A single button — “Produce Daily Report” — generates the briefing. A calendar lets the user travel back in time and replay any previous trading day. An integrated AI analyst, running on free-tier language model APIs, writes the narrative summary a human junior analyst would otherwise write by hand.

The product is designed around three audiences that share one need. The finance student uses it to build daily market fluency — the single trait that most reliably separates strong internship candidates in interviews. The retail investor or casual trader uses it to understand what moved and why before making decisions. The generally curious professional uses it to hold an informed conversation about the economy. All three receive the same core artefact: a beautiful, opinionated, one-page account of the economic day.

Everything in this document — the data pipeline, the AI layer, hosting, storage and automation — runs entirely on free tiers: FRED, the Bank of England and ECB statistical APIs, Frankfurter, CoinGecko and Finnhub for data; Google Gemini's free tier for the AI analyst; and Vercel's Hobby plan for hosting, serverless functions and daily cron jobs. Section 10 provides a line-by-line cost audit demonstrating a genuine £0.00 total.

> **The thesis**
>
> A dashboard shows you numbers. A terminal tells you what they mean. STIRLING's defining design decision is that narrative is a first-class citizen: every chart, tile and gauge exists to support a single, coherent story of the day — the same story a junior analyst would tell their desk at 7:45am.

# 2. The Problem and the Vision

## 2.1 The problem

Economic information is abundant but fragmented and hostile to daily consumption. Market data lives on broker platforms designed to encourage trading, not understanding. Macro releases live on statistics office websites written for economists. Commentary lives behind paywalls at the FT and Bloomberg, priced for institutions (a Bloomberg Terminal costs roughly \$25,000 per year). Free aggregators exist, but they present walls of undifferentiated numbers with no hierarchy, no narrative and no memory — yesterday simply vanishes.

The result is that the people who would benefit most from daily economic fluency — students, early-career professionals, retail investors — face the highest barriers to acquiring it. Reading the economy daily is a compounding skill: each day's story only makes sense against the backdrop of the previous weeks. No free tool currently preserves and presents that continuity.

## 2.2 The vision

STIRLING compresses the entire economic day into a single, beautiful page that can be read in four minutes and interrogated for forty. Its design language is drawn from the material culture of finance itself — British racing green set against warm ivory with brass detailing, the register of racing heritage and private-bank stationery executed as a modern product — rather than the glowing dark dashboard every data product defaults to. And it behaves like a junior analyst: it ranks what mattered, explains why, links causes to effects, and keeps a perfect archive of every day it has ever reported on.

## 2.3 The name

Stirling — after Stirling Moss, the greatest of the British racers, and a homophone of sterling. The name carries the product's two identities in one word: British racing craft (the source of the Racing Ink design language, Section 8) and the currency at the centre of its daily story. It also gives the builder a thirty-second naming story in interviews, which is worth more than it sounds.

## 2.4 Guiding principles

- Narrative first. Numbers are evidence; the story is the product. Every screen answers “so what?” before “what?”

- Zero cost, no compromises. Every architectural decision must survive the constraint of £0/month at realistic usage. Free tiers are treated as a design material, not a limitation.

- Memory is a feature. Every daily briefing is archived permanently and replayable. The tool gets more valuable every single day it runs.

- Designed for the 7am reader. The primary use case is five focused minutes before lectures, the commute or the market open. Depth is available, never demanded.

- Teach quietly. Educational scaffolding (definitions, context, 'why this matters') is embedded but ambient — the tool never feels like a textbook.

# 3. Who It Is For — Personas and Use Cases

STIRLING is deliberately built for everyone who needs to understand the day's economy, but it is anchored by four personas that shape prioritisation. Each persona maps to a distinct mode of the same product rather than a separate product.

| **Persona**                       | **Situation**                                                                    | **What STIRLING gives them**                                                                                              | **Key features**                                              |
|-----------------------------------|----------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------|
| **The Student Analyst (primary)** | Economics/finance undergraduate preparing for internship interviews and seminars | Daily market fluency; a running mental model of the macro environment; instant answers to “talk me through markets today” | Daily Briefing, Learn Mode, Interview Prep Mode, Time Machine |
| **The Retail Trader**             | Trades CFDs/ETFs part-time; needs context before entering positions              | What moved overnight, why, what's scheduled today, and where sentiment sits                                               | Market Board, Economic Calendar, Surprise Index, Watchlist    |
| **The Curious Professional**      | Wants to be conversant about the economy without reading the FT cover to cover   | A trustworthy 4-minute daily read in plain English                                                                        | Story of the Day, AI Analyst summary, Economic Weather        |
| **The Interviewer's Mirror**      | The user on the morning of an assessment centre                                  | A structured, rehearsable account of the last 30 days of macro                                                            | Time Machine, Month-in-Review, Interview Prep Mode flashcards |

A day in the life: at 07:15, Padraig opens STIRLING on his phone. The Economic Weather gauge reads “Overcast — risk-off”. The Story of the Day explains that US CPI printed hot after yesterday's close, gilt yields have followed Treasuries higher overnight, and sterling is softer into this morning's UK labour market release at 07:00, which has just surprised to the downside. Three tappable chips define “core CPI”, “gilt” and “labour market slack” inline. He taps “Produce Daily Report”, skims the AI analyst's six-paragraph briefing, and walks into his 9am seminar able to explain — unprompted — why the front end of the UK curve rallied this morning. Total elapsed time: six minutes.

# 4. Feature Specification

Features are grouped into the Core Experience (the daily loop), Analytical Instruments (the depth layer), Intelligence (AI and narrative), and Growth & Learning (the student layer). Each feature below specifies its purpose, behaviour and data dependencies.

## 4.1 The Daily Briefing Engine — “Produce Daily Report”

The signature interaction. A single prominent button assembles the entire day into a structured briefing: headline summary, market table with day/week/month changes, notable movers, macro releases versus consensus, central bank developments, and the AI analyst's narrative. The report renders as a beautifully typeset page within the app and exports to PDF (via the browser print stylesheet) and to a shareable image card (Section 4.12).

Mechanically, the button is honest theatre: a Vercel cron job has already snapshotted the day's data at 22:05 UK time and cached the AI narrative, so the “generation” is instant for every user and costs nothing per click. Before the evening snapshot exists, the button produces an intraday edition clearly labelled “As of 14:32 — markets open”. Each generated report is immutable once the day closes and becomes part of the permanent archive.

## 4.2 Story of the Day — the narrative engine

The centrepiece of the dashboard is not a chart but a headline. A deterministic rules engine ranks the day's candidate stories by a salience score — the product of a move's size in standard deviations (measured against its trailing 90-day volatility), the asset class's systemic weight, and calendar significance (a CPI day beats a quiet Tuesday). The top-ranked story becomes the day's headline and organising theme; the second and third become sub-plots. This ranking is fully deterministic and transparent — the AI layer writes prose around it but never decides what mattered. That separation keeps the product trustworthy: the editorial judgement is auditable code.

Example output hierarchy: “Sterling's worst day since March as BoE splits 5–4” (headline) → “Oil extends slide on OPEC+ quota chatter” (sub-plot) → “Quiet session in equities masks rotation into defensives” (sub-plot).

## 4.3 The AI Analyst

A “Generate AI Briefing” action produces a written analysis in the register of a sell-side morning note: what happened, why it likely happened, what it means, and what to watch tomorrow. The AI receives a compact, structured JSON context — the day's snapshot, the salience ranking, the surprise index, and the trailing five days of headlines for continuity — and is prompted to write with attributed uncertainty (“the move is consistent with…”, never false certainty). Three tone presets serve the three audiences: Desk Note (professional), Plain English (no jargon), and Study Mode (each paragraph ends with the concept a student should look up).

The economics of this feature are the key unlock and are detailed in Section 6: one generation per day, produced by the cron job and cached, means the marginal cost per reader is zero and the free-tier quota is never approached.

## 4.4 The Time Machine — calendar replay

A full-screen calendar heat-mapped by each day's Economic Weather (Section 4.9). Clicking any past date reconstructs the entire dashboard exactly as it stood that evening: same numbers, same story, same AI briefing. A “Play Week” control animates through five consecutive days at two seconds per day, letting the user watch a narrative arc unfold — the week a hiking cycle ended, the week a bank failed. Two auto-generated compilations, Week in Review and Month in Review, stitch archived days into a single retrospective narrative, which is precisely the artefact needed the night before an interview.

Storage is trivial: one JSON snapshot per day of roughly 40–60 KB. A decade of daily archives fits inside 250 MB — comfortably within every free storage tier considered in Section 7.

## 4.5 The Market Board

The quantitative heart of the dashboard: a bento grid of live tiles covering equity indices (FTSE 100, S&P 500, Nasdaq, Euro Stoxx 50, Nikkei), rates (UK 2y/10y gilts, US 2y/10y Treasuries, Bund 10y), FX majors (GBP/USD, EUR/USD, USD/JPY, and DXY), commodities (Brent, WTI, gold, copper), and crypto (BTC, ETH) as a sentiment barometer. Every entry shows level, day change, a 30-day sparkline, and an ink weight proportional to the move's z-score — routine moves print light, genuinely unusual moves print heavy and gain a marginal annotation, the way an editor circles the number that matters. Entries expand on click into a full chart with 1M/6M/1Y/5Y ranges and event annotations drawn from the archive.

## 4.6 The Yield Curve Observatory

A dedicated instrument for the single most-watched recession signal in markets. It renders today's UK gilt and US Treasury curves against their shapes one month and one year ago, with a ghost-trail animation showing the curve's evolution. A persistent 2s10s spread tracker flags inversion and, when inverted, displays days-inverted alongside the historical record of inversions preceding recessions. This feature alone is an interview conversation piece: it demonstrates that the builder understands why the curve matters, not just how to plot it.

## 4.7 Economic Calendar and the Surprise Index

A forward calendar of scheduled releases (CPI, GDP, labour market data, PMIs, rate decisions) for the UK, US and euro area, each tagged with prior value, consensus expectation where freely available, and — once released — the actual print. Each release is scored: (actual − consensus), normalised by the release's historical surprise volatility. These scores aggregate into a rolling Economic Surprise Index for each economy, plotted as a 90-day line — an elegant, professional-grade summary of whether data has been beating or missing expectations, and a genuine input to how markets are trading.

## 4.8 Central Bank Watch

A panel tracking the Bank of England, Federal Reserve and ECB: current policy rate, date of the next decision with a live countdown, the market-implied path where derivable from freely available data, and a timeline of recent decisions and vote splits. On decision days, the panel moves to the top of the dashboard automatically and the Story of the Day engine weights it maximally. A “decision day mode” shows expected versus announced side by side the moment the release lands.

## 4.9 The Economic Weather System

The signature piece of visual identity and the fastest possible read of the day. A composite regime gauge blends equity momentum, volatility level and trend, curve slope, credit proxies, the surprise indices and safe-haven flows into one of five weather states. Each state is expressed through the Daily Medallion — a banknote-style guilloché rosette whose engraved geometry is re-generated every day from the day's data (volatility sets the line density, regime sets the ink) — and through a subtle shift in the paper and rules of the whole edition:

| **State**    | **Meaning**                                | **Ambient signal**                                           |
|--------------|--------------------------------------------|--------------------------------------------------------------|
| **Clear**    | Risk-on; data beating; vol suppressed      | Paper prints cool and bright; green ink dominates the ledger |
| **Fair**     | Constructive but mixed                     | Neutral paper; balanced ink                                  |
| **Overcast** | Caution; deteriorating breadth or data     | Paper warms a degree; rules thicken slightly                 |
| **Storm**    | Risk-off; vol elevated; correlated selling | Seal-red ink spreads; the medallion's engraving tightens     |
| **Fog**      | Directionless; pre-event positioning       | Ink lightens; the medallion blurs to a fine moiré            |

The weather metaphor does serious work: it gives non-experts an instant read, gives the Time Machine calendar its heat-map colouring, and gives the whole product a memorable identity. The methodology page discloses the exact formula — auditability is part of the brand.

## 4.10 Learn Mode — the ambient tutor

A global toggle that layers education onto the interface without changing it. Every technical term becomes a hoverable chip with a two-sentence definition written for intelligent beginners. Every panel gains a small “Why this matters” affordance explaining the economic mechanism (why does an inverted curve precede recessions? why does hot CPI lift yields?). A daily “Concept of the Day” ties a definition to today's actual data — teaching duration on the day the long end sells off. Definitions the user opens are tracked locally, building a personal glossary of every concept they have ever looked up.

## 4.11 Interview Prep Mode

The feature that converts daily reading into internship offers. It generates, on demand: a “Talk me through markets today” model answer built from the current briefing in the STAR-adjacent structure interviewers expect; a Last 30 Days one-pager summarising the month's narrative arc, key prints and central bank actions; and a flashcard drill built from the archive (“UK CPI came in at X on the 18th — what was the gilt reaction?”). A mock-question generator uses the AI layer to produce desk-style questions from real recent data. No other free product does this, because no other free product has the archive to do it with.

## 4.12 Shareable Briefing Cards

Every daily report exports as a designed 1200×630 social card — racing-green ground, the brass medallion, the headline in cream serif, three key numbers and the edition numeral — generated server-side with Vercel's free OG-image rendering. This is the growth loop (cards circulate in student group chats and LinkedIn) and the portfolio loop: each card is a daily, public, dated proof of the product's quality.

## 4.13 Watchlist and Personalisation

Users can pin any instrument or release series to a personal watchlist rendered above the fold, reorder dashboard panels, and set their home economy (defaulting UK) which determines which curve, calendar and central bank lead the page. Preferences persist in localStorage — deliberately, since it requires no accounts, no database of personal data, and no GDPR surface for a free product.

## 4.14 This Day in Economic History

A quiet daily delight: on each date, a one-line vignette of a significant economic event that occurred on this day (Black Wednesday on 16 September; the Lehman filing on 15 September), drawn from a small curated dataset shipped with the app and linked, where the archive extends back far enough, to STIRLING's own briefing from that day. It rewards daily visits and signals editorial care.

# 5. Data Architecture — Everything Free, Everything Cited

The entire data layer is assembled from institutional-grade public APIs and generous free tiers. The design rule is defence in depth: every panel has a primary source and a fallback, and the daily snapshot architecture (Section 7) means a source being briefly unavailable degrades one refresh, never the archive.

| **Domain**                        | **Primary source**                                                          | **Free-tier terms**                 | **Notes / fallback**                                                                                                   |
|-----------------------------------|-----------------------------------------------------------------------------|-------------------------------------|------------------------------------------------------------------------------------------------------------------------|
| **US & global macro series**      | FRED (St. Louis Fed) API                                                    | Free key; 120 requests/min          | The gold standard; 800k+ series incl. Treasury yields, CPI, payrolls                                                   |
| **UK official statistics**        | ONS API + Bank of England IADB                                              | Free, no key                        | UK CPI, GDP, labour market; BoE for Bank Rate & gilt yields                                                            |
| **Euro area**                     | ECB Data Portal API                                                         | Free, no key                        | Policy rates, HICP, Bund yields                                                                                        |
| **Equity indices & single names** | Finnhub / Twelve Data                                                       | 60 calls/min free / 800 credits/day | Stooq CSV endpoints as keyless fallback for index closes                                                               |
| **Foreign exchange**              | Frankfurter.app                                                             | Free, no key, no limit stated       | ECB reference rates; ideal for daily closes                                                                            |
| **Commodities**                   | FRED (Brent/WTI/gold series) + Stooq                                        | Free                                | Daily granularity is sufficient by design                                                                              |
| **Crypto**                        | CoinGecko public API                                                        | ~30 calls/min free                  | BTC/ETH as sentiment barometer only                                                                                    |
| **Economic calendar**             | Curated static schedule + official release calendars (ONS, BLS, ECB)        | Free                                | Release dates are published months ahead; consensus figures entered via a lightweight admin note or omitted gracefully |
| **News headlines**                | Official RSS feeds (BoE, Fed, ECB press releases; Reuters/BBC business RSS) | Free                                | Headlines only, linked out — no scraping, no copyright risk                                                            |

> **Design decision: daily, not real-time**
>
> STIRLING deliberately trades tick-level data for daily-close truth. This is not a limitation being spun — it is the product. Real-time feeds are what make market data expensive; daily closes are free, stable, and exactly the granularity at which economic narrative exists. The one concession is a light intraday refresh (every 30 minutes during market hours) for the headline tiles, comfortably inside every quota above.

Attribution is rendered in the footer of every panel (“Source: FRED, Bank of England, ECB”) — partly because licences ask for it, mostly because visible sourcing is what separates a credible analytical product from a widget.

# 6. The AI Layer on a £0 Budget

The apparent contradiction — an AI-powered product with no budget — dissolves once the usage pattern is examined. STIRLING does not need an AI call per user; it needs an AI call per day. The economy has one story per day, and every reader receives the same professionally cached copy.

## 6.1 The generate-once, read-many architecture

At 22:05 UK time, a Vercel cron job assembles the day's structured context (snapshot JSON, salience ranking, surprise scores, five-day headline trail) and makes a single call per tone preset to the model API — three calls per day. The responses are stored in the daily snapshot. When any user clicks “Generate AI Briefing”, they receive the cached narrative instantly with a brief typing animation for perceived liveness. Interactive features that genuinely require a fresh call (the Interview Prep question generator, an optional “ask a follow-up” box) are rate-limited per browser via localStorage tokens and a serverless proxy that enforces a global daily budget.

## 6.2 Provider strategy

| **Provider**                  | **Free tier (indicative)**                            | **Role in STIRLING**                                                                                                                                                             |
|-------------------------------|-------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Google Gemini (Flash)**     | Generous daily request allowance on the free API tier | Primary: daily briefings and interview questions                                                                                                                                 |
| **Groq (open-weight models)** | Free tier with per-day request limits                 | Fallback provider; also powers low-stakes features like flashcard phrasing                                                                                                       |
| **Client-side templates**     | Free forever                                          | Final fallback: if all AI quota is exhausted, the deterministic narrative engine still produces a structured, readable briefing from templates — the product never shows a blank |

Daily consumption at three cached generations plus a defensive ceiling of fifty interactive calls sits at well under 1% of current free-tier allowances. Even if every quota halved, the architecture survives untouched. The API key lives in a Vercel environment variable and is only ever exercised server-side — it is never exposed to the browser.

## 6.3 Prompt design principles

The system prompt enforces the analyst register: attribute causality with appropriate hedging, never fabricate a number not present in the context JSON, always end with “what to watch tomorrow”, and match the requested tone preset. Because the context is a compact structured document rather than raw scraped text, hallucination surface is minimal and outputs are consistent enough to typeset confidently. Every AI-written passage in the UI carries a small “AI-generated · sources below” badge — honesty as a design feature.

# 7. Technical Architecture and Vercel Deployment

## 7.1 Stack

| **Layer**               | **Technology**                                                                                                     | **Why**                                                                                                          |
|-------------------------|--------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------|
| **Framework**           | Next.js 14+ (App Router, TypeScript)                                                                               | First-class Vercel deployment; server components keep API keys server-side; ISR gives free-tier-friendly caching |
| **Visualisation**       | D3.js for bespoke instruments (curve, weather gauge); Recharts for standard series                                 | D3 where the design must be distinctive; Recharts where speed of build matters                                   |
| **Styling**             | Tailwind CSS + CSS custom properties for the ambient weather theming                                               | Design-token-driven; the weather tint is a handful of CSS variables                                              |
| **State**               | React server components + a thin Zustand store; localStorage for preferences                                       | No accounts, no personal data, no GDPR surface                                                                   |
| **Snapshots & archive** | Vercel Blob or Upstash Redis (both free tier); snapshots also mirrored as JSON to a public GitHub repo via Actions | Triple redundancy for ~50 KB/day; the GitHub mirror doubles as an open dataset — itself a portfolio asset        |
| **Automation**          | Vercel Cron (Hobby tier permits daily jobs) + GitHub Actions for the mirror and any heavier scheduled computation  | GitHub Actions' free minutes are effectively a free compute tier                                                 |
| **AI proxy**            | Next.js route handler with global daily budget + per-client token bucket                                           | Keys hidden; abuse bounded                                                                                       |
| **OG cards**            | @vercel/og (Satori) edge rendering                                                                                 | Free, fast, designed once in JSX                                                                                 |

## 7.2 The daily lifecycle

07:00–21:30 (UK): light intraday mode — headline tiles refresh via ISR every 30 minutes; the dashboard is marked “live edition”. 22:05: the snapshot cron runs — fetch all sources, compute z-scores, surprise index, weather state and salience ranking, call the AI layer, write the immutable daily snapshot to storage and the GitHub mirror. 22:10: the day's OG card is rendered and cached. From then on, that date is permanently replayable in the Time Machine. A second lightweight cron at 06:45 pre-warms the morning edition with overnight Asia closes so the 7am reader never sees stale tiles.

## 7.3 Free-tier capacity audit

Vercel Hobby provides 100 GB bandwidth and 100 GB-hours of function execution monthly. A fully cached, snapshot-driven site at even 1,000 daily readers consumes single-digit percentages of both, because nearly every request is served from the edge cache — the expensive work happens exactly twice a day in cron. Storage grows at under 20 MB per year. The binding constraint is not any quota; it is discipline in keeping the request pattern cache-first, which the architecture enforces by construction.

## 7.4 Reliability and graceful degradation

Every panel implements a three-state contract: live data, cached data with a “last updated” stamp, or an honest empty state with the reason. Source failures never cascade — the snapshot writer records per-source status, and the Story engine simply excludes silent sources from that day's ranking. The permanent archive means the worst possible failure mode is a missing intraday refresh, never a missing day.

# 8. Design System and Style Guide — “Racing Ink”

The design language is named Racing Ink. Its anchor is British racing green — the most institutional colour in British visual culture, carrying racing heritage, engineering craft and old-money credibility in a single hue — set against a warm ivory ground with brass detailing. The register is heritage-modern, and its detailing vocabulary is drawn specifically from British GT and endurance racing design: coachlines, door roundels, bonnet stripes, the finish-line chequer — the material world of enamel badges and racing liveries, executed as a clean contemporary product interface. It is emphatically light: the page reads as ivory with green authority, never as a dark or heavy surface.

Two prior directions were considered and deliberately retired. The default dark-terminal aesthetic signals template rather than craft in the AI era; a full broadsheet treatment proved charming but costume-like. Racing Ink keeps the strongest ideas of both — editorial hierarchy, the generative medallion, ledger ink discipline — inside a modern card-based interface that would sit comfortably in a professional design portfolio.

## 8.1 Design principles

- Ivory ground, green authority. The page is warm and light. Racing green appears as ink and as exactly one saturated surface per view — a single deep-green feature panel that gives the page its drama, the way one racing car reads against gravel.

- The ledger convention, refined. Positive figures in emerald, negative in a burnt vermilion — warm rather than alarming — always doubled with ▲/▼ glyphs so colour is never the sole channel.

- One serif moment. The display serif is reserved for the day's headline and section titles; everything else is set in a contemporary grotesk. This single editorial gesture carries the brand without tipping into newsprint.

- Brass is the jewellery. The metallic accent appears only in fine details — the medallion's line-work, the edition numeral, active states. Small, precise, expensive.

- Modern surfaces, quiet depth. Cards with 14px radii, hairline borders and one soft ambient shadow level. No glows, no gradients-as-decoration, no glassmorphism.

- Emphasis is weight, not colour. Unusual moves set heavier type and heavier sparkline strokes and gain a short annotation; the palette stays disciplined even on violent days.

## 8.2 Colour palette

A light, warm system built outward from British racing green. Chromatic colour is scarce and always means something.

| **Token**                     | **Hex**  | **Role**                                                                                              |
|-------------------------------|----------|-------------------------------------------------------------------------------------------------------|
| **ivory-0 (Ground)**          | \#F6F4EC | Page background — warm ivory, unmistakably light                                                      |
| **ivory-1 (Card)**            | \#FCFBF6 | Card and panel surfaces                                                                               |
| **sage-1 (Well)**             | \#ECEFE4 | Recessed wells: tables, input fields, the archive strip                                               |
| **racing-900 (Racing Green)** | \#0C3B2A | The brand: the feature panel, primary buttons, chart emphasis, the wordmark                           |
| **racing-600**                | \#1E5C43 | Hover states, secondary green accents, links                                                          |
| **ink-900**                   | \#17251E | Body text and figures — a green-cast near-black, softer than pure black on ivory                      |
| **ink-500 (Muted)**           | \#66716A | Captions, labels, axes                                                                                |
| **line-200**                  | \#DFE0D3 | Hairline borders, dividers, chart grids                                                               |
| **brass**                     | \#A9853F | Fine detail only: medallion line-work, edition numeral, selected states. Never large areas            |
| **rise (Emerald)**            | \#177A4E | Positive change                                                                                       |
| **fall (Vermilion)**          | \#BC4B32 | Negative change and alerts — burnt and warm, distinguishable from rise under colour-vision deficiency |
| **cream (On-green)**          | \#F2EFDF | Text and line-work set on the racing-green panel                                                      |

Contrast: ink-900 on ivory-0 exceeds WCAG AAA; cream on racing-900 exceeds AAA; rise and fall meet AA at data sizes on all light surfaces. The rise/fall pairing is emerald against burnt orange-red, legible under deuteranopia, and every directional cue carries a glyph regardless. The deep green is confined to one feature surface per view precisely so the interface never reads as dark.

## 8.3 Typography

| **Role**      | **Typeface (free via Google Fonts)**                                | **Usage rules**                                                                                                                                            |
|---------------|---------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Display**   | Fraunces (variable, high optical size)                              | The daily headline, section titles and the wordmark only. Weight 520–600; italic for editorial emphasis inside headlines                                   |
| **Text & UI** | Archivo                                                             | Everything else: body, standfirsts, labels, buttons, navigation. 15–16px body at 1.6; labels uppercase at +10% tracking                                    |
| **Data**      | Archivo with tabular lining figures; Archivo Narrow in dense tables | Every figure aligns to the decimal; precision rules per class (indices 1dp, FX 4dp, yields in bp). Hero numerals on the green panel may be set in Fraunces |

No monospace anywhere — tabular figures provide terminal-grade alignment without the hacker register. Type scale runs a 1.25 ratio from 16px (16 / 20 / 25 / 31 / 39 / 49 / 61); the daily headline may reach 56–64px on desktop. Fraunces never sets running data; Archivo never sets the headline.

## 8.4 Grid, surfaces and spacing

A 12-column grid, 1200px max measure, 24px gutters, on an 8px spacing scale. Surfaces are modern cards: ivory-1 fill, 14px radius, 1px line-200 border, and a single soft shadow (0 1px 2px at 4% plus 0 8px 24px at 5%) used consistently — one elevation level for the entire product. The racing-green feature panel shares the same geometry, which keeps it feeling like a member of the system rather than a poster. Vertical rhythm is generous at the top (the lead breathes) and tightens through the data sections; the page never exceeds two card densities.

## 8.5 Component library

| **Component**                    | **Specification**                                                                                                                                                                                                                                                                                                              |
|----------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Header Bar                       | Left: STIRLING wordmark in Fraunces with a brass full stop; centre: navigation (Today · Archive · Curve · Diary · Learn) in Archivo caps; right: date, the weather chip, and the primary button. A single hairline beneath; the bar is ivory, not green — green is spent below                                                 |
| Weather Chip                     | A pill containing the 20px micro-medallion and the state word. The medallion is the generative guilloché mark retained from the previous system, now drawn in brass-on-green: petal count driven by realised volatility, a vermilion thread woven in on Storm days                                                             |
| Primary Button                   | 'Issue today's report' — racing-900 fill, cream text, 10px radius, sentence case. Hover deepens to racing-600 shadowless press. The one filled green control per view                                                                                                                                                          |
| The Green Panel (Today's Ledger) | The signature surface: the day's highest-salience instruments on racing-900, set in cream — instrument label, level in tabular figures, change with glyph, cream sparkline whose stroke weight scales with \|z\|. An unusual move gains a brass annotation ('worst day since 12 Mar'). One green panel per view, no exceptions |
| Stat Row                         | The markets strip: instrument, level, change chip (soft emerald or vermilion tint at 10% with matching text), 30-day sparkline in ink. Chips are pills; glyphs always present                                                                                                                                                  |
| Status Pill                      | BEAT / MISS / DUE on diary rows: tinted pills (emerald, vermilion, neutral outline) in 10px caps — modern and quiet, replacing the previous rubber-stamp treatment                                                                                                                                                             |
| Archive Strip (Time Machine)     | The last thirty sessions as 40px rounded tiles tinted by weather state, each carrying its date and a 16px micro-medallion; today ringed in brass. Hover lifts 2px and reveals the day's headline; click replays the edition under a slim green 'Replay' banner                                                                 |
| Learn Chip                       | Terms carry a fine dotted brass underline; the popover is an ivory-1 card: Fraunces term, Archivo definition, 'why it matters today' line, add-to-glossary action                                                                                                                                                              |
| Empty/Stale States               | Muted ink on sage-1 with the honest reason: 'BoE IADB unreachable — showing yesterday 16:30 close'                                                                                                                                                                                                                             |

## 8.6 Motion

Calm and singular: chart lines draw in once on first view (400–600ms ease-out); the report panel slides up with a soft settle; the archive strip's Play Week advances tiles with a 120ms stagger; buttons compress 1px on press. Micro-interactions run 150–250ms. Nothing loops, nothing pulses, numbers never scroll — an updated figure re-inks once with a brief brass underline. All motion respects prefers-reduced-motion.

## 8.7 Data visualisation rules

Charts are ink-on-ivory: no chart backgrounds, axes and grids in line-200 hairlines, no legends where direct labelling fits. Today's series prints heaviest in racing green; comparison series (one month, one year ago) print lighter, dashed, in muted ink. Area fills use a 6% green tint or fine diagonal hatching — never saturated washes. Event annotations use a fine leader line to an 11px caption. Baselines are honest: percentage-change charts anchor at zero; truncated level axes show the break. Every chart carries source and timestamp in the bottom margin. If a mark does not change what the reader understands, it is removed.

## 8.8 Livery details — the British GT influence

A small, strictly rationed vocabulary of decorative elements borrowed from GT and endurance racing livery. These are defined here as a palette of available details with rules of character, scale and frequency — their exact placements are deliberately left open, to be decided during the build against real content and refined by eye. The governing constraints: each element appears at most once per surface, none may sit behind or compete with figures, and the whole set is jewellery, not wallpaper.

| **Element**             | **Racing source**                                   | **Character & usage rules**                                                                                                                                                                                             |
|-------------------------|-----------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Coachline**           | The hand-painted twin pinstripe of coach-built cars | A twin brass hairline, short (≤40px) as a title accent or full-width as a structural rule paired with racing green. The most repeatable micro-signature in the set                                                      |
| **Door roundel**        | The circular racing number on a GT car's door       | The edition number set in a green-ringed circle — the daily 'race number'. One per view, wherever the edition identity is most useful; naturally doubles as the permalink control                                       |
| **Bonnet stripes**      | Le Mans-style twin stripes of unequal width         | Two parallel stripes, translucent (≤15% opacity) on saturated surfaces or in tint on ivory. Best on a large quiet surface with room to run — placement to be found in build; if no surface earns them, they are omitted |
| **Finish-line chequer** | The chequered flag                                  | A fine chequer strip at ≤16% opacity, plus the flag glyph on controls. The chequer strictly means 'complete' — end of a report, end of a replay — and appears nowhere else                                              |
| **Guilloché medallion** | Enamel badge / engraved crest                       | Brass-on-green generative rosette: petal count driven by realised volatility, a vermilion thread on Storm days. The identity mark — weather chip, report seal, archive tiles, favicon                                   |
| **Dot-grid watermark**  | Perforated race-plaque texture                      | A faint brass dot-field at ≤14% opacity, always cropped by a panel edge, at most one per view                                                                                                                           |

Distribution of green across the page follows a bookend rhythm: a green structural line near the top of the viewport, one saturated feature panel in the hero, green chart emphasis and the primary button through the middle sections, and a green band closing the page. The ground between these moments stays ivory, which is what keeps the page light while letting the brand colour structure the reader's descent.

## 8.9 What this identity buys

Racing green is instantly legible to a British finance audience as heritage, discipline and quality — and almost entirely absent from the data-product landscape, which oscillates between dark terminals and blue SaaS. A light, green-anchored interface with one generative brass medallion is distinctive at a glance, defensible in one sentence, and cheap to execute well: the system is one saturated surface, two text inks, and restraint.

# 9. Page Anatomy

## 9.1 Today (home)

Top — the coachline (3px green + 1px brass) across the viewport, then the Header Bar with navigation, weather chip and the primary button. Lead — a two-part hero: left, the Story of the Day on an ivory card carrying the edition roundel in its corner (kicker, Fraunces headline, standfirst, two ruled sub-plots); right, the racing-green Today’s Ledger panel with the four highest-salience instruments in cream. Strip — the Stat Row of the remaining lead instruments. Middle — two cards side by side: the Yield Curve Observatory (green emphasis line, dashed comparators, annotated spread readout) and Central Bank Watch (three banks, rates, countdowns). Lower — the Economic Diary table with status pills and the surprise index, beside This Day in Economic History and the Concept of the Day as compact cards. Base — the Archive Strip of thirty weather-tinted tiles with the flag-marked Play Week control, closed by the racing-green footer band: sources, methodology, snapshot timestamp and the edition numeral in brass.

## 9.2 The Daily Report

Issuing the report opens an elevated sheet: a racing-green header band carrying the brass medallion, the date and edition numeral, and the headline in cream Fraunces; below, on ivory, the AI briefing with key numbers pulled into a tinted stat bar, the market table with a fine double rule closing it, releases versus consensus with pills, 'What to watch tomorrow' as a numbered list, and the finish-line chequer closing the sheet. Export actions: print-perfect PDF, the OG card, copy link.

## 9.3 The Archive (Time Machine)

The full view is a calendar of weather-tinted tiles by month, each with its micro-medallion; Play Week advances a highlighted window across five tiles. Selecting a date replays that edition beneath a slim racing-green banner — 'Replay · 14 April 2026' — so past can never be mistaken for present. Week-in-Review and Month-in-Review generate from this view as long-form report sheets.

## 9.4 Interview Prep Mode

A focused view on plain ivory: the model answer set as an annotated document — every sentence carries a marginal note linking it to the exact data point it derives from — with flashcards as a compact deck on the right and the Last 30 Days one-pager as a downloadable sheet. The traceability conceit is the demo moment: it shows an interviewer that the AI's every claim maps to a number, which is precisely how a risk function wants to think about language models.

# 10. Cost Audit — Proving £0.00

| **Line item**                                                            | **Provider & tier**                        | **Monthly cost**                                                           |
|--------------------------------------------------------------------------|--------------------------------------------|----------------------------------------------------------------------------|
| **Hosting, CDN, serverless, cron**                                       | Vercel Hobby                               | £0                                                                         |
| **Macro & rates data**                                                   | FRED / ONS / BoE / ECB APIs                | £0                                                                         |
| **Market data**                                                          | Finnhub + Twelve Data + Stooq free tiers   | £0                                                                         |
| **FX & crypto**                                                          | Frankfurter / CoinGecko                    | £0                                                                         |
| **AI briefings (3 cached generations/day + bounded interactive budget)** | Gemini free tier, Groq fallback            | £0                                                                         |
| **Snapshot storage & archive mirror**                                    | Vercel Blob free tier + public GitHub repo | £0                                                                         |
| **Scheduled compute**                                                    | Vercel Cron + GitHub Actions free minutes  | £0                                                                         |
| **Fonts (Fraunces, Archivo), icons, OG rendering**                       | Google Fonts, Lucide, @vercel/og           | £0                                                                         |
| **Domain (optional)**                                                    | stirling-terminal.vercel.app subdomain     | £0 (a custom .com is the only conceivable spend, ~£10/yr, and is optional) |
| **Total**                                                                | —                                          | £0.00                                                                      |

The audit's honest caveat: free tiers are contractual courtesies, not rights. The mitigation is architectural — the cache-first, generate-once pattern means STIRLING consumes so little of each quota that even a 90% reduction in any single tier's allowance would not force a redesign, and every provider has a named substitute.

# 11. Build Roadmap

| **Phase**                            | **Scope**                                                                                                                                          | **Definition of done**                                                                                                      |
|--------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------|
| **1 · The Front Page (weeks 1–2)**   | Next.js scaffold, Racing Ink design tokens, header + hero + green ledger panel + stat row from live APIs, generative medallion, deployed to Vercel | The page is live at a public URL and is visually unmistakable for a template                                                |
| **2 · The Snapshot (weeks 3–4)**     | Cron pipeline, immutable numbered editions, storage + GitHub mirror, z-scores and salience engine                                                  | Every day is being archived automatically; Story of the Day headline generates deterministically; edition numbers increment |
| **3 · The Analyst (weeks 5–6)**      | AI proxy, three tone presets, cached daily briefing, report sheet with print stylesheet                                                            | The Issue button produces a complete, beautiful report; AI spend is provably ~3 calls/day                                   |
| **4 · The Archive (weeks 7–8)**      | Time Machine replay, weather system, Play Week, OG cards with the daily medallion                                                                  | Any archived date fully reconstructs under the replay banner; cards share correctly on social platforms                     |
| **5 · The Instruments (weeks 9–10)** | Yield Curve Observatory, Surprise Index, Central Bank Watch, diary                                                                                 | Curve card with comparators live; decision-day mode tested against a real MPC date                                          |
| **6 · The Tutor (weeks 11–12)**      | Learn Mode chips, glossary, Interview Prep Mode, Month in Review                                                                                   | A complete interview-morning workflow exists end to end                                                                     |

The sequencing is deliberate: the archive starts accumulating in week 3, so by the time internship interviews arrive, STIRLING arrives with months of its own history — the moat no weekend clone can replicate.

# 12. STIRLING as a Portfolio Piece

For a second-year economics and finance student targeting internships, STIRLING is unusually well-shaped evidence. It demonstrates market knowledge (the choice of instruments, the curve, the surprise index — these choices are the CV line), technical initiative (a deployed, automated, production system, not a notebook), product judgement (free-tier engineering is resourcefulness made visible), design literacy (a named identity system with a rationale), and communication (the daily briefing is literally a writing sample generated by a system you designed).

Concrete usage: the CV line reads “Designed and shipped STIRLING, an automated daily economic briefing terminal (Next.js, D3, LLM pipeline) with N months of archived daily market narratives — stirling-terminal.vercel.app”. In interviews it converts three standard questions into home fixtures: “talk me through markets” (you read your own product this morning), “tell me about a project” (this document is the answer), and “how do you think about AI” (the generate-once architecture and the traceable-sentence design are genuinely thoughtful answers). The GitHub data mirror gives a second artefact: an open dataset of daily economic snapshots that quant-leaning interviewers will notice.

> **The compounding asset**
>
> Most student projects are finished and then decay. STIRLING inverts this: it improves autonomously every single day it is deployed, because its archive — the thing none of the free alternatives have — only grows. Ship it in month one of second year, and by spring-week interviews it has hundreds of days of history.

# 13. Risks, Limitations and Mitigations

| **Risk**                                                         | **Assessment**                                             | **Mitigation**                                                                                                                                          |
|------------------------------------------------------------------|------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Free tier withdrawal or shrinkage**                            | Likely for at least one provider over a multi-year horizon | Per-domain fallbacks; cache-first usage at \<1% of quotas; snapshot architecture isolates history from any provider                                     |
| **Consensus/forecast data is the one genuinely paywalled input** | True — expectations data is commercial                     | Ship without it gracefully (prior vs actual still yields surprise direction); allow manual entry for the handful of releases that matter; clearly label |
| **AI hallucination in briefings**                                | Bounded but non-zero                                       | Structured-context-only prompting; numbers rendered from data, never from prose; visible AI badge; deterministic template fallback                      |
| **Being mistaken for financial advice**                          | Reputational/regulatory hygiene                            | Persistent 'informational only, not investment advice' footer; no recommendations, no buy/sell language anywhere in the prompt or UI                    |
| **Scope creep killing completion**                               | The classic student-project failure mode                   | The phase gates in Section 11; Phase 1 alone is already a portfolio-grade deliverable                                                                   |
| **Unofficial data endpoints changing**                           | Occasional                                                 | Official APIs primary everywhere; unofficial sources only ever as fallbacks; per-source health surfaced in the footer                                   |

# 14. Appendix — Signals Reference

The initial instrument and release set, chosen for narrative coverage rather than completeness. Every addition must earn its place by changing the story the front page can tell.

| **Class**          | **Instruments / series (launch set)**                                                                                                    |
|--------------------|------------------------------------------------------------------------------------------------------------------------------------------|
| Equities           | FTSE 100, S&P 500, Nasdaq Composite, Euro Stoxx 50, Nikkei 225                                                                           |
| Rates              | UK 2y & 10y gilt yields, US 2y & 10y Treasury yields, German 10y Bund, 2s10s spreads                                                     |
| FX                 | GBP/USD, EUR/USD, USD/JPY, EUR/GBP, DXY                                                                                                  |
| Commodities        | Brent, WTI, Gold, Copper                                                                                                                 |
| Crypto (sentiment) | BTC, ETH                                                                                                                                 |
| UK releases        | CPI & core CPI, GDP (monthly), labour market (unemployment, wage growth), retail sales, S&P Global PMIs, Bank Rate decisions & MPC votes |
| US releases        | CPI & core CPI, non-farm payrolls & unemployment, GDP, retail sales, ISM PMIs, FOMC decisions                                            |
| Euro area releases | HICP, GDP, unemployment, PMIs, ECB decisions                                                                                             |
| Derived signals    | Per-instrument 90-day z-scores, Economic Surprise Indices (UK/US/EA), Economic Weather composite, salience ranking                       |

*— End of specification. The next artefact is the deployed URL. —*
