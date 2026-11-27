/** Placeholder rows while the first results load (design "loading" state). */
export function SearchSkeleton() {
  return (
    <div
      role="status"
      aria-label="Searching"
      className="flex animate-pulse flex-col gap-3"
    >
      <span className="h-3 w-28 rounded-full bg-border" />
      {Array.from({ length: 4 }, (_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-2xl bg-muted p-2.5 lg:p-3"
        >
          <span className="size-12 shrink-0 rounded-xl bg-border lg:size-[46px]" />
          <span className="flex flex-1 flex-col gap-2">
            <span className="h-3.5 w-3/5 rounded-full bg-border" />
            <span className="h-2.5 w-2/5 rounded-full bg-border" />
          </span>
          <span className="h-3.5 w-14 rounded-full bg-border" />
        </div>
      ))}
    </div>
  );
}
