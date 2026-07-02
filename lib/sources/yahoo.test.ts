import { describe, expect, it } from "vitest";
import fixture from "./__fixtures__/yahoo-ftse.json";
import { parseYahoo } from "./yahoo";

type Chart = Parameters<typeof parseYahoo>[0];

describe("parseYahoo", () => {
  const points = parseYahoo(fixture as Chart);

  it("zips timestamps with closes, ascending", () => {
    expect(points.length).toBeGreaterThan(30);
    const dates = points.map((p) => p.date);
    expect(dates).toEqual([...dates].sort());
  });

  it("drops null closes", () => {
    const withNull = JSON.parse(JSON.stringify(fixture)) as Chart;
    withNull.chart.result[0].indicators.quote[0].close[0] = null;
    expect(parseYahoo(withNull).length).toBe(points.length - 1);
  });

  it("survives an empty result", () => {
    expect(parseYahoo({ chart: { result: [] } } as unknown as Chart)).toEqual([]);
  });
});
