import { NEXT_MIDDLEWARE_RESERVED_SEGMENTS } from "lib/constants";
import { NextResponse, type NextRequest } from "next/server";

// Real HTTP 308s for the flat → deep category redirect.
//
// Why this exists: `permanentRedirect()` inside the page is *not* a 308 under
// `cacheComponents`. The route shell is flushed before the redirect is reached,
// so Next degrades it to a client-side `__next-page-redirect` served with a 200
// — which crawlers treat far more weakly than a redirect, and which was the
// whole point of redirecting instead of leaning on a canonical tag.
// `export const dynamic = "force-dynamic"` would fix it and is rejected outright
// by `cacheComponents`. Middleware runs before any rendering, so it can.
//
// The in-page `permanentRedirect()` stays as a fallback: everything here
// degrades to `NextResponse.next()` on any failure, and then the page still
// gets the visitor to the right URL, just weakly. Middleware must never be the
// reason a page fails to render.
//
// Redirects handled:
//   /<handle>                     → /<tree path>                (in-tree only)
//   /<handle>/<make>/<model>/<yr> → /<tree path>/<make>/<model>/<yr>
//   /search/<handle>              → /<tree path> or /<handle>    (legacy route)

// One minute of staleness after a nav edit, in exchange for one internal
// request per instance per minute instead of one per visitor request.
const INDEX_TTL_MS = 60_000;

let cached: { map: Record<string, string>; at: number } | null = null;
let inflight: Promise<Record<string, string> | null> | null = null;

async function categoryRedirects(
  origin: string,
): Promise<Record<string, string> | null> {
  if (cached && Date.now() - cached.at < INDEX_TTL_MS) return cached.map;

  // Collapse concurrent misses onto one request.
  inflight ??= fetch(`${origin}/api/category-index`)
    .then((res) => (res.ok ? res.json() : null))
    .then((body) => body?.redirects ?? null)
    .catch(() => null)
    .finally(() => {
      inflight = null;
    });

  const map = await inflight;
  if (map) {
    cached = { map, at: Date.now() };
    return map;
  }

  // Deployment protection, a cold start mid-deploy, anything: serve the last
  // good map if there is one, otherwise let the request through untouched.
  return cached?.map ?? null;
}

export async function middleware(request: NextRequest) {
  const { pathname, search, origin } = request.nextUrl;
  const segments = pathname.split("/").filter(Boolean);

  // Only two shapes can ever be a flat collection URL: a bare handle, or a
  // handle plus make/model/year. Everything else — the homepage, product
  // pages, the L1 code routes — skips the index lookup entirely, so the
  // internal fetch never sits in front of the common path.
  const isLegacySearch = segments.length === 2 && segments[0] === "search";
  const isFlatShape =
    (segments.length === 1 || segments.length === 4) &&
    !NEXT_MIDDLEWARE_RESERVED_SEGMENTS.has(segments[0]!);

  if (!isLegacySearch && !isFlatShape) return NextResponse.next();

  const handle = segments[isLegacySearch ? 1 : 0]!;
  const treePath = (await categoryRedirects(origin))?.[handle];

  if (isLegacySearch) {
    // Nothing links here any more, so it redirects unconditionally: to the
    // tree path when the handle has one, to the flat path otherwise.
    return redirect(request, `${treePath ?? `/${handle}`}`, search, pathname);
  }

  if (!treePath) return NextResponse.next();

  const vehicle = segments.slice(1).join("/");
  return redirect(
    request,
    `${treePath}${vehicle ? `/${vehicle}` : ""}`,
    search,
    pathname,
  );
}

// Never redirect a URL to itself. The index route already drops handles whose
// tree path is their own flat path (the common depth-1 case), but a stale
// memoized map must not be able to produce an infinite loop.
const redirect = (
  request: NextRequest,
  to: string,
  search: string,
  from: string,
) =>
  to === from
    ? NextResponse.next()
    : NextResponse.redirect(new URL(`${to}${search}`, request.url), 308);

export const config = {
  // Skip Next internals, route handlers (including the index this reads — a
  // self-request loop would be fatal), and anything with a file extension.
  matcher: ["/((?!_next/|api/|.*\\.).*)"],
};
