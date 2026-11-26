import "server-only";

import { formatEnvIssues, parseServerEnv } from "./env-schema";

const parsed = parseServerEnv(process.env);

if (!parsed.success) {
  throw new Error(
    `Invalid environment variables:\n${formatEnvIssues(parsed.error)}`,
  );
}

/** Validated server environment. Import only from server code. */
export const env = parsed.data;
