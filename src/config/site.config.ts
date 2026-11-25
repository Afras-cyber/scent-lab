import type { SiteConfig } from "./schema";

// Brand and contact details. Change the phone, WhatsApp number or logo here
// only; components read them from `@/config`.
// Values containing TODO or **** fail the production build (see schema.ts).
export const siteConfig = {
  name: "AYAD",
  legalName: "AYAD Scent Lab",
  tagline: "Smell Expensive. Feel Confident.",
  description:
    "Long-lasting oud, musk and amber attars and Arabic-inspired perfumes in Sri Lanka. Cash on Delivery and island-wide delivery.",
  url: "https://ayadscentlab.com",
  domain: "ayadscentlab.com",
  language: "en",
  locale: "en-LK",
  timezone: "Asia/Colombo",
  currency: { code: "LKR", symbol: "Rs", decimals: 0 },

  brand: {
    logoText: "AYAD",
    logoLetterSpacing: "0.42em",
    themeColor: "#081B1A",
  },

  contact: {
    phoneDisplay: "+94 77 675 6287",
    phoneE164: "+94776756287",
    whatsapp: {
      display: "+94 77 675 6287",
      number: "94776756287",
      defaultMessage: "Hello AYAD, I need help choosing a scent.",
    },
    email: "hello@ayadscentlab.com",
    hours: "Daily 10am – 10pm",
    // Printed on invoices and receipts.
    address: {
      line1: "TODO",
      city: "TODO",
      district: "TODO",
      country: "Sri Lanka",
    },
  },

  social: {
    instagram: "https://instagram.com/ayadscentlab",
    facebook: "",
    tiktok: "",
  },
} as const satisfies SiteConfig;
