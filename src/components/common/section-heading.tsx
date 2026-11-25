import { cn } from "@/lib/utils";

// Small uppercase pill label above a serif heading, as used across the design.
export function SectionHeading({
  eyebrow,
  title,
  className,
}: {
  eyebrow: string;
  title: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-start gap-3", className)}>
      <span className="rounded-full bg-secondary px-3 py-1 text-[11px] font-semibold tracking-[0.12em] text-secondary-foreground uppercase">
        {eyebrow}
      </span>
      <h2 className="text-3xl font-semibold md:text-4xl">{title}</h2>
    </div>
  );
}
