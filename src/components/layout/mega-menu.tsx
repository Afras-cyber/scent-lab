"use client";

import { ArrowRight, ChevronDown, Menu, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { NavigationMenu } from "radix-ui";

import { navigationConfig } from "@/config";
import type { NavigationConfig } from "@/config/schema";
import { cn } from "@/lib/utils";

const { megaMenu, whatsappCta } = navigationConfig;
const mainNav: NavigationConfig["mainNav"] = navigationConfig.mainNav;

// Desktop nav row: "Shop All" opens the full-width mega menu; the other links
// go straight to their page. Radix handles hover intent, Esc and arrow keys.
export function MegaMenu({ whatsappHref }: { whatsappHref: string }) {
  return (
    <NavigationMenu.Root className="relative" delayDuration={100}>
      <div className="container-page flex h-14 items-center gap-4">
        <NavigationMenu.List className="flex items-center gap-1 xl:gap-2">
          <NavigationMenu.Item>
            <NavigationMenu.Trigger className="group inline-flex h-9 items-center gap-2 rounded-full bg-gold pr-3 pl-4 text-[15px] font-semibold text-brand-deep transition-colors hover:bg-gold/90">
              <Menu className="size-4" aria-hidden />
              Shop All
              <ChevronDown
                className="size-4 transition-transform duration-200 group-data-[state=open]:rotate-180"
                aria-hidden
              />
            </NavigationMenu.Trigger>
            <NavigationMenu.Content className="data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in">
              <MegaMenuPanel />
            </NavigationMenu.Content>
          </NavigationMenu.Item>

          {mainNav.map((item) => (
            <NavigationMenu.Item key={item.href}>
              <NavigationMenu.Link asChild>
                <Link
                  href={item.href}
                  className={cn(
                    "inline-flex h-9 items-center gap-2 rounded-full px-3 text-[15px] text-brand-foreground/90 transition-colors hover:bg-white/10 hover:text-brand-foreground",
                    item.badge && "font-semibold text-brand-foreground",
                  )}
                >
                  {item.label}
                  {item.badge && (
                    <span className="rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold tracking-wide text-brand-deep uppercase">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </NavigationMenu.Link>
            </NavigationMenu.Item>
          ))}
        </NavigationMenu.List>

        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto hidden items-center gap-2 text-[15px] text-brand-foreground/90 hover:text-brand-foreground hover:underline xl:inline-flex"
        >
          <MessageCircle className="size-4" aria-hidden />
          {whatsappCta.nav}
        </a>
      </div>

      <div className="absolute inset-x-0 top-full">
        <NavigationMenu.Viewport className="h-(--radix-navigation-menu-viewport-height) overflow-hidden bg-popover text-popover-foreground shadow-[0_16px_32px_-16px_rgb(8_27_26/0.25)] transition-[height] duration-200 data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in" />
      </div>
    </NavigationMenu.Root>
  );
}

function MegaMenuPanel() {
  const { featured } = megaMenu;
  return (
    <div className="container-page grid grid-cols-[repeat(4,minmax(0,1fr))_minmax(0,340px)] gap-8 py-10">
      {megaMenu.groups.map((group) => (
        <div key={group.title} className="flex flex-col gap-4">
          <p className="text-sm font-semibold tracking-[0.12em] text-heading uppercase">
            {group.title}
          </p>
          <ul className="flex flex-col gap-2.5">
            {group.links.map((link) => (
              <li key={link.href}>
                <NavigationMenu.Link asChild>
                  <Link
                    href={link.href}
                    className="text-[15px] text-foreground transition-colors hover:text-gold"
                  >
                    {link.label}
                  </Link>
                </NavigationMenu.Link>
              </li>
            ))}
            {"viewAll" in group && group.viewAll && (
              <li>
                <NavigationMenu.Link asChild>
                  <Link
                    href={group.viewAll}
                    className="inline-flex items-center gap-2 text-[15px] font-semibold text-heading hover:text-gold"
                  >
                    View all <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </NavigationMenu.Link>
              </li>
            )}
          </ul>
        </div>
      ))}

      <div className="relative flex flex-col items-start gap-2 self-start overflow-hidden rounded-[20px] bg-brand-gradient p-7 text-brand-foreground">
        <p className="text-xs font-semibold tracking-[0.12em] text-brand-foreground/80 uppercase">
          {featured.eyebrow}
        </p>
        <p className="font-serif text-3xl">{featured.title}</p>
        <p className="text-sm text-brand-foreground/80">{featured.text}</p>
        <NavigationMenu.Link asChild>
          <Link
            href={featured.cta.href}
            className="mt-3 inline-flex h-10 items-center rounded-full bg-white px-5 text-sm font-semibold text-brand-deep transition-colors hover:bg-white/90"
          >
            {featured.cta.label}
          </Link>
        </NavigationMenu.Link>
        <Image
          src="/images/collections/Bottle.png"
          alt=""
          width={70}
          height={98}
          className="absolute top-7 right-7 h-auto w-16"
        />
      </div>
    </div>
  );
}
