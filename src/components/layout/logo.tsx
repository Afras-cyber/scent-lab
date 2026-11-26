import Link from "next/link";

import { siteConfig } from "@/config";
import { cn } from "@/lib/utils";

// Temporary text logo. Replace this one file when the final logo arrives.
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label={`${siteConfig.name} home`}
      className={cn("inline-block text-2xl font-bold uppercase", className)}
      style={{ letterSpacing: siteConfig.brand.logoLetterSpacing }}
    >
      {siteConfig.brand.logoText}
    </Link>
  );
}
