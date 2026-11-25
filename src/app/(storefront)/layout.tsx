import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { featuresConfig, navigationConfig, siteConfig } from "@/config";

// Placeholder shell. Phase 1 replaces it with the top bar, header, mega menu,
// footer, mobile bottom nav and WhatsApp float from the Figma exports.
export default function StorefrontLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <header className="bg-brand-deep text-brand-foreground">
        <div className="container-page flex h-20 items-center justify-between">
          <Logo />
          {featuresConfig.darkMode && <ThemeToggle />}
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="bg-brand-deep text-brand-foreground/70">
        <div className="container-page py-10 text-sm">
          <p className="max-w-sm">{navigationConfig.footer.blurb}</p>
          <p className="mt-6">
            © {siteConfig.name} · {siteConfig.domain}
          </p>
        </div>
      </footer>
    </>
  );
}
