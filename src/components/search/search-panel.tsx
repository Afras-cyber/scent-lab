"use client";

import {
  ArrowRight,
  ArrowUpDown,
  Clock,
  Droplet,
  LayoutGrid,
  Search,
  TrendingUp,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import { collectionCountLabel } from "@/components/collections/collection-href";
import { searchConfig } from "@/config";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useSearchResults } from "@/features/search/hooks";
import { useRecentSearches } from "@/features/search/recent";
import { MIN_QUERY_LENGTH, searchHref } from "@/features/search/schemas";
import type { SearchResults } from "@/features/search/search";
import { fillMessage } from "@/lib/whatsapp/link";
import { cn } from "@/lib/utils";

import { Highlight } from "./highlight";
import {
  Chip,
  CollectionRow,
  ProductRow,
  QuickLinkRow,
  RemoveButton,
  SectionLabel,
  type OptionProps,
} from "./search-rows";
import { SearchNone } from "./search-none";
import { SearchSkeleton } from "./search-skeleton";

export type QuickLink = { label: string; href: string; count: string };

/** What Enter (or a click) does with an option: open a page or search. */
type Action = { href: string } | { query: string };

type Props = {
  initialQuery: string;
  /** Collection picked in the header select; limits the perfume results. */
  collection?: string;
  collectionNames: Record<string, string>;
  quickLinks: QuickLink[];
  onClose: () => void;
};

/**
 * Body of the search popup: the field, the empty / loading / results / none
 * views and the footer. Focus stays in the field; ↑/↓ move a highlighted
 * option (combobox pattern) and Enter opens it.
 */
