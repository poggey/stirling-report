import type { Headline } from "@/lib/sources/wires";

interface WiresPanelProps {
  headlines: Headline[];
  /** "live" refreshes on the intraday cache; "archived" is the snapshot copy. */
  mode: "live" | "archived";
}

function timeOf(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * On the wires (WHITEPAPER §5): official-source headlines, linked out —
 * context for the numbers, never the ranking. Live copies refresh every 30
 * minutes with the rest of the page; each edition freezes its own set.
 */
export function WiresPanel({ headlines, mode }: WiresPanelProps) {
  return (
    <section
      aria-label="On the wires — headlines from official sources"
      className="mt-6 rounded-card border border-line bg-ivory-1 px-6 py-5 shadow-card sm:px-7"
    >
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="coachline-under font-display text-[19px] font-[540] text-ink">
          On the wires
        </h3>
        <span className="caps !font-medium text-muted">
          {mode === "live"
            ? "BBC · BoE · Fed · ECB · refreshes every 30 min"
            : "as they stood at the snapshot"}
        </span>
      </div>

      {headlines.length === 0 ? (
        <p className="rounded-lg bg-sage px-4 py-3 text-[13px] text-muted">
          Wire feeds unreachable — headlines return with the next refresh.
        </p>
      ) : (
        <>
          {/* The leader: highest wire salience, pinned however old it gets */}
          <a
            href={headlines[0].link}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-line pb-3"
          >
            <span className="caps shrink-0 !text-[9px] !font-bold !tracking-[0.16em] text-brass">
              Leading
            </span>
            <span className="font-display text-[17.5px] leading-snug text-ink group-hover:text-brg-600">
              {headlines[0].title}
            </span>
            <span className="caps ml-auto shrink-0 !text-[9px] text-muted">
              {headlines[0].source} · {timeOf(headlines[0].publishedAt)}
            </span>
          </a>

          <ul className="mt-1 grid grid-cols-1 gap-x-8 min-[960px]:grid-cols-2">
            {headlines.slice(1).map((h) => (
              <li key={h.link} className="border-b border-[#EAEBDF] py-2 last:border-b-0 min-[960px]:[&:nth-last-child(2)]:border-b-0">
                <a
                  href={h.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-baseline gap-3"
                >
                  <span className="figures caps shrink-0 !text-[9px] !font-bold text-brass">
                    {timeOf(h.publishedAt)}
                  </span>
                  <span className="text-[13.5px] leading-snug text-ink group-hover:text-brg-600">
                    {h.title}
                  </span>
                  <span className="caps ml-auto hidden shrink-0 !text-[9px] text-muted sm:inline">
                    {h.source}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </>
      )}

      <p className="mt-3 border-t border-line pt-2 text-[11px] text-muted">
        Headlines only, from official feeds, always linked to source. The
        leading wire is chosen by an auditable salience score (keyword tier ×
        source × recency half-life) so a big story is never buried by later
        trivia; the rest run newest-first. The wires give the numbers context
        — the market salience ranking alone decides the story.
      </p>
    </section>
  );
}
