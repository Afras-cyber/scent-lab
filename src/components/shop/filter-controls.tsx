"use client";

import { Check, ChevronUp } from "lucide-react";
import { Checkbox, Collapsible, Switch } from "radix-ui";
import { useId, type ComponentProps, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Collapsible filter section with a title and an optional selection count. */
export function FilterSection({
  title,
  selected = 0,
  showCount = false,
  children,
}: {
  title: string;
  selected?: number;
  showCount?: boolean;
  children: ReactNode;
}) {
  return (
    <Collapsible.Root
      defaultOpen
      className="border-b py-5 first:pt-0 last:border-b-0 last:pb-0"
    >
      <Collapsible.Trigger className="group flex w-full items-center justify-between gap-2 text-left">
        <span className="flex items-center gap-2 text-base font-semibold text-heading">
          {title}
          {showCount && selected > 0 && (
            <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-secondary px-1.5 text-[11px] font-semibold text-secondary-foreground">
              {selected}
            </span>
          )}
        </span>
        <ChevronUp
          className="size-4 text-heading transition-transform group-data-[state=closed]:rotate-180"
          aria-hidden
        />
      </Collapsible.Trigger>
      <Collapsible.Content className="pt-4">{children}</Collapsible.Content>
    </Collapsible.Root>
  );
}

/** Toggle pill used for notes, sizes, presets and the mobile sheet options. */
export function FilterPill({
  active,
  className,
  ...props
}: ComponentProps<"button"> & { active: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        "inline-flex h-9 items-center justify-center rounded-full border px-3.5 text-[13px] font-medium transition-colors disabled:pointer-events-none disabled:opacity-40",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "bg-card text-heading hover:bg-muted",
        className,
      )}
      {...props}
    />
  );
}

/** Checkbox row with a label and a count ("Men 18"). */
export function FilterCheckbox({
  label,
  count,
  checked,
  onCheckedChange,
}: {
  label: string;
  count: number;
  checked: boolean;
  onCheckedChange: () => void;
}) {
  const id = useId();
  const disabled = count === 0 && !checked;
  return (
    <div
      className={cn(
        "flex items-center gap-3 text-[15px]",
        disabled && "opacity-40",
      )}
    >
      <Checkbox.Root
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
        className="inline-flex size-5 shrink-0 items-center justify-center rounded-[5px] border border-input bg-card transition-colors data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
      >
        <Checkbox.Indicator>
          <Check className="size-3.5" strokeWidth={3} aria-hidden />
        </Checkbox.Indicator>
      </Checkbox.Root>
      <label htmlFor={id} className="flex-1 cursor-pointer text-foreground">
        {label}
      </label>
      <span className="text-xs text-muted-foreground">{count}</span>
    </div>
  );
}

/** Switch row ("In stock only"). */
export function FilterSwitch({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: () => void;
}) {
  const id = useId();
  return (
    <div className="flex items-center justify-between gap-3 text-[15px]">
      <label htmlFor={id} className="cursor-pointer text-foreground">
        {label}
      </label>
      <Switch.Root
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full bg-input transition-colors data-[state=checked]:bg-primary"
      >
        <Switch.Thumb className="block size-5 translate-x-0.5 rounded-full bg-white shadow transition-transform data-[state=checked]:translate-x-[22px]" />
      </Switch.Root>
    </div>
  );
}
