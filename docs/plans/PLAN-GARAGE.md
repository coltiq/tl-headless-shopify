# Category + Vehicle-Fitment URLs (Rough Country style)

> **Phasing (decided):** This plan is **Phase 1** — ships on the existing hardcoded 5-truck stub and `fits-*` tags, fully testable now. **Phase 2** (outlined at the bottom, not in this build) replaces the stub with metaobject-sourced vehicles and a Year/Make/Model picker. Phase 1's data shapes (`make`/`model`/`yearStart`/`yearEnd`) are chosen to match Phase 2's metaobject exactly, so the swap is a data-source change, not a redesign.

## Context

The garage ("Add my truck") fitment filter currently works only on the `/search` text-search page — collection pages and any future category pages ignore it. Colt wants Rough Country-style URLs instead: each main nav category is a top-level page (`/lighting`, `/lifts`), and appending vehicle segments (`/lighting/ford/f150/2021`) narrows to parts that fit that truck. A visitor with a garage truck who clicks a bare category link must land on the vehicle-filtered view.

This design keeps every page cacheable: vehicle identity lives in the URL (shareable, indexable), never in a server-side cookie read. The garage cookie only drives a client-side redirect from bare category URLs.

**Decisions made with user:** category = Shopify collection (handle = URL segment); garage lands you on the vehicle URL; **no CMS page rendering** — Shopify "pages" will never be displayed; all non-category pages are custom-built routes in code (`app/[page]` is deleted outright, not migrated); **`/search` never gets vehicle URL segments** — it gets a "Fits my vehicle" toggle instead, auto-on when a garage truck exists, with an "Add Your Truck" button (the existing garage picker) when none is set.

**Fitment scope (decided 2026-07-24):** the main nav is Customize (in-person services), Parts, Lifestyle (merch/apparel), Learn, plus about/contact/blog/galleries. Fitment only applies to **Parts** collections:

- **Opt-out flag:** collections carry a boolean metafield `custom.fitment_disabled`. Unset/false = fitment on (the default — Parts collections need no setup); true = disabled, set only on Lifestyle collections (the shorter list). Exposed as `collection.fitmentDisabled` in the app.
- On a fitment-disabled collection: bare page renders the plain grid with **no GarageRedirect and no banner**; any vehicle-segment URL (`/tshirt/ford/f150/2021`) → `notFound()`.
- **Search stays strict:** the `(tag:fits-<gen> OR tag:fits-universal)` clause is unchanged. Merch products are tagged `fits-universal` in admin so they surface in filtered search (searching "tshirt" with the filter on works); an untagged product vanishing from filtered views is intentional — better than showing where fitment hasn't been confirmed.
- Customize/Learn/about/contact/blog/galleries are custom code routes, not collections — static siblings beat `[category]`, so they're unaffected.

## Files

| Action | File                                                                                                                                                                            |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Modify | `lib/fitment.ts` — structured vehicle fields + URL helpers                                                                                                                      |
| Delete | `app/[page]/` entirely (layout, page, loading, opengraph-image) — no CMS branch replaces it                                                                                     |
| Create | `app/[category]/[[...vehicle]]/page.tsx` — category + vehicle views                                                                                                             |
| Create | `app/[category]/layout.tsx`, `app/[category]/opengraph-image.tsx`, `app/[category]/garage-redirect.tsx`                                                                         |
| Create | `app/contact/page.tsx` — minimal placeholder (header/drawer link to `/contact`, currently a CMS page; stub until custom-built)                                                  |
| Modify | `app/sitemap.ts` — drop the CMS `pagesPromise` (those URLs would 404 now)                                                                                                       |
| Modify | `lib/shopify/index.ts` — collection paths, predictive search path, menuUrlToPath, `fitmentDisabled` in reshapeCollection, `filters` param on `getCollectionProducts`            |
| Modify | `lib/shopify/queries/collection.ts` — add `custom.fitment_disabled` metafield to the collection fragment; optional `$filters: [ProductFilter!]` on `getCollectionProductsQuery` |
| Modify | `lib/shopify/types.ts` — metafield on `ShopifyCollection`, `fitmentDisabled: boolean` on `Collection`, `filters` in `ShopifyCollectionProductsOperation` variables              |
| Create | `docs/shopify-setup.md` Part 9 — full webhook inventory: topics, how to create each (admin UI vs Admin GraphQL), known gaps                                                     |
| Modify | `components/layout/header/search.tsx` — import shared `readGarageGeneration`                                                                                                    |
| Modify | `app/search/page.tsx` — fitment toggle replaces the inline banner                                                                                                               |
| Create | `components/layout/search/fitment-toggle.tsx` — client toggle / add-truck control                                                                                               |
| Modify | `docs/shopify-setup.md` — link-format table                                                                                                                                     |
| Modify | `app/search/[collection]/page.tsx` — canonical alternate to `/<handle>`                                                                                                         |
| Modify | `components/layout/search/filter/item.tsx` — `SortFilterItem` also preserves `all` (fixes filter re-applying on sorted `/search?all=1` too)                                     |

