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
    bankName: "TODO", // TODO: from client
    accountName: "TODO",
    accountNumber: "TODO",
    branch: "TODO",
  },
  deliveryEstimate: { colombo: "1–2 days", other: "2–4 days" },
} as const satisfies CommerceConfig;
