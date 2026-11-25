import { siteConfig } from "@/config";

/** Replaces `{token}` placeholders; unknown tokens are left as they are. */
export function fillMessage(
  template: string,
  tokens: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in tokens ? String(tokens[key]) : match,
  );
}

/**
 * Click-to-chat link to the shop's WhatsApp number. Opens WhatsApp Web or the
 * app with `message` prefilled; nothing is sent until the customer taps send.
 */
export function waLink(
  message: string = siteConfig.contact.whatsapp.defaultMessage,
): string {
  const number = siteConfig.contact.whatsapp.number;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
