interface FooterBandProps {
  edition: number;
  sources: string[];
  fetchedAt: string;
}

/** The slim racing-green band that closes the page — the coachline's bookend. */
export function FooterBand({ edition, sources, fetchedAt }: FooterBandProps) {
  return (
    <footer className="mb-10 mt-6 flex flex-wrap justify-between gap-2.5 rounded-card bg-brg px-6 py-4 text-[11px] tracking-[0.05em] text-cream/75 shadow-card">
      <span>Sources: {sources.join(" · ")}</span>
      <span>
        Edition <span className="figures font-bold text-brass">Nº {edition}</span> · Fetched{" "}
        {new Date(fetchedAt).toLocaleString("en-GB", {
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        })}{" "}
        UTC · Informational only — not investment advice
      </span>
    </footer>
  );
}
