"use client";

import { Minus, Plus } from "lucide-react";
import { Accordion } from "radix-ui";

import { productConfig } from "@/config";

const copy = productConfig.details;

/**
 * Description, Delivery & returns, Authenticity and FAQ (Figma accordion
 * card). The description starts open.
 */
export function ProductDetails({
  description,
}: {
  description: string | null;
}) {
  const sections = [
    ...(description
      ? [{ title: copy.description, body: <p>{description}</p> }]
      : []),
    ...copy.sections.map((s) => ({ title: s.title, body: <p>{s.text}</p> })),
    ...(copy.faq.length > 0
      ? [
          {
            title: copy.faqTitle,
            body: (
              <dl className="flex flex-col gap-3">
                {copy.faq.map((item) => (
                  <div key={item.question}>
                    <dt className="font-medium text-heading">
                      {item.question}
                    </dt>
                    <dd>{item.answer}</dd>
                  </div>
                ))}
              </dl>
            ),
          },
        ]
      : []),
  ];

  return (
    <Accordion.Root
      type="multiple"
      defaultValue={description ? [copy.description] : []}
      className="container-page"
    >
      <div className="divide-y overflow-hidden rounded-[20px] bg-card shadow-sm">
        {sections.map(({ title, body }) => (
          <Accordion.Item key={title} value={title}>
            <Accordion.Header>
              <Accordion.Trigger className="group flex w-full items-center justify-between gap-4 px-5 py-5 text-left text-base font-semibold text-heading outline-none focus-visible:bg-muted lg:px-6">
                {title}
                <Plus
                  className="size-5 shrink-0 group-data-[state=open]:hidden"
                  aria-hidden
                />
                <Minus
                  className="size-5 shrink-0 group-data-[state=closed]:hidden"
                  aria-hidden
                />
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className="px-5 pb-5 text-sm leading-relaxed text-foreground/85 lg:px-6">
              {body}
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </div>
    </Accordion.Root>
  );
}
