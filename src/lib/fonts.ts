import { Inter, Playfair_Display } from "next/font/google";

// Headings and product names: Playfair Display. UI and body text: Inter.
// Both match the Figma exports.

export const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-playfair",
  display: "swap",
});

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
