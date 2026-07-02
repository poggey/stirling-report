import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parseRss, scoreHeadline } from "./wires";

const xml = readFileSync(
  path.join(__dirname, "__fixtures__", "bbc-business.rss.xml"),
  "utf8",
);

describe("parseRss", () => {
  const headlines = parseRss(xml, "BBC Business");

  it("parses every item with title, link and timestamp", () => {
    expect(headlines.length).toBeGreaterThan(20);
    for (const h of headlines) {
      expect(h.title.length).toBeGreaterThan(5);
      expect(h.link).toMatch(/^https?:\/\//);
      expect(h.publishedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(h.source).toBe("BBC Business");
    }
  });

  it("strips CDATA wrappers from titles", () => {
    for (const h of headlines) {
      expect(h.title).not.toContain("CDATA");
      expect(h.title).not.toContain("]]>");
    }
  });

  it("decodes basic HTML entities", () => {
    expect(parseRss(
      `<item><title>M&amp;S &#x27;back&#x27;</title><link>https://x</link><pubDate>Thu, 02 Jul 2026 10:00:00 GMT</pubDate></item>`,
      "t",
    )[0].title).toBe("M&S 'back'");
  });

  it("skips items with unparseable dates", () => {
    expect(parseRss(
      `<item><title>ok</title><link>https://x</link><pubDate>not a date</pubDate></item>`,
      "t",
    )).toEqual([]);
  });
});

describe("scoreHeadline", () => {
  const now = Date.parse("2026-07-02T20:00:00Z");
  const at = (hoursAgo: number) =>
    new Date(now - hoursAgo * 3_600_000).toISOString();

  it("keeps a 12-hour-old crisis story above fresh trivia", () => {
    const war = scoreHeadline("US strikes Iran nuclear sites", "BBC World", at(12), now);
    const trivia = scoreHeadline("Pubs allowed to stay open until 5am", "BBC Business", at(0), now);
    expect(war).toBeGreaterThan(trivia);
  });

  it("decays: day-old trivia loses to fresh trivia", () => {
    const old = scoreHeadline("Retailer opens new flagship store", "BBC Business", at(24), now);
    const fresh = scoreHeadline("Museum unveils quiet exhibition", "BBC Business", at(0), now);
    expect(fresh).toBeGreaterThan(old);
  });

  it("weights central-bank sources above general news", () => {
    const boe = scoreHeadline("Committee publishes minutes", "Bank of England", at(1), now);
    const bbc = scoreHeadline("Committee publishes minutes", "BBC Business", at(1), now);
    expect(boe).toBeGreaterThan(bbc);
  });

  it("ranks macro terms above unmatched text", () => {
    const macro = scoreHeadline("Inflation surprise reshapes rate bets", "BBC Business", at(2), now);
    const plain = scoreHeadline("Village fete raises record sum", "BBC Business", at(2), now);
    expect(macro).toBeGreaterThan(plain);
  });
});
