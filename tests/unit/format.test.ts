import { describe, expect, it } from "vitest";

import { formatLKR } from "@/lib/format";

describe("formatLKR", () => {
  it.each([
    [3490, "Rs 3,490"],
    [0, "Rs 0"],
    [125000, "Rs 125,000"],
    [999.6, "Rs 1,000"],
  ])("%d → %s", (amount, expected) => {
    expect(formatLKR(amount)).toBe(expected);
  });
});
