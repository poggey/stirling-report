import { splitWires, type Headline } from "@/lib/sources/wires";

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
 * context for the numbers, never the ranking. Every high-salience story
 * leads (several big stories all surface, none buried); the rest run as a
 * newest-first ticker. Live copies refresh every 30 minutes; each edition
 * freezes its own set.
 */
export function WiresPanel({ headlines, mode }: WiresPanelProps) {
  const { leaders, latest } = splitWires(headlines);

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

      {leaders.length === 0 ? (
        <p className="rounded-lg bg-sage px-4 py-3 text-[13px] text-muted">
          Wire feeds unreachable — headlines return with the next refresh.
        </p>
      ) : (
        <>
          {/* Every high-salience story leads — a second big story is never
              hidden behind the first */}
          <ul className="border-b border-line pb-2.5">
            {leaders.map((h, i) => (
              <li key={h.link} className={i > 0 ? "mt-2.5 border-t border-[#EAEBDF] pt-2.5" : ""}>
                <a
                  href={h.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block"
                >
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="caps shrink-0 !text-[9px] !font-bold !tracking-[0.16em] text-brass">
                      Leading
                    </span>
                    <span className="caps shrink-0 !text-[9px] text-muted">
                      {h.source} · {timeOf(h.publishedAt)}
                    </span>
                  </span>
                  <span className="mt-1 block max-w-[75ch] font-display text-[17.5px] leading-snug text-ink group-hover:text-brg-600">
                    {h.title}
                  </span>
                </a>
              </li>
            ))}
          </ul>

          {latest.length > 0 && (
            <>
              <p className="caps mt-3 !text-[9px] !font-bold text-muted">Just published</p>
              <ul className="mt-1 grid grid-cols-1 gap-x-8 min-[960px]:grid-cols-2">
                {latest.map((h) => (
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
        </>
      )}

      <p className="mt-3 border-t border-line pt-2 text-[11px] text-muted">
        Headlines only, from official feeds, always linked to source. Leading
        stories are every headline above an auditable salience threshold
        (keyword tier × source × recency half-life) — several big stories all
        surface, and none is buried by later trivia. The wires give the
        numbers context — the market salience ranking alone decides the story.
      </p>
    </section>
  );
}
