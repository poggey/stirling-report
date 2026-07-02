import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parseBoE } from "./boe";

const csv = readFileSync(
  path.join(__dirname, "__fixtures__", "boe-iadb.csv"),
  "utf8",
);

describe("parseBoE", () => {
  const series = parseBoE(csv);

  it("returns one series per code", () => {
    expect(Object.keys(series).sort()).toEqual([
      "IUDBEDR",
      "IUDMNPY",
      "IUDSNPY",
    ]);
  });

  it("converts IADB dates to ISO", () => {
    expect(series.IUDBEDR[0].date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("skips blank cells where yields lag Bank Rate", () => {
    // The fixture's final row has a Bank Rate but empty yield cells.
    expect(series.IUDBEDR.length).toBeGreaterThan(series.IUDSNPY.length);
  });

  it("parses plausible values", () => {
    for (const p of series.IUDMNPY) {
      expect(p.value).toBeGreaterThan(0);
      expect(p.value).toBeLessThan(20);
    }
  });
});
