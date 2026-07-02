import { describe, expect, it } from "vitest";
import fixture from "./__fixtures__/coingecko-bitcoin.json";
import { parseCoinGecko } from "./coingecko";

describe("parseCoinGecko", () => {
  const points = parseCoinGecko(fixture as { prices: [number, number][] });

  it("collapses to one point per date, ascending", () => {
    const dates = points.map((p) => p.date);
    expect(new Set(dates).size).toBe(dates.length);
    expect(dates).toEqual([...dates].sort());
  });

  it("keeps the live price for today rather than the midnight point", () => {
    const raw = (fixture as { prices: [number, number][] }).prices;
    const last = points[points.length - 1];
    expect(last.value).toBe(raw[raw.length - 1][1]);
  });

  it("covers roughly 30 days", () => {
    expect(points.length).toBeGreaterThanOrEqual(28);
    expect(points.length).toBeLessThanOrEqual(31);
  });
});
