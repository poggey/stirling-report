import { describe, expect, it } from "vitest";
import type { MarketInstrument } from "./market-data";
import { rankBySalience, salienceScore } from "./salience";
import { readWeather } from "./weather";
import type { InstrumentClass } from "./sources/types";

function inst(
  id: string,
  cls: InstrumentClass,
  z: number,
  change = z,
): MarketInstrument {
  return {
    id,
    label: id,
    class: cls,
    precision: 2,
    source: "test",
    points: [],
    health: { status: "ok", asOf: "2026-07-02" },
    level: 100,
    change,
    changePct: change,
    z,
  };
}

describe("salience", () => {
  it("weights a rates move above an equal crypto move", () => {
    expect(salienceScore(inst("rate", "rate", 2))).toBeGreaterThan(
      salienceScore(inst("btc", "crypto", 2)),
    );
  });

  it("ranks by weighted |z|, not raw |z|", () => {
    const ranked = rankBySalience([
      inst("btc", "crypto", 2.0),
      inst("gilt", "rate", -1.2),
      inst("ftse", "index", 0.4),
    ]);
    // 1.2 × 1.3 = 1.56 vs 2.0 × 0.6 = 1.2 — the gilt move leads.
    expect(ranked.map((i) => i.id)).toEqual(["gilt", "btc", "ftse"]);
  });
});

describe("weather", () => {
  it("reads a quiet board as fog", () => {
    const reading = readWeather([
      inst("a", "index", 0.1),
      inst("b", "fx", -0.2),
    ]);
    expect(reading.state).toBe("fog");
  });

  it("reads loud correlated selling as storm", () => {
    const reading = readWeather([
      inst("a", "index", -2.2, -2),
      inst("b", "crypto", -1.8, -3),
      inst("c", "commodity", -1.5, -1),
    ]);
    expect(reading.state).toBe("storm");
  });

  it("reads broad constructive strength as clear", () => {
    const reading = readWeather([
      inst("a", "index", 0.8, 1),
      inst("b", "crypto", 0.7, 2),
      inst("c", "fx", 0.6, 0.5),
    ]);
    expect(reading.state).toBe("clear");
  });
});
