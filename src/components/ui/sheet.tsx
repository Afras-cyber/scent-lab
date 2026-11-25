"use client";

import { X } from "lucide-react";
import { Dialog as SheetPrimitive } from "radix-ui";
import * as React from "react";

import { cn } from "@/lib/utils";

// Side drawer on Radix Dialog (focus trap, Esc, scroll lock). Used for the
// mobile menu, filters, the cart drawer and the WhatsApp order sheet.

const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetClose = SheetPrimitive.Close;
const SheetTitle = SheetPrimitive.Title;
const SheetDescription = SheetPrimitive.Description;

const sideClasses = {
  left: "inset-y-0 left-0 h-full w-full max-w-sm data-[state=closed]:animate-slide-out-left data-[state=open]:animate-slide-in-left",
  right:
    "inset-y-0 right-0 h-full w-full max-w-md data-[state=closed]:animate-slide-out-right data-[state=open]:animate-slide-in-right",
  bottom:
    "inset-x-0 bottom-0 max-h-[90dvh] rounded-t-[20px] data-[state=closed]:animate-slide-out-bottom data-[state=open]:animate-slide-in-bottom",
} as const;

function SheetContent({
  className,
  children,
  side = "right",
  showClose = true,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: keyof typeof sideClasses;
  showClose?: boolean;
}) {
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Overlay className="fixed inset-0 z-50 bg-brand-darkest/50 data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in" />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          "fixed z-50 flex flex-col overflow-y-auto bg-background shadow-xl outline-none",
          sideClasses[side],
          className,
        )}
        {...props}
      >
        {children}
        {showClose && (
          <SheetPrimitive.Close
            aria-label="Close"
            className="absolute top-5 right-5 inline-flex size-11 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-secondary/70"
          >
            <X className="size-5" aria-hidden />
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  );
}

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
};
