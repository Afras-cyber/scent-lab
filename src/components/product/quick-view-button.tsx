"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Eye } from "lucide-react";
import Link from "next/link";

import { prefetchProduct } from "@/features/catalog/hooks";
import { useQuickViewStore } from "@/features/catalog/quick-view-store";
import { cn } from "@/lib/utils";

/**
 * Eye button on product cards. Opens the quick view; a plain link to the
 * product page before hydration, or when opened in a new tab.
 */
export function QuickViewButton({
  slug,
  name,
  href,
  className,
}: {
  slug: string;
  name: string;
  href: string;
  className?: string;
}) {
  const queryClient = useQueryClient();
  const openQuickView = useQuickViewStore((s) => s.openQuickView);
  const prefetch = () => void prefetchProduct(queryClient, slug);

  return (
    <Link
      href={href}
      prefetch={false}
      aria-label={`Quick view ${name}`}
      aria-haspopup="dialog"
      onPointerEnter={prefetch}
      onFocus={prefetch}
      onClick={(e) => {
        // Keep ⌘/Ctrl/middle-click as "open in new tab".
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        openQuickView(slug);
      }}
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-white text-brand-deep shadow-sm transition-transform hover:scale-105",
        className,
      )}
    >
      <Eye className="size-4" aria-hidden />
    </Link>
  );
}
