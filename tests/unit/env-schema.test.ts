import { describe, expect, it } from "vitest";

import { parsePublicEnv, parseServerEnv } from "@/lib/env-schema";

const base = {
  NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
  NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_x",
  SUPABASE_SECRET_KEY: "sb_secret_x",
};

describe("env schema", () => {
  it("accepts the Phase 0 minimum", () => {
    expect(parseServerEnv(base).success).toBe(true);
  });

  it("requires the Supabase secret key on the server", () => {
    const rest = { ...base, SUPABASE_SECRET_KEY: undefined };
    expect(parseServerEnv(rest).success).toBe(false);
  });

  it("treats empty values as unset", () => {
    expect(
      parseServerEnv({ ...base, AUTH_SECRET: "", REVALIDATE_SECRET: "" })
        .success,
    ).toBe(true);
  });

  it("rejects short secrets when they are set", () => {
    expect(
      parseServerEnv({ ...base, REVALIDATE_SECRET: "short" }).success,
    ).toBe(false);
  });

  it("public env ignores server secrets", () => {
    const result = parsePublicEnv(base);
    expect(result.success && "SUPABASE_SECRET_KEY" in result.data).toBe(false);
  });
});
