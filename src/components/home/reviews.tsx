import { SectionHeading } from "@/components/common/section-heading";
import { ReviewCard, SummaryCard } from "@/components/product/review-cards";
import { featuresConfig, homeConfig } from "@/config";
import { getLatestReviews, getReviewSummary } from "@/features/catalog/queries";

/** "Let Customers Speak For Us": rating summary and the latest reviews. */
export async function Reviews() {
  if (!featuresConfig.reviews) return null;
  const [summary, reviews] = await Promise.all([
    getReviewSummary(),
    getLatestReviews(3),
  ]);
  if (summary.total === 0) return null;
  const { eyebrow, title } = homeConfig.reviews;

  return (
    <section className="py-12 lg:py-[72px]">
      <div className="container-page flex flex-col gap-6 lg:gap-8">
        <SectionHeading eyebrow={eyebrow} title={title} />
        <div className="grid gap-4 lg:grid-cols-[360px_1fr_1fr_1fr] lg:gap-6">
          <SummaryCard summary={summary} />
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </div>
    </section>
  );
}
