import { Box, MessageCircle, ShoppingCart } from "lucide-react";
import Link from "next/link";

import { HeaderSearch } from "@/components/layout/header-search";
import { Logo } from "@/components/layout/logo";
import { MegaMenu } from "@/components/layout/mega-menu";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { SearchDialog } from "@/components/search/search-dialog";
import {
  collectionsConfig,
  featuresConfig,
  searchConfig,
  siteConfig,
} from "@/config";
import { filterProducts } from "@/features/catalog/filter";
import { getCatalog, listCollections } from "@/features/catalog/queries";
import type { ShopFilters } from "@/features/catalog/schemas";
import { countLabel } from "@/lib/count";
import { waLink } from "@/lib/whatsapp/link";

export async function Header() {
  const [collections, catalog] = await Promise.all([
    listCollections(),
    getCatalog(),
  ]);
  const whatsappHref = waLink();
  const quickLinks = searchConfig.quickLinks.map((link) => {
    const { filters } = link;
    const shopFilters: ShopFilters = {
      gender: "gender" in filters ? [...filters.gender] : undefined,
      collection: "collection" in filters ? [...filters.collection] : undefined,
    };
    return {
      label: link.label,
      href: link.href,
      count: countLabel(
        filterProducts(catalog, shopFilters).length,
        "unit" in link ? link.unit : collectionsConfig.defaultUnit,
      ),
    };
  });

  return (
    <header className="sticky top-0 z-40 bg-brand-deep text-brand-foreground">
      <div className="container-page flex h-16 items-center gap-3 lg:h-[92px] lg:gap-10">
        <div className="flex flex-1 lg:hidden">
          <MobileMenu whatsappHref={whatsappHref} />
        </div>

        <Logo className="text-xl text-brand-foreground sm:text-[22px] md:text-2xl lg:text-[24px]" />

        <HeaderSearch
          collections={collections}
          className="max-w-[600px] flex-1 max-lg:hidden"
        />

        <div className="flex flex-1 items-center justify-end gap-1 lg:flex-none lg:gap-3">
          <Link
            href="/track-order"
            className="inline-flex size-11 items-center justify-center gap-2 rounded-full transition-colors hover:bg-white/10 lg:h-12 lg:w-auto lg:bg-white lg:px-6 lg:text-xs lg:font-semibold lg:text-brand-deep lg:hover:bg-white/90 xl:text-[13px]"
          >
            <Box className="size-6 lg:size-5" aria-hidden />
            <span className="sr-only lg:not-sr-only">Track Order</span>
          </Link>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden h-12 items-center gap-2 rounded-full bg-whatsapp-soft px-6 font-semibold text-whatsapp transition-opacity hover:opacity-90 xl:inline-flex xl:text-xs 2xl:text-[13px]"
          >
            <MessageCircle className="size-5" aria-hidden />
            {siteConfig.contact.whatsapp.display}
          </a>
          {featuresConfig.darkMode && <ThemeToggle className="max-lg:hidden" />}
          {/* Cart count and total arrive with the cart store in Phase 2. */}
          <Link href="/cart" className="group inline-flex items-center gap-3">
            <span className="inline-flex size-11 items-center justify-center rounded-full transition-colors group-hover:bg-white/10 lg:size-12 lg:bg-white/10 lg:group-hover:bg-white/20">
              <ShoppingCart className="size-6 lg:size-5" aria-hidden />
            </span>
            <span className="sr-only text-sm lg:not-sr-only lg:text-xs xl:text-[13px]">
              My Cart
            </span>
          </Link>
        </div>
      </div>

      <div className="container-page pb-3 lg:hidden">
        <HeaderSearch />
      </div>

      <div className="border-t border-white/10 max-lg:hidden">
        <MegaMenu />
      </div>

      <SearchDialog
        quickLinks={quickLinks}
        collectionNames={Object.fromEntries(
          collections.map((c) => [c.slug, c.name]),
        )}
      />
    </header>
  );
}
