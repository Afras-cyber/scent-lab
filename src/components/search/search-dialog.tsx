"use client";

import { Dialog } from "radix-ui";
import { useEffect } from "react";

import { useSearchStore } from "@/features/search/store";

import { SearchPanel, type QuickLink } from "./search-panel";

function isTypingTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
  );
}

/**
 * The search popup: a centered modal on desktop and a bottom sheet on mobile
 * (Figma "Search popup" / "Search sheet"). Mounted once in the header; any
 * search field opens it through the search store. ⌘K, Ctrl+K and / open it too.
 */
export function SearchDialog({
  quickLinks,
  collectionNames,
}: {
  quickLinks: QuickLink[];
  collectionNames: Record<string, string>;
}) {
  const { open, initialQuery, collection, openSearch, setOpen } =
    useSearchStore();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const shortcut =
        (e.key === "k" && (e.metaKey || e.ctrlKey)) ||
        (e.key === "/" && !isTypingTarget(e.target));
      if (!shortcut || useSearchStore.getState().open) return;
      e.preventDefault();
      openSearch();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openSearch]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-brand-darkest/55 backdrop-blur-[2px] data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-x-0 top-[max(3.5rem,7dvh)] bottom-0 z-50 flex flex-col overflow-hidden rounded-t-[28px] bg-card text-card-foreground shadow-2xl outline-none data-[state=closed]:animate-slide-out-bottom data-[state=open]:animate-slide-in-bottom lg:inset-x-auto lg:top-[90px] lg:bottom-auto lg:left-1/2 lg:max-h-[calc(100dvh-130px)] lg:w-[calc(100%-4rem)] lg:max-w-[680px] lg:-translate-x-1/2 lg:rounded-[28px] lg:data-[state=closed]:animate-fade-out lg:data-[state=open]:animate-fade-in"
        >
          <Dialog.Title className="sr-only">Search</Dialog.Title>
          <span
            className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-input lg:hidden"
            aria-hidden
          />
          <SearchPanel
            initialQuery={initialQuery}
            collection={collection}
            collectionNames={collectionNames}
            quickLinks={quickLinks}
            onClose={() => setOpen(false)}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
