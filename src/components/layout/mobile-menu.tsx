"use client";

import {
  ArrowRight,
  Box,
  ChevronRight,
  Menu,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { HeaderSearch } from "@/components/layout/header-search";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { featuresConfig, navigationConfig, siteConfig } from "@/config";
import { useSearchStore } from "@/features/search/store";

type Props = { whatsappHref: string };

export function MobileMenu({ whatsappHref }: Props) {
  const [open, setOpen] = useState(false);
  const links = [
    { label: "Shop All", href: "/shop" },
    ...navigationConfig.mainNav,
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label="Open menu"
        className="-ml-2.5 inline-flex size-11 items-center justify-center rounded-full transition-colors hover:bg-white/10"
      >
        <Menu className="size-6" aria-hidden />
      </SheetTrigger>

      <SheetContent
        side="left"
        className="max-w-none px-6 pt-5 pb-8 sm:max-w-sm"
        // Opening search closes the menu; keep focus in the search popup.
        onCloseAutoFocus={(e) => {
          if (useSearchStore.getState().open) e.preventDefault();
        }}
      >
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <SheetDescription className="sr-only">
          Shop categories, order tracking and WhatsApp chat
        </SheetDescription>

        <div className="flex h-11 items-center">
          <Logo className="text-heading" />
        </div>

        <HeaderSearch
          className="mt-5 border border-input"
          onOpenSearch={() => setOpen(false)}
        />

        <nav aria-label="Main" className="mt-3">
          <ul>
            {links.map((item, i) => (
              <li key={item.href} className="border-b border-border">
                <SheetClose asChild>
                  <Link
                    href={item.href}
                    className={`flex h-[59px] items-center gap-2 text-lg text-heading ${i === 0 ? "font-semibold" : ""}`}
                  >
                    {item.label}
                    {"badge" in item && item.badge && (
                      <span className="rounded-md bg-gold px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-brand-deep uppercase">
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight
                      className="ml-auto size-5 text-muted-foreground"
                      aria-hidden
                    />
                  </Link>
                </SheetClose>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-5 flex flex-col gap-3">
          <SheetClose asChild>
            <Link
              href="/track-order"
              className="flex items-center gap-4 rounded-[20px] bg-brand-gradient p-5 text-brand-foreground"
            >
              <span className="inline-flex size-11 items-center justify-center rounded-full bg-white/15">
                <Box className="size-5" aria-hidden />
              </span>
              <span className="flex flex-col">
                <span className="text-lg font-semibold">Track Order</span>
                <span className="text-sm text-brand-foreground/75">
                  Order ID + phone number
                </span>
              </span>
              <ArrowRight className="ml-auto size-5" aria-hidden />
            </Link>
          </SheetClose>

          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 rounded-[20px] border border-whatsapp/25 bg-whatsapp-soft p-5 text-whatsapp"
          >
            <span className="inline-flex size-11 items-center justify-center rounded-full bg-whatsapp text-white">
              <MessageCircle className="size-5" aria-hidden />
            </span>
            <span className="flex flex-col">
              <span className="text-lg font-semibold">Chat on WhatsApp</span>
              <span className="text-sm text-brand-deep/70">
                {siteConfig.contact.whatsapp.display}
              </span>
            </span>
          </a>
        </div>

        {featuresConfig.darkMode && (
          <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
            Appearance
            <ThemeToggle className="text-heading hover:bg-muted" />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
