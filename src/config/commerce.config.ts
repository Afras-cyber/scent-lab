import type { CommerceConfig } from "./schema";

// Defaults for checkout and delivery. Staff can override the delivery fees,
// the free-delivery threshold and the bank details in `site_settings`.
export const commerceConfig = {
  orderCodePrefix: "AYD", // AYD-10482
  invoicePrefix: "INV",
  receiptPrefix: "RCT",
  maxQtyPerLine: 20,
  maxLinesPerOrder: 30,
  freeDeliveryThresholdLkr: 5000,
  paymentMethods: ["cod", "bank_transfer"],
  bankTransfer: {
    // MOCK until the client supplies real details. The production build
    // fails while these remain (see KNOWN_PLACEHOLDER_VALUES in schema.ts).
    bankName: "Sample Bank PLC", // MOCK
    accountName: "AYAD Scent Lab (Pvt) Ltd", // MOCK
    accountNumber: "0000 0000 0000", // MOCK
    branch: "Colombo Main", // MOCK
  },
  deliveryEstimate: { colombo: "1–2 days", other: "2–4 days" },
} as const satisfies CommerceConfig;
