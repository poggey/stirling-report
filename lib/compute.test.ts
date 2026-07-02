import { describe, expect, it } from "vitest";
import { dailyChanges, dayChange, zScore } from "./compute";
import type { SeriesPoint } from "./sources/types";

const series = (values: number[]): SeriesPoint[] =>
  values.map((value, i) => ({
    date: `2026-06-${String(i + 1).padStart(2, "0")}`,
    value,
  }));

describe("dailyChanges", () => {
  it("computes percent changes", () => {
    expect(dailyChanges(series([100, 110, 99]), "pct")).toEqual([10, -10]);
  });

  it("computes absolute changes for rates", () => {
    const changes = dailyChanges(series([4.0, 4.25, 4.1]), "abs");
    expect(changes[0]).toBeCloseTo(0.25);
    expect(changes[1]).toBeCloseTo(-0.15);
  });
});

describe("dayChange", () => {
  it("returns latest close vs previous", () => {
    const c = dayChange(series([100, 104]));
    expect(c?.abs).toBeCloseTo(4);
    expect(c?.pct).toBeCloseTo(4);
  });

  it("returns null with fewer than two points", () => {
    expect(dayChange(series([100]))).toBeNull();
  });
});

describe("zScore", () => {
  it("is 0 for a flat series (Bank Rate case)", () => {
    expect(zScore(series(Array(31).fill(3.75)), "abs")).toBe(0);
  });

  it("is 0 with too little history", () => {
    expect(zScore(series([100, 101, 103]), "pct")).toBe(0);
  });

  it("flags an outsized final move as high |z|", () => {
    // 30 days oscillating ±0.5%, then a -5% day.
    const values = [100];
    for (let i = 0; i < 29; i++) {
      values.push(values[values.length - 1] * (i % 2 === 0 ? 1.005 : 0.995));
    }
    values.push(values[values.length - 1] * 0.95);
    const z = zScore(series(values), "pct");
    expect(Math.abs(z)).toBeGreaterThan(3);
    expect(z).toBeLessThan(0);
  });
});
