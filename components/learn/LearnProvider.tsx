"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { GLOSSARY, glossaryBySlug, type GlossaryTerm } from "@/lib/glossary";

/**
 * Learn Mode (WHITEPAPER §4.10): a global toggle that layers education onto
 * the interface without changing it. Preferences and the personal glossary
 * live in localStorage only — no accounts, no cookies.
 */

const LEARN_KEY = "stirling.learn";
const GLOSSARY_KEY = "stirling.glossary";

interface LearnContextValue {
  enabled: boolean;
  toggle: () => void;
  opened: string[];
  recordOpen: (slug: string) => void;
}

const LearnContext = createContext<LearnContextValue>({
  enabled: false,
  toggle: () => {},
  opened: [],
  recordOpen: () => {},
});

export function useLearn() {
  return useContext(LearnContext);
}

export function LearnProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const [opened, setOpened] = useState<string[]>([]);

  useEffect(() => {
    // Hydrate once from localStorage after mount: the server must render the
    // learn-off state, so a lazy initializer would mismatch on hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEnabled(localStorage.getItem(LEARN_KEY) === "on");
    try {
      setOpened(JSON.parse(localStorage.getItem(GLOSSARY_KEY) ?? "[]"));
    } catch {
      setOpened([]);
    }
  }, []);

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      localStorage.setItem(LEARN_KEY, prev ? "off" : "on");
      return !prev;
    });
  }, []);

  const recordOpen = useCallback((slug: string) => {
    setOpened((prev) => {
      if (prev.includes(slug)) return prev;
      const next = [...prev, slug];
      localStorage.setItem(GLOSSARY_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <LearnContext.Provider value={{ enabled, toggle, opened, recordOpen }}>
      {children}
    </LearnContext.Provider>
  );
}

export function LearnToggle() {
  const { enabled, toggle } = useLearn();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={enabled}
      title="Learn mode: every technical term becomes a hoverable definition"
      className={`caps rounded-full border px-3 py-1.5 !text-[10px] transition-colors ${
        enabled
          ? "border-brass bg-brg text-cream"
          : "border-line bg-ivory-1 text-muted hover:text-brg"
      }`}
    >
      Learn {enabled ? "on" : "off"}
    </button>
  );
}

// Rendered inside running <p> text, so every element must be phrasing
// content — spans with block display, never divs or nested paragraphs.
function ChipPopover({ term, onClose }: { term: GlossaryTerm; onClose: () => void }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    addEventListener("keydown", onKey);
    addEventListener("mousedown", onClick);
    return () => {
      removeEventListener("keydown", onKey);
      removeEventListener("mousedown", onClick);
    };
  }, [onClose]);
  return (
    <span
      ref={ref}
      role="note"
      className="absolute left-0 top-full z-40 mt-1.5 block w-72 rounded-card border border-line bg-ivory-1 p-4 text-left font-sans shadow-card"
    >
      <span className="block font-display text-base font-semibold not-italic text-ink">
        {term.term}
      </span>
      <span className="mt-1.5 block text-[12.5px] font-normal leading-relaxed not-italic text-[#42504A]">
        {term.definition}
      </span>
      <span className="mt-2 block text-[12px] font-normal leading-relaxed not-italic text-muted">
        <span className="font-semibold text-brass">Why it matters:</span> {term.why}
      </span>
      <span className="caps mt-2.5 block !text-[9px] not-italic text-muted">
        added to your glossary
      </span>
    </span>
  );
}

export function LearnChip({ slug, children }: { slug: string; children: React.ReactNode }) {
  const { enabled, recordOpen } = useLearn();
  const [open, setOpen] = useState(false);
  const term = glossaryBySlug(slug);
  if (!enabled || !term) return <>{children}</>;
  return (
    <span className="relative inline-block">
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          recordOpen(slug);
        }}
        className="cursor-help border-b border-dotted border-brass text-inherit"
      >
        {children}
      </button>
      {open && <ChipPopover term={term} onClose={() => setOpen(false)} />}
    </span>
  );
}

// A match only counts at word boundaries: letters may not touch either end,
// so "GBP" never triggers the "bp" chip and "warms" never triggers a term.
// Digits are deliberately allowed to touch ("5.3σ", "11bp" must still chip).
const isLetter = (ch: string | undefined) => ch !== undefined && /[a-z]/i.test(ch);

function findWholeWord(haystackLower: string, needle: string): number {
  let from = 0;
  while (from <= haystackLower.length - needle.length) {
    const index = haystackLower.indexOf(needle, from);
    if (index === -1) return -1;
    const before = haystackLower[index - 1];
    const after = haystackLower[index + needle.length];
    if (!isLetter(before) && !isLetter(after)) return index;
    from = index + 1;
  }
  return -1;
}

/** Wraps the first occurrence of each glossary term in `text` with a chip. */
export function Chipped({ text }: { text: string }) {
  const { enabled } = useLearn();
  if (!enabled) return <>{text}</>;

  // Longest matches first so "non-farm payrolls" beats "payrolls".
  const matchers = GLOSSARY.flatMap((g) => g.matches.map((m) => ({ m, slug: g.slug }))).sort(
    (a, b) => b.m.length - a.m.length,
  );
  const used = new Set<string>();
  const nodes: React.ReactNode[] = [];
  let rest = text;
  let key = 0;

  outer: while (rest.length > 0) {
    let best: { index: number; length: number; slug: string } | null = null;
    const lower = rest.toLowerCase();
    for (const { m, slug } of matchers) {
      if (used.has(slug)) continue;
      const index = findWholeWord(lower, m);
      if (index !== -1 && (best === null || index < best.index)) {
        best = { index, length: m.length, slug };
      }
    }
    if (!best) {
      nodes.push(rest);
      break outer;
    }
    used.add(best.slug);
    nodes.push(rest.slice(0, best.index));
    nodes.push(
      <LearnChip key={key++} slug={best.slug}>
        {rest.slice(best.index, best.index + best.length)}
      </LearnChip>,
    );
    rest = rest.slice(best.index + best.length);
  }

  return <>{nodes}</>;
}
