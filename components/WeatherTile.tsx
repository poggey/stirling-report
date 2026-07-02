import Link from "next/link";
import { Medallion } from "./Medallion";
import { petalsFromZ } from "./Medallion";
import type { EditionSummary } from "@/lib/editions/summaries";
import type { WeatherState } from "@/lib/weather";

/** Weather-tinted archive tile colours (concept .w0–.w4). */
export const WEATHER_TINT: Record<WeatherState, string> = {
  clear: "#E2EEE2",
  fair: "#EDEEE2",
  overcast: "#F1E9D2",
  storm: "#F3DFD2",
  fog: "#E9E9E2",
};

interface WeatherTileProps {
  summary: EditionSummary;
  isToday?: boolean;
  size?: "strip" | "calendar";
  highlighted?: boolean;
}

/** One archived session: tinted by weather, stamped with its micro-medallion. */
export function WeatherTile({
  summary,
  isToday = false,
  size = "strip",
  highlighted = false,
}: WeatherTileProps) {
  const day = Number(summary.date.slice(8, 10));
  const dims = size === "strip" ? "h-12 w-[42px]" : "h-16 w-full";
  return (
    <Link
      href={`/archive/${summary.date}`}
      title={`Nº ${summary.number} · ${summary.headline}`}
      className={`flex ${dims} shrink-0 flex-col items-center justify-center gap-[3px] rounded-[10px] border transition-transform duration-150 hover:-translate-y-[3px] hover:shadow-card motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${
        isToday || highlighted ? "border-[1.5px] border-brass" : "border-line"
      }`}
      style={{ background: WEATHER_TINT[summary.weather] }}
    >
      <Medallion
        petals={petalsFromZ(summary.intensity)}
        storm={summary.weather === "storm"}
        size={size === "strip" ? 15 : 18}
        background={false}
      />
      <span className="figures text-[10px] font-bold text-ink/75">{day}</span>
    </Link>
  );
}
