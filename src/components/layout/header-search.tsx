import { ChevronDown, Search } from "lucide-react";
import Form from "next/form";
import type { FormEventHandler } from "react";

import { cn } from "@/lib/utils";

type Props = {
  /** Shows the "All Scents" collection picker (desktop header). */
  collections?: { slug: string; name: string }[];
  className?: string;
  onSubmit?: FormEventHandler<HTMLFormElement>;
};

// Plain GET form to /search, so it works before hydration. next/form turns it
// into a client-side navigation once JS has loaded.
export function HeaderSearch({ collections, className, onSubmit }: Props) {
  return (
    <Form
      action="/search"
      role="search"
      onSubmit={onSubmit}
      className={cn(
        "flex h-12 items-center rounded-full border-2 border-gold bg-white pr-1 text-brand-deep",
        !collections && "pl-4",
        className,
      )}
    >
      {collections ? (
        <div className="relative shrink-0">
          <label htmlFor="search-collection" className="sr-only">
            Collection
          </label>
          <select
            id="search-collection"
            name="collection"
            defaultValue=""
            className="h-11 cursor-pointer appearance-none rounded-l-full bg-transparent pr-8 pl-5 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            <option value="">All Scents</option>
            {collections.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute top-1/2 right-2 size-4 -translate-y-1/2"
            aria-hidden
          />
        </div>
      ) : (
        <Search className="size-5 shrink-0" aria-hidden />
      )}
      <input
        aria-label="Search products"
        type="search"
        name="q"
        required
        maxLength={80}
        placeholder={
          collections
            ? "Search oud, musk, attar, amber…"
            : "Search oud, musk, attar…"
        }
        className="h-full min-w-0 flex-1 bg-transparent px-3 text-[15px] outline-none placeholder:text-brand-deep/50"
      />
      {collections && (
        <button
          type="submit"
          aria-label="Search"
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-mid text-white transition-colors hover:bg-brand-deep"
        >
          <Search className="size-5" aria-hidden />
        </button>
      )}
    </Form>
  );
}
