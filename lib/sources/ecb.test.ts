import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parseEcb } from "./ecb";

const csv = readFileSync(path.join(__dirname, "__fixtures__", "ecb-dfr.csv"), "utf8");

describe("parseEcb", () => {
  const points = parseEcb(csv);

  it("parses TIME_PERIOD/OBS_VALUE pairs, ascending", () => {
    expect(points.length).toBeGreaterThan(30);
    const dates = points.map((p) => p.date);
    expect(dates).toEqual([...dates].sort());
  });

  it("yields plausible policy rates", () => {
    for (const p of points) {
      expect(p.value).toBeGreaterThan(-1);
      expect(p.value).toBeLessThan(10);
    }
  });

  it("survives an empty document", () => {
    expect(parseEcb("")).toEqual([]);
    expect(parseEcb("KEY,FREQ")).toEqual([]);
  });
});
