# Stirling — Claude Code Kit

How to use this file:

1. `mkdir stirling && cd stirling && claude`
2. Copy **Part 1** below into a file called `CLAUDE.md` in the repo root *before your first prompt*. Claude Code reads it automatically at the start of every session — it's the project's constitution, and it's what keeps quality consistent across sessions.
3. Paste **Part 2** as your first prompt.
4. Use the Phase prompts in **Part 3** in later sessions.

---

## Part 1 — CLAUDE.md (place in repo root)

```markdown
# Stirling

A free, automated daily economic briefing terminal. Named after Stirling Moss
(homophone: sterling). It ingests daily market and macro data from free public
APIs, ranks what mattered, and issues one immutable, numbered daily "edition"
with an AI-written desk note. Primary user: a UK finance student building
daily market fluency. Everything must run at £0/month.

## Stack (do not deviate without asking)
- Next.js 14+ App Router, TypeScript strict, deployed on Vercel Hobby
- Tailwind CSS with the design tokens below wired into tailwind.config.ts
- Charts: lightweight inline SVG or D3 for bespoke pieces; no heavy chart libs
- State: React Server Components first; Zustand only if genuinely needed
- Preferences in localStorage only — no accounts, no user database, no cookies
- Package manager: npm

## Architecture: snapshot-first (the core rule)
- The product is driven by ONE immutable JSON snapshot per day, written by a
  cron route at 22:05 UK time to Vercel Blob, path `editions/YYYY-MM-DD.json`
- Page requests NEVER fan out to external APIs. Pages read the latest
  snapshot (plus a light intraday cache revalidated every 30 min for the
  header strip). External fetches happen in the cron route and in tagged
  fetch() calls with `next: { revalidate }` — nowhere else.
- Edition numbers increment from launch day and never change. Past editions
  are never rewritten.
- Every external source has a named fallback. A failed source degrades one
  panel with an honest "stale since <time>" note — never a crash, never a
  blank page.

## Data sources (all free — never add a paid or key-leaking source)
- FX: frankfurter.dev (no key). Crypto: CoinGecko public API (no key).
- Indices/commodities daily closes: Stooq CSV endpoints (no key), e.g.
  https://stooq.com/q/d/l/?s=^ftse&i=d — verify symbol per instrument.
- US macro + Treasury yields: FRED API (key in env FRED_API_KEY).
- UK: Bank of England IADB (no key) for Bank Rate + gilt yields; ONS API for
  CPI/labour market.
- ECB Data Portal API (no key) for euro area.
- If an endpoint's format surprises you, write a tiny probe script in
  /scripts, run it, and adapt — do not guess response shapes.

## AI layer (strict budget rules)
- Provider: Google Gemini Flash via GEMINI_API_KEY, server-side only.
- Generate-once, read-many: the cron route makes ≤3 calls/day (one per tone:
  Desk Note, Plain English, Study Mode) and stores results in the snapshot.
  User-facing "Generate briefing" reads the cache. NEVER call the AI per
  page view or per user.
- The prompt receives ONLY the structured snapshot JSON. The system prompt
  forbids inventing numbers, requires hedged causality ("consistent with"),
  and must end with "What to watch tomorrow".
- Fallback: a deterministic template briefing built from the snapshot, so
  the product never shows a blank if quota fails.

## Design system: "Racing Ink" (follow exactly)
Light, warm, British racing green. NEVER a dark page. NEVER monospace fonts.

Tokens:
- ivory-0 #F6F4EC (page bg) · ivory-1 #FCFBF6 (cards) · sage #ECEFE4 (wells)
- brg #0C3B2A (brand) · brg-600 #1E5C43 (hover/links)
- ink #17251E (text) · muted #66716A · line #DFE0D3
- brass #A9853F (fine detail only) · cream #F2EFDF (text on green)
- rise #177A4E (positive) · fall #BC4B32 (negative)

Type (Google Fonts via next/font):
- Fraunces: display only — the daily headline, card titles, wordmark
- Archivo: everything else; ALL numbers with font-variant-numeric:
  tabular-nums; Archivo Narrow for dense tables

Hard rules:
- Exactly ONE saturated green surface per view (the "Today's Ledger" hero
  panel). Everything else is ivory cards: 14px radius, 1px line border, one
  soft shadow level (0 1px 2px rgba(23,37,30,.04), 0 8px 24px rgba(23,37,30,.05)).
- Ledger convention: gains rise-green, losses fall-vermilion, ALWAYS with
  ▲/▼ glyphs. Precision: indices 1dp, FX 4dp, yields in bp deltas.
- Brass is jewellery: coachlines (twin 1px hairlines), the edition roundel,
  the medallion. Small and rare.
- Livery vocabulary (use sparingly, placement by judgement, ≤1 per surface):
  coachline, door roundel (edition number in a green ring), finish-line
  chequer (means "complete", nowhere else), guilloché medallion (generative
  SVG: nested rotated ellipses, petal count = f(volatility)), faint dot-grid
  watermark cropped by a panel edge.
- Motion: draw-in once, 150–600ms, nothing loops, respect
  prefers-reduced-motion.
- Charts: ink-on-ivory, hairline grids, today's series heaviest in brg,
  comparators lighter + dashed, direct labels over legends, source +
  timestamp in the margin, zero-anchored % charts.

## Conventions
- Files: kebab-case; components PascalCase in /components; data providers in
  /lib/sources with one file per source implementing a common interface
  { fetchDaily(): Promise<SeriesPoint[]> } plus a health field.
- Every provider gets a unit test with a recorded fixture (no live calls in
  tests). `npm test` must pass before any commit.
- Env vars: FRED_API_KEY, GEMINI_API_KEY, CRON_SECRET, BLOB_READ_WRITE_TOKEN.
  Cron route checks CRON_SECRET. Keys never reach the client bundle.
- Accessibility floor: visible focus states, AA contrast, glyphs alongside
  colour, semantic headings.
- Footer on every page: "Informational only — not investment advice" +
  source attribution. No buy/sell language anywhere, including AI prompts.
- After UI changes, run the dev server and check the page renders before
  declaring done. Prefer small commits with clear messages.
```

