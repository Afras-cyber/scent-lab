import { siteConfig } from "@/config";

const lkr = new Intl.NumberFormat("en-LK", { maximumFractionDigits: 0 });

/** Formats whole rupees as `Rs 3,490`. */
export function formatLKR(amount: number): string {
  return `${siteConfig.currency.symbol} ${lkr.format(Math.round(amount))}`;
}
