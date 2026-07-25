import OpengraphImage from "components/opengraph-image";
import type { NextRequest } from "next/server";

// Next's `opengraph-image` file convention cannot be used inside a catch-all
// segment ("Catch-all must be the last part of the URL"), so category pages
// get their card from this handler instead and point at it from
// generateMetadata. Same renderer as every other OG image in the app.
//
// The title is caller-supplied, so it is length-capped and rendered as text
// only — there is nothing here to inject into.
export async function GET(request: NextRequest) {
  const title = request.nextUrl.searchParams.get("title")?.trim().slice(0, 80);

  return OpengraphImage(title ? { title } : undefined);
}
