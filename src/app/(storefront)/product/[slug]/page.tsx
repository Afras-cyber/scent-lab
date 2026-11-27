import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { BuyBox } from "@/components/product/buy-box";
import { DeliveryChecker } from "@/components/product/delivery-checker";
import { discountPercent } from "@/components/product/price";
import { badgeFor, productHref } from "@/components/product/product-card";
import { ProductDetails } from "@/components/product/product-details";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductJsonLd } from "@/components/product/product-json-ld";
import { ProductReviews } from "@/components/product/product-reviews";
import { ProductSkeleton } from "@/components/product/product-skeleton";
import { RelatedProducts } from "@/components/product/related-products";
import { ScentProfile } from "@/components/product/scent-profile";
import { SpecStrip } from "@/components/product/spec-strip";
import { collectionsConfig, siteConfig } from "@/config";
import {
  getCatalog,
  getDeliveryZones,
  getFreeDeliveryThreshold,
  getProductBySlug,
} from "@/features/catalog/queries";

export async function generateStaticParams() {
  const products = await getCatalog();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  const description =
    product.shortDescription ?? `${product.name} from ${siteConfig.name}.`;
  const image = product.images[0]!;
  return {
    title: product.name,
    description,
    alternates: { canonical: productHref(slug) },
    openGraph: {
      title: product.name,
      description,
      images: [{ url: image.src, alt: image.alt }],
    },
  };
}

export default function ProductPage({ params }: PageProps<"/product/[slug]">) {
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductContent params={params} />
    </Suspense>
  );
}

// Product data comes from the cached catalog, so known slugs are in the
// static shell; reviews and related products stream in their own Suspense.
async function ProductContent({
  params,
}: Pick<PageProps<"/product/[slug]">, "params">) {
  const { slug } = await params;
  const [product, zones, freeThreshold] = await Promise.all([
    getProductBySlug(slug),
    getDeliveryZones(),
    getFreeDeliveryThreshold(),
  ]);
  if (!product) notFound();

  const collection = product.collections[0];
  const badge = badgeFor(product);
  const discount = discountPercent(product.price, product.compareAt);
  const badges = [
    ...(badge ? [{ label: badge, tone: "gold" as const }] : []),
    ...(discount > 0 && product.inStock
      ? [{ label: `-${discount}%`, tone: "light" as const }]
      : []),
  ];

  return (
    <>
      <ProductJsonLd product={product} />
      <div className="container-page flex flex-col gap-4 pt-4 pb-12 lg:gap-6 lg:pt-6 lg:pb-16">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            ...(collection
              ? [
                  {
                    label: collectionsConfig.index.eyebrow,
                    href: "/collections",
                  },
                  {
                    label: collection.name,
                    href: `/collections/${collection.slug}`,
                  },
                ]
              : [{ label: "Shop", href: "/shop" }]),
            { label: product.name },
          ]}
        />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,500px)] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_552px] xl:gap-12">
          <div className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
            <ProductGallery
              images={product.images}
              name={product.name}
              badges={badges}
              dimmed={!product.inStock}
            />
            <div className="max-lg:hidden">
              <SpecStrip product={product} />
            </div>
          </div>
          <BuyBox
            product={product}
            syncUrl
            extra={
              <DeliveryChecker zones={zones} freeThreshold={freeThreshold} />
            }
          />
          <div className="lg:hidden">
            <SpecStrip product={product} />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-10 pb-12 lg:gap-12 lg:pb-[72px]">
        <ScentProfile product={product} />
        <ProductDetails description={product.description} />
      </div>

      <Suspense>
        <ProductReviews product={product} />
      </Suspense>
      <Suspense>
        <RelatedProducts product={product} />
      </Suspense>
    </>
  );
}
