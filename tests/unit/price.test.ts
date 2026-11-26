import { describe, expect, it } from "vitest";

import { discountPercent } from "@/components/product/price";

describe("discountPercent", () => {
  it.each([
    [3490, 4290, 19],
    [2490, 2990, 17],
    [2990, null, 0],
    [3000, 3000, 0],
    [3500, 3000, 0],
  ])("%d from %s → %d%%", (price, compareAt, expected) => {
    expect(discountPercent(price, compareAt)).toBe(expected);
  });
});
