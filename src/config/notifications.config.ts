import type { NotificationsConfig } from "./schema";

// Automatic WhatsApp messages (Cloud API). Template names must match the
// templates approved in Meta Business Manager. Events can also be toggled at
// runtime in `site_settings`.
export const notificationsConfig = {
  provider: "whatsapp-cloud",
  graphApiVersion: "v26.0",
  language: "en",
  events: {
    order_placed: {
      enabled: true,
      template: "order_placed_invoice",
      attach: "invoice",
    },
    payment_received: {
      enabled: true,
      template: "payment_received_receipt",
      attach: "receipt",
    },
    order_dispatched: {
      enabled: false,
      template: "order_dispatched",
      attach: null,
    },
    order_delivered: {
      enabled: false,
      template: "order_delivered",
      attach: null,
    },
    order_cancelled: {
      enabled: false,
      template: "order_cancelled",
      attach: null,
    },
  },
  retry: { maxAttempts: 5, backoffSeconds: [30, 120, 600, 1800, 7200] },
  optIn: { required: true, checkboxDefaultChecked: false },
  pdf: { paper: "A4", showTaxLine: false },
} as const satisfies NotificationsConfig;
