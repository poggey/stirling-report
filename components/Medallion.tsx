export interface MedallionProps {
  /** Guilloché line density — derived from average |z| across the board. */
  petals: number;
  /** Storm days weave a vermilion thread through the engraving. */
  storm?: boolean;
  size: number;
  /** Brass-on-green (chips, seals) or bare line-work on any ground. */
  background?: boolean;
}

/** Average |z| across the board → petal count, clamped to a sane engraving. */
export function petalsFromZ(avgAbsZ: number): number {
  return Math.min(26, Math.max(12, Math.round(14 + avgAbsZ * 8)));
}

/**
 * The generative guilloché medallion (WHITEPAPER §8.8): brass-on-green nested
 * rotated ellipses, banknote-style. Doubles later as favicon, report seal and
 * OG-card mark.
 */
export function Medallion({ petals, storm = false, size, background = true }: MedallionProps) {
  const rings = Array.from({ length: petals }, (_, i) => (i * 180) / petals);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label={storm ? "Medallion (storm)" : "Medallion"}
    >
      {background && <circle cx={50} cy={50} r={49} fill="#0C3B2A" />}
      <circle cx={50} cy={50} r={46} fill="none" stroke="#A9853F" strokeWidth={1.6} />
      <g transform="translate(50 50)">
        {rings.map((angle, i) => (
          <ellipse
            key={angle}
            rx={37}
            ry={12.5}
            fill="none"
            stroke={storm && i % 6 === 0 ? "#BC4B32" : "#A9853F"}
            strokeWidth={0.6}
            opacity={0.75}
            transform={`rotate(${angle})`}
          />
        ))}
      </g>
      <circle cx={50} cy={50} r={3.6} fill="#A9853F" />
    </svg>
  );
}
