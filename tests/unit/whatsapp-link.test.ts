import { describe, expect, it } from "vitest";

import { siteConfig, whatsappConfig } from "@/config";
import { fillMessage, waLink } from "@/lib/whatsapp/link";

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
