import { describe, expect, it } from "vitest";

import { allConfigs } from "@/config/check";
import { findPlaceholders, validateConfig } from "@/config/schema";

describe("src/config", () => {
  it("every config matches its schema", () => {
    expect(validateConfig(allConfigs, { strict: false })).toEqual([]);
  });

  it("strict mode reports placeholders by path", () => {
    const problems = validateConfig(allConfigs, { strict: true });
    // Remove this expectation once the client supplies the real values.
    expect(problems).toContain(
      "site.contact.whatsapp.number: placeholder value must be replaced before launch",
    );
  });

  it("strict mode requires bank details when bank transfer is offered", () => {
    const commerce = {
      ...allConfigs.commerce,
      bankTransfer: {
        bankName: "",
        accountName: "",
        accountNumber: "",
        branch: "",
      },
    };
    const problems = validateConfig(
      { ...allConfigs, commerce },
      { strict: true },
    );
    expect(problems).toContain(
      "commerce.bankTransfer.bankName: required for bank transfer",
    );
  });

  it("rejects a malformed WhatsApp number", () => {
    const site = {
      ...allConfigs.site,
      contact: {
        ...allConfigs.site.contact,
        whatsapp: {
          ...allConfigs.site.contact.whatsapp,
          number: "+94 77 123 4567",
        },
      },
    };
    const problems = validateConfig({ ...allConfigs, site }, { strict: false });
    expect(
      problems.some((p) => p.startsWith("site.contact.whatsapp.number")),
    ).toBe(true);
  });

  it("requires one backoff entry per retry attempt", () => {
    const notifications = {
      ...allConfigs.notifications,
      retry: { maxAttempts: 6, backoffSeconds: [30] },
    };
    const problems = validateConfig(
      { ...allConfigs, notifications },
      { strict: false },
    );
    expect(
      problems.some((p) =>
        p.includes("backoffSeconds needs one entry per attempt"),
      ),
    ).toBe(true);
  });
});

describe("findPlaceholders", () => {
  it("finds TODO, masked digits and known dummy values in nested data", () => {
    expect(
      findPlaceholders({
        a: "TODO",
        b: { c: "+94 76 776 ****", d: ["ok", "94767760000"] },
        e: "fine",
        f: 3,
      }),
    ).toEqual(["a", "b.c", "b.d[1]"]);
  });
});
