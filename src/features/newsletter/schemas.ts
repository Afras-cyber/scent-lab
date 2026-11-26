import { z } from "zod";

export const subscribeSchema = z.object({
  email: z
    .email("Enter a valid email address")
    .max(254)
    .transform((e) => e.toLowerCase()),
});

export type SubscribeState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string };
