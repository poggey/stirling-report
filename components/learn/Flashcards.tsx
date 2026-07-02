"use client";

import { useState } from "react";
import type { Flashcard } from "@/lib/prep";

/** The archive drill: flip for the answer, step through the deck. */
export function Flashcards({ cards }: { cards: Flashcard[] }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (cards.length === 0) {
    return (
      <p className="rounded-lg bg-sage px-4 py-3 text-[13px] text-muted">
        The drill builds itself from archived editions — cards appear as the
        archive grows.
      </p>
    );
  }

  const card = cards[index];
  return (
    <div>
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        aria-label={flipped ? "Show question" : "Reveal answer"}
        className={`block min-h-[140px] w-full rounded-card border p-5 text-left shadow-card transition-colors ${
          flipped ? "border-brass bg-sage" : "border-line bg-ivory-1"
        }`}
      >
        <span className="caps block !text-[9.5px] text-muted">
          {flipped ? "Answer" : "Question"} · card {index + 1} of {cards.length}
        </span>
        <span className="mt-2 block font-display text-[17px] leading-snug text-ink">
          {flipped ? card.answer : card.question}
        </span>
        <span className="caps mt-3 block !text-[9px] text-brass">
          {flipped ? "click to hide" : "click to reveal"}
        </span>
      </button>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          disabled={index === 0}
          onClick={() => {
            setIndex((i) => i - 1);
            setFlipped(false);
          }}
          className="rounded-full border border-line px-3.5 py-1.5 text-xs font-semibold text-muted enabled:hover:text-brg disabled:opacity-40"
        >
          ← Previous
        </button>
        <button
          type="button"
          disabled={index >= cards.length - 1}
          onClick={() => {
            setIndex((i) => i + 1);
            setFlipped(false);
          }}
          className="rounded-full border border-line px-3.5 py-1.5 text-xs font-semibold text-muted enabled:hover:text-brg disabled:opacity-40"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
