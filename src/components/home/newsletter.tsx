import { featuresConfig, homeConfig } from "@/config";

import { NewsletterForm } from "./newsletter-form";

/** "Get offers & new scents first" email sign-up. */
export function Newsletter() {
  if (!featuresConfig.newsletter) return null;
  const { title, text } = homeConfig.newsletter;

  return (
    <section className="bg-card py-12 lg:py-[72px]">
      <div className="container-page">
        <div className="flex flex-col gap-6 rounded-[20px] bg-secondary p-6 lg:flex-row lg:items-center lg:justify-between lg:px-14 lg:py-12">
          <div className="flex flex-col gap-2">
            <h2 className="text-[28px] leading-tight lg:text-4xl">{title}</h2>
            <p className="text-sm lg:text-[15px]">{text}</p>
          </div>
          <NewsletterForm />
        </div>
      </div>
    </section>
  );
}
