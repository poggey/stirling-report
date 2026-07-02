import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parseRss } from "./wires";

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
