"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { subscribe } from "@/features/newsletter/actions";
import type { SubscribeState } from "@/features/newsletter/schemas";

const initialState: SubscribeState = { status: "idle" };

export function NewsletterForm() {
  const [state, action, pending] = useActionState(subscribe, initialState);

  if (state.status === "success") {
    return (
      <p role="status" className="font-semibold text-heading lg:text-right">
        Thanks! You’re on the list.
      </p>
    );
  }

  const error = state.status === "error" ? state.message : null;
  return (
    <form action={action} className="flex flex-col gap-2" noValidate>
      <div className="flex flex-col gap-3 lg:flex-row">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="Your email address"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "newsletter-error" : undefined}
          className="h-12 w-full rounded-xl border bg-card px-4 text-[15px] placeholder:text-muted-foreground focus-visible:border-gold focus-visible:outline-none lg:w-[360px]"
        />
        {/* Honeypot: hidden from people, filled in by bots. */}
        <input
          name="company"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
          className="hidden"
        />
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Subscribing…" : "Subscribe"}
        </Button>
      </div>
      {error && (
        <p
          id="newsletter-error"
          role="alert"
          className="text-sm text-destructive"
        >
          {error}
        </p>
      )}
    </form>
  );
}
