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
- Attribute causality with hedged language ("consistent with", "likely reflects") — never false certainty.
- No investment advice, no buy/sell/hold language, no price targets.
- The watch items must derive only from instruments and readings in the context.
- British English. No headings other than the watch heading, no bullet decoration beyond the numbered watch list.`;

function contextFor(edition: Edition): string {
  // Compact context: the ranking plus the numbers the model may cite.
  return JSON.stringify({
    date: edition.date,
    edition: edition.number,
    weather: edition.weather,
    story: edition.story,
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
          generationConfig: { temperature: 0.4, maxOutputTokens: 1024 },
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
 * three AI tones when a key is present and the calls succeed. ≤3 calls/day.
 */
export async function buildBriefings(edition: Edition): Promise<Briefings> {
  const briefings: Briefings = {
    template: templateBriefing(edition),
    ai: false,
  };

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return briefings;

  const model = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";
  const context = `Context JSON for ${edition.date}:\n${contextFor(edition)}`;

  for (const tone of TONES) {
    const text = await callGemini(
      apiKey,
      model,
      `${SYSTEM_RULES}\n${tone.instruction}`,
      context,
    );
    if (text) {
      briefings[tone.key] = text;
      briefings.ai = true;
      briefings.model = model;
    }
  }
  return briefings;
}
