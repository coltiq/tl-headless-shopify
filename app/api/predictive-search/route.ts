import { getPredictiveSearch } from "lib/shopify";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const q = req.nextUrl.searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ products: [], collections: [] });
  }

  return NextResponse.json(await getPredictiveSearch(q));
}
