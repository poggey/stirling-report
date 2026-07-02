import { describe, expect, it } from "vitest";
import fixture from "./__fixtures__/fred-dgs10.json";
import { parseFred } from "./fred";

describe("parseFred", () => {
  const points = parseFred(fixture);

  it("parses string values into numbers, ascending", () => {
    expect(points.length).toBeGreaterThan(20);
    const dates = points.map((p) => p.date);
    expect(dates).toEqual([...dates].sort());
    for (const p of points) expect(typeof p.value).toBe("number");
  });

  it('drops missing days marked "."', () => {
    const body = {
      observations: [
        { date: "2026-06-29", value: "4.38" },
        { date: "2026-06-28", value: "." },
      ],
    };
    expect(parseFred(body)).toEqual([{ date: "2026-06-29", value: 4.38 }]);
  });
});