Untouched: homepage carousels, nav components (nav data stays shared/cached — personalization happens on arrival via the redirect), `getPage`/`getPages` in lib/shopify (unused by routes after this; harmless to keep). `/search` keeps its server-side cookie+`?all=1` filtering logic — only its UI changes (Step 6).

## Step 1 — `lib/fitment.ts` (stays client-safe, no next/headers)

Extend `VehicleGeneration` with `make`, `model` (slug-safe lowercase), `yearStart`, `yearEnd`; fill the 5 stub entries (`ford-f150-2021-2026` → ford/f150/2021–2026; `ford-f150-2015-2020`; `chevy-silverado-2019-2025` → chevy/silverado; `ram-1500-2019-2025` → ram/1500; `toyota-tacoma-2016-2023` → toyota/tacoma). Keep the metaobject-sourcing TODO.

New pure helpers:

- `vehiclePathSegments(gen): string[]` → `[make, model, String(yearStart)]`. Emits `yearStart` — the cookie stores only a generation handle, so first year is the deterministic canonical link. Resolver accepts any in-range year, so all year URLs work.
- `resolveVehiclePath(segments: string[]): VehicleGeneration | undefined` — require exactly 3 segments (future drivetrain/trim = loosen here only); guard destructured values (`noUncheckedIndexedAccess`); reject non-integer years; match make+model and `yearStart <= year <= yearEnd`.
- Move `readGarageGeneration()` here from `components/layout/header/search.tsx:58-64` (document-guarded cookie regex read, dependency-free); export it; update search.tsx to import it.

## Step 2 — Routes

Delete `app/[page]/` (all four files). Create `app/[category]/[[...vehicle]]/page.tsx` — the optional catch-all matches both `/lighting` (vehicle undefined) and `/lighting/ford/f150/2021` with typed params, no manual slug branching. `rm -rf .next` before first typecheck — stale generated route types for `[page]` fail tsc. Static siblings (`/`, `/product`, `/search`, `/api`, `/contact`, sitemap, robots) beat the dynamic segment.

**`app/[category]/layout.tsx`** — `<div className="w-full">{children}</div><Footer />` (no prose container; that was CMS styling). No loading.tsx (fetchers are `use cache`; warm renders are instant).

**page.tsx** — `params: Promise<{ category: string; vehicle?: string[] }>` plus the `searchParams` promise, which the page body **never awaits** — it's forwarded unread into a Suspense-wrapped grid child (Step 3), so the shell (h1, description, banner, metadata) stays prerenderable and only the grid subtree is a dynamic hole; `?all=1` remains client-side-only (GarageRedirect):

```
const { category, vehicle } = await params;
const collection = await getCollection(category);   // lib/shopify/index.ts:316, already cached
if (!collection || category.startsWith("hidden")) notFound();
if (!vehicle || vehicle.length === 0) → bare category view
if (collection.fitmentDisabled) notFound();         // lifestyle collections have no vehicle URLs
const gen = resolveVehiclePath(vehicle);
if (!gen) notFound();
→ vehicle view
```

The `hidden` guard is required — `getCollection` doesn't filter `hidden-*` handles, and without it `/hidden-homepage-featured-items` becomes a public page. The `fitmentDisabled` guard must also appear in `generateMetadata`'s vehicle branch (it runs independently of the page render).

`generateMetadata`: bare category → `collection.seo?.title || collection.title` + description (mirror `app/search/[collection]/page.tsx:9-24`) plus a self-canonical `alternates: { canonical: \`/${category}\` }` so `?sort=`/`?all=` variants don't index separately; vehicle → `` `${gen.label} ${collection.title}` `` + `` `${collection.title} that fits your ${gen.label}.` `` **plus `alternates: { canonical: \`/${category}/${gen.make}/${gen.model}/${gen.yearStart}\` }`\*\* — every in-range year serves identical content, so all year variants canonicalize to the generation's first-year URL (concentrates ranking signals on one indexed vehicle page per generation; users still see their own year in the address bar). Comment it: switch to self-referencing canonicals if/when fitment becomes year-specific within a generation. Invalid vehicle → notFound.

