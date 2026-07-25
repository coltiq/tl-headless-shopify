import { indexByHandle } from "lib/categories";
import { getCategoryTree } from "lib/shopify";
import { NextResponse } from "next/server";

// Collection handle → canonical tree path, for `middleware.ts`.
//
// Middleware cannot call `use cache` functions, so it can't read the category
// index directly — but a route handler can, and this one adds no Shopify
// traffic: getCategoryTree() is the same cached entry the pages read, so a hit
// here is a memory read. Middleware fetches this once per instance per minute
// and memoizes it.
//
// The payload is nav structure, which is already public in the rendered menu.
export async function GET() {
  const redirects: Record<string, string> = {};

  for (const [handle, node] of indexByHandle(await getCategoryTree())) {
    // A depth-1 category whose slug matches its collection handle already
    // lives at /<handle> — the flat URL *is* the canonical one. Emitting it
    // would make middleware redirect the page to itself, forever. This is the
    // common case for top-level categories, not an edge case.
    if (node.path === `/${handle}`) continue;

    redirects[handle] = node.path;
  }

  return NextResponse.json({ redirects });
}
