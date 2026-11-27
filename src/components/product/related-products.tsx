import { SectionHeading } from "@/components/common/section-heading";
import { productConfig } from "@/config";
import { getRelatedProducts } from "@/features/catalog/queries";
import type { ProductCardData } from "@/features/catalog/types";

import { ProductCard } from "./product-card";

/** "Pairs well with": products sharing a collection or note. */
export async function RelatedProducts({
  product,
}: {
  product: ProductCardData;
}) {
  const related = await getRelatedProducts(product, 4);
  if (related.length === 0) return null;
  const { eyebrow, title } = productConfig.related;

  return (
    <section className="py-12 lg:py-[72px]">
      <div className="container-page flex flex-col gap-6 lg:gap-8">
        <SectionHeading eyebrow={eyebrow} title={title} />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-6">
          {related.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
