import { NextResponse, type NextRequest } from "next/server";

import { searchConfig } from "@/config";
import {
  getCatalog,
  listCollections,
  listNotes,
} from "@/features/catalog/queries";
import { searchQuerySchema } from "@/features/search/schemas";
import { searchCatalog } from "@/features/search/search";

// Popup search. Reads the cached public catalog, so it costs no database
// query per keystroke; the CDN may keep a response for a minute.
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const parsed = searchQuerySchema.safeParse({
    q: params.get("q") ?? "",
    collection: params.get("collection") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  const [catalog, collections, notes] = await Promise.all([
    getCatalog(),
    listCollections(),
    listNotes(),
  ]);
  const results = searchCatalog(
    catalog,
    collections,
    notes,
    parsed.data,
    searchConfig.maxProducts,
  );
  return NextResponse.json(results, {
    headers: { "Cache-Control": "public, s-maxage=60, max-age=0" },
  });
}