export function SearchPanel({
  initialQuery,
  collection: initialCollection,
  collectionNames,
  quickLinks,
  onClose,
}: Props) {
  const router = useRouter();
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const desktop = useMediaQuery("(min-width: 64rem)");
  const [query, setQuery] = useState(initialQuery);
  const [collection, setCollection] = useState(initialCollection);
  const [active, setActive] = useState(-1);
  const { recent, add, remove, clear } = useRecentSearches();
  const { data, enabled } = useSearchResults(query, collection);

  const trimmed = query.trim();
  const searching = trimmed.length >= MIN_QUERY_LENGTH;
  const results: SearchResults | undefined = searching ? data : undefined;
  const view = !searching
    ? "empty"
    : !results
      ? "loading"
      : results.total + results.collections.length + results.notes.length > 0
        ? "results"
        : "none";

  // The options of the current view, in screen order.
  const actions: Action[] = [];
  if (view === "empty") {
    recent.forEach((q) => actions.push({ query: q }));
    searchConfig.popularSearches.forEach((c) =>
      actions.push("href" in c ? { href: c.href } : { query: c.query }),
    );
    quickLinks.forEach((l) => actions.push({ href: l.href }));
  } else if (view === "results" && results) {
    results.products.forEach((p) =>
      actions.push({ href: `/product/${p.slug}` }),
    );
    results.collections.forEach((c) =>
      actions.push({ href: `/collections/${c.slug}` }),
    );
    results.notes.forEach((n) =>
      actions.push({ href: `/shop?note=${n.slug}` }),
    );
  } else if (view === "none") {
    searchConfig.noResults.suggestions.forEach((c) =>
      actions.push("href" in c ? { href: c.href } : { query: c.query }),
    );
  }

  // New results highlight their first row, as in the design; the empty and
  // none views start with nothing highlighted.
  const resultsKey = view === "results" ? `${trimmed}|${results?.total}` : view;
  const [lastKey, setLastKey] = useState(resultsKey);
  if (lastKey !== resultsKey) {
    setLastKey(resultsKey);
    setActive(view === "results" ? 0 : -1);
  }

  const optionId = (i: number) => `${listboxId}-option-${i}`;
  useEffect(() => {
    if (active < 0) return;
    document
      .getElementById(optionId(active))
      ?.scrollIntoView({ block: "nearest" });
    // optionId only depends on listboxId, which never changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const option = (i: number): OptionProps => ({
    id: optionId(i),
    role: "option",
    "aria-selected": i === active,
    "data-active": i === active,
    onPointerMove: () => {
      if (i !== active) setActive(i);
    },
  });

  /** Leaving through a result: remember the query and close. */
  function navigated() {
    if (searching) add(trimmed);
    onClose();
  }

  function search(q: string) {
    setQuery(q);
    inputRef.current?.focus();
  }

  function run(action: Action) {
    if ("query" in action) {
      search(action.query);
      return;
    }
    router.push(action.href);
    navigated();
  }

  const seeAllHref = searchHref(trimmed, collection);
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (actions.length === 0) return;
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActive((i) =>
        i < 0 && step < 0
          ? actions.length - 1
          : (i + step + actions.length) % actions.length,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = actions[active];
      if (target) run(target);
      else if (searching) run({ href: seeAllHref });
    }
  };

  let index = 0;
  const next = () => index++;

  return (
    <>
      <div className="flex shrink-0 items-center gap-3 px-5 pt-5 pb-3 lg:gap-3 lg:border-b lg:px-5 lg:pt-[18px] lg:pb-[18px]">
        <div className="flex h-14 min-w-0 flex-1 items-center gap-3 rounded-2xl border-2 border-gold bg-background px-4 focus-within:ring-[3px] focus-within:ring-gold/25 lg:h-[52px] lg:rounded-[14px]">
          <Search
            className="size-5 shrink-0 text-gold-ink"
            strokeWidth={2.25}
            aria-hidden
          />
          <input
            ref={inputRef}
            autoFocus
            type="search"
            enterKeyHint="search"
            role="combobox"
            aria-label="Search products"
            aria-expanded={actions.length > 0}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={active >= 0 ? optionId(active) : undefined}
            maxLength={80}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={
              desktop
                ? searchConfig.placeholder.desktop
                : searchConfig.placeholder.mobile
            }
            className="h-full min-w-0 flex-1 bg-transparent text-[17px] font-medium text-heading outline-none placeholder:font-normal placeholder:text-muted-foreground/80 lg:text-base [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => search("")}
              className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-muted-foreground/70 text-white transition-colors hover:bg-muted-foreground"
            >
              <X className="size-4" strokeWidth={3} aria-hidden />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 text-[17px] font-medium text-heading lg:hidden"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close search"
          className="hidden h-9 shrink-0 items-center rounded-lg bg-secondary px-2.5 text-xs font-bold text-secondary-foreground transition-colors hover:bg-secondary/70 lg:inline-flex"
        >
          ESC
        </button>
      </div>

      <div
        id={listboxId}
        role="listbox"
        aria-label="Search suggestions"
        className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain px-5 pt-3 pb-6 lg:gap-5 lg:pt-4 lg:pb-5"
      >
        {collection && searching && (
          <p className="-mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            In {collectionNames[collection] ?? collection}
            <button
              type="button"
              onClick={() => setCollection(undefined)}
              className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground"
            >
              Search everywhere
              <X className="size-3" strokeWidth={3} aria-hidden />
            </button>
          </p>
        )}

        {view === "empty" && (
          <>
            {recent.length > 0 && (
              <Group
                label={searchConfig.labels.recent}
                icon={Clock}
                action={
                  <button
                    type="button"
                    onClick={clear}
                    className="text-sm font-medium text-heading hover:underline"
                  >
                    Clear
                  </button>
                }
                chips
              >
                {recent.map((q) => {
                  const props = option(next());
                  return (
                    <span
                      key={q}
                      {...props}
                      className="inline-flex h-10 items-center gap-2 rounded-full border border-input bg-card pr-3 pl-4 text-[15px] font-medium text-heading transition-colors data-[active=true]:border-gold data-[active=true]:bg-secondary lg:h-9 lg:pl-3.5 lg:text-sm"
                    >
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => search(q)}
                        className="inline-flex items-center gap-2"
                      >
                        <Clock
                          className="size-4 text-muted-foreground"
                          strokeWidth={2.25}
                          aria-hidden
                        />
                        {q}
                      </button>
                      <RemoveButton
                        aria-label={`Remove ${q} from recent searches`}
                        onClick={() => remove(q)}
                      />
                    </span>
                  );
                })}
              </Group>
            )}

            {searchConfig.popularSearches.length > 0 && (
              <Group
                label={searchConfig.labels.popular}
                icon={TrendingUp}
                chips
              >
                {searchConfig.popularSearches.map((c) => (
                  <Chip
                    key={c.label}
                    icon="popular"
                    option={option(next())}
                    href={"href" in c ? c.href : undefined}
                    onNavigate={navigated}
                    onClick={"query" in c ? () => search(c.query) : undefined}
                  >
                    {c.label}
                  </Chip>
                ))}
              </Group>
            )}

            {quickLinks.length > 0 && (
              <Group label={searchConfig.labels.quickLinks} icon={LayoutGrid}>
                {quickLinks.map((l) => (
                  <QuickLinkRow
                    key={l.href}
                    {...l}
                    option={option(next())}
                    onNavigate={navigated}
                  />
                ))}
              </Group>
            )}
          </>
        )}

        {view === "loading" && <SearchSkeleton />}

        {view === "results" && results && (
          <>
            {results.products.length > 0 && (
              <Group
                label={`${searchConfig.labels.perfumes} (${results.total})`}
                icon={Droplet}
              >
                {results.products.map((p) => (
                  <ProductRow
                    key={p.id}
                    product={p}
                    query={trimmed}
                    option={option(next())}
                    onNavigate={navigated}
                  />
                ))}
              </Group>
            )}
            {results.collections.length > 0 && (
              <Group
                label={`${searchConfig.labels.collections} (${results.collections.length})`}
                icon={LayoutGrid}
              >
                {results.collections.map((c) => (
                  <CollectionRow
                    key={c.slug}
                    collection={c}
                    count={collectionCountLabel(c.slug, c.count)}
                    query={trimmed}
                    option={option(next())}
                    onNavigate={navigated}
                  />
                ))}
              </Group>
            )}
            {results.notes.length > 0 && (
              <Group
                label={`${searchConfig.labels.notes} (${results.notes.length})`}
                icon={Droplet}
                chips
              >
                {results.notes.map((n) => (
                  <Chip
                    key={n.slug}
                    href={`/shop?note=${n.slug}`}
                    option={option(next())}
                    onNavigate={navigated}
                    className="border-transparent bg-secondary hover:bg-secondary/70"
                  >
                    <Highlight text={n.name} query={trimmed} />
                  </Chip>
                ))}
              </Group>
            )}
          </>
        )}

        {view === "none" && (
          <SearchNone query={trimmed} className="py-4 lg:py-6">
            {searchConfig.noResults.suggestions.map((c) => (
              <Chip
                key={c.label}
                option={option(next())}
                href={"href" in c ? c.href : undefined}
                onNavigate={navigated}
                onClick={"query" in c ? () => search(c.query) : undefined}
              >
                {c.label}
              </Chip>
            ))}
          </SearchNone>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-6 bg-muted px-5 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] lg:py-[18px] lg:pr-6 lg:pl-6">
        <ul
          className="hidden items-center gap-4 text-sm text-muted-foreground lg:flex"
          aria-hidden
        >
          <li className="flex items-center gap-2">
            <Kbd>
              <ArrowUpDown className="size-3.5" strokeWidth={2.5} />
            </Kbd>
            navigate
          </li>
          <li className="flex items-center gap-2">
            <Kbd>Enter</Kbd>
            open
          </li>
          <li className="flex items-center gap-2">
            <Kbd>Esc</Kbd>
            close
          </li>
        </ul>
        <Link
          href={view === "results" && results ? seeAllHref : "/shop"}
          onClick={navigated}
          className="inline-flex h-14 flex-1 items-center justify-center gap-2.5 rounded-full bg-primary px-7 text-[17px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 lg:ml-auto lg:h-[46px] lg:flex-none lg:text-base"
        >
          {view === "results" && results
            ? fillMessage(searchConfig.labels.seeAll, { count: results.total })
            : searchConfig.labels.browse}
          <ArrowRight className="size-5" strokeWidth={2.25} aria-hidden />
        </Link>
      </div>
      {/* Announces result changes to screen readers. */}
      <p className="sr-only" aria-live="polite">
        {enabled && view === "results" && results
          ? `${results.total} ${results.total === 1 ? "perfume" : "perfumes"} found`
          : view === "none"
            ? "No results"
            : ""}
      </p>
    </>
  );
}

function Group({
  label,
  icon,
  action,
  chips = false,
  children,
}: {
  label: string;
  icon: typeof Clock;
  action?: ReactNode;
  chips?: boolean;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <section
      role="group"
      aria-labelledby={id}
      className="flex flex-col gap-3 lg:gap-2.5"
    >
      <SectionLabel id={id} icon={icon} action={action}>
        {label}
      </SectionLabel>
      <div
        className={cn(
          chips ? "flex flex-wrap gap-2.5 lg:gap-2" : "flex flex-col gap-2.5",
        )}
      >
        {children}
      </div>
    </section>
  );
}

function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex h-7 min-w-8 items-center justify-center rounded-md border border-input bg-card px-2 font-sans text-xs font-semibold text-heading">
      {children}
    </kbd>
  );
}
