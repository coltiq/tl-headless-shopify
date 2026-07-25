# Phase 3 — Multi-level category URLs + audit fixes

> Supersedes the flat one-segment URL space from PLAN-GARAGE.md Phase 1. The
> category path becomes variable-depth and is **derived from the `nav_item`
> tree**; vehicle segments stay exactly as they are, appended at the end. Also
> folds in the fixes from the 2026-07-24 audit.
>
> **Nothing is deployed or indexed** (confirmed with user) — URL shapes can
> change freely in this phase. That stops being true the moment this ships.

## Why

The audit found the nav authored against a URL space that doesn't exist:
`/lighting/rock-lights` and `/lighting/rock-lights/diy-kits` both 404, because
after `/<category>` segments 2–4 are reserved for `make/model/year`. Five of
seven live nav destinations are dead. The URL space is one level deep; the nav
is four.

## Decisions (made with user, 2026-07-25)

1. **Category paths are derived from tree position** in the `nav_item` tree —
   authors type a slug, the app builds the path. Re-parenting an item in admin
   moves its URL automatically; the menu and the URL space can never disagree.
2. **L1 is a section, not a segment.** The nav root's direct children (Parts,
   Customize, Lifestyle, Learn) group the menu and contribute nothing to any
   URL. `/lighting` is valid, `/parts/lighting` never exists. L1 `link` values
   (`/parts`, `/design-build`) are standalone destinations — custom code routes,
   outside the category space.
3. **`nav_item` is extended**, not replaced: new `slug`, `collection`
   (collection reference), `layout`, `sections`, `show_grid` fields. `label`
   becomes display-only; `link` is only for non-category destinations. The
   collection is an explicit reference — **the app never infers a handle from a
   slug**, because the two are allowed to differ.
4. **Vehicle segments stay bare** — the last three segments are `make/model/year`
   if and only if they resolve, and the full path is tried as a category
   _first_, so a real category always wins. Phase 1 URL grammar and canonical
   contract are unchanged.
