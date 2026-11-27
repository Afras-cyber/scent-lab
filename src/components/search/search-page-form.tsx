import { Search } from "lucide-react";
import Form from "next/form";

import { searchConfig } from "@/config";

/** Large search field on /search. A plain GET form, like the header's. */
export function SearchPageForm({ query }: { query: string }) {
  return (
    <Form
      action="/search"
      role="search"
      className="flex h-14 items-center gap-3 rounded-2xl border-2 border-gold bg-card pr-1.5 pl-4 focus-within:ring-[3px] focus-within:ring-gold/25 lg:h-16 lg:pl-5"
    >
      <Search
        className="size-5 shrink-0 text-gold-ink"
        strokeWidth={2.25}
        aria-hidden
      />
      <input
        // Remount when the query changes, so the field shows the new value.
        key={query}
        type="search"
        name="q"
        required
        maxLength={80}
        defaultValue={query}
        aria-label="Search products"
        placeholder={searchConfig.placeholder.desktop}
        className="h-full min-w-0 flex-1 bg-transparent text-base font-medium text-heading outline-none placeholder:font-normal placeholder:text-muted-foreground/80 lg:text-lg"
      />
      <button
        type="submit"
        className="inline-flex h-11 shrink-0 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 lg:h-12 lg:px-7 lg:text-[15px]"
      >
        Search
      </button>
    </Form>
  );
}