**`app/[category]/opengraph-image.tsx`** — collection-only: `getCollection(category)` → `collection.seo?.title || collection.title` into `components/opengraph-image`; awaited params shape.

**`app/contact/page.tsx`** — minimal placeholder (heading + support email/link) so the existing header/drawer `/contact` links keep working; marked TODO for the custom build.

**Sort ships in Phase 1 (decided 2026-07-24):** same `?sort=` grammar and `sorting` list (`lib/constants.ts`) as `/search/[collection]`. The sort read lives in a server child component (e.g. `<SortedGrid category vehicle={gen} searchParams={props.searchParams}>` wrapped in `<Suspense fallback={<Grid className="…">skeleton</Grid>}>`): it awaits `searchParams`, resolves `sorting.find((i) => i.slug === sort) || defaultSort`, and calls `getCollectionProducts({ collection, sortKey, reverse, filters? })` — cached per (collection, sort, filters) variant. Reading `searchParams` only inside the Suspense boundary keeps the page shell static under `cacheComponents`; the grid streams but its data is cached. Sort applies identically on bare and vehicle views (`sortKey`/`filters` compose in one query; the `CREATED_AT → CREATED` mapping in `getCollectionProducts` already handles the collection sort-key enum).

**Fitment filtering is server-side (decided 2026-07-24):** the vehicle view calls `getCollectionProducts({ collection: category, filters: [{ tag: fitmentTag(gen.handle) }, { tag: UNIVERSAL_FIT_TAG }] })`. Multiples of the same filter type combine with **OR** (per Shopify's storefront filtering docs) — exactly the `fits-<gen>` OR `fits-universal` semantics — so the `first: 100` cap applies to _matching_ products, not the whole collection. Changes: optional `filters: [ProductFilter!]` variable on `getCollectionProductsQuery` + threaded through `getCollectionProducts` and `ShopifyCollectionProductsOperation` (validate the exact shape via shopify-dev-mcp at build time per repo rule — the MCP was offline during planning). Distinct filter values produce distinct cache entries per (collection, generation); still fully cacheable.

**Keep the in-memory `productFitsGeneration(p.tags, gen.handle)` post-filter as a safety net** (every `Product` already carries `tags`, `lib/shopify/fragments/product.ts:57`): tag filtering only takes effect once the tag filter is enabled in the Search & Discovery app (admin checklist, Step 6); until then Shopify ignores the filter and returns the unfiltered list, and the post-filter degrades gracefully to today's in-memory-over-first-100 behavior instead of showing wrong products.

## Step 3 — Category page UI

Reuse `Grid` + `ProductGridItems` with `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` (same as `app/search/[collection]/page.tsx`); container mirrors the search layout's flex structure: `mx-auto flex max-w-(--breakpoint-2xl) flex-col gap-8 px-4 pb-4 md:flex-row` with the grid as the main column and a right rail `<div className="order-none flex-none md:order-last md:w-[125px]"><FilterList list={sorting} title="Sort by" /></div>` (no Collections sidebar — the nav covers category discovery). `FilterList`'s sort links already build from `usePathname()`, so they work unchanged on both `/lighting` and `/lighting/ford/f150/2021`.

**Required tweak to `components/layout/search/filter/item.tsx`:** `SortFilterItem` preserves only `q` + `sort` when building links — it drops `all`, so sorting on `/lighting?all=1` would strip the suppressor and let GarageRedirect bounce the visitor to the vehicle URL (and on `/search?all=1` it silently re-applies the fitment filter — an existing bug this fixes). Carry `all` through alongside `q`.

**Bare category** (`/lighting`): `<h1>` title, optional description, full grid, existing empty-state copy, plus `<Suspense fallback={null}><GarageRedirect category={category} /></Suspense>` (Suspense required — it calls `useSearchParams`). Render GarageRedirect **only when `!collection.fitmentDisabled`** — lifestyle pages get the plain grid with no redirect and no fitment UI (`/tshirt` never bounces to a vehicle URL, garage cookie or not).

**Vehicle view** (`/lighting/ford/f150/2021`): banner patterned on `app/search/page.tsx:52-59` — "Showing {collection.title} that fits your {gen.label}. [View all {collection.title}]" linking `` `/${category}?all=1` ``; filtered grid; empty state "No {collection.title} fit your {gen.label} yet." with the same view-all link. No GarageRedirect here (can't loop).

**`app/[category]/garage-redirect.tsx`** (client, renders null): in `useEffect`, once per mount (useRef guard): if `useSearchParams().get("all") === "1"` → no-op; else `readGarageGeneration()` → if found, `router.replace(\`/${category}/${vehiclePathSegments(gen).join("/")}\`)`— appending the current`sort` param if set, so a sorted bare page lands on the sorted vehicle page.

### URL grammar

| URL                                    | Behavior                                                                                    |
| -------------------------------------- | ------------------------------------------------------------------------------------------- |
| `/<cat>`                               | full grid; redirect fires iff garage cookie set and no `?all=1`                             |
| `/<cat>?all=1`                         | full grid, redirect suppressed (matches `/search?all=1` convention)                         |
| `/<cat>/<make>/<model>/<year>`         | filtered, cacheable, cookie-free; any in-range year resolves                                |
| `/<cat>[/<vehicle>]?sort=<slug>`       | same view reordered; shell static, grid streams from cached data; sort links preserve `all` |
| fitment-disabled `/<cat>`              | plain grid, no redirect/banner regardless of garage cookie                                  |
| fitment-disabled `/<cat>/<...vehicle>` | `notFound()`                                                                                |
| anything else                          | `notFound()`                                                                                |

Accepted tradeoff: one-frame flash of the unfiltered grid before `replace` (unavoidable without server cookie reads).

## Step 4 — Path rewrites + sitemap

In `lib/shopify/index.ts`:

1. `reshapeCollection` (line 160): `path: \`/${collection.handle}\``— flows to sitemap and the`/search`sidebar automatically. Synthetic "All" entries keep`path: "/search"`. Also map the metafield: `fitmentDisabled: collection.fitmentDisabled?.value === "true"`(query aliases`metafield(namespace: "custom", key: "fitment_disabled") { value }`as`fitmentDisabled`; validate the field shape via shopify-dev-mcp per repo rule). Missing metafield → `false` → fitment on, so Parts collections need no admin setup.
2. `getPredictiveSearch` (line 590): `/search/${handle}` → `/${handle}`.
3. `menuUrlToPath` (line 445): map `/collections/<h>` → `/<h>` (replace `"/collections/"` with `"/"` **first**, then bare `"/collections"` → `"/search"` — order matters). `/pages` strip becomes moot but is harmless; leave it.

`app/sitemap.ts`: remove `pagesPromise` (`getPages`) — CMS page URLs would 404 now. Vehicle URLs deliberately not in the sitemap yet (stub generations would churn when the metaobject source ships).

## Step 5 — `/search` fitment toggle (no vehicle URLs here)

`app/search/page.tsx` keeps its server logic but separates "what's in the garage" from "is the filter applied":

```
const cookieGen = findGeneration((await cookies()).get(GARAGE_COOKIE)?.value);
const applyFitment = Boolean(cookieGen) && all !== "1";
const query = applyFitment ? [searchValue, fitmentSearchClause(cookieGen!.handle)]... : searchValue;
```

(The current code conflates them — `garage` is `undefined` when `?all=1`, so the banner disappears when widened; the toggle must remain visible in the off state.)

Replace the inline banner (lines 52-59) with `<FitmentToggle garage={cookieGen ?? null} />`:

**`components/layout/search/fitment-toggle.tsx`** (client):

- `garage` set → a toggle labeled "Fits my {garage.shortLabel}", checked when `useSearchParams().get("all") !== "1"` (auto-on by default). Toggling off: `router.replace` current URL with `all=1` added; toggling on: remove `all` — always preserving `q` and `sort`. Style as a compact pill/switch consistent with the header's indigo accent (`bg-tl-indigo` when on).
- `garage` null → render the existing `<GarageMenu current={null} variant="drawer" />` (`components/layout/header/garage-menu.tsx` — already renders an "Add Your Truck" trigger + picker when `current` is null; choosing a truck runs the server action and `router.refresh()`, which re-renders the page with the filter auto-applied). If the drawer variant's full-width styling looks wrong inline, add a third `variant: "inline"` to GarageMenu rather than forking the component.

No changes to `/search`'s data fetching, `?all=1` grammar, or `getProducts` usage.

## Step 6 — Docs + canonical

- `docs/shopify-setup.md` link table: Category → `/<handle>` (e.g. `/lighting`; `/collections/<handle>` also works — rewritten). Replace the "CMS page" row with "Custom page → the route's path (pages are custom-built, Shopify CMS pages are not rendered)". Optional row: pre-filtered vehicle link `/<handle>/<make>/<model>/<year>` (rare — the redirect usually handles it).
- `docs/shopify-setup.md` admin checklist additions: (1) create a **collection metafield definition** `custom.fitment_disabled` (boolean, **Storefront access enabled** — without it the Storefront API returns null); (2) set it true on every Lifestyle collection (t-shirts, hats, accessories…); (3) tag every Lifestyle **product** `fits-universal` so it appears in fitment-filtered search; (4) **pre-deploy link sweep:** audit the footer menu (`next-js-frontend-footer-menu`) and every nav metaobject `link` field — any CMS-page link (`/pages/<handle>` or bare `/<handle>` pointing at a Shopify page) 404s once `app/[page]` is deleted, so each must either have its custom code route built or be removed from the menu before deploy (end state decided: no CMS-page links anywhere; every page is a custom-designed code route); (5) in the **Search & Discovery app**: Filters → Edit filters → enable the **Tag** filter — without it the Storefront API silently ignores the `filters` argument on `collection.products` and vehicle pages fall back to the in-memory safety net.

**Webhook caveat (verified 2026-07-24):** collection metafield edits do **not** fire `collections/update` (the topic fires on product add/remove and rule changes only — unlike products, where metafield edits do fire `products/update`). So flipping `fitment_disabled` won't auto-revalidate; it takes effect when the `cacheLife("days")` window expires, or immediately if you also make any trivial collection edit (e.g. touch the description) to force the webhook. Full webhook inventory and creation steps: `docs/shopify-setup.md` Part 9. Fitment **tags** on products are core fields — tag edits fire `products/update` normally.

- `app/search/[collection]/page.tsx`: add `alternates: { canonical: \`/${params.collection}\` }` — the route keeps working but SEO concentrates on the new URLs.

## Verification

1. `rm -rf .next && npx tsc --noEmit` (vehicle-segment guards under `noUncheckedIndexedAccess`).
2. `npm run build` — the `[category]/[[...vehicle]]` shell must stay prerenderable: the only request-data read is `searchParams` inside the Suspense-wrapped grid child; nothing in the page body, layout, or `generateMetadata` may await `searchParams`, cookies, or headers. `npm run prettier`.
3. Manual (via `npm run build && npm start` — never `npm run dev` per repo rule):
   - `/lighting` → collection grid; `/contact` → placeholder page; `/nonexistent` → 404; `/hidden-homepage-featured-items` → 404.
   - `/lighting/ford/f150/2021` and `/2024` → same filtered grid + banner; both emit `<link rel="canonical">` pointing at `/lighting/ford/f150/2021`; `/1999`, missing segments, extra segments → 404.
   - Set garage (header chip) → click a category link → land on vehicle URL; "View all" → `/lighting?all=1`, no bounce-back; clear garage → `/lighting` stays.
   - Sort: `/lighting?sort=price-asc` reorders; sort rail shows on bare and vehicle views; sorting on `/lighting?all=1` keeps `all=1` (no redirect bounce); sorted bare page + garage set → redirect lands on `/lighting/<vehicle>?sort=price-asc`; `/search?all=1` + sort keeps `all=1` (filter stays off).
   - `/search` with garage set → toggle visible and ON, results filtered; toggle off → `?all=1`, all results, toggle stays visible (off); toggle back on → param removed. With `?q=` present, toggling preserves the query.
   - `/search` without garage → "Add Your Truck" picker shown; choosing a truck refreshes with filter auto-applied and toggle ON.
   - Vehicle URL in incognito (no cookie) → identical filtered grid.
   - Fitment-disabled collection (e.g. `/tshirts` with the metafield set): garage set → page stays on `/tshirts`, no redirect, no banner; `/tshirts/ford/f150/2021` → 404; `/search?q=tshirt` with garage set → merch appears (via its `fits-universal` tag) with the toggle ON.
   - Footer/sidebar/predictive-search collection links → `/<handle>`; sitemap lists bare category URLs and no CMS page URLs.

## Known limits (accepted)

- `first: 100` cap in `getCollectionProductsQuery`: with server-side tag filtering enabled the cap applies to _matching_ products, so it only bites when >100 products fit one vehicle in one category (acceptable). Until the Search & Discovery tag filter is enabled in admin, the in-memory safety net sees only the first 100 collection products — the original limitation, now temporary. Comment the cap; pagination out of scope.
- Products missing `fits-*` tags vanish from vehicle pages and fitment-filtered search (deliberate — better hidden than shown with unconfirmed fitment). Admin prerequisites: parts get `fits-<generation>` tags, lifestyle products get `fits-universal`.
- A new Lifestyle collection created without `fitment_disabled` set behaves like a parts category (redirect fires, vehicle URLs resolve) until the flag is set — visible symptom, one-toggle fix in admin.
- **Cross-vehicle near-duplicates while the catalog is thin:** with few products (or mostly `fits-universal`), vehicle pages for _different_ trucks (`/lighting/ford/f150/2021` vs `/lighting/chevy/silverado/2019`) can render the same grid under different titles. Google's response is soft deduplication (picks one to rank), not a penalty. Accepted: vehicle URLs are already excluded from the sitemap (low crawl exposure), and pages diverge naturally as real `fits-*` data lands. Adding vehicle URLs to the sitemap is a deliberate Phase 2+ step once fitment coverage makes them distinct. Escalation lever if Search Console flags duplicates anyway: noindex a vehicle page when its filtered grid equals the full collection — don't build until needed.
- 5 hardcoded stub generations until Phase 2 ships; `resolveVehiclePath` is the single extension point for drivetrain/trim segments.
- Any single-segment URL that isn't a collection handle or a real route now 404s (no CMS fallback) — intentional; custom pages are added as code routes.

---

## Phase 2 (follow-up build, not in scope here): metaobject-sourced YMM fitment

> **Detailed build plan: `PLAN-GARAGE-PHASE2.md`** (2026-07-24). The outline
> below is the original direction; the detailed plan supersedes it where they
> differ (notably: `short_label` field added, handles derived from fields,
> tags-only fitment confirmed, sitemap still deferred).

Decided direction, recorded for continuity:

1. **`vehicle` metaobject** — `make`, `model`, `year_start`, `year_end`, `label` (one entry per generation / year-range — decided over per-exact-year entries; the picker's Year dropdown still offers individual years, resolved to the containing range). Storefront access enabled; same webhook/revalidation pattern as `nav_item`.
   **Slug contract (binding — Phase 1 URLs bake these in, and indexed URLs are permanent):** `make`/`model` values are URL slugs, not display names — lowercase, alphanumeric only, **no hyphens or spaces inside a value** (the URL uses `/` between segments; a hyphen inside a slug is fine to avoid only because Phase 1 set none). Makes use the common name, not the corporate one: `chevy` not `chevrolet`/`chevrolet-gmc`; models compact: `f150` not `f-150`, `1500` not `ram-1500`. Display text lives in `label` (`2021+ Ford F-150`) — never derive URLs from it. Phase 1's five stubs (`ford`/`f150`, `chevy`/`silverado`, `ram`/`1500`, `toyota`/`tacoma`) are the reference examples; metaobject entries must match these exactly or the Phase 1 → 2 swap stops being a pure data-source change and live URLs break.
2. **Product fitment metafield** — list of metaobject references to `vehicle` entries the product fits, plus a universal-fit flag (or keep the `fits-universal` tag).
3. **YMM picker** — `GarageMenu`'s dropdown stub becomes three cascading selectors (Year → Make → Model) derived from the vehicle entries. Cookie contract unchanged (stores the vehicle handle), so `/search`, the toggle, the redirect, and vehicle URLs all keep working untouched.
4. **`VEHICLE_GENERATIONS` stub swap** — `lib/fitment.ts` loads vehicles from a cached fetcher instead of the hardcoded array. Field shape already matches (Phase 1 Step 1).
5. **Filtering decision to make then**: (a) derive `fits-<handle>` tags from the metafield (Shopify Flow / bulk script) so `/search`'s server-side tag query keeps working, or (b) add the fitment metafield to the product fragment and filter in-memory everywhere. Category/vehicle pages filter in-memory either way; the choice only affects `/search` mechanics and admin tooling.
