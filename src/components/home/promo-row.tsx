import { ArrowRight, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Price } from "@/components/product/price";
import { productHref } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { homeConfig } from "@/config";
import { getCatalog } from "@/features/catalog/queries";
import { waLink } from "@/lib/whatsapp/link";

const eyebrowClass =
  "self-start rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.12em] uppercase";

/** Discovery set card (price from the catalog) and the WhatsApp help card. */
export async function PromoRow() {
  const { discoveryPromo, helpPromo } = homeConfig;
  const set = (await getCatalog()).find(
    (p) => p.slug === discoveryPromo.productSlug,
  );

  return (
    <section className="bg-card pb-12 lg:pb-[72px]">
      <div className="container-page grid gap-4 lg:grid-cols-2 lg:gap-6">
        {set && (
          <div className="relative flex overflow-hidden rounded-[20px] bg-brand-gradient p-6 text-brand-foreground lg:p-11">
            <div className="flex flex-col gap-4">
              <span className={`${eyebrowClass} bg-white/10`}>
                {discoveryPromo.eyebrow}
              </span>
              <h2 className="text-[28px] leading-tight text-brand-foreground lg:text-4xl">
                {set.name}
              </h2>
              <p className="max-w-sm text-sm text-brand-foreground/80 lg:text-[15px]">
                {discoveryPromo.text}
              </p>
              <Price
                price={set.price}
                compareAt={set.compareAt}
                className="[&_*]:text-brand-foreground [&_s]:text-brand-foreground/60"
              />
              <Button asChild variant="light" className="mt-2 self-start">
                <Link href={productHref(set.slug)}>
                  {discoveryPromo.ctaLabel}
                  <ArrowRight aria-hidden />
                </Link>
              </Button>
            </div>
            <Image
              src={set.image.src}
              alt=""
              width={160}
              height={133}
              className="absolute right-6 bottom-6 h-auto w-24 object-contain lg:static lg:ml-auto lg:w-40 lg:self-start"
            />
          </div>
        )}

        <div className="flex items-center gap-4 rounded-[20px] bg-gradient-to-br from-[#dff8e8] to-[#b9f0cd] p-6 lg:items-start lg:p-11 dark:from-[#123a28] dark:to-[#0f2e22]">
          <div className="flex flex-1 flex-col gap-3 lg:gap-4">
            <span
              className={`${eyebrowClass} bg-white text-whatsapp max-lg:hidden dark:bg-white/10`}
            >
              {helpPromo.eyebrow}
            </span>
            <h2 className="text-xl lg:text-4xl">{helpPromo.title}</h2>
            <p className="text-xs text-heading/80 lg:max-w-sm lg:text-[15px]">
              {helpPromo.text}
            </p>
            <Button
              asChild
              variant="whatsapp"
              className="self-start max-lg:hidden"
            >
              <a href={waLink()} target="_blank" rel="noopener noreferrer">
                <MessageCircle aria-hidden />
                {helpPromo.ctaLabel}
              </a>
            </Button>
          </div>
          <a
            href={waLink()}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={helpPromo.ctaLabel}
            className="inline-flex size-[52px] shrink-0 items-center justify-center rounded-full bg-whatsapp text-white shadow-lg transition-transform hover:scale-105 lg:size-24"
          >
            <MessageCircle className="size-6 lg:size-10" aria-hidden />
          </a>
        </div>
      </div>
    </section>
  );
}
