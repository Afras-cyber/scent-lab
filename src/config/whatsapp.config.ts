import type { WhatsappConfig } from "./schema";

// WhatsApp is click-to-chat only: wa.me links open WhatsApp Web or the app
// with a prefilled message to the shop number in `site.config.ts`. No
// WhatsApp Business API, so nothing is sent automatically.
export const whatsappConfig = {
  messages: {
    product: "Hello AYAD, I'd like to order {product} ({size}).\n{url}",
    orderPlaced:
      "Hello AYAD, I just placed order {orderCode} (total {total}). Please confirm.",
    orderHelp: "Hello AYAD, I have a question about order {orderCode}.",
    notifyStock:
      "Hello AYAD, please tell me when {product} is back in stock.\n{url}",
    search: "Hello AYAD, I'm looking for “{query}”. Can you help me find it?",
  },
} as const satisfies WhatsappConfig;
