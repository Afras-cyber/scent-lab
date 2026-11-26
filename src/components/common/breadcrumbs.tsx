import { ChevronRight } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

export type Crumb = { label: string; href?: string };

/** "Home › Shop" trail. The last crumb is the current page. */
export function Breadcrumbs({
  items,
  className,
}: {
  items: Crumb[];
  className?: string;
}) {
  return (
    <nav aria-label="Breadcrumb" className={cn("text-sm", className)}>
      <ol className="flex flex-wrap items-center gap-1.5 text-muted-foreground">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={item.label} className="flex items-center gap-1.5">
              {item.href && !last ? (
                <Link
                  href={item.href}
                  className="transition-colors hover:text-heading"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={last ? "page" : undefined}
                  className="font-medium text-heading"
                >
                  {item.label}
                </span>
              )}
              {!last && <ChevronRight className="size-3.5" aria-hidden />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
