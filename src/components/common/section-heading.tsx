import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

// Small uppercase pill label above a serif heading, as used across the design.
// `action` sits at the end of the row on desktop (a "View all" link or tabs).
export function SectionHeading({
  eyebrow,
  title,
  action,
  className,
}: {
  eyebrow: string;
  title: string;
  action?: ReactNode;
  className?: string;
}) {
  const heading = (
    <div className="flex flex-col items-start gap-3">
      <span className="rounded-full bg-secondary px-3 py-1 text-[11px] font-semibold tracking-[0.12em] text-secondary-foreground uppercase">
        {eyebrow}
      </span>
      <h2 className="text-3xl font-semibold md:text-4xl lg:text-[44px] lg:leading-tight">
        {title}
      </h2>
    </div>
  );
  if (!action) return <div className={className}>{heading}</div>;

  return (
    <div
      className={cn(
        "flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between",
        className,
      )}
    >
      {heading}
      {action}
    </div>
  );
}

/** The "View All Collections →" style link next to a section heading. */
export function SectionLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-2 text-[15px] font-semibold text-heading lg:pb-2",
        className,
      )}
    >
      {children}
      <ArrowRight
        className="size-4 transition-transform group-hover:translate-x-1"
        aria-hidden
      />
    </Link>
  );
}
