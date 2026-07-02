import { getMarketData } from "@/lib/market-data";
import { rankBySalience, salienceTable } from "@/lib/salience";
import { fetchWires } from "@/lib/sources/wires";
import { buildStory } from "@/lib/story";
import { readWeather } from "@/lib/weather";
import { getLatestEdition } from "./store";
import { ukDateOf, type Edition } from "./types";

/**
 * Assembles today's edition from live providers. Numbering continues from the
 * last stored edition; the first ever issued is Nº 1.
 */
export async function buildEdition(): Promise<Edition> {
  const [{ instruments, fetchedAt }, wires, latest] = await Promise.all([
    getMarketData(),
    fetchWires(),
    getLatestEdition(),
  ]);
  const ranked = rankBySalience(instruments.filter((i) => i.id !== "gilt20y"));

  return {
    schema: 1,
    date: ukDateOf(new Date()),
    number: latest ? latest.number + 1 : 1,
    generatedAt: fetchedAt,
    weather: readWeather(instruments),
    story: buildStory(ranked),
    salience: salienceTable(instruments),
    instruments,
    sources: [...new Set(instruments.map((i) => i.source))],
    wires,
  };
}