---

## Part 2 — Phase 1 kickoff prompt (paste as your first message)

```
Read CLAUDE.md fully before doing anything.

Build Phase 1 of Stirling: the live front page ("Today") with real data,
deployable to Vercel Hobby. Work in this order and show me the plan before
writing code:

1. Scaffold: create-next-app (TS, App Router, Tailwind, ESLint). Wire the
   Racing Ink tokens from CLAUDE.md into tailwind.config.ts as named colours,
   and set up Fraunces + Archivo with next/font.

2. Data layer: implement /lib/sources providers for (a) Frankfurter FX
   (GBP/USD, EUR/USD, USD/JPY, EUR/GBP), (b) CoinGecko (BTC, ETH),
   (c) Stooq daily closes for FTSE 100, S&P 500, Nasdaq, Brent, Gold,
   (d) Bank of England IADB for Bank Rate and 2y/10y gilt yields,
   (e) FRED for US 2y/10y Treasury yields (behind FRED_API_KEY; if the key
   is absent, the provider returns a stale-marked fixture so the app still
   runs). Write a probe script per source first, run it, and build the
   parser from the real response. Each provider: 30-day history, day change,
   and a computed z-score of today's move vs the trailing 30 days. Cache
   with next revalidate 1800.

3. UI, matching the Racing Ink spec exactly:
   - Header bar: green+brass coachline at top of viewport, Stirling wordmark
     (Fraunces, brass full stop), nav placeholder (Today · Archive · Curve ·
     Diary · Learn), date, weather chip (hardcode "Fair" for now with the
     generative medallion component), and a "Issue today's report" primary
     button (disabled state for Phase 1, tooltip "Phase 3").
   - Hero: left, the Story of the Day card with the edition roundel — for
     Phase 1 generate the headline deterministically: rank instruments by
     |z-score| and template a headline like "{Instrument} {moves} as
     {context}" from the top mover; kicker, standfirst from the top-2
     movers, and a meta row. Right: the single green "Today's Ledger" panel
     with the top-4 |z| instruments, cream sparklines whose stroke width
     scales with |z|, and the faint brass dot-grid watermark.
   - Stat row of the remaining instruments as cards with ink sparklines and
     rise/fall pills.
   - The gilt curve card: plot 2y and 10y as a simple two-point curve for
     now with the 2s10s readout (full curve comes in Phase 5).
   - Green footer band with sources and "Edition Nº 1" in brass.
   - Fully responsive to 375px; visible focus states; reduced-motion safe.

4. The Medallion component: generative SVG, props { petals, storm, size },
   petals derived from average |z| across the board. Export it — it becomes
   the favicon and OG card later.

5. Verification: run the dev server, confirm real data renders, run
   `npm run build` clean, and give me the exact Vercel deploy steps
   including which env vars to set.

Constraints to respect from CLAUDE.md: no per-request fan-out beyond the
revalidated fetches, no monospace, exactly one green surface, no dark mode.
If any data source turns out to be unreliable, tell me and propose the
fallback rather than silently switching.
```

---

## Part 3 — Later-phase prompts (one session each)

**Phase 2 — the Snapshot.** "Read CLAUDE.md. Build the snapshot pipeline: a
/api/cron/snapshot route (protected by CRON_SECRET) that gathers all
providers, computes z-scores, the salience ranking and a first-pass Economic
Weather state, and writes an immutable numbered edition JSON to Vercel Blob;
wire vercel.json cron for 22:05 UTC; make the Today page read the latest
edition and add a /api/editions/[date] reader. Add a GitHub Action that
mirrors each new edition JSON into the repo's /data folder nightly."

**Phase 3 — the Analyst.** "Read CLAUDE.md. Add the Gemini briefing to the
cron route (3 tone presets, cached into the edition), the deterministic
template fallback, and the report sheet UI behind the Issue button: green
header band, medallion seal, briefing text, stat bar, what-to-watch list,
finish-line chequer, print stylesheet."

**Phase 4 — the Archive.** "Read CLAUDE.md. Build the Archive strip and
full Archive page from stored editions, weather-tinted tiles with
micro-medallions, click-to-replay under a green Replay banner, Play Week,
and the @vercel/og card generator using the medallion + headline."

**Phase 5 — the Instruments.** Full gilt/Treasury curve card with monthly
comparators, Economic Diary with ONS/BLS release schedule and MISS/BEAT
pills, surprise index, Central Bank Watch with countdowns.

**Phase 6 — the Tutor.** Learn-mode chips + glossary (localStorage),
Interview Prep Mode (model answer with per-sentence data footnotes,
flashcards from the archive, Last-30-Days one-pager).

---

## Working tips

- **Start the cron early.** As soon as Phase 2 works, deploy — every day it
  runs is archive you can never recover later.
- One phase per session; start each session with "Read CLAUDE.md" and end
  with `npm run build` + a commit.
- When Claude Code probes an API, let it run the script and read real
  output — that's faster and more reliable than it guessing schemas.
- Keep a `NOTES.md` of quirks you discover (ONS date formats, Stooq
  symbols); tell Claude Code to read it alongside CLAUDE.md.
- Get your two keys first (FRED: fred.stlouisfed.org/docs/api → free key;
  Gemini: aistudio.google.com → free key) so Phase 1 runs end-to-end.
