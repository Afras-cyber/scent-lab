"use client";

import {
  ArrowRight,
  ChevronRight,
  Clock,
  LayoutGrid,
  Plus,
  TrendingUp,
  X,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { productHref } from "@/components/product/product-card";
import type { SearchCollection, SearchProduct } from "@/features/search/search";
import { formatLKR } from "@/lib/format";
import { cn } from "@/lib/utils";

import { Highlight } from "./highlight";

/** ARIA and hover wiring for one keyboard-navigable option. */
export type OptionProps = {
  id: string;
  role: "option";
  "aria-selected": boolean;
  "data-active": boolean;
  onPointerMove: () => void;
};

/** Gold uppercase group label with an icon ("PERFUMES (6)"). */
export function SectionLabel({
  icon: Icon,
  id,
  children,
  action,
}: {
  icon: LucideIcon;
  id?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h3
        id={id}
        className="flex items-center gap-2 font-sans text-xs font-bold tracking-[0.14em] text-gold-ink uppercase"
      >
        <Icon className="size-4" strokeWidth={2.25} aria-hidden />
        {children}
      </h3>
      {action}
    </div>
  );
}

const rowClass =
  "relative flex items-center gap-3 rounded-2xl border-2 border-transparent bg-muted transition-colors data-[active=true]:border-gold data-[active=true]:bg-secondary lg:gap-4";

/** Perfume row: thumbnail, highlighted name, notes, price and View / Add. */
export function ProductRow({
  product,
  query,
  option,
  onNavigate,
}: {
  product: SearchProduct;
  query: string;
  option: OptionProps;
  onNavigate: () => void;
}) {
  const href = productHref(product.slug);
  const details = [
    ...product.notes.map((n) => n.toUpperCase()),
    product.sizeLabel,
  ].filter(Boolean);

  return (
    <div {...option} className={cn(rowClass, "p-2.5 pr-3 lg:p-3 lg:pr-3.5")}>
      <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white lg:size-[46px]">
        <Image
          src={product.image.src}
          alt=""
          width={46}
          height={46}
          className={cn(
            "size-full object-contain p-1",
            !product.inStock && "opacity-60 grayscale",
          )}
        />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <Link
          href={href}
          tabIndex={-1}
          onClick={onNavigate}
          className="truncate text-[15px] font-medium text-heading after:absolute after:inset-0 after:rounded-2xl lg:text-base"
        >
          <Highlight text={product.name} query={query} />
        </Link>
        <span className="truncate text-xs tracking-wide text-muted-foreground">
          {details.join(" · ")}
        </span>
        {/* Mobile: the price goes under the details so they aren't cut off. */}
        <span className="text-sm font-bold text-heading lg:hidden">
          {formatLKR(product.price)}
        </span>
      </span>
      <span className="shrink-0 text-[15px] font-bold text-heading max-lg:hidden">
        {formatLKR(product.price)}
      </span>
      <ProductAction product={product} href={href} onNavigate={onNavigate} />
    </div>
  );
}

function ProductAction({
  product,
  href,
  onNavigate,
}: {
  product: SearchProduct;
  href: string;
  onNavigate: () => void;
}) {
  if (!product.inStock) {
    return (
      <span className="w-16 shrink-0 text-right text-xs font-semibold text-muted-foreground lg:w-[72px]">
        Sold out
      </span>
    );
  }
  if (product.multiVariant) {
    return (
      <span
        className="inline-flex w-16 shrink-0 items-center justify-end gap-1 text-sm font-semibold text-gold-ink lg:w-[72px] lg:text-[15px]"
        aria-hidden
      >
        View
        <ArrowRight className="size-4" strokeWidth={2.5} />
      </span>
    );
  }
  // Phase 2 adds the item to the cart here; until then it opens the product,
  // like the product card's "Add to Cart".
  return (
    <Link
      href={href}
      tabIndex={-1}
      onClick={onNavigate}
      aria-label={`Add ${product.name}`}
      className="relative z-10 inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-primary px-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 lg:h-10 lg:px-4 lg:text-[15px]"
    >
      <Plus className="size-4" strokeWidth={2.5} aria-hidden />
      Add
    </Link>
  );
}

/** Collection row: dark icon circle, highlighted name, product count. */
export function CollectionRow({
  collection,
  count,
  query,
  option,
  onNavigate,
}: {
  collection: SearchCollection;
  count: string;
  query: string;
  option: OptionProps;
  onNavigate: () => void;
}) {
  return (
    <div {...option} className={cn(rowClass, "p-2.5 pr-4 lg:p-3 lg:pr-5")}>
      <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground lg:size-9">
        <LayoutGrid className="size-[18px]" aria-hidden />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <Link
          href={`/collections/${collection.slug}`}
          tabIndex={-1}
          onClick={onNavigate}
          className="truncate text-[15px] font-medium text-heading after:absolute after:inset-0 after:rounded-2xl lg:text-base"
        >
          <Highlight text={collection.name} query={query} />
        </Link>
        <span className="text-xs text-muted-foreground lg:text-[13px]">
          {count}
        </span>
      </span>
      <ChevronRight className="size-5 text-muted-foreground" aria-hidden />
    </div>
  );
}

/** "For Him · 18 perfumes ›" row in the empty state. */
export function QuickLinkRow({
  label,
  count,
  href,
  option,
  onNavigate,
}: {
  label: string;
  count: string;
  href: string;
  option: OptionProps;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      tabIndex={-1}
      onClick={onNavigate}
      {...option}
      className={cn(rowClass, "h-[52px] px-4 lg:h-10 lg:px-3.5")}
    >
      <span className="flex-1 truncate text-[17px] font-medium text-heading lg:text-base">
        {label}
      </span>
      <span className="text-sm text-muted-foreground">{count}</span>
      <ChevronRight className="size-5 text-muted-foreground" aria-hidden />
    </Link>
  );
}

const chipIcons = { recent: Clock, popular: TrendingUp } as const;

const chipClass =
  "inline-flex h-10 items-center gap-2 rounded-full border border-input bg-card px-4 text-[15px] font-medium text-heading transition-colors hover:bg-muted data-[active=true]:border-gold data-[active=true]:bg-secondary lg:h-9 lg:gap-1.5 lg:px-3 lg:text-sm";

/**
 * Outline chip. Renders a link for `href`, otherwise a button (fills the
 * search field). `icon` adds the clock or trend icon from the design.
 */
export function Chip({
  href,
  icon,
  option,
  onNavigate,
  onClick,
  children,
  className,
}: {
  href?: string;
  icon?: keyof typeof chipIcons;
  option: OptionProps;
  onNavigate?: () => void;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
}) {
  const Icon = icon ? chipIcons[icon] : null;
  const content = (
    <>
      {Icon && (
        <Icon
          className="size-4 text-muted-foreground"
          strokeWidth={2.25}
          aria-hidden
        />
      )}
      {children}
    </>
  );
  if (href) {
    return (
      <Link
        href={href}
        tabIndex={-1}
        onClick={onNavigate}
        {...option}
        className={cn(chipClass, className)}
      >
        {content}
      </Link>
    );
  }
  return (
    <button
      type="button"
      tabIndex={-1}
      onClick={onClick}
      {...option}
      className={cn(chipClass, className)}
    >
      {content}
    </button>
  );
}

/** The × inside a recent-search chip. */
export function RemoveButton(props: ComponentProps<"button">) {
  return (
    <button
      type="button"
      tabIndex={-1}
      className="-mr-1.5 inline-flex size-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-input/50 hover:text-heading"
      {...props}
    >
      <X className="size-4" strokeWidth={2.5} aria-hidden />
    </button>
  );
}
