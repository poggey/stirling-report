"use client";

import { useLearn } from "./LearnProvider";
import { glossaryBySlug } from "@/lib/glossary";

/** Every definition this reader has ever opened — localStorage only. */
export function PersonalGlossary() {
  const { opened } = useLearn();
  const terms = opened
    .map(glossaryBySlug)
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  if (terms.length === 0) {
    return (
      <p className="rounded-lg bg-sage px-4 py-3 text-[13px] text-muted">
        Empty so far. Switch Learn mode on, click any dotted-underlined term
        anywhere in Stirling, and it lands here.
      </p>
    );
  }
  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {terms.map((t) => (
        <li key={t.slug} className="rounded-card border border-line bg-ivory-1 p-4 shadow-card">
          <p className="font-display text-base font-semibold text-ink">{t.term}</p>
          <p className="mt-1 text-[12.5px] leading-relaxed text-muted">{t.definition}</p>
        </li>
      ))}
    </ul>
  );
}
