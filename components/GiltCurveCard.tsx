import type { MarketInstrument } from "@/lib/market-data";

interface GiltCurveCardProps {
  gilt5y: MarketInstrument;
  gilt10y: MarketInstrument;
  fetchedAt: string;
}

const W = 340;
const H = 170;
const PAD_X = 46;
const PAD_Y = 24;

function x(tenor: number): number {
  return PAD_X + ((tenor - 5) / 5) * (W - PAD_X * 2);
}

/**
 * Phase 1 gilt curve: two points, honestly labelled. The IADB has no 2y
 * par-yield series (NOTES.md), so the short tenor is 5y and the readout is
 * the 5s10s spread. The full Yield Curve Observatory arrives in Phase 5.
 */
export function GiltCurveCard({ gilt5y, gilt10y, fetchedAt }: GiltCurveCardProps) {
  const today: [number, number] | null =
    gilt5y.level !== null && gilt10y.level !== null
      ? [gilt5y.level, gilt10y.level]
      : null;

  // One month ≈ 21 trading days back, else the oldest point available.
  const monthAgo = (i: MarketInstrument) =>
    i.points.length > 21 ? i.points[i.points.length - 22].value : i.points[0]?.value;
  const prior: [number, number] | null =
    gilt5y.points.length && gilt10y.points.length
      ? [monthAgo(gilt5y), monthAgo(gilt10y)]
      : null;

  if (!today) {
    return (
      <section className="rounded-card border border-line bg-ivory-1 p-6 shadow-card">
        <h2 className="font-display text-xl font-semibold text-ink">The Gilt Curve</h2>
        <p className="mt-4 rounded bg-sage px-3 py-2 text-sm text-muted">
          BoE IADB unreachable — no curve to draw.
        </p>
      </section>
    );
  }

  const values = [...today, ...(prior ?? [])];
  const min = Math.min(...values) - 0.15;
  const max = Math.max(...values) + 0.15;
  const y = (v: number) => PAD_Y + (1 - (v - min) / (max - min)) * (H - PAD_Y * 2);

  const spreadBp = Math.round((today[1] - today[0]) * 100);
  const gridLines = [min + (max - min) * 0.25, min + (max - min) * 0.5, min + (max - min) * 0.75];
  const lineLength = Math.hypot(x(10) - x(5), y(today[1]) - y(today[0]));

  return (
    <section
      aria-label="UK gilt curve, 5 and 10 year"
      className="rounded-card border border-line bg-ivory-1 p-6 shadow-card"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-xl font-semibold text-ink">The Gilt Curve</h2>
        <p className="figures text-sm text-muted">
          5s10s spread{" "}
          <span className={`font-medium ${spreadBp < 0 ? "text-fall" : "text-ink"}`}>
            {spreadBp >= 0 ? "+" : ""}
            {spreadBp}bp
          </span>
        </p>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-3 w-full"
        role="img"
        aria-label={`5 year gilt ${today[0].toFixed(2)} percent, 10 year ${today[1].toFixed(2)} percent`}
      >
        {gridLines.map((v) => (
          <g key={v}>
            <line x1={PAD_X} y1={y(v)} x2={W - PAD_X} y2={y(v)} stroke="#DFE0D3" strokeWidth={1} />
            <text x={PAD_X - 6} y={y(v) + 3} textAnchor="end" fontSize={9} fill="#66716A" className="figures">
              {v.toFixed(2)}%
            </text>
          </g>
        ))}

        {prior && (
          <line
            x1={x(5)}
            y1={y(prior[0])}
            x2={x(10)}
            y2={y(prior[1])}
            stroke="#66716A"
            strokeWidth={1.2}
            strokeDasharray="4 4"
          />
        )}
        {prior && (
          <text x={x(10) + 6} y={y(prior[1]) + 3} fontSize={9} fill="#66716A">
            1m ago
          </text>
        )}

        <line
          x1={x(5)}
          y1={y(today[0])}
          x2={x(10)}
          y2={y(today[1])}
          stroke="#0C3B2A"
          strokeWidth={2.4}
          className="animate-draw"
          style={{ ["--draw-length" as string]: `${Math.ceil(lineLength)}` }}
        />
        {([
          [5, today[0], gilt5y.label],
          [10, today[1], gilt10y.label],
        ] as const).map(([tenor, value, label]) => (
          <g key={tenor}>
            <circle cx={x(tenor)} cy={y(value)} r={3.4} fill="#0C3B2A" />
            <text
              x={x(tenor)}
              y={y(value) - 9}
              textAnchor="middle"
              fontSize={10}
              fill="#17251E"
              fontWeight={600}
              className="figures"
            >
              {label.replace("UK ", "")} {value.toFixed(2)}%
            </text>
          </g>
        ))}

        <text x={PAD_X} y={H - 4} fontSize={8.5} fill="#66716A">
          Nominal par yields · no 2y IADB series — 5y shown · full curve in Phase 5
        </text>
      </svg>

      <p className="mt-2 border-t border-line pt-2 text-[11px] text-muted">
        Source: Bank of England IADB · as of {gilt10y.health.status !== "down" ? gilt10y.health.asOf : "—"} · fetched{" "}
        {new Date(fetchedAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
      </p>
    </section>
  );
}
