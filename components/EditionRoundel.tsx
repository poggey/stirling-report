/** The door roundel (WHITEPAPER §8.8): the edition number as the day's race number. */
export function EditionRoundel({ edition }: { edition: number }) {
  return (
    <div
      className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-brg bg-ivory-1"
      title={`Edition Nº ${edition}`}
    >
      <span className="figures font-display text-lg font-semibold text-brg">
        {edition}
      </span>
    </div>
  );
}
