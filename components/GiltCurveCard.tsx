import type { MarketInstrument } from "@/lib/market-data";
import type { SeriesPoint } from "@/lib/sources/types";

interface GiltCurveCardProps {
  gilt5y: MarketInstrument;
  gilt10y: MarketInstrument;
  gilt20y: MarketInstrument;
  fetchedAt: string;
}

const W = 620;
const H = 190;
const PAD_X = 28;
const BASE_Y = 158;
const TOP_Y = 26;

const TENORS = [5, 10, 20] as const;

// Log-spaced tenor axis, as yield curves are conventionally drawn.
function x(tenor: number): number {
  const t = (Math.log(tenor) - Math.log(5)) / (Math.log(20) - Math.log(5));
  return PAD_X + t * (W - PAD_X * 2 - 20);
}

/** Value on/nearest-before the date `daysAgo` back, or null if history is short. */
function valueDaysAgo(points: SeriesPoint[], daysAgo: number): number | null {
  const cutoff = new Date(Date.now() - daysAgo * 86400_000)
    .toISOString()
    .slice(0, 10);
  for (let i = points.length - 1; i >= 0; i--) {
    if (points[i].date <= cutoff) return points[i].value;
  }
  return null;
}

function smoothPath(coords: [number, number][]): string {
  const [a, b, c] = coords;
  // One quadratic per segment, control points nudged toward the middle knot.
  return (
    `M${a[0]},${a[1]} ` +
    `Q${(a[0] + b[0]) / 2},${b[1] + (a[1] - b[1]) * 0.15} ${b[0]},${b[1]} ` +
    `Q${(b[0] + c[0]) / 2},${b[1] + (c[1] - b[1]) * 0.85} ${c[0]},${c[1]}`
  );
}

/**
 * The gilt curve across the three IADB par-yield tenors (no 2y series exists —
 * NOTES.md), with one-month and one-year comparators. The full Yield Curve
 * Observatory with Treasuries lands in Phase 5.
 */
