# Phase 3 red flags — self-audit of the category-URL build

Written 2026-07-25, immediately after implementing
`docs/plans/PLAN-CATEGORY-URLS.md` Steps 1–6 and 8. Everything here is either a
place the build **deviates from the plan**, or a place the plan turned out to be
**wrong about what the framework does**. Known limits the plan already accepted
(cascading collection membership, moving categories changes URLs, nav caps
bounding the URL space, `first: 100`) are not repeated — they're in the plan and
in `docs/shopify-setup.md`.

Ordered by how much they matter.

---

## 1. ~~The 308s are not 308s~~ — **FIXED 2026-07-25.** The 404s still aren't 404s.

**Original finding.** The plan's URL grammar promises `/rock-lights` → **308** →
`/lighting/rock-lights`, and Step 6 leans on that being "stronger than a
canonical tag." It wasn't. Under `cacheComponents` the route shell is flushed
before `permanentRedirect()` is reached, so Next degraded the redirect to a
client-side `__next-page-redirect` payload served with **HTTP 200** — no
`Location` header. Same root cause as the 404-returns-200 problem the plan
accepted for `notFound()`; the plan spotted it for 404s and missed it for
redirects.

`export const dynamic = "force-dynamic"` would fix it and is rejected outright
by `cacheComponents` at build time.

**The fix that shipped:** `middleware.ts`, which runs before any rendering.

- `app/api/category-index/route.ts` serves `handle → tree path`. Middleware
  can't call `use cache` functions, but a route handler can, and this one adds
  **no Shopify traffic** — `getCategoryTree()` is the same cached entry the
  pages read.
- Middleware memoizes that map for 60s per instance and only fetches it for the
  two path shapes that could possibly be a flat collection URL (one segment, or
  a handle plus `make/model/year`). The homepage, product pages, and the L1 code
  routes never touch it.
- Every failure path — a blocked internal request, a cold start mid-deploy —
  falls through to `NextResponse.next()`, and the in-page `permanentRedirect()`
  still gets the visitor there, just weakly. Middleware is never the reason a
  page fails to render.

Verified: `/rock-lights` → **308** → `/lighting/rock-lights`;
`/rock-lights/ford/f150/2021` → 308 with the vehicle suffix carried;
`/rock-lights?sort=price-asc` → 308 with the query carried; `/search/<handle>`
→ 308; `/gift-cards`, `/parts`, `/product/<handle>`, `/` all untouched.

> **A bug this uncovered, worth remembering.** A depth-1 category whose slug
> matches its collection handle (`slug: lighting` → `/lighting`, collection
> `lighting`) maps a handle to its own flat path. Redirecting `/lighting` →
> `/lighting` is an infinite loop, and that is the _common_ shape for top-level
> categories, not an edge case. The index route now drops any handle whose tree
> path is its own flat path, and middleware independently refuses to redirect a
> URL to itself. Both guards were verified against a deliberately
> loop-inducing map.

**Still true:** `notFound()` returns **HTTP 200**. Middleware can't fix that
without a handle allowlist at the edge — it would have to know every valid URL,
not just the redirecting ones. `robots: { index: false }` on `app/not-found.tsx`
remains the mitigation; watch Search Console for soft-404s.

**New cost to be aware of:** middleware now runs on every non-asset request.
For the two matching path shapes it may block on one internal fetch per instance
per minute. Nav edits take up to 60s to change redirect behavior — the pages
themselves are unaffected, since they read the cached tree directly.

---

## 2. `opengraph-image` cannot exist under a catch-all — OG images moved to a route handler

**Severity: medium — a deviation from the plan's file list.**

The plan flagged this as the one piece it hadn't seen build. It doesn't build:

```
Error: Catch-all must be the last part of the URL in route "/[...path]/opengraph-image".
```

There is no "beside the page" to move it to — the segment _is_ the catch-all.

**What shipped instead:** `app/api/og/route.tsx`, a GET handler that renders the
same `components/opengraph-image` card from a `?title=` param, plus
`ogImageUrl()` in `lib/utils.ts`. `generateMetadata` on the catch-all points
`openGraph.images` at it. Verified: 200, `image/png`, 25 KB.

**Why this is a red flag anyway:** it is a public, unauthenticated image
generator that renders caller-supplied text. The title is trimmed and capped at
80 characters and is rendered as text into an `ImageResponse` (no HTML parsing,
nothing to inject), so the exposure is bounded — but it is a new public surface
that Next's signed `opengraph-image` convention would not have created. If that
matters, the alternative is dropping per-category OG cards and letting every
category inherit the site-wide `app/opengraph-image.tsx`.

---

## 3. `nav_item.sections` is deliberately not in the query

