import { SectionHeading } from "@/components/common/section-heading";
import { homeConfig } from "@/config";

/** "Order in 3 Steps — No Account Needed". */
export function OrderSteps() {
  const { eyebrow, title, steps } = homeConfig.orderSteps;

  return (
    <section className="py-12 lg:py-[72px]">
      <div className="container-page flex flex-col gap-6 lg:gap-8">
        <SectionHeading eyebrow={eyebrow} title={title} />
        <ol className="grid gap-3 lg:grid-cols-3 lg:gap-6">
          {steps.map((step, i) => (
            <li
              key={step.title}
              className="flex items-center gap-4 rounded-[20px] bg-card p-4 shadow-sm lg:items-start lg:p-7"
            >
              <span
                className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground lg:size-11"
                aria-hidden
              >
                {i + 1}
              </span>
              <div className="flex flex-col gap-1 lg:gap-2">
                <h3 className="font-sans text-base font-semibold lg:font-serif lg:text-xl lg:font-normal">
                  <span className="sr-only">Step {i + 1}: </span>
                  {step.title}
                </h3>
                <p className="text-xs text-muted-foreground lg:text-[15px]">
                  {step.text}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
