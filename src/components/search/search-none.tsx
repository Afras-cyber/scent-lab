import { MessageCircle, Search } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { searchConfig, whatsappConfig } from "@/config";
import { cn } from "@/lib/utils";
import { fillMessage, waLink } from "@/lib/whatsapp/link";

/**
 * "Nothing found" state of the popup and /search: suggestion chips
 * (`children`) and a WhatsApp chat that carries the query.
 */
export function SearchNone({
  query,
  children,
  className,
}: {
  query: string;
  children: ReactNode;
  className?: string;
}) {
  const { title, text, whatsappLabel } = searchConfig.noResults;

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 text-center lg:gap-3.5",
        className,
      )}
    >
      <span className="inline-flex size-[68px] items-center justify-center rounded-full bg-secondary text-heading lg:size-[76px]">
        <Search className="size-7 lg:size-8" aria-hidden />
      </span>
      <h2 className="mt-1 text-2xl font-semibold break-words lg:text-[26px]">
        {fillMessage(title, { query })}
      </h2>
      <p className="text-[15px] text-muted-foreground">{text}</p>
      <div className="flex flex-wrap justify-center gap-2.5">{children}</div>
      <Button
        asChild
        variant="whatsapp"
        size="lg"
        className="mt-1 h-13 w-full max-w-[600px] text-base font-semibold"
      >
        <a
          href={waLink(fillMessage(whatsappConfig.messages.search, { query }))}
          target="_blank"
          rel="noopener noreferrer"
        >
          <MessageCircle aria-hidden />
          {whatsappLabel}
        </a>
      </Button>
    </div>
  );
}
