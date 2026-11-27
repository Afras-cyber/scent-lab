"use client";

import {
  Banknote,
  BellRing,
  CircleCheck,
  Clock,
  Link2,
  MessageCircle,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Truck,
} from "lucide-react";
import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { Button } from "@/components/ui/button";
import {
  commerceConfig,
  productConfig,
  shopConfig,
  siteConfig,
  whatsappConfig,
} from "@/config";
import type { ProductDetail, ProductVariant } from "@/features/catalog/types";
import { formatLKR } from "@/lib/format";
import { cn } from "@/lib/utils";
import { fillMessage, waLink, waShareLink } from "@/lib/whatsapp/link";

import { discountPercent } from "./price";
import { badgeFor, productHref } from "./product-card";
import { Stars } from "./rating";

const copy = productConfig.buyBox;

const badgeIcons = {
  cash: Banknote,
  truck: Truck,
  shield: ShieldCheck,
  clock: Clock,
} as const;

// Dot colours for note chips; other notes get gold.
const noteColors: Record<string, string> = {
  oud: "#243533",
  leather: "#4a3a2e",
  smoke: "#6b6f6e",
  amber: "#bda23d",
  honey: "#d9a441",
  vanilla: "#e3cf9c",
  musk: "#a9bfb8",
  saffron: "#c0532f",
  rose: "#d27a8c",
  jasmine: "#efe3b0",
  iris: "#9b8fc4",
  citrus: "#e6b422",
  cedar: "#8a6d4f",
  sandalwood: "#b98b5e",
  woods: "#7b5e3f",
};

