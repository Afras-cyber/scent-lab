"use client";

import {
  Box,
  House,
  MessageCircle,
  ShoppingCart,
  Store,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { navigationConfig } from "@/config";
import { cn } from "@/lib/utils";

const icons: Record<
  (typeof navigationConfig.bottomNav)[number]["icon"],
  LucideIcon
> = {
  home: House,
  shop: Store,
  cart: ShoppingCart,
  whatsapp: MessageCircle,
  track: Box,
};

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

/** Mobile-only tab bar. The WhatsApp item opens a wa.me chat. */
export function BottomNav({ whatsappHref }: { whatsappHref: string }) {
  const pathname = usePathname();
  const itemClass =
    "flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium";

  return (
    <nav
      aria-label="Quick links"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="flex h-16">
        {navigationConfig.bottomNav.map((item) => {
          const Icon = icons[item.icon];
          if (!("href" in item) || !item.href) {
            return (
              <li key={item.label} className="flex flex-1">
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(itemClass, "text-whatsapp")}
                >
                  <Icon className="size-[22px]" aria-hidden />
                  {item.label}
                </a>
              </li>
            );
          }
          const active = isActive(pathname, item.href);
          return (
            <li key={item.label} className="flex flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  itemClass,
                  active ? "text-heading" : "text-muted-foreground",
                )}
              >
                <Icon
                  className={cn("size-[22px]", active && "text-gold")}
                  aria-hidden
                />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