export function GiltCurveCard({ gilt5y, gilt10y, gilt20y, fetchedAt }: GiltCurveCardProps) {
  const gilts = [gilt5y, gilt10y, gilt20y];

  if (gilts.some((g) => g.level === null)) {
    return (
      <section className="rounded-card border border-line bg-ivory-1 p-6 shadow-card sm:px-7">
        <div className="flex items-baseline justify-between">
          <h3 className="coachline-under font-display text-[19px] font-[540] text-ink">
            The UK gilt curve
          </h3>
          <span className="caps text-muted !font-medium">Bank of England IADB</span>
        </div>
        <p className="mt-4 rounded bg-sage px-3 py-2 text-sm text-muted">
          BoE IADB unreachable — no curve to draw today.
        </p>
      </section>
    );
  }

  const today = gilts.map((g) => g.level!) as [number, number, number];
  const monthAgo = gilts.map((g) => valueDaysAgo(g.points, 30));
  const yearAgo = gilts.map((g) => valueDaysAgo(g.points, 365));
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
  const coordsFor = (vals: number[]): [number, number][] =>
    vals.map((v, i) => [x(TENORS[i]), y(v)]);

  const spreadBp = Math.round((today[1] - today[0]) * 100);
  const change10yBp = (gilt10y.change ?? 0) * 100;
  const prevSpread =
    gilt10y.points.length > 1 && gilt5y.points.length > 1
      ? gilt10y.points[gilt10y.points.length - 2].value -
        gilt5y.points[gilt5y.points.length - 2].value
      : null;
  const spreadDeltaBp =
    prevSpread === null ? null : Math.round((today[1] - today[0] - prevSpread) * 100);

  const todayCoords = coordsFor(today);
  const annotationColour = change10yBp >= 0 ? "#BC4B32" : "#177A4E";

  return (
    <section
      aria-label="UK gilt curve against one month and one year ago"
      className="rounded-card border border-line bg-ivory-1 p-6 shadow-card sm:px-7"
    >
      <div className="mb-4 flex items-baseline justify-between">
        <h3 className="coachline-under font-display text-[19px] font-[540] text-ink">
          The UK gilt curve
        </h3>
        <span className="caps !font-medium text-muted">Bank of England IADB</span>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="h-[190px] w-full"
        role="img"
        aria-label={`5 year ${today[0].toFixed(2)}%, 10 year ${today[1].toFixed(2)}%, 20 year ${today[2].toFixed(2)}%`}
      >
        <line x1={0} y1={BASE_Y} x2={W} y2={BASE_Y} stroke="#DFE0D3" />
        <line x1={0} y1={108} x2={W} y2={108} stroke="#EAEBDF" />
        <line x1={0} y1={58} x2={W} y2={58} stroke="#EAEBDF" />

        {/* 6% green area under today's curve — never a saturated wash */}
        <path
          d={`${smoothPath(todayCoords)} L${todayCoords[2][0]},${BASE_Y} L${todayCoords[0][0]},${BASE_Y} Z`}
          fill="rgba(12,59,42,.06)"
        />
        {hasYear && (
          <path
            d={smoothPath(coordsFor(yearAgo as number[]))}
            fill="none"
            stroke="#b9c4ba"
            strokeWidth={1.2}
            strokeDasharray="2 5"
          />
        )}
        {hasMonth && (
          <path
            d={smoothPath(coordsFor(monthAgo as number[]))}
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
          style={{ ["--draw-length" as string]: "700" }}
        />

        <circle cx={todayCoords[1][0]} cy={todayCoords[1][1]} r={3.4} fill="#0C3B2A" />
        <line
          x1={todayCoords[1][0]}
          y1={todayCoords[1][1]}
          x2={todayCoords[1][0] + 48}
          y2={30}
          stroke={annotationColour}
          strokeWidth={1}
        />
        <text
          x={todayCoords[1][0] + 54}
          y={28}
          fontSize={11}
          fill={annotationColour}
          fontWeight={600}
          className="figures"
        >
          10Y {change10yBp >= 0 ? "+" : "−"}
          {Math.abs(change10yBp).toFixed(0)}bp today
        </text>

        <g fontSize={10} fill="#66716A" fontWeight={600}>
          {TENORS.map((t) => (
            <text key={t} x={x(t) - 6} y={178} className="figures">
              {t}Y
            </text>
          ))}
        </g>
      </svg>

      <div className="mt-2.5 flex gap-[18px] text-[11.5px] text-muted">
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

      <div className="mt-3.5 flex flex-wrap gap-x-8 gap-y-2 border-t border-line pt-3.5">
        <div>
          <div className="caps !text-[10px] text-muted">5s10s spread</div>
          <div className={`figures mt-0.5 text-[17px] font-bold ${spreadBp < 0 ? "text-fall" : "text-rise"}`}>
            {spreadBp >= 0 ? "+" : ""}
            {spreadBp}bp
          </div>
        </div>
        {spreadDeltaBp !== null && (
          <div>
            <div className="caps !text-[10px] text-muted">Change today</div>
            <div className="figures mt-0.5 text-[17px] font-bold text-ink">
              {spreadDeltaBp >= 0 ? "+" : "−"}
              {Math.abs(spreadDeltaBp)}bp {spreadDeltaBp >= 0 ? "steeper" : "flatter"}
            </div>
          </div>
        )}
        <div>
          <div className="caps !text-[10px] text-muted">Recession signal</div>
          <div className={`mt-0.5 text-[17px] font-bold ${spreadBp < 0 ? "text-fall" : "text-muted"}`}>
            {spreadBp < 0 ? "Inverted" : "Not inverted"}
          </div>
        </div>
      </div>

      <p className="mt-3 border-t border-line pt-2 text-[11px] text-muted">
        Nominal par yields · no 2Y IADB series — curve starts at 5Y · as of{" "}
        {gilt10y.health.status !== "down" ? gilt10y.health.asOf : "—"} · fetched{" "}
        {new Date(fetchedAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
      </p>
    </section>
  );
}
