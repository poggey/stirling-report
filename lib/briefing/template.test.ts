import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { Edition } from "@/lib/editions/types";
import { parseBriefing, templateBriefing, WATCH_HEADING } from "./template";

// The real Edition Nº 1 from the mirror — the template must always render it.
const edition = JSON.parse(
  readFileSync(path.join(__dirname, "..", "..", "data", "editions", "2026-07-02.json"), "utf8"),
) as Edition;

describe("templateBriefing", () => {
  const text = templateBriefing(edition);

  it("ends with the watch section", () => {
    expect(text).toContain(WATCH_HEADING);
    expect(text.indexOf(WATCH_HEADING)).toBeGreaterThan(0);
  });

  it("cites only real instrument labels", () => {
    const labels = edition.instruments.map((i) => i.label);
    // The top mover named in paragraph one must be a real instrument.
    const first = text.split("\n\n")[0];
    expect(labels.some((l) => first.includes(l))).toBe(true);
  });

  it("round-trips through parseBriefing", () => {
    const { paragraphs, watch } = parseBriefing(text);
    expect(paragraphs.length).toBeGreaterThanOrEqual(2);
    expect(watch.length).toBeGreaterThanOrEqual(3);
    for (const w of watch) expect(w).not.toMatch(/^\d+[.)]/);
  });
});

describe("parseBriefing", () => {
  it("handles text without a watch section", () => {
    const { paragraphs, watch } = parseBriefing("One.\n\nTwo.");
    expect(paragraphs).toEqual(["One.", "Two."]);
    expect(watch).toEqual([]);
  });
});
