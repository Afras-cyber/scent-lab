import {
  Banknote,
  Box,
  Landmark,
  Phone,
  ShieldCheck,
  Truck,
} from "lucide-react";
import Link from "next/link";

import { navigationConfig, siteConfig } from "@/config";
import type { NavigationConfig } from "@/config/schema";
import { cn } from "@/lib/utils";

const icons = {
  truck: Truck,
  cash: Banknote,
  shield: ShieldCheck,
  bank: Landmark,
};

type Item = NavigationConfig["topBar"]["left"][number];

function TopBarItem({ item, mobile }: { item: Item; mobile?: boolean }) {
  const Icon = icons[item.icon];
  return (
    <li className="flex items-center gap-2">
      <Icon className="size-4 text-brand-mid dark:text-gold" aria-hidden />
      {mobile ? (item.short ?? item.label) : item.label}
    </li>
  );
}

export function TopBar() {
  const { left, center } = navigationConfig.topBar;
  const itemClass = "flex items-center gap-x-6 gap-y-1";

  return (
    <div className="bg-secondary text-[10px] text-secondary-foreground sm:text-[11px] md:text-xs lg:text-[11px]">
      <div className="container-page flex min-h-9 items-center justify-center py-1.5 lg:justify-between">
        <ul className={cn(itemClass, "lg:hidden")}>
          {left.map((item) => (
            <TopBarItem key={item.label} item={item} mobile />
          ))}
        </ul>
        <ul className={cn(itemClass, "max-lg:hidden")}>
          {left.map((item) => (
            <TopBarItem key={item.label} item={item} />
          ))}
        </ul>
        <ul className={cn(itemClass, "max-lg:hidden")}>
          {center.map((item) => (
            <TopBarItem key={item.label} item={item} />
          ))}
        </ul>
        <ul className={cn(itemClass, "max-lg:hidden")}>
          <li>
            <a
              href={`tel:${siteConfig.contact.phoneE164}`}
              className="flex items-center gap-2 hover:underline"
            >
              <Phone
                className="size-4 text-brand-mid dark:text-gold"
                aria-hidden
              />
              {siteConfig.contact.phoneDisplay}
            </a>
          </li>
          <li>
            <Link
              href="/track-order"
              className="flex items-center gap-2 hover:underline"
            >
              <Box
                className="size-4 text-brand-mid dark:text-gold"
                aria-hidden
              />
              Track Order
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
