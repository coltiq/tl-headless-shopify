# Open items — red flags, accepted limits, deferred work

The single running list of everything still outstanding in this storefront.
Consolidated 2026-07-25 from the shipped build plans (garage Phase 1 and 2,
category URLs Phase 3) and the Phase 3 self-audit, all of which were folded
into `CLAUDE.md` and deleted.

Architecture and contracts live in `CLAUDE.md`. Admin setup lives in
`docs/shopify-setup.md`. **This file is only what is broken, bounded, or not
built yet.**

Nothing is deployed or indexed. Several entries below stop being cheap the
moment that changes — they're marked **before launch**.

---

## 1. Blocked on admin

### 1.1 The deep nav links still 404 — five of seven

**The single highest-impact item here, and it needs no code.**

Verified against the live store: `/lighting`, `/parts`, and `/design-build`
resolve; `/lighting/rock-lights`, `/lighting/rock-lights/diy-kits`,
`/lighting/rock-lights/plug-play-kits`, and
`/lighting/rock-lights/singles-spares` all render the branded 404. Same failure
the 2026-07-24 audit found.

The `nav_item` entries have no `slug` or `collection` values, so the category
tree builds empty and the app falls back to `link`, which still holds
hand-typed deep paths nothing serves. The URL machinery is built and verified;
the data isn't there.

**Fix:** `docs/shopify-setup.md` Part 4.3. Safe one item at a time — a derived
path wins wherever a slug exists, and untouched items keep working off `link`.

### 1.2 Fitment is inert until the Tag filter is enabled

Search & Discovery → Filters → enable the **Tag** filter. Until then Shopify
**silently discards** the `filters` argument on `collection.products` — no
error, no warning — and every vehicle page is really being filtered by the
in-memory safety net over the first 100 products in the collection.

> **Verification gate, the moment it's on.** The app sends two `tag` filters and
> depends on them combining with **OR** (`fits-<generation>` OR
> `fits-universal`). If Shopify ANDs them, no product can match both and every
> vehicle page goes blank. That is a **code** fix, not an admin one, and it is
> untestable until the filter is enabled.

### 1.3 No product carries a `fits-*` tag yet

Selecting a truck currently empties every category page and every search.
`docs/shopify-setup.md` Part 6.

### 1.4 Homepage collections don't exist

`hidden-homepage-carousel` and `hidden-homepage-featured-items` are missing —
the build logs `No collection found` for both and the homepage renders zero
products.

---

## 2. Red flags in the current build

### 2.1 `notFound()` returns HTTP 200, app-wide

Under `cacheComponents` the route shell is flushed before `notFound()` is
reached, so Next cannot set the status. This predates the fitment work
(`/product/does-not-exist` behaves the same).

Middleware can't fix it the way it fixed the redirects: it would have to know
every valid URL, not just the redirecting ones — a handle allowlist at the edge.

`robots: { index: false }` on `app/not-found.tsx` is the mitigation. **Before
launch:** watch Search Console for soft-404s, and escalate to the allowlist only
if they actually show up.

> Resolved 2026-07-25: the flat → deep **redirects** had the same root cause and
> were degrading to client-side redirects with a 200. `middleware.ts` now issues
> real 308s. `export const dynamic = "force-dynamic"` is rejected outright by
> `cacheComponents`, so middleware was the only route.

### 2.2 Nothing guards the category tree walk

`buildNavProjection` decides every category URL on the site, and there is no
test suite in this repo. Worse, `npm run build` currently exercises **none** of
it — the store has no slugs, so every prerendered path comes from the flat
collection fallback.

It was verified once with a fixture through `npx tsx`, covering derived paths at
three depths, L1 contributing no segment, headings attaching children to the
grandparent, `childPaths` bubbling through a heading, four-digit and duplicate
slug rejection, cross-L1 duplicate paths, explicit collection references,
missing references, root-first ancestors, `indexByHandle` first-wins, and six
slug-regex cases. All 19 passed. **That script was deleted.**

`lib/categories.ts` was kept free of `next/*` and env imports specifically so
this is easy to redo properly. **Highest-value follow-up in this document.**

### 2.3 `app/api/og` is a public image generator

Next's signed `opengraph-image` convention can't be used under a catch-all
segment (`Error: Catch-all must be the last part of the URL`), so category OG
cards come from a plain route handler taking `?title=`.

The title is trimmed, capped at 80 characters, and rendered as text into an
`ImageResponse` — no HTML parsing, nothing to inject — so exposure is bounded.
But it is a public surface the file convention would not have created. The
alternative, if that ever matters, is dropping per-category cards and letting
every category inherit the site-wide `app/opengraph-image.tsx`.

### 2.4 Middleware runs on every non-asset request

For the two path shapes that could be a flat collection URL (one segment, or a
handle plus `make/model/year`) it may block on one internal fetch per instance
per minute. Nav edits take up to 60s to change redirect behavior; the pages
themselves are unaffected, since they read the cached tree directly.

**Before launch:** if Vercel Deployment Protection covers production, confirm
middleware's internal request to `/api/category-index` isn't blocked. It
degrades safely (falls through to `next()`), but the 308s quietly stop.

### 2.5 Cascading collection membership can't be verified

The app assumes a parent collection contains everything in its descendants —
that assumption is what lets every category page be one query with native
sorting. If a product is added to a leaf but not its parents, the parent page
silently under-reports: no error, no empty grid, just a quietly incomplete page
nobody notices for months.

