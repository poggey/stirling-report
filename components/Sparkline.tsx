import type { SeriesPoint } from "@/lib/sources/types";

interface SparklineProps {
  points: SeriesPoint[];
  stroke: string;
  /** Ink weight is meaning: scales with |z| at the call site. */
  strokeWidth: number;
  width?: number;
  height?: number;
  className?: string;
}

/** 30-day inline-SVG sparkline. Decorative — data lives in the figures beside it. */
export function Sparkline({
  points,
  stroke,
  strokeWidth,
  width = 96,
  height = 28,
  className,
}: SparklineProps) {
  if (points.length < 2) {
    return (
      <svg width={width} height={height} aria-hidden="true" className={className}>
        <line
          x1={0}
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke={stroke}
          strokeWidth={1}
          strokeDasharray="2 3"
          opacity={0.4}
        />
      </svg>
    );
  }
  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pad = strokeWidth + 1;
  const coords = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * width;
      const y = pad + (1 - (p.value - min) / span) * (height - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg width={width} height={height} aria-hidden="true" className={className}>
      <polyline
        points={coords}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
