export interface MedallionProps {
  /** Guilloché line density — derived from average |z| across the board. */
  petals: number;
  /** Storm days weave a vermilion thread through the engraving. */
  storm?: boolean;
  size: number;
}

/** Average |z| across the board → petal count, clamped to a sane engraving. */
export function petalsFromZ(avgAbsZ: number): number {
  return Math.min(24, Math.max(8, Math.round(8 + avgAbsZ * 6)));
}

/**
 * The generative guilloché medallion (WHITEPAPER §8.8): brass-on-green nested
 * rotated ellipses, banknote-style. Doubles later as favicon, report seal and
 * OG-card mark.
 */
export function Medallion({ petals, storm = false, size }: MedallionProps) {
  const c = 50;
  const rings = Array.from({ length: petals }, (_, i) => (i * 180) / petals);
  const thread = storm ? rings.filter((_, i) => i % 5 === 2) : [];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label={storm ? "Medallion (storm)" : "Medallion"}
    >
      <circle cx={c} cy={c} r={48} fill="#0C3B2A" />
      <circle cx={c} cy={c} r={44} fill="none" stroke="#A9853F" strokeWidth={1} opacity={0.9} />
      <circle cx={c} cy={c} r={40} fill="none" stroke="#A9853F" strokeWidth={0.5} opacity={0.6} />
      {rings.map((angle) => (
        <ellipse
          key={angle}
          cx={c}
          cy={c}
          rx={36}
          ry={14}
          fill="none"
          stroke="#A9853F"
          strokeWidth={0.7}
          opacity={0.75}
          transform={`rotate(${angle} ${c} ${c})`}
        />
      ))}
      {thread.map((angle) => (
        <ellipse
          key={`storm-${angle}`}
          cx={c}
          cy={c}
          rx={36}
          ry={14}
          fill="none"
          stroke="#BC4B32"
          strokeWidth={0.8}
          opacity={0.85}
          transform={`rotate(${angle} ${c} ${c})`}
        />
      ))}
      <circle cx={c} cy={c} r={4} fill="#A9853F" />
    </svg>
  );
}