**Severity: low — a deliberate deviation, called out because the plan's Step 1
field table lists it.**

`sections` is a metaobject-reference **list**, so selecting it means another
multiplying connection at all four nav levels of a query whose caps already
multiply 8×12×12×16. The existing comment in `lib/shopify/queries/nav.ts` warns
that a cost rejection drops the entire nav to the native-menu fallback — i.e.
the failure mode is "the whole site's navigation and category space disappear."

Paying that risk for a field nothing reads (Phase 3B is deferred by decision 8)
is a bad trade. `slug`, `collection`, `layout`, and `show_grid` — all cheap —
are in the query and read. `sections` gets added with Step 7, when there is
something to render and a reason to re-review cost.

Consequence: `CategoryNode` has no `sectionIds`, which the plan's type sketch
included. Adding it is a two-line change alongside the query.

---

## 4. The deep nav links still 404, and only admin can fix that

**Severity: high as a project risk, zero as a code defect.**

Verified against the live store after the build: of the seven live nav
destinations, `/lighting`, `/parts`, and `/design-build` resolve;
`/lighting/rock-lights`, `/lighting/rock-lights/diy-kits`,
`/lighting/rock-lights/plug-play-kits`, and `/lighting/rock-lights/singles-spares`
all render the branded 404. **Same 5-of-7 failure the audit found.**

That is expected. The `nav_item` entries have no `slug` or `collection` values
yet, so the category tree builds empty and the app falls back to `link`, which
still contains the hand-typed deep paths nothing serves. The URL machinery is
built and tested; the data isn't there.

`docs/shopify-setup.md` Part 4.3 is now the migration instruction. The migration
is safe to do one item at a time — a derived path wins when a slug exists, and
`link` keeps working everywhere else.

---

## 5. The category walk is only tested by a throwaway fixture

**Severity: medium.**

Because the live store has no slugs, `npm run build` exercises **none** of the
tree walk — every prerendered path came from the flat collection fallback. The
walk was verified with a fixture script run through `npx tsx` covering: derived
paths at three depths, L1 contributing no segment, heading nodes attaching
children to the grandparent, `childPaths` bubbling through a heading, four-digit
slug rejection, duplicate-sibling rejection, cross-L1 duplicate-path rejection,
explicit-collection (never inferred), missing collection reference,
root-first ancestors, `indexByHandle` first-wins, and the six slug-regex cases.
All 19 passed; the three expected `console.error` lines fired.

That script was deleted — this repo has no test runner, and the plan didn't ask
for one. **So there is nothing standing guard on the walk.** The single most
valuable follow-up in this whole document is turning that fixture into a real
test. The walk is the piece where a subtle regression silently changes every
category URL on the site.

To make that possible, the walk was moved out of `lib/shopify/index.ts` into
`lib/categories.ts` (`buildNavProjection`), which has no `next/*` or env
imports and runs standalone. `menuUrlToPath` is injected as a parameter for
exactly that reason.

---

## 6. Behaviors that differ from the old `[category]` route

Not defects, but worth knowing before the UI pass:

- **The `<h1>` on a category is the nav `label`, not the collection title.**
  They're allowed to differ, and the breadcrumb trail uses the label, so using
  the collection title would make the page disagree with its own breadcrumb.
  Flat (out-of-tree) collections still use the collection title — they have no
  label.
- **Vehicle segments are lowercased before resolution.** `/lighting/Ford/f150/2021`
  now renders (it 404'd before) and canonicalizes to the lowercase URL. The
  category segments themselves are still case-sensitive: `/Lighting` is a 404.
  Fixing that means either lowercasing the whole path or a redirect, and it
  wasn't in scope.
- **The `layout: landing` value is stored and ignored.** A node set to `landing`
  renders the grid. That is decision 8 (Phase 3B deferred), but it means admin
  can set a field that visibly does nothing.
- **`pnpm-lock.yaml` was already gone.** Step 8 lists it under dead code, but
  commit `633048c` removed it from git before this work started. What was
  sitting on disk was a fresh artifact regenerated by corepack when a stray
  `npm test` shelled out to pnpm — along with a `pnpm-workspace.yaml` that
  never belonged here. Both deleted, neither committed. Worth knowing that
  running pnpm in this repo silently recreates them.

---

## 7. Still untestable, still gating

Unchanged from the plan, repeated because it gates trusting any fitment number:
the Search & Discovery **Tag filter** is still off, so Shopify discards the
`filters` argument wholesale and every vehicle page is really being filtered by
the in-memory safety net over the first 100 products. The moment the filter is
enabled, confirm two `tag` filters **OR** rather than AND. If they AND, every
vehicle page goes blank and that is a code fix, not an admin one.
