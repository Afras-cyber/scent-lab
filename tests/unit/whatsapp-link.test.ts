import { describe, expect, it } from "vitest";

import { siteConfig, whatsappConfig } from "@/config";
import { fillMessage, waLink, waShareLink } from "@/lib/whatsapp/link";

describe("fillMessage", () => {
  it("fills known tokens and keeps unknown ones", () => {
    expect(
      fillMessage(whatsappConfig.messages.product, {
        product: "Oud Royale",
        size: "12ml",
      }),
    ).toBe("Hello AYAD, I'd like to order Oud Royale (12ml).\n{url}");
  });
});

describe("productOrder message", () => {
  it("fills quantity, size and total", () => {
    expect(
      fillMessage(whatsappConfig.messages.productOrder, {
        qty: 2,
        product: "Oud Royale",
        size: "12ml attar",
        total: "Rs 4,980",
        url: "https://ayadscentlab.com/product/oud-royale",
      }),
    ).toBe(
      "Hello AYAD, I'd like to order:\n2 × Oud Royale (12ml attar) – Rs 4,980\nhttps://ayadscentlab.com/product/oud-royale",
    );
  });
});

describe("waShareLink", () => {
  it("lets the customer pick the chat (no number)", () => {
    expect(waShareLink("Look: x")).toBe("https://wa.me/?text=Look%3A%20x");
  });
});

describe("waLink", () => {
  it("builds an encoded wa.me link to the shop number", () => {
    expect(waLink("Hi & hello?\nThanks")).toBe(
      `https://wa.me/${siteConfig.contact.whatsapp.number}?text=Hi%20%26%20hello%3F%0AThanks`,
    );
  });

  it("uses the default help message", () => {
    expect(waLink()).toContain(
      encodeURIComponent(siteConfig.contact.whatsapp.defaultMessage),
    );
  });
});
