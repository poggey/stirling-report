import type { Briefings, Edition } from "@/lib/editions/types";
import { templateBriefing, WATCH_HEADING } from "./template";

/**
 * The AI layer (WHITEPAPER §6): generate-once, read-many. Exactly one call
 * per tone per day, made by the snapshot cron and cached in the edition.
 * The model sees ONLY the structured snapshot context — never raw text.
 */

const TONES = [
  {
    key: "deskNote" as const,
    instruction:
      "Tone: a sell-side desk morning note for professionals. Terse, precise, market vocabulary allowed.",
  },
  {
    key: "plainEnglish" as const,
    instruction:
      "Tone: plain English for an intelligent reader with no finance background. No jargon — where a term is unavoidable, gloss it in a clause.",
  },
  {
    key: "studyMode" as const,
    instruction:
      "Tone: study mode for a finance student. After each paragraph, add one line: 'Look up: <the concept this paragraph turns on>'.",
  },
];

const SYSTEM_RULES = `You are the analyst for Stirling, a daily economic briefing.
Write a briefing of exactly three short paragraphs, then a section headed "${WATCH_HEADING}" with three numbered items.
Hard rules:
- Use ONLY numbers present in the context JSON. Never invent, extrapolate or recall a figure from memory.
- The context may include a "wires" list of official news headlines. You may use them to EXPLAIN moves with hedged language ("consistent with reports that…") and must cite no event that is not in the wires. The wires never change which move matters — the salience ranking decides that.
- Attribute causality with hedged language ("consistent with", "likely reflects") — never false certainty.
- No investment advice, no buy/sell/hold language, no price targets.
- The watch items must derive only from instruments, readings and wires in the context.
- British English. No headings other than the watch heading, no bullet decoration beyond the numbered watch list.`;

const HEADLINE_INSTRUCTION = `Before the briefing, output exactly one line in the form:
HEADLINE: <a newspaper headline of at most 12 words>
It must lead with the top-ranked instrument's move. Attribute the move to a wire headline ONLY when that event has a direct, economically plausible link to that specific instrument (a Gulf conflict explains oil; a bank enforcement notice does not explain the yen). When no wire plausibly explains the move, write a purely factual headline about the move itself — do not force a connection. Name no event absent from the wires. Then a blank line, then the briefing.`;

function contextFor(edition: Edition): string {
  // Compact context: the ranking plus the numbers the model may cite.
  return JSON.stringify({
    date: edition.date,
    edition: edition.number,
    weather: edition.weather,
    story: edition.story,
    wires: (edition.wires ?? []).map((w) => ({
      title: w.title,
      source: w.source,
      publishedAt: w.publishedAt,
      salience: w.score,
    })),
    board: edition.salience.slice(0, 10).map((s) => {
      const i = edition.instruments.find((x) => x.id === s.id);
      return {
        label: s.label,
        class: i?.class,
        level: i?.level,
        dayChange: i?.change,
        dayChangePct: i?.changePct,
        zScore: s.z,
        salience: s.score,
      };
    }),
  });
}

async function callGemini(
  apiKey: string,
  model: string,
  system: string,
  user: string,
): Promise<string | null> {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: "user", parts: [{ text: user }] }],
          generationConfig: {
            temperature: 0.4,
            // 2.5-series models spend "thinking" tokens from the same output
            // budget — zero it (a briefing needs prose, not reasoning) and
            // leave ample room so tones never truncate mid-sentence.
            maxOutputTokens: 4096,
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
        cache: "no-store",
      },
    );
    if (!res.ok) {
      console.error(`gemini ${model}: HTTP ${res.status}`, (await res.text()).slice(0, 200));
      return null;
    }
    const body = await res.json();
    const text: unknown = body?.candidates?.[0]?.content?.parts?.[0]?.text;
    return typeof text === "string" && text.trim().length > 0 ? text.trim() : null;
  } catch (err) {
    console.error(`gemini ${model}:`, err);
    return null;
  }
}

/**
 * Builds the day's briefings: the deterministic template always, plus the
 * three AI tones when a key is present and the calls succeed. The
 * news-aware headline rides inside the desk-note call so the cron stays at
 * ≤3 AI calls/day (CLAUDE.md).
 */
export async function buildBriefings(
  edition: Edition,
): Promise<{ briefings: Briefings; aiHeadline?: string }> {
  const briefings: Briefings = {
    template: templateBriefing(edition),
    ai: false,
  };

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { briefings };

  // gemini-2.0-flash 429s on the current free tier; 2.5-flash is the
  // free-quota model as of Jul 2026. Override with GEMINI_MODEL if it moves.
  const model = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
  const context = `Context JSON for ${edition.date}:\n${contextFor(edition)}`;
  let aiHeadline: string | undefined;

  for (const tone of TONES) {
    const wantHeadline = tone.key === "deskNote";
    const text = await callGemini(
      apiKey,
      model,
      `${SYSTEM_RULES}\n${tone.instruction}${wantHeadline ? `\n${HEADLINE_INSTRUCTION}` : ""}`,
      context,
    );
    if (!text) continue;
    let body = text;
    if (wantHeadline) {
      const m = text.match(/^HEADLINE:\s*(.+)\s*\n+([\s\S]*)$/);
      if (m) {
        aiHeadline = m[1].trim().replace(/^["']|["']$/g, "");
        body = m[2].trim();
      }
    }
    briefings[tone.key] = body;
    briefings.ai = true;
    briefings.model = model;
  }
  return { briefings, aiHeadline };
}
