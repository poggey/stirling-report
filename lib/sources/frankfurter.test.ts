import { describe, expect, it } from "vitest";
import fixture from "./__fixtures__/frankfurter-gbp-usd.json";
import { parseFrankfurter } from "./frankfurter";

describe("parseFrankfurter", () => {
  const points = parseFrankfurter(fixture, "USD");

  it("parses one point per banking day, ascending", () => {
    expect(points.length).toBeGreaterThan(30);
    const dates = points.map((p) => p.date);
    expect(dates).toEqual([...dates].sort());
    expect(dates[0] < dates[dates.length - 1]).toBe(true);
  });

  it("yields plausible GBP/USD rates", () => {
    for (const p of points) {
      expect(p.value).toBeGreaterThan(0.8);
      expect(p.value).toBeLessThan(2.5);
    }
  });

  it("returns empty for an unknown symbol", () => {
    expect(parseFrankfurter(fixture, "XXX")).toEqual([]);
  });
});
