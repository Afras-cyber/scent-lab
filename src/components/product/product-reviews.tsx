import { MessageCircle } from "lucide-react";

import { SectionHeading } from "@/components/common/section-heading";
import { Button } from "@/components/ui/button";
import { featuresConfig, productConfig } from "@/config";
import {
  getProductReviews,
  getReviewSummary,
} from "@/features/catalog/queries";
import type { ProductDetail } from "@/features/catalog/types";
import { fillMessage, waLink } from "@/lib/whatsapp/link";

import { ReviewCard, SummaryCard } from "./review-cards";

const copy = productConfig.reviews;

/** "Customer reviews": this product's rating summary and latest reviews. */
export async function ProductReviews({ product }: { product: ProductDetail }) {
  if (!featuresConfig.reviews) return null;
  const [summary, reviews] = await Promise.all([
    getReviewSummary(product.id),
    getProductReviews(product.id, 3),
  ]);

  // Review submission isn't built yet: reviews come in over WhatsApp.
  const writeReview = (
    <Button asChild variant="default" className="self-start">
      <a
        href={waLink(
          fillMessage(copy.writeReviewMessage, { product: product.name }),
        )}
        target="_blank"
        rel="noopener noreferrer"
      >
        <MessageCircle aria-hidden />
        {copy.writeReview}
      </a>
    </Button>
  );

  return (
    <section
      id="reviews"
      className="scroll-mt-24 bg-card py-12 lg:py-[72px] dark:bg-transparent"
    >
      <div className="container-page flex flex-col gap-6 lg:gap-8">
        <SectionHeading eyebrow={copy.eyebrow} title={copy.title} />
        {summary.total === 0 ? (
          <div className="flex flex-col items-start gap-4 rounded-[20px] bg-muted p-6 lg:p-8">
            <p className="text-heading">{copy.empty}</p>
            {writeReview}
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[300px_1fr_1fr_1fr] lg:gap-6">
            <SummaryCard summary={summary}>{writeReview}</SummaryCard>
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
