import { CircleCheck } from "lucide-react";

import { SectionHeading } from "@/components/common/section-heading";
import { Stars } from "@/components/product/rating";
import { featuresConfig, homeConfig } from "@/config";
import { getLatestReviews, getReviewSummary } from "@/features/catalog/queries";
import type { Review, ReviewSummary } from "@/features/catalog/types";

const numberFormat = new Intl.NumberFormat("en-LK");

function SummaryCard({ summary }: { summary: ReviewSummary }) {
  return (
    <div className="flex flex-col gap-4 rounded-[20px] bg-card p-6 shadow-sm lg:p-8">
      <div className="flex items-center gap-4 lg:flex-col lg:items-start lg:gap-3">
        <p className="font-serif text-5xl font-semibold text-heading lg:text-7xl">
          {summary.average.toFixed(1)}
          <span className="sr-only"> out of 5</span>
        </p>
        <div className="flex flex-col gap-1.5">
          <Stars
            value={summary.average}
            className="[&_svg]:size-4 lg:[&_svg]:size-5"
          />
          <p className="text-xs text-muted-foreground lg:text-sm">
            Based on {numberFormat.format(summary.total)}{" "}
            {summary.total === 1 ? "review" : "reviews"}
          </p>
        </div>
      </div>
      <ul className="flex flex-col gap-2 max-lg:hidden">
        {[5, 4, 3, 2, 1].map((stars) => {
          const count = summary.counts[stars - 1]!;
          const share = summary.total ? (count / summary.total) * 100 : 0;
          return (
            <li key={stars} className="flex items-center gap-2 text-xs">
              <span className="w-6 text-muted-foreground">{stars}★</span>
              <span
                className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
                role="img"
                aria-label={`${stars} stars: ${count}`}
              >
                <span
                  className="block h-full rounded-full bg-primary"
                  style={{ width: `${share}%` }}
                />
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <figure className="flex flex-col gap-4 self-start rounded-[20px] bg-card p-6 shadow-sm">
      <Stars value={review.rating} className="[&_svg]:size-4" />
      <blockquote className="text-[15px] leading-relaxed text-heading">
        “{review.body}”
      </blockquote>
      <figcaption className="flex items-center gap-3">
        <span
          className="inline-flex size-10 items-center justify-center rounded-full bg-secondary font-semibold text-secondary-foreground"
          aria-hidden
        >
          {review.customerName.charAt(0).toUpperCase()}
        </span>
        <span className="flex flex-col">
          <span className="text-sm font-semibold text-heading">
            {review.customerName}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            {review.isVerified && (
              <>
                <CircleCheck className="size-3.5 text-whatsapp" aria-hidden />
                Verified buyer
              </>
            )}
            {review.isVerified && review.location && " · "}
            {review.location}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}

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
