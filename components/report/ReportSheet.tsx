"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Chipped } from "@/components/learn/LearnProvider";
import { Medallion } from "@/components/Medallion";
import { parseBriefing } from "@/lib/briefing/template";
import type { Briefings } from "@/lib/editions/types";

export interface ReportStat {
  label: string;
  text: string;
  tone: "rise" | "fall" | "flat";
}

export interface ReportPayload {
  dateLabel: string;
  edition: number;
  weatherLabel: string;
  petals: number;
  storm: boolean;
  headline: string;
  /** True before the evening snapshot: "As of 14:32 — markets open". */
  intraday: boolean;
  asOf: string;
  stats: ReportStat[];
  briefings: Briefings;
}

const ReportContext = createContext<{ open: boolean; setOpen: (v: boolean) => void }>({
  open: false,
  setOpen: () => {},
});

const TONE_TABS = [
  { key: "deskNote", label: "Desk note" },
  { key: "plainEnglish", label: "Plain English" },
  { key: "studyMode", label: "Study mode" },
  { key: "template", label: "Template" },
] as const;

type ToneKey = (typeof TONE_TABS)[number]["key"];

const STAT_TONE = {
  rise: "text-rise",
  fall: "text-fall",
  flat: "text-muted",
} as const;

export function ReportProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);
  return (
    <ReportContext.Provider value={{ open, setOpen }}>{children}</ReportContext.Provider>
  );
}

export function IssueButton({ label }: { label?: string }) {
  const { setOpen } = useContext(ReportContext);
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="whitespace-nowrap rounded-[10px] bg-brg px-3 py-[11px] text-[13px] font-semibold text-cream transition-colors hover:bg-brg-600 active:translate-y-px sm:px-5"
    >
      {label ?? (
        <>
          Issue<span className="hidden min-[430px]:inline"> today&rsquo;s</span> report
        </>
      )}
    </button>
  );
}

export function ReportSheet({ payload }: { payload: ReportPayload }) {
  const { open, setOpen } = useContext(ReportContext);
  const aiTones = TONE_TABS.filter(
    (t) => t.key !== "template" && payload.briefings[t.key],
  );
  const [tone, setTone] = useState<ToneKey>(aiTones[0]?.key ?? "template");

  const text =
    tone === "template"
      ? payload.briefings.template
      : (payload.briefings[tone] ?? payload.briefings.template);
  const { paragraphs, watch } = parseBriefing(text);
  const isAi = tone !== "template" && Boolean(payload.briefings[tone]);

  return (
    <>
      <div
        onClick={() => setOpen(false)}
        aria-hidden="true"
        className={`fixed inset-0 z-50 bg-ink/40 transition-opacity duration-300 motion-reduce:transition-none ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />
      <article
        id="report-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Daily report"
        aria-hidden={!open}
        className={`fixed left-1/2 top-[4vh] z-[60] max-h-[92vh] w-[min(700px,94vw)] overflow-y-auto rounded-[18px] bg-ivory-1 shadow-[0_24px_80px_rgba(23,37,30,.28)] transition-transform duration-500 [transition-timing-function:cubic-bezier(.22,.9,.26,1)] motion-reduce:transition-none ${open ? "-translate-x-1/2 translate-y-0" : "-translate-x-1/2 translate-y-[106vh]"}`}
      >
        <div className="relative flex items-start justify-between gap-6 rounded-t-[18px] bg-brg px-6 py-7 text-cream sm:px-[38px]">
          <div>
            <div className="caps text-brass">
              The daily briefing · {TONE_TABS.find((t) => t.key === tone)?.label}
            </div>
            <h2 className="mt-2 max-w-[22ch] font-display text-[26px] font-[520] leading-[1.15]">
              {payload.headline}
            </h2>
            <div className="caps mt-2.5 !font-semibold !tracking-[0.1em] text-cream/60">
              {payload.intraday
                ? `As of ${payload.asOf} — markets open · intraday edition`
                : `${payload.dateLabel} · Edition Nº ${payload.edition} · ${payload.weatherLabel}`}
            </div>
          </div>
          <div className="hidden shrink-0 sm:block">
            <Medallion petals={payload.petals} storm={payload.storm} size={84} background={false} />
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="absolute right-4 top-4 h-8 w-8 rounded-full bg-cream/10 text-sm text-cream hover:bg-cream/20 print:hidden"
          >
            ✕
          </button>
        </div>

        <div className="px-6 pb-9 pt-7 sm:px-[38px]">
          <div className="mb-4 flex flex-wrap gap-1.5 print:hidden" role="tablist" aria-label="Briefing tone">
            {TONE_TABS.map((t) => {
              const available = t.key === "template" || Boolean(payload.briefings[t.key]);
              return (
                <button
                  key={t.key}
                  role="tab"
                  aria-selected={tone === t.key}
                  disabled={!available}
                  onClick={() => setTone(t.key)}
                  title={available ? undefined : "AI briefing not cached for this edition"}
                  className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${
                    tone === t.key
                      ? "border-brg bg-brg text-cream"
                      : available
                        ? "border-line text-muted hover:text-brg"
                        : "cursor-not-allowed border-line text-line"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          <div className="figures mb-[18px] flex flex-wrap gap-x-4 gap-y-1 rounded-xl bg-sage px-4 py-3 text-[12.5px] font-bold">
            {payload.stats.map((s) => (
              <span key={s.label} className={STAT_TONE[s.tone]}>
                {s.label} {s.text}
              </span>
            ))}
          </div>

          {paragraphs.map((p) => (
            <p key={p.slice(0, 40)} className="mb-3.5 text-[15px] leading-[1.7] text-[#2A3830]">
              <Chipped text={p} />
            </p>
          ))}

          {watch.length > 0 && (
            <div className="mt-5 border-t border-line pt-3.5">
              <div className="caps text-muted">What to watch tomorrow</div>
              <ol className="ml-5 mt-2 list-decimal">
                {watch.map((w) => (
                  <li key={w.slice(0, 40)} className="mb-1.5 text-[13.5px] text-[#42504A]">
                    {w}
                  </li>
                ))}
              </ol>
            </div>
          )}

          <span className="caps mt-4 inline-block rounded-full border border-line px-2.5 py-1 !text-[9.5px] !font-bold text-muted">
            {isAi
              ? "AI-generated · every figure from the day's snapshot"
              : "Deterministic template · no AI call"}
          </span>
        </div>
      </article>
    </>
  );
}
