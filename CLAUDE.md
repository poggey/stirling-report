```markdown
# Stirling

A free, automated daily economic briefing terminal. Named after Stirling Moss
(homophone: sterling). It ingests daily market and macro data from free public
APIs, ranks what mattered, and issues one immutable, numbered daily "edition"
with an AI-written desk note. Primary user: a UK finance student building
daily market fluency. Everything must run at £0/month.

## The white paper is the source of truth
The full product and design specification lives in WHITEPAPER.md in the repo
root. This CLAUDE.md is the condensed operating rules; the white paper is the
authority behind them. Consult WHITEPAPER.md before making any decision it
covers — feature behaviour and scope (Section 4), data sources and fallbacks
(Section 5), AI budget rules (Section 6), architecture (Section 7), the
Racing Ink design system and livery vocabulary (Section 8), page anatomy
(Section 9), and the phase gates (Section 11). Do not re-read the whole file
every session: read the specific section relevant to the current task. If
CLAUDE.md and WHITEPAPER.md ever conflict, say so and ask rather than picking
one silently. If a task requires a decision the white paper does not cover,
make the smallest reasonable choice, flag it in your summary, and suggest
whether WHITEPAPER.md should be updated to record it.

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