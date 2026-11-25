import type { Metadata, Viewport } from "next";

import { seoConfig, siteConfig } from "@/config";
import { inter, playfair } from "@/lib/fonts";
import { themeInitScript } from "@/lib/theme";
import { AppProviders } from "@/providers/app-providers";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: seoConfig.defaultTitle, template: seoConfig.titleTemplate },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: siteConfig.locale.replace("-", "_"),
    url: "/",
    images: [
      {
        url: seoConfig.ogImage.path,
        width: seoConfig.ogImage.width,
        height: seoConfig.ogImage.height,
        alt: seoConfig.ogImage.alt,
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: siteConfig.brand.themeColor,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang={siteConfig.language}
      className={`${inter.variable} ${playfair.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