/** `?size=` value for a variant: "12ml attar" → "12ml-attar". */
export function sizeParam(label: string) {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// The URL only changes through our own replaceState, so nothing to subscribe to.
const noSubscribe = () => () => {};

function defaultVariant(product: ProductDetail): ProductVariant {
  return (
    product.variants.find((v) => v.id === product.defaultVariantId) ??
    product.variants[0]!
  );
}

/**
 * Product info and purchase controls (Figma "Product page" right column and
 * "Buy box states"): price, stock, size, quantity, Add to Cart and Order via
 * WhatsApp. Used on the product page and in the quick view. With `syncUrl`
 * the selected size is kept in `?size=` so the link can be shared.
 */
export function BuyBox({
  product,
  compact = false,
  syncUrl = false,
  extra,
}: {
  product: ProductDetail;
  /** Quick view: no trust badges, share row or `extra`. */
  compact?: boolean;
  syncUrl?: boolean;
  /** Rendered under the trust badges, e.g. the delivery checker. */
  extra?: ReactNode;
}) {
  // Start from the shared `?size=`, if any. Read on the client only, so the
  // page stays static (no searchParams on the server).
  const sharedSize = useSyncExternalStore(
    noSubscribe,
    () =>
      syncUrl ? new URLSearchParams(window.location.search).get("size") : null,
    () => null,
  );
  const [pickedId, setPickedId] = useState<string | null>(null);
  const variant =
    product.variants.find((v) => v.id === pickedId) ??
    product.variants.find(
      (v) =>
        sharedSize !== null && sizeParam(v.label) === sharedSize && v.stock > 0,
    ) ??
    defaultVariant(product);
  const [qty, setQty] = useState(1);

  // Mobile: show the sticky buy bar once the buttons scroll out of view.
  const ctaRef = useRef<HTMLDivElement>(null);
  const [ctaPassed, setCtaPassed] = useState(false);
  useEffect(() => {
    const el = ctaRef.current;
    if (compact || !el) return;
    const observer = new IntersectionObserver(([entry]) =>
      setCtaPassed(!entry!.isIntersecting && entry!.boundingClientRect.top < 0),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [compact]);

  const selectVariant = (v: ProductVariant) => {
    setPickedId(v.id);
    setQty((q) => Math.min(q, maxQty(v)));
    if (syncUrl) {
      const url = new URL(window.location.href);
      url.searchParams.set("size", sizeParam(v.label));
      window.history.replaceState(window.history.state, "", url);
    }
  };

  const href = productHref(product.slug);
  const url = `${siteConfig.url}${href}`;
  const soldOut = !product.inStock;
  const lowStock = !soldOut && variant.stock < commerceConfig.lowStockThreshold;
  const discount = discountPercent(variant.price, variant.compareAt);
  const badge = badgeFor(product);
  const collection = product.collections[0];
  const subtitle = [
    product.profile.concentration,
    product.gender && shopConfig.genderLabels[product.gender],
  ]
    .filter(Boolean)
    .join(" · ");

  const orderLink = waLink(
    fillMessage(whatsappConfig.messages.productOrder, {
      qty,
      product: product.name,
      size: variant.label,
      total: formatLKR(variant.price * qty),
      url,
    }),
  );
  const notifyLink = waLink(
    fillMessage(whatsappConfig.messages.notifyStock, {
      product: product.name,
      url,
    }),
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        {(collection || badge) && (
          <div className="flex flex-wrap gap-2">
            {collection && (
              <Link
                href={`/collections/${collection.slug}`}
                className="rounded-full bg-secondary px-3 py-1 text-[11px] font-semibold tracking-[0.12em] text-secondary-foreground uppercase transition-colors hover:bg-secondary/70"
              >
                {collection.name}
              </Link>
            )}
            {badge && (
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.12em] uppercase",
                  soldOut
                    ? "bg-brand-mid text-brand-foreground"
                    : "bg-gold text-brand-deep",
                )}
              >
                {badge}
              </span>
            )}
          </div>
        )}

        {compact ? (
          <h2 className="text-2xl leading-tight font-semibold lg:text-3xl">
            <Link href={href} className="hover:underline">
              {product.name}
            </Link>
          </h2>
        ) : (
          <h1 className="text-3xl leading-tight font-semibold lg:text-[44px]">
            {product.name}
          </h1>
        )}

        {subtitle && <p className="text-muted-foreground">{subtitle}</p>}

        {product.ratingCount > 0 && (
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
            <Stars value={product.ratingAvg} className="[&_svg]:size-3.5" />
            <span className="font-semibold text-heading">
              {product.ratingAvg.toFixed(1)}
            </span>
            <a
              href={compact ? `${href}#reviews` : "#reviews"}
              className="text-muted-foreground hover:underline"
            >
              ({product.ratingCount}{" "}
              {product.ratingCount === 1 ? "review" : "reviews"})
            </a>
            <span className="text-muted-foreground" aria-hidden>
              •
            </span>
            <span className="flex items-center gap-1 font-medium text-whatsapp">
              <CircleCheck className="size-4" aria-hidden />
              {copy.verifiedBuyers}
            </span>
          </p>
        )}

        {product.shortDescription && (
          <p className="leading-relaxed text-foreground/85">
            {product.shortDescription}
          </p>
        )}

        {product.notes.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {product.notes.map((note) => (
              <li
                key={note.slug}
                className="flex items-center gap-2 rounded-full border bg-card px-3.5 py-1.5 text-sm text-heading"
              >
                <span
                  className="size-2.5 rounded-full"
                  style={{
                    backgroundColor: noteColors[note.slug] ?? "#bda23d",
                  }}
                  aria-hidden
                />
                {note.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <hr />

      <div className="flex flex-col gap-3">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-3xl font-bold text-heading lg:text-4xl">
            {formatLKR(variant.price)}
          </span>
          {discount > 0 && (
            <>
              <s className="text-lg text-muted-foreground">
                <span className="sr-only">Was </span>
                {formatLKR(variant.compareAt!)}
              </s>
              <span className="rounded-md bg-gold/20 px-2 py-0.5 text-xs font-semibold text-heading">
                {fillMessage(copy.save, { percent: discount })}
              </span>
            </>
          )}
        </p>

        <StockLine
          soldOut={soldOut}
          lowStock={lowStock}
          stock={variant.stock}
        />
      </div>

      <fieldset className="flex flex-col gap-2.5">
        <legend className="mb-2.5 text-sm">
          <span className="font-semibold text-heading">{copy.size}:</span>{" "}
          <span className="text-muted-foreground">{variant.label}</span>
        </legend>
        <div className="flex flex-wrap gap-2.5">
          {product.variants.map((v) => {
            const out = v.stock <= 0;
            const selected = !soldOut && v.id === variant.id;
            return (
              <button
                key={v.id}
                type="button"
                disabled={out}
                onClick={() => selectVariant(v)}
                aria-pressed={selected}
                className={cn(
                  "flex min-w-[88px] flex-col items-center rounded-xl border bg-card px-4 py-2 text-sm transition-colors",
                  selected
                    ? "border-2 border-heading bg-secondary"
                    : "hover:border-heading/50",
                  out && "border-dashed text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "font-medium",
                    out ? "line-through" : "text-heading",
                  )}
                >
                  {v.label}
                </span>
                <span
                  className={cn(
                    "text-xs",
                    out ? "text-destructive" : "text-muted-foreground",
                  )}
                >
                  {out ? copy.soldOut : formatLKR(v.price)}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div ref={ctaRef} className="flex flex-col gap-3">
        <div className="flex gap-3">
          <QuantityStepper
            value={qty}
            max={maxQty(variant)}
            disabled={soldOut}
            onChange={setQty}
          />
          {soldOut ? (
            <Button
              disabled
              size="lg"
              className="flex-1 bg-muted text-muted-foreground disabled:opacity-100"
            >
              {copy.outOfStock}
            </Button>
          ) : (
            // Phase 2 wires this to the cart store.
            <Button
              disabled
              size="lg"
              className="flex-1"
              aria-describedby={`cart-soon-${product.id}`}
            >
              <ShoppingCart aria-hidden />
              {copy.addToCart}
            </Button>
          )}
        </div>
        {!soldOut && (
          <p
            id={`cart-soon-${product.id}`}
            className="text-center text-xs text-muted-foreground"
          >
            {copy.cartSoon}
          </p>
        )}

        {soldOut ? (
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-2 border-whatsapp text-whatsapp hover:bg-whatsapp/5"
          >
            <a href={notifyLink} target="_blank" rel="noopener noreferrer">
              <BellRing aria-hidden />
              {copy.notifyWhatsapp}
            </a>
          </Button>
        ) : (
          <Button asChild variant="whatsapp" size="lg">
            <a href={orderLink} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="size-5" aria-hidden />
              {copy.orderWhatsapp}
            </a>
          </Button>
        )}
        <p className="text-center text-xs text-muted-foreground">
          {soldOut ? copy.notifyWhatsappNote : copy.orderWhatsappNote}
        </p>
      </div>

      {!compact && (
        <>
          <ul className="grid grid-cols-2 gap-y-4 rounded-2xl border bg-card p-4 sm:grid-cols-4">
            {productConfig.trustBadges.map(({ icon, label }) => {
              const Icon = badgeIcons[icon];
              return (
                <li
                  key={label}
                  className="flex flex-col items-center gap-2 text-center text-xs font-medium text-heading"
                >
                  <Icon className="size-5" aria-hidden />
                  {label}
                </li>
              );
            })}
          </ul>
          {extra}
          <ShareRow name={product.name} url={url} />
          <div
            className={cn(
              "fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 flex items-center gap-3 border-t bg-card px-5 py-3 shadow-[0_-4px_16px_rgb(0_0_0/0.06)] transition-transform duration-300 lg:hidden",
              !ctaPassed && "pointer-events-none translate-y-[calc(100%+4rem)]",
            )}
            aria-hidden={!ctaPassed}
            inert={!ctaPassed}
          >
            <p className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-xs text-muted-foreground">
                {variant.label}
              </span>
              <span className="text-lg font-bold text-heading">
                {formatLKR(variant.price * qty)}
              </span>
            </p>
            {soldOut ? (
              <Button
                asChild
                variant="outline"
                className="border-2 border-whatsapp text-whatsapp"
              >
                <a href={notifyLink} target="_blank" rel="noopener noreferrer">
                  <BellRing aria-hidden />
                  {copy.notifyWhatsapp}
                </a>
              </Button>
            ) : (
              <Button asChild variant="whatsapp">
                <a href={orderLink} target="_blank" rel="noopener noreferrer">
                  <MessageCircle aria-hidden />
                  {copy.orderWhatsapp}
                </a>
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function maxQty(variant: ProductVariant) {
  return Math.max(1, Math.min(variant.stock, commerceConfig.maxQtyPerLine));
}

function StockLine({
  soldOut,
  lowStock,
  stock,
}: {
  soldOut: boolean;
  lowStock: boolean;
  stock: number;
}) {
  const [dot, label, note] = soldOut
    ? ["bg-destructive", copy.outOfStock, copy.outOfStockNote]
    : lowStock
      ? [
          "bg-orange-500",
          fillMessage(copy.lowStock, { count: stock }),
          copy.lowStockNote,
        ]
      : ["bg-whatsapp", copy.inStock, copy.inStockNote];
  const tone = soldOut
    ? "text-destructive"
    : lowStock
      ? "text-orange-600 dark:text-orange-400"
      : "text-whatsapp";

  return (
    <div className="flex flex-col gap-2">
      <p className="flex items-center gap-2 text-sm">
        <span className={cn("size-2.5 rounded-full", dot)} aria-hidden />
        <span className={cn("font-semibold", tone)}>{label}</span>
        <span className="text-muted-foreground">· {note}</span>
      </p>
      {lowStock && (
        <span
          className="block h-1.5 w-40 overflow-hidden rounded-full bg-orange-500/20"
          aria-hidden
        >
          <span
            className="block h-full rounded-full bg-orange-500"
            style={{
              width: `${(stock / commerceConfig.lowStockThreshold) * 100}%`,
            }}
          />
        </span>
      )}
    </div>
  );
}

function QuantityStepper({
  value,
  max,
  disabled,
  onChange,
}: {
  value: number;
  max: number;
  disabled: boolean;
  onChange: (value: number) => void;
}) {
  const stepClass =
    "inline-flex size-9 items-center justify-center rounded-full bg-secondary text-heading transition-colors hover:bg-secondary/70 disabled:opacity-40";
  return (
    <div
      role="group"
      aria-label={copy.quantity}
      className={cn(
        "flex h-12 shrink-0 items-center gap-1 rounded-full border bg-card px-1.5",
        disabled && "opacity-60",
      )}
    >
      <button
        type="button"
        className={stepClass}
        onClick={() => onChange(value - 1)}
        disabled={disabled || value <= 1}
        aria-label="Decrease quantity"
      >
        <Minus className="size-4" aria-hidden />
      </button>
      <output
        className="w-8 text-center font-semibold text-heading"
        aria-live="polite"
      >
        {value}
      </output>
      <button
        type="button"
        className={stepClass}
        onClick={() => onChange(value + 1)}
        disabled={disabled || value >= max}
        aria-label="Increase quantity"
      >
        <Plus className="size-4" aria-hidden />
      </button>
    </div>
  );
}

function ShareRow({ name, url }: { name: string; url: string }) {
  const [copied, setCopied] = useState(false);
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked (insecure context or denied): nothing to do.
    }
  };

  return (
    <div className="flex items-center gap-3 text-sm text-muted-foreground">
      <span>{copy.share}</span>
      <a
        href={waShareLink(
          fillMessage(whatsappConfig.messages.share, { product: name, url }),
        )}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={copy.shareWhatsapp}
        className="inline-flex size-9 items-center justify-center rounded-full bg-whatsapp text-white transition-transform hover:scale-105"
      >
        <MessageCircle className="size-4" aria-hidden />
      </a>
      <button
        type="button"
        onClick={copyLink}
        aria-label={copy.copyLink}
        className="inline-flex size-9 items-center justify-center rounded-full bg-secondary text-heading transition-transform hover:scale-105"
      >
        <Link2 className="size-4" aria-hidden />
      </button>
      <span aria-live="polite" className="text-xs">
        {copied && copy.linkCopied}
      </span>
    </div>
  );
}
