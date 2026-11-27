"use client";

import { ChevronDown, Search } from "lucide-react";
import Form from "next/form";
import { useRef, type KeyboardEvent } from "react";

import { useSearchStore } from "@/features/search/store";
import { cn } from "@/lib/utils";

type Props = {
  /** Shows the "All Scents" collection picker (desktop header). */
  collections?: { slug: string; name: string }[];
  className?: string;
  /** Runs before the search popup opens (the mobile menu closes itself). */
  onOpenSearch?: () => void;
};

// Plain GET form to /search, so it works before hydration. Once JS has
// loaded, a click or the first typed character opens the search popup
// instead (focus alone doesn't, so tabbing past the field stays possible).
export function HeaderSearch({ collections, className, onOpenSearch }: Props) {
  const openSearch = useSearchStore((s) => s.openSearch);
  const selectRef = useRef<HTMLSelectElement>(null);

  function open(query = "") {
    onOpenSearch?.();
    openSearch({ query, collection: selectRef.current?.value });
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    const typed = e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey;
    if (!typed && !["Enter", "ArrowDown"].includes(e.key)) return;
    e.preventDefault();
    open(`${e.currentTarget.value}${typed ? e.key : ""}`);
  }

  return (
    <Form
      action="/search"
      role="search"
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
            ref={selectRef}
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
        aria-haspopup="dialog"
        type="search"
        name="q"
        required
        maxLength={80}
        autoComplete="off"
        placeholder={
          collections
            ? "Search oud, musk, attar, amber…"
            : "Search oud, musk, attar…"
        }
        onClick={(e) => open(e.currentTarget.value)}
        onKeyDown={onKeyDown}
        onPaste={(e) => {
          e.preventDefault();
          open(e.clipboardData.getData("text").slice(0, 80));
        }}
        className="h-full min-w-0 flex-1 cursor-text bg-transparent px-3 text-[15px] outline-none placeholder:text-brand-deep/50"
      />
      {collections && (
        <button
          type="submit"
          aria-label="Search"
          onClick={(e) => {
            // Submits /search without JS; with JS the popup takes over.
            e.preventDefault();
            open(e.currentTarget.form?.q.value);
          }}
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-mid text-white transition-colors hover:bg-brand-deep"
        >
          <Search className="size-5" aria-hidden />
        </button>
      )}
    </Form>
  );
}
