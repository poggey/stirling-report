"use client";

import { useState } from "react";
import type { SeriesPoint } from "@/lib/sources/types";

interface SparklineProps {
  points: SeriesPoint[];
  stroke: string;
  /** Ink weight is meaning: scales with |z| at the call site. */
  strokeWidth: number;
  width?: number;
  height?: number;
  className?: string;
  /** Pass "none" to stretch the sparkline to its container width. */
  preserveAspectRatio?: string;
  /** Decimal places for the scrub tooltip. */
  precision?: number;
  /** Rates render their tooltip values as percentages. */
  isRate?: boolean;
}

function fmtDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

/**
 * 30-day sparkline with pointer scrubbing: hover or drag to read the exact
 * date and value. Decorative to screen readers — the figures live in the
 * row beside it.
 */
export function Sparkline({
  points,
  stroke,
  strokeWidth,
  width = 96,
  height = 28,
  className,
  preserveAspectRatio,
  precision = 1,
  isRate = false,
}: SparklineProps) {
  const [active, setActive] = useState<number | null>(null);

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
  const coords = points.map((p, i) => {
    const x = (i / (points.length - 1)) * width;
    const y = pad + (1 - (p.value - min) / span) * (height - pad * 2);
    return [x, y] as const;
  });
  const polyline = coords.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const frac = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    setActive(Math.round(frac * (points.length - 1)));
  };

  const activePoint = active !== null ? points[active] : null;

  return (
    <span className={`relative inline-block ${className ?? ""}`}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio={preserveAspectRatio}
        aria-hidden="true"
        className="block w-full touch-none"
        onPointerMove={onMove}
        onPointerDown={onMove}
        onPointerLeave={() => setActive(null)}
      >
        <polyline
          points={polyline}
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {active !== null && (
          <circle
            cx={coords[active][0]}
            cy={coords[active][1]}
            r={Math.max(2.4, strokeWidth)}
            fill={stroke}
          />
        )}
      </svg>
      {activePoint && (
        <span
          aria-hidden="true"
          className="figures pointer-events-none absolute bottom-full z-30 mb-1 -translate-x-1/2 whitespace-nowrap rounded-md border border-line bg-ivory-1 px-2 py-0.5 text-[10px] font-semibold text-ink shadow-card"
          style={{
            left: `${(active! / (points.length - 1)) * 100}%`,
          }}
        >
          {fmtDate(activePoint.date)} ·{" "}
          {activePoint.value.toLocaleString("en-GB", {
            minimumFractionDigits: precision,
            maximumFractionDigits: precision,
          })}
          {isRate ? "%" : ""}
        </span>
      )}
    </span>
  );
}
