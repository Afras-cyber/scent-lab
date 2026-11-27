const block = "animate-pulse rounded-2xl bg-muted";

/** Placeholder while a product page (or the quick view) loads. */
export function ProductSkeleton({ compact = false }: { compact?: boolean }) {
  const info = (
    <div className="flex flex-col gap-4">
      <div className={`${block} h-6 w-40 rounded-full`} />
      <div className={`${block} h-10 w-3/4`} />
      <div className={`${block} h-5 w-1/2`} />
      <div className={`${block} h-16 w-full`} />
      <div className={`${block} h-10 w-40`} />
      <div className={`${block} h-14 w-full`} />
      <div className={`${block} h-12 w-full rounded-full`} />
      <div className={`${block} h-12 w-full rounded-full`} />
    </div>
  );

  if (compact) {
    return (
      <div className="grid gap-6 p-5 md:grid-cols-2 lg:p-8" aria-busy>
        <div className={`${block} aspect-square`} />
        {info}
      </div>
    );
  }

  return (
    <div
      className="container-page flex flex-col gap-6 pt-4 pb-16 lg:pt-6"
      aria-busy
    >
      <div className={`${block} h-4 w-64`} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,500px)] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_552px] xl:gap-12">
        <div className={`${block} aspect-square lg:aspect-[600/516]`} />
        {info}
      </div>
    </div>
  );
}
