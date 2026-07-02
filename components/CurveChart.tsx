import { CurveScrub, type CurveKnot } from "./CurveScrub";
import type { MarketInstrument } from "@/lib/market-data";
import type { SeriesPoint } from "@/lib/sources/types";

export interface CurveTenor {
  tenor: number;
  instrument: MarketInstrument;
}

interface CurveChartProps {
  title: string;
  sourceNote: string;
  tenors: CurveTenor[];
  fetchedAt: string;
  footnote?: string;
}

const W = 620;
const H = 200;
const PAD_X = 30;
const BASE_Y = 166;
const TOP_Y = 28;

function valueDaysAgo(points: SeriesPoint[], daysAgo: number): number | null {
  const cutoff = new Date(Date.now() - daysAgo * 86400_000).toISOString().slice(0, 10);
  for (let i = points.length - 1; i >= 0; i--) {
    if (points[i].date <= cutoff) return points[i].value;
  }
  return null;
}

/** Catmull-Rom through the knots, emitted as cubic beziers. */
function smoothPath(pts: [number, number][]): string {
  if (pts.length < 2) return "";
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1: [number, number] = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: [number, number] = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0]},${p2[1]}`;
  }
  return d;
}

/**
 * A full yield curve with one-month and one-year comparators, drawn to the
 * WHITEPAPER §8.7 rules: ink on ivory, today heaviest in racing green,
 * comparators lighter and dashed, direct labels, source in the margin.
 */
export function CurveChart({ title, sourceNote, tenors, fetchedAt, footnote }: CurveChartProps) {
  const live = tenors.filter((t) => t.instrument.level !== null);
  if (live.length < 2) {
    return (
      <section className="rounded-card border border-line bg-ivory-1 p-6 shadow-card sm:px-7">
        <h3 className="coachline-under font-display text-[19px] font-[540] text-ink">{title}</h3>
        <p className="mt-4 rounded bg-sage px-3 py-2 text-sm text-muted">
          Source unreachable — no curve to draw today.
        </p>
      </section>
    );
  }

  const minTenor = live[0].tenor;
  const maxTenor = live[live.length - 1].tenor;
  const x = (tenor: number) =>
    PAD_X +
    ((Math.log(tenor) - Math.log(minTenor)) / (Math.log(maxTenor) - Math.log(minTenor))) *
      (W - PAD_X * 2 - 16);

  const today = live.map((t) => t.instrument.level!);
  const monthAgo = live.map((t) => valueDaysAgo(t.instrument.points, 30));
  const yearAgo = live.map((t) => valueDaysAgo(t.instrument.points, 365));
  const hasMonth = monthAgo.every((v) => v !== null);
  const hasYear = yearAgo.every((v) => v !== null);

  const all = [
    ...today,
    ...(hasMonth ? (monthAgo as number[]) : []),
    ...(hasYear ? (yearAgo as number[]) : []),
  ];
  const min = Math.min(...all) - 0.12;
  const max = Math.max(...all) + 0.12;
  const y = (v: number) => TOP_Y + (1 - (v - min) / (max - min)) * (BASE_Y - TOP_Y);
  const coords = (vals: number[]): [number, number][] =>
    vals.map((v, i) => [x(live[i].tenor), y(v)]);

  const todayCoords = coords(today);
  const stale = live.some((t) => t.instrument.health.status !== "ok");

  const knots: CurveKnot[] = live.map((t, i) => ({
    tenor: t.tenor,
    x: todayCoords[i][0],
    y: todayCoords[i][1],
    lines: [
      { label: "Today", value: today[i] },
      ...(hasMonth ? [{ label: "1m ago", value: monthAgo[i]! }] : []),
      ...(hasYear ? [{ label: "1y ago", value: yearAgo[i]! }] : []),
    ],
  }));

  return (
    <section
      aria-label={title}
      className="rounded-card border border-line bg-ivory-1 p-6 shadow-card sm:px-7"
    >
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="coachline-under font-display text-[19px] font-[540] text-ink">{title}</h3>
        <span className="caps !font-medium text-muted">{sourceNote}</span>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="h-[200px] w-full"
        role="img"
        aria-label={live.map((t) => `${t.tenor} year ${t.instrument.level!.toFixed(2)}%`).join(", ")}
      >
        {[0.25, 0.55, 0.85].map((f) => (
          <line
            key={f}
            x1={0}
            y1={TOP_Y + f * (BASE_Y - TOP_Y)}
            x2={W}
            y2={TOP_Y + f * (BASE_Y - TOP_Y)}
            stroke="#EAEBDF"
          />
        ))}
        <line x1={0} y1={BASE_Y} x2={W} y2={BASE_Y} stroke="#DFE0D3" />

        <path
          d={`${smoothPath(todayCoords)} L${todayCoords[todayCoords.length - 1][0]},${BASE_Y} L${todayCoords[0][0]},${BASE_Y} Z`}
          fill="rgba(12,59,42,.06)"
        />
        {hasYear && (
          <path
            d={smoothPath(coords(yearAgo as number[]))}
            fill="none"
            stroke="#b9c4ba"
            strokeWidth={1.2}
            strokeDasharray="2 5"
          />
        )}
        {hasMonth && (
          <path
            d={smoothPath(coords(monthAgo as number[]))}
            fill="none"
            stroke="#8fa294"
            strokeWidth={1.6}
            strokeDasharray="7 4"
          />
        )}
        <path
          d={smoothPath(todayCoords)}
          fill="none"
          stroke="#0C3B2A"
          strokeWidth={2.6}
          className="animate-draw"
          style={{ ["--draw-length" as string]: "900" }}
        />

        {live.map((t, i) => (
          <g key={t.tenor}>
            <circle cx={todayCoords[i][0]} cy={todayCoords[i][1]} r={3.2} fill="#0C3B2A" />
            <text
              x={todayCoords[i][0]}
              y={todayCoords[i][1] - 9}
              textAnchor="middle"
              fontSize={10}
              fill="#17251E"
              fontWeight={600}
              className="figures"
            >
              {today[i].toFixed(2)}%
            </text>
            <text
              x={todayCoords[i][0]}
              y={H - 18}
              textAnchor="middle"
              fontSize={10}
              fill="#66716A"
              fontWeight={600}
              className="figures"
            >
              {t.tenor}Y
            </text>
          </g>
        ))}

        <CurveScrub knots={knots} width={W} height={H} baseY={BASE_Y} />
      </svg>

      <div className="mt-2 flex gap-[18px] text-[11.5px] text-muted">
        <span>
          <i className="mr-1.5 inline-block w-[18px] border-t-[2.4px] border-brg align-middle" />
          Today
        </span>
        {hasMonth && (
          <span>
            <i className="mr-1.5 inline-block w-[18px] border-t-[1.5px] border-dashed border-[#8fa294] align-middle" />
            One month ago
          </span>
        )}
        {hasYear && (
          <span>
            <i className="mr-1.5 inline-block w-[18px] border-t border-dashed border-[#b9c4ba] align-middle" />
            One year ago
          </span>
        )}
      </div>

      <p className="mt-3 border-t border-line pt-2 text-[11px] text-muted">
        {footnote ? `${footnote} · ` : ""}
        {sourceNote} · as of{" "}
        {live[0].instrument.health.status !== "down"
          ? live[0].instrument.health.asOf
          : "—"}
        {stale && " · some tenors stale"} · fetched{" "}
        {new Date(fetchedAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
      </p>
    </section>
  );
}