5. **Default template is the flat filterable grid** (today's page). A category
   renders an authored landing page only where one has been built.
6. **Every category node has a collection.** Collection membership cascades in
   admin — a product in `rock-light-kits` is also in `rock-lights` and
   `lighting` — so a parent tier is a real collection containing everything
   beneath it, and no page ever has to merge its descendants. Every category is
   therefore one query with native Shopify sorting.
7. **Flat URLs 308 to the deep path** when the handle has a tree position;
   collections outside the tree (`gift-cards`, `shop-labor`, `the-lab`,
   `best-sellers`) keep rendering flat at `/<handle>`.

8. **Every collection uses the default full grid for now.** Authored landing
   pages (Step 7 / Phase 3B) are deferred until after the UI pass — the section
   schema will want to change once the real design exists.
9. **The four L1 sections are** Customize (`/design-build`), Parts (`/parts`),
   Lifestyle (`/lifestyle`), and Behind The Build (`/behind-the-build`). Title-
   only placeholder routes ship with this plan (built 2026-07-25); the real
   pages come after the backend work.

Deferred by user to their own admin pass, not blocking this build: `fits-*`
product tagging, `vehicle` metaobject entries, `custom.fitment_disabled`, the
Search & Discovery Tag filter, and the homepage collections.

## URL grammar

| URL                                         | Behavior                                                |
| ------------------------------------------- | ------------------------------------------------------- |
| `/lighting`                                 | category (tree depth 1); garage redirect fires          |
| `/lighting/rock-lights`                     | category (depth 2)                                      |
| `/lighting/rock-lights/kits`                | category (depth 3+, no limit)                           |
| `/lighting/rock-lights/kits/ford/f150/2021` | same category, fitment-filtered                         |
| `/lighting/rock-lights/kits?all=1`          | full grid, redirect suppressed                          |
| `/rock-lights` (handle has a tree position) | **308** → `/lighting/rock-lights`                       |
| `/gift-cards` (handle absent from tree)     | renders flat, no redirect                               |
| `/gift-cards/ford/f150/2021`                | flat collection + vehicle, if fitment-enabled           |
| `/parts`, `/design-build`                   | custom code routes (static siblings beat the catch-all) |
| anything else                               | `notFound()`                                            |

Resolution order (deterministic, no ambiguity — steps 1–2 are in-memory map
lookups against the cached index, so trying both is free):

```
1. whole path in the category index?        → category, no vehicle
2. segments ≥ 4, path minus last 3 in index
   AND last 3 resolve to a generation?      → category + vehicle
3. single segment that is a live collection? → flat render (or 308 if in tree)
4. 4 segments, [0] a live collection,
   [1..3] a generation?                     → flat + vehicle (or 308)
5. notFound()
```

## Files

| Action | File                                                                                                            |
| ------ | --------------------------------------------------------------------------------------------------------------- |
| Delete | `app/[category]/` entirely (page, layout, opengraph-image, garage-redirect)                                     |
| Create | `app/[...path]/page.tsx` — resolver + grid render mode (+ landing in 3B)                                        |
| Create | `app/[...path]/layout.tsx`, `app/[...path]/opengraph-image.tsx`, `app/[...path]/garage-redirect.tsx`            |
| Create | `app/[...path]/breadcrumbs.tsx` — trail + `BreadcrumbList` JSON-LD                                              |
| Create | `app/[...path]/category-sections.tsx` — authored landing sections (Phase 3B)                                    |
| Create | `lib/categories.ts` — client-safe pure helpers: path building, index lookup, ancestor walk                      |
| Modify | `lib/shopify/queries/nav.ts` — `slug`, `collection` reference, `layout`, `sections`, `show_grid` per level      |
| Modify | `lib/shopify/index.ts` — `getNavTree()`; `getNavMenu`/`getCategoryTree` project from it                         |
| Modify | `lib/shopify/types.ts` — `ShopifyNavItem` new fields, `CategoryNode`, `CategorySection`                         |
| Done   | `app/design-build/`, `app/parts/`, `app/lifestyle/`, `app/behind-the-build/` — L1 title-only stubs (2026-07-25) |
| Create | `app/not-found.tsx` — branded 404, `robots: { index: false }`                                                   |
| Modify | `app/sitemap.ts` — tree paths + out-of-tree flat paths + static routes                                          |
| Modify | `app/search/[collection]/page.tsx` — `permanentRedirect` to the canonical path                                  |
| Create | `components/product/fitment-badge.tsx` — PDP "fits your truck" island                                           |
| Modify | `app/product/[handle]/page.tsx` — mount the badge                                                               |
| Modify | `components/layout/header/vehicle-picker.tsx` — "My truck isn't listed" escape hatch                            |
| Modify | `docs/shopify-setup.md` — new field table, slug rules, tree→URL explanation                                     |
| Delete | `lib/shopify/queries/page.ts`, `getPage`/`getPages`, `Page` types — dead since Phase 1                          |

Untouched: `lib/fitment.ts` (every helper still correct — the vehicle grammar
does not change), `components/vehicles-context.tsx`, `app/search/*` fitment
toggle mechanics, cart, `revalidate()`.

---

## Step 1 — `nav_item` schema + query

New fields on the existing definition (admin work, documented in Step 8):

| Field key    | Type                                              | Notes                                                                                |
| ------------ | ------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `slug`       | single-line text                                  | URL segment. Regex `^[a-z0-9]+(-[a-z0-9]+)*$`. Empty on L1 and on heading-only nodes |
| `collection` | Collection reference                              | Explicit. Absent = merged-descendants node                                           |
| `layout`     | single-line text, preset `grid`/`landing`         | Default `grid`                                                                       |
| `sections`   | Metaobject reference → Category section, **list** | Phase 3B only; ignored when `layout` is `grid`                                       |
| `show_grid`  | true/false                                        | Landing pages only; default true = grid appended below the sections                  |

**Slug rules (binding, same weight as the vehicle slug contract):**

- Lowercase alphanumeric plus internal hyphens. `plug-play`, never `p&p` — `&`
  is not URL-safe and `%26` in a path is a permanent readability tax.
- **A slug may never be four digits.** `/lighting/2021` would collide with the
  year segment. Validated at index build; offending nodes are dropped with a
  `console.error`.
- Slugs must be unique among siblings. Duplicates make two nodes claim one
  path — first wins, rest dropped with an error.

`getNavMenuQuery` gains the new fields at every level. `collection` is a
reference field, so it needs `reference { ... on Collection { handle title } }`.
**Validate the exact field shape against the Storefront schema via
shopify-dev-mcp before writing it** (repo rule) — reference-field selection sets
are the easiest thing to get subtly wrong here, and a bad selection set throws,
which drops the whole nav to the native-menu fallback.

Query cost: the caps already multiply (8×12×12×16). Adding a reference
sub-selection per level raises the requested cost. If the Storefront API
rejects the query, trim the L4 cap first — same guidance as the existing
comment in `nav.ts`.

## Step 2 — `getNavTree()` and the category index

One fetch, two projections. In `lib/shopify/index.ts`:

- **`getNavTree()`** — `"use cache"`, `cacheTag(TAGS.menu, TAGS.collections)`,
  `cacheLife("days")`. Returns the raw reshaped tree. Keeps the existing
  try/catch → native-menu fallback.
- **`getNavMenu()`** — unchanged signature, now projects `MenuItem[]` from
  `getNavTree()`. **Its `path` values become the derived paths**, so the header,
  mega panel, and mobile drawer all link at the real URLs with no further
  change. L1 keeps using its `link`; L2+ uses the derived path; nodes with
  neither render as `#` headings.
- **`getCategoryTree()`** — projects a **flat** `CategoryNode[]`:

```ts
type CategoryNode = {
  path: string; // "/lighting/rock-lights"
  segments: string[];
  slug: string;
  title: string; // from `label`
  collectionHandle: string | null;
  layout: "grid" | "landing";
  showGrid: boolean;
  parentPath: string | null;
  childPaths: string[];
  sectionIds: string[]; // Phase 3B
};
```

Flat, with `parentPath`/`childPaths` rather than nested node objects — no
cycles, no duplication, trivially serializable through the `use cache`
boundary. Building the map is a pure helper in `lib/categories.ts`
(`indexByPath`, `indexByHandle`, `ancestorsOf`), so the module stays
client-safe and reusable by the breadcrumb island.

Walk rules: start at the root's **grandchildren** (L1 skipped); a node
contributes a segment only if it has a non-empty valid `slug`; a node without
a slug is a menu heading and its children attach to _its_ parent's path.

Per-node validation, dropping offenders with `console.error` — one bad admin
entry must never blank the category space (same discipline as
`reshapeVehicles`).

## Step 3 — Route resolution

Delete `app/[category]/`. Create `app/[...path]/page.tsx` implementing the
five-step order above. A required catch-all (not optional) — `[[...path]]` at
the root would conflict with `app/page.tsx`.

Static siblings (`/`, `/product`, `/search`, `/contact`, `/api`, sitemap,
robots, opengraph-image) beat the catch-all, so future hub routes drop in as
plain directories with no resolver change.

`generateMetadata` mirrors the page's resolution and must reach the same
verdict independently:

- bare category → `title`/`description` from the collection SEO when there is
  one, else the node title; self-canonical at the **derived path**;
- vehicle → `${gen.label} ${title}`, canonical at
  `<category path>/<make>/<model>/<yearStart>` (unchanged Phase 1 rule: every
  in-range year canonicalizes to the generation's first year);
- flat fallback whose handle _is_ in the tree → the redirect fires before
  metadata matters.

**Canonical rule for the flat fallback:** the canonical is always the tree path
when one exists. That plus the 308 keeps exactly one indexable URL per
category.

`generateStaticParams` returns every tree path (plus out-of-tree collection
handles) so all category shells prerender at build — currently none do.

Also fix while here: **lowercase the incoming vehicle segments** before
`resolveVehiclePath`. `/lighting/Ford/f150/2021` 404s today.

## Step 4 — Render modes

Two, selected in this order:

1. **Landing** (`layout: landing` and sections authored) — Phase 3B, Step 7.
2. **Grid** (`collectionHandle` set, or flat fallback) — today's page,
   unchanged: `<Suspense>`-wrapped sorted grid, sort rail, fitment banner,
   `?all=1` view-all link, empty states. Every category lands here (decision 6),
   so every category page is one cached query with native Shopify sorting.

**Safety net, not a third mode:** if a node's `collection` reference is missing,
or resolves to a collection that has been deleted or unpublished from the sales
channel, the page logs a `console.error` and renders its child links in place of
the grid — no products, no sort rail, no fitment UI, and vehicle URLs beneath it 404. Roughly fifteen lines and no extra queries; it exists so a one-field admin
slip can't leave a live nav link pointing at a dead page. It is a bug indicator,
not a supported page type.

Fitment applies identically in both modes: same `filters` argument, same
in-memory safety net, same banner, same garage redirect. **The vehicle
suffix works at any depth** — that is the whole point of the phase.

`app/[...path]/layout.tsx` keeps the Suspense boundary the prerender needs, but
its `fallback={null}` becomes a real shell skeleton (title bar + grid) so a
cold category page doesn't paint header-and-footer-around-nothing.

## Step 5 — Breadcrumbs

Free from the index and worth taking now, since the UI work starts next:
`ancestorsOf(node)` → trail, rendered above the `<h1>`, plus `BreadcrumbList`
JSON-LD. On a vehicle URL the trail ends at the category and the vehicle reads
as the current crumb.

## Step 6 — 404s and redirects

- **`app/not-found.tsx`** — branded page (header/footer, search field, top
  categories) exporting `metadata = { robots: { index: false } }`.
  Note the status code stays **200**: under `cacheComponents` the shell is
  flushed before `notFound()` is reached, so Next cannot set 404. This is
  app-wide and predates the fitment work (`/product/does-not-exist` behaves the
  same). The noindex is the mitigation; watch Search Console for soft-404s
  after launch, and escalate to a middleware handle-allowlist only if they
  actually show up.
- **`/search/[collection]`** → `permanentRedirect` to the canonical category
  path. Nothing links to it any more; the canonical tag it carries today is
  weaker than a redirect.
- **Flat → deep 308** as decided, driven by `indexByHandle`.

## Step 7 — Authored landing pages (Phase 3B — DEFERRED, do not build yet)

> Decided 2026-07-25: every collection uses the default full grid for now. This
> step is recorded for continuity and ships after the UI pass, when the section
> schema can be designed against the real page rather than guessed at. Nothing
> in Steps 1–6 depends on it; `layout` defaults to `grid` and `sections` is
> simply unread until then.

New `category_section` metaobject:

| Field key    | Type                    | Notes                                     |
| ------------ | ----------------------- | ----------------------------------------- |
| `heading`    | single-line text        | Required                                  |
| `body`       | multi-line text         | Optional intro copy                       |
| `image`      | file                    | Optional                                  |
| `collection` | Collection reference    | Products come from here…                  |
| `products`   | Product reference, list | …or are hand-picked here (takes priority) |
| `limit`      | integer                 | How many to show from a collection        |

`nav_item.sections` holds an ordered list of references. Rendered top to bottom;
`show_grid` decides whether the full grid follows. Each section's products go
through the **same fitment filter** as the grid, so a landing page keeps the
garage promise instead of quietly becoming the one place that shows parts that
don't fit.

Splitting this out means Step 3A (the URL fix) can ship and be verified on its
own — it's the part that unblocks the nav.

## Step 8 — Audit leftovers

Small, independent, all from the 2026-07-24 audit:

- **PDP fitment badge** — `components/product/fitment-badge.tsx`, a client
  island reading `useVehicles()` + `readGarageGeneration()` against
  `product.tags`: "✓ Fits your 2021+ Ford F-150" / "Doesn't fit your …" /
  "Universal fit" / nothing when no truck is set. Today the PDP is the one
  place in the funnel that ignores the garage entirely.
- **`GarageRedirect`** preserves _all_ query params, not just `sort`.
- **Vehicle picker escape hatch** — "My truck isn't listed" linking to
  `/contact`.
- **Sitemap** — tree paths, out-of-tree flat paths, plus the static routes
  (`/contact`, `/search`) it omits today. Vehicle URLs stay out (Phase 2
  decision, unchanged).
- **Dead code** — `getPage`/`getPages`/`queries/page.ts`/`Page` types (unused
  since Phase 1 deleted `app/[page]`), the footer's "Deploy on Vercel" button,
  `pnpm-lock.yaml`.
- **Docs** — `docs/shopify-setup.md` gets the new field table, the slug
  rules, and a plain statement of how tree position becomes a URL (the missing
  piece that caused the broken nav in the first place).

`?all=1` stays per-URL rather than session-sticky: a widened view is a
deliberate act on one page, and a sticky "fitment off" flag would make the
garage silently stop working three clicks later.

---

## Verification

1. `rm -rf .next && npx tsc --noEmit`; `npm run prettier`.
2. `npm run build` — confirm the `[...path]` shell still prerenders (the only
   request-data read stays `searchParams` inside the Suspense-wrapped grid),
   and that `generateStaticParams` emits every tree path.
   **Check the route table for `opengraph-image` under the catch-all** — a
   metadata file inside `[...path]` is the one piece of this plan I have not
   seen build; if Next won't generate it, move it beside the page.
3. Manual (`npm run build && npm start`, never `npm run dev`):
   - every live nav link resolves — re-run the sweep that found 5/7 dead:
     extract `\"path\":\"…\"` from the homepage payload and curl each one;
   - `/lighting/rock-lights/kits` and `/lighting/rock-lights/kits/ford/f150/2021`
     both render, with the vehicle banner on the second;
   - `/rock-lights` → 308 → `/lighting/rock-lights`; `/gift-cards` renders flat;
   - `/lighting/2021`, `/lighting/Ford/f150/2021`, `/a/b/c/d` → not-found page
     carrying `noindex`;
   - garage set → click a depth-3 category → land on the depth-3 vehicle URL;
     "View all" → `?all=1`, no bounce-back; sorting preserves `all`;
   - breadcrumb trail matches the nav position at every depth;
   - a parent category's grid contains everything its children's grids do
     (catches cascade drift in collection membership);
   - a node whose `collection` reference is cleared in admin logs an error and
     renders child links rather than 404ing;
   - canonicals: deep path self-canonical; every in-range year canonicalizes to
     the generation's first year.
4. **Gate before trusting fitment numbers:** once the Search & Discovery Tag
   filter is enabled, confirm two `tag` filters **OR** rather than AND. The
   plan (and the `fits-<gen>` OR `fits-universal` semantics) depends on OR. If
   Shopify ANDs them, no product can ever match both and every vehicle page
   goes blank — that is a code fix, not an admin one, and it is currently
   untestable because the filter argument is being ignored wholesale.

## Known limits (accepted)

- **Cascading collection membership is an admin discipline the app cannot
  verify.** Decision 6 assumes a parent collection contains everything in its
  descendants. If a product is added to a leaf but not to its parents, the
  parent page silently under-reports — no error, no empty grid, just a quietly
  incomplete page. **Recommendation: make the parent tiers smart collections**
  (rules on tag or product type) so membership is computed and cannot drift;
  leaves can stay manual. The verification step below checks parent ⊇ children
  once, but nothing enforces it continuously.
- **Moving a category in admin changes its URL.** That is the point of derived
  paths, and it is free while nothing is indexed. Once live it needs either a
  redirect table or a rule that categories don't move.
- **Nav caps bound the category space** (8/12/12/16). A tree wider or deeper
  than the caps silently loses URLs — the same silent truncation already
  documented for the menu, now with SEO consequences. Log when a level hits its
  cap.
- **Depth is unbounded in the resolver but bounded by the query** at 4 levels
  (3 URL segments after L1 is skipped). Going deeper means another nesting
  level in `nav.ts` and another cost review.
- **A collection in two places in the tree** gets two paths; first in walk order
  wins the canonical, the other still renders. Rare, and visible in the sitemap
  if it happens.
- **404s return HTTP 200** app-wide under `cacheComponents` (Step 6).
- Everything inherited from Phase 1/2: `first: 100` per collection, untagged
  products vanishing from filtered views, vehicle URLs absent from the sitemap.

## Open questions

None outstanding. Closed 2026-07-25:

- Merged-descendant nodes and their partial sort rail — **cut**; every node has
  a collection (decision 6).
- Whether L2 categories keep their own page — **yes**, implied by decision 6.
- Landing sections — **deferred** to after the UI pass (decision 8).
- L1 destinations — **title-only stub routes**, built (decision 9).

One thing to watch rather than decide: the four L1 routes permanently claim
`/design-build`, `/parts`, `/lifestyle`, and `/behind-the-build` in the URL
space. Static routes beat the catch-all, so a collection with any of those
handles could never get a category page. None exists today; worth remembering
before naming one `lifestyle`.
