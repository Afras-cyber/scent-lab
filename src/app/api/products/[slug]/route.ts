import { NextResponse, type NextRequest } from "next/server";

import { getProductBySlug } from "@/features/catalog/queries";
import { productSlugSchema } from "@/features/catalog/schemas";

// Quick view data. Reads the cached public catalog; the CDN may keep a
// response for a minute.
export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/products/[slug]">,
) {
  const parsed = productSlugSchema.safeParse((await ctx.params).slug);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }
  const product = await getProductBySlug(parsed.data);
  if (!product) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  return NextResponse.json(product, {
    headers: { "Cache-Control": "public, s-maxage=60, max-age=0" },
  });
}
