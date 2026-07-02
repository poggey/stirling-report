"use client";

import { useState } from "react";

export interface CurveKnot {
  tenor: number;
  x: number;
  y: number;
  lines: { label: string; value: number }[];
}

interface CurveScrubProps {
  knots: CurveKnot[];
  width: number;
  height: number;
  baseY: number;
}

/**
 * Scrub layer for the curve charts: hover or drag anywhere on the chart to
 * pin the nearest tenor and read today's and the comparators' yields. Pure
 * SVG so it inherits the chart's coordinate space.
 */
export function CurveScrub({ knots, width, height, baseY }: CurveScrubProps) {
  const [active, setActive] = useState<number | null>(null);

  const onMove = (e: React.PointerEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * width;
    let nearest = 0;
    for (let i = 1; i < knots.length; i++) {
      if (Math.abs(knots[i].x - x) < Math.abs(knots[nearest].x - x)) nearest = i;
    }
    setActive(nearest);
  };

  const knot = active !== null ? knots[active] : null;
  const boxWidth = 108;
  const boxHeight = knot ? 16 + knot.lines.length * 13 : 0;

  return (
    <g aria-hidden="true">
      {knot && (
        <>
          <line
            x1={knot.x}
            y1={12}
            x2={knot.x}
            y2={baseY}
            stroke="#A9853F"
            strokeWidth={0.8}
            strokeDasharray="3 3"
          />
          <g
            transform={`translate(${Math.min(width - boxWidth - 4, Math.max(4, knot.x + 10))}, 8)`}
          >
            <rect
              width={boxWidth}
              height={boxHeight}
              rx={6}
              fill="#FCFBF6"
              stroke="#DFE0D3"
            />
            <text x={8} y={12} fontSize={9} fontWeight={700} fill="#17251E">
              {knot.tenor}Y
            </text>
            {knot.lines.map((l, i) => (
              <text key={l.label} x={8} y={24 + i * 13} fontSize={9} fill="#66716A">
                {l.label}: {l.value.toFixed(2)}%
              </text>
            ))}
          </g>
        </>
      )}
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill="transparent"
        className="touch-none"
        onPointerMove={onMove}
        onPointerDown={onMove}
        onPointerLeave={() => setActive(null)}
      />
    </g>
  );
}