**Recommendation: make the parent tiers smart collections** (rules on tag or
product type) so membership is computed and cannot drift. Leaves can stay
manual.

### 2.6 Moving a category in admin changes its URL

That is the point of derived paths, and it is free while nothing is indexed.
**Before launch** it needs either a redirect table or a rule that categories
don't move.

---

## 3. Accepted limits

**Catalog and fitment**

- `first: 100` per collection query. With server-side tag filtering the cap
  applies to _matching_ products, so it only bites when >100 products fit one
  vehicle in one category. Until the Tag filter is on, the in-memory safety net
  sees only the first 100 products in the collection. Pagination is out of scope.
- An untagged product vanishes from vehicle pages and filtered search.
  Deliberate — better hidden than shown with unconfirmed fitment.
- A Lifestyle collection created without `custom.fitment_disabled` behaves like
  a parts category (garage bounce fires, vehicle URLs resolve) until the flag is
  set. Visible symptom, one-toggle fix.
- 250 vehicle metaobject entries, one Storefront page, no pagination. Logged
  when exceeded.
- Overlapping generations for the same make+model are ambiguous, so the app
  keeps the first and drops the rest with an error. Admin fixes the data; the
  app never guesses.
- If every vehicle entry is deleted, the five fallback stubs resurrect. Fine
  during rollout. Once the metaobject is the stable source, returning `[]`
  instead is a small follow-up — an empty list renders the garage UI with an
  empty picker and no redirects, which is correct once intentional.
- `fits-*` tags are applied manually per product. See §4.3.

**URLs and SEO**

- **Vehicle URLs are absent from the sitemap**, deliberately. Categories ×
  generations is a combinatorial pile of near-duplicates while the catalog is
  thin, and they're crawlable anyway. Revisit when real `fits-*` coverage makes
  them distinct: one addition to `app/sitemap.ts` emitting category × generation
  first-year URLs for fitment-enabled collections.
- **Cross-vehicle near-duplicates while the catalog is thin.** With few products
  (or mostly `fits-universal`), `/lighting/ford/f150/2021` and
  `/lighting/chevy/silverado/2019` can render the same grid under different
  titles. Google soft-deduplicates rather than penalizing. Escalation lever if
  Search Console flags it: noindex a vehicle page whose filtered grid equals the
  full collection. Don't build until needed.
- Nav caps (8/12/12/16) bound the category URL space, not just the menu. The app
  logs when a level is sitting on one.
- Depth is unbounded in the resolver but capped at four nav levels by the query —
  three URL segments. Going deeper means another nesting level in `nav.ts` and a
  cost review.
- A collection in two places in the tree gets two paths; first in walk order
  wins the canonical, the other still renders. Visible in the sitemap if it
  happens.
- Category path segments are case-sensitive: `/Lighting` is a 404. Vehicle
  segments are lowercased before resolution, so `/lighting/Ford/f150/2021`
  resolves and canonicalizes down. Fixing the category half means lowercasing
  the whole path or adding a redirect.
- Any single-segment URL that isn't a collection handle or a real route 404s.
  Intentional — there is no CMS fallback; custom pages are code routes.

**Admin ergonomics**

- `layout: landing` is stored and ignored — a node set to it renders the grid.
  Admin can set a field that visibly does nothing until §4.1 ships.
- The picker's Year list spans every generation's range, so it can offer years
  for which only one make exists. Fine at this catalog size.

---

## 4. Deferred work

### 4.1 Phase 3B — authored landing pages

Deferred by decision on 2026-07-25: every category uses the default full grid
until after the UI pass, when the section schema can be designed against the
real page instead of guessed at. `layout` defaults to `grid` and `sections` is
simply unread until then.

- The `category_section` metaobject schema is already recorded in
  `docs/shopify-setup.md` Part 1.5. **Don't build it yet.**
- `nav_item.sections` is **deliberately not in the nav query.** It is a
  metaobject-reference _list_, so selecting it adds another multiplying
  connection at all four levels of a query whose caps already multiply
  8×12×12×16 — and a cost rejection drops the entire nav to the native-menu
  fallback, i.e. the whole site's navigation and category space disappear.
  Paying that risk for a field nothing reads is a bad trade. Add it with this
  step, alongside a fresh cost review.
- `CategoryNode` correspondingly has no `sectionIds`. Two lines when needed.
- Rendering intent: sections render top to bottom, `show_grid` decides whether
  the full grid follows, and **each section's products go through the same
  fitment filter as the grid** — otherwise a landing page quietly becomes the
  one place that shows parts that don't fit.

### 4.2 The four L1 sections are title-only stubs

`/parts`, `/design-build`, `/lifestyle`, `/behind-the-build` render a heading
and nothing else. Real pages come after the backend work.

### 4.3 Automating `fits-*` tags

Recorded from the Phase 2 decision discussion, not built: a product metafield of
`vehicle` references plus Shopify Flow (or a bulk script) deriving the tags
automatically. Better admin UX, and **zero app changes** — tags stay the
filtering mechanism either way.

### 4.4 Link sweep before launch

Audit the footer menu (`next-js-frontend-footer-menu`) and every nav `link`
field. Shopify CMS pages are not rendered, so any `/pages/<handle>` link — or a
bare `/<handle>` pointing at a Shopify page — 404s. End state: no CMS-page links
anywhere, every page a custom code route.
