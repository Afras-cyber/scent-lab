import { MessageCircle, Search } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { shopConfig } from "@/config";
import type { ShopFilters } from "@/features/catalog/schemas";
import { waLink } from "@/lib/whatsapp/link";

import { clearedFilters, shopHref } from "./shop-href";

/** Empty state when no product matches the filters. */
export function NoResults({ filters }: { filters: ShopFilters }) {
  const { title, text, whatsappMessage, popularTitle, popularCollections } =
    shopConfig.noResults;

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-10 text-center lg:py-16">
      <span className="inline-flex size-[88px] items-center justify-center rounded-full bg-secondary text-heading">
        <Search className="size-9" aria-hidden />
      </span>
      <h2 className="text-2xl font-semibold lg:text-3xl">{title}</h2>
      <p className="text-sm text-muted-foreground lg:text-[15px]">{text}</p>
      <div className="mt-2 flex w-full flex-col gap-3">
        <Button asChild size="lg" className="h-13">
          <Link href={shopHref(clearedFilters(filters))} scroll={false}>
            Clear all filters
          </Link>
        </Button>
        <Button asChild variant="whatsapp" size="lg" className="h-13">
          <a
            href={waLink(whatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle aria-hidden />
            Ask us on WhatsApp
          </a>
        </Button>
      </div>
      <p className="mt-4 text-sm font-semibold text-heading">{popularTitle}</p>
      <ul className="flex flex-wrap justify-center gap-2">
        {popularCollections.map((c) => (
          <li key={c.slug}>
            <Link
              href={shopHref({ collection: [c.slug] })}
              scroll={false}
              className="inline-flex h-10 items-center rounded-full border bg-card px-4 text-sm font-medium text-heading transition-colors hover:bg-muted"
            >
              {c.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
