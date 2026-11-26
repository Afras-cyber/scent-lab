import { BottomNav } from "@/components/layout/bottom-nav";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { TopBar } from "@/components/layout/top-bar";
import { WhatsappFloat } from "@/components/layout/whatsapp-float";
import { waLink } from "@/lib/whatsapp/link";

export default function StorefrontLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <a
        href="#main"
        className="sr-only z-50 rounded-full bg-gold px-4 py-2 font-semibold text-brand-deep focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <TopBar />
      <Header />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
      <WhatsappFloat />
      <BottomNav whatsappHref={waLink()} />
    </>
  );
}
