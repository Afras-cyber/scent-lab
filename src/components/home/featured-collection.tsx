import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { homeConfig } from "@/config";
import { getCollectionBySlug, listProducts } from "@/features/catalog/queries";
import { FALLBACK_PRODUCT_IMAGE } from "@/lib/images";

/** Dark "The Oud Edit" card beside three products from that collection. */
export async function FeaturedCollection() {
  const { eyebrow, collectionSlug, title, text, ctaLabel } =
    homeConfig.featuredCollection;
  const [collection, products] = await Promise.all([
    getCollectionBySlug(collectionSlug),
    listProducts({ collection: collectionSlug, sort: "featured" }),
  ]);
  if (!collection) return null;
  const href = `/collections/${collection.slug}`;

  return (
    <section className="bg-card py-12 lg:py-[72px]">
      <div className="container-page grid gap-4 lg:grid-cols-[380px_1fr] lg:gap-6">
        <div className="relative flex flex-col gap-4 overflow-hidden rounded-[20px] bg-brand-gradient p-6 text-brand-foreground lg:p-9">
          <span className="self-start rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-[0.12em] uppercase">
            {eyebrow}
          </span>
          <h2 className="text-[28px] text-brand-foreground lg:text-[40px] lg:leading-tight">
            {title}
          </h2>
          <p className="max-w-xs text-sm text-brand-foreground/80 lg:text-[15px]">
            {text}
          </p>
          <div className="flex items-end justify-between gap-4 lg:flex-col lg:items-start">
            <Button asChild variant="light">
              <Link href={href}>
                {ctaLabel}
                <ArrowRight aria-hidden />
              </Link>
            </Button>
            <Image
              src={collection.image ?? FALLBACK_PRODUCT_IMAGE}
              alt=""
              width={140}
              height={196}
              className="h-20 w-auto object-contain lg:mx-auto lg:mt-4 lg:h-40"
            />
          </div>
        </div>

        <ul className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-6">
          {products.slice(0, 3).map((product, i) => (
            <li
              key={product.id}
              className={`flex [&>*]:w-full ${i === 2 ? "max-lg:hidden" : ""}`}
            >
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
