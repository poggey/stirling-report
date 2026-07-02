interface FooterBandProps {
  edition: number;
  sources: string[];
  fetchedAt: string;
}

/** The racing-green band that closes the page — the bookend to the coachline. */
export function FooterBand({ edition, sources, fetchedAt }: FooterBandProps) {
  return (
    <footer className="mt-12 bg-brg text-cream">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-start justify-between gap-6 px-4 py-8 sm:px-6">
        <div className="max-w-xl">
          <p className="font-display text-lg font-semibold">
            Stirling<span className="text-brass">.</span>
          </p>
          <p className="mt-2 text-xs leading-relaxed text-cream/75">
            Sources: {sources.join(" · ")}
          </p>
          <p className="figures mt-1 text-xs text-cream/60">
            Data fetched{" "}
            {new Date(fetchedAt).toLocaleString("en-GB", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            UTC · refreshes every 30 minutes
          </p>
          <p className="mt-3 text-xs font-medium text-cream/90">
            Informational only — not investment advice.
          </p>
        </div>
        <p className="text-right">
          <span className="block text-[11px] uppercase tracking-[0.14em] text-cream/60">
            Edition
          </span>
          <span className="figures font-display text-3xl font-semibold text-brass">
            Nº {edition}
          </span>
        </p>
      </div>
    </footer>
  );
}
