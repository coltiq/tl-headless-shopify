# Phase 2 — Metaobject-sourced vehicles + Year/Make/Model picker

> Builds on PLAN-GARAGE.md Phase 1 (shipped on `main`). Replaces the hardcoded
> 5-truck stub in `lib/fitment.ts` with a Shopify `vehicle` metaobject and turns
> the flat garage picker into cascading Year → Make → Model selects. The cookie
> contract, URL grammar, and `fits-*` tag filtering are all unchanged — this is a
> data-source swap plus a picker UI, not a redesign.

## Decisions (made with user, 2026-07-24)

- **Fitment data stays tags-only.** Products keep raw `fits-<generation>` tags as
  the sole fitment source; `/search`'s query clause, the category-page
  `ProductFilter`, and the in-memory safety net are untouched. The product
  fitment metafield + auto-derived tags (Shopify Flow) is recorded below as a
  Phase 3 candidate, not built here.
- **Vehicle URLs stay out of the sitemap.** Still deferred until real `fits-*`
  coverage makes vehicle pages distinct (see PLAN-GARAGE.md known limits). When
  ready: emit category × generation first-year URLs for fitment-enabled
  collections — one addition to `app/sitemap.ts`.
- **Picker UX: cascading selects inside the existing GarageMenu popover** (not a
  modal). Three stacked native `<select>`s (Year, Make, Model) + a confirm
  button; same three trigger variants (`row`/`drawer`/`inline`) as today.

## The core mechanical problem

`lib/fitment.ts` helpers (`findGeneration`, `resolveVehiclePath`,
`readGarageGeneration`) close over the hardcoded `VEHICLE_GENERATIONS` array and
are called **synchronously from client components**: `garage-menu.tsx`,
`header/search.tsx`, `app/[category]/garage-redirect.tsx` (plus
`fitment-toggle.tsx` via GarageMenu). A metaobject-sourced list is async and
server-fetched, so Phase 2 must:

1. add a cached server fetcher (`getVehicles()`),
2. parameterize the pure helpers over a passed-in list (module stays
   client-safe, no fetching inside), and
3. deliver the list to client islands via a context provider mounted in the
   root layout (same pattern as `CartProvider`; the payload is a small
   serializable array).

Server code (`garage-chip.tsx`, `header/actions.ts`, `app/search/page.tsx`,
`app/[category]/[[...vehicle]]/page.tsx`) calls `getVehicles()` directly — it's
`use cache`, so awaiting it in layouts/pages/metadata keeps everything
prerenderable (same as `Header` awaiting `getNavMenu`).

## Data contract — `vehicle` metaobject

One entry per generation (year range), per PLAN-GARAGE.md Phase 2 outline.
Definition (admin setup in `docs/shopify-vehicle-setup.md`, created by this
build):

| Field key     | Type             | Validation / notes                                                          |
| ------------- | ---------------- | --------------------------------------------------------------------------- |
| `make`        | single-line text | URL slug: regex `^[a-z0-9]+$` (set as an admin validation on the field)     |
| `model`       | single-line text | URL slug: regex `^[a-z0-9]+$`                                               |
| `year_start`  | integer          | 4-digit year                                                                |
| `year_end`    | integer          | 4-digit year, ≥ `year_start`                                                |
| `label`       | single-line text | Display name, e.g. `2021+ Ford F-150` — never used for URLs                 |
| `short_label` | single-line text | Condensed chip text, e.g. `21+ F-150`; app falls back to `label` when empty |

`short_label` is new versus the Phase 2 outline in PLAN-GARAGE.md — the outline
omitted it, but `VehicleGeneration.shortLabel` is load-bearing (condensed header
chip, search-dropdown fitment badges, `/search` toggle label).

**Storefront access must be enabled** on the definition (like `nav_item`) —
without it the Storefront API throws / returns null and the app serves the
fallback stubs.

**Handle is derived, not read.** The app computes each generation's handle as
`` `${make}-${model}-${yearStart}-${yearEnd}` `` (pure helper `vehicleHandle()`
in `lib/fitment.ts`) and ignores the metaobject's own Shopify handle. Rationale:
cookie values and `fits-*` product tags embed the handle, so it must be
deterministic from fields, immune to admin handle typos/auto-generation. All 5
Phase 1 stub handles (`ford-f150-2021-2026`, `ford-f150-2015-2020`,
`chevy-silverado-2019-2025`, `ram-1500-2019-2025`, `toyota-tacoma-2016-2023`)
already match this pattern, so **existing visitor cookies and product tags
survive the swap unchanged** — provided admin enters the 5 initial entries with
exactly the stub field values (slug contract in PLAN-GARAGE.md Phase 2 §1 is
binding). Admin should still set each metaobject's handle to the same string
for sanity, but the app never reads it.

## Files

| Action | File                                                                                                                 |
| ------ | -------------------------------------------------------------------------------------------------------------------- |
| Modify | `lib/constants.ts` — add `TAGS.vehicles`                                                                             |
| Create | `lib/shopify/queries/vehicles.ts` — `metaobjects(type: "vehicle")` query                                             |
| Modify | `lib/shopify/types.ts` — `ShopifyVehiclesOperation`                                                                  |
| Modify | `lib/shopify/index.ts` — `getVehicles()` + `reshapeVehicles()`; `revalidate()` dual-tags metaobject topics           |
| Modify | `lib/fitment.ts` — parameterized helpers, `vehicleHandle()`, stub renamed `FALLBACK_VEHICLE_GENERATIONS`             |
| Create | `components/vehicles-context.tsx` — `VehiclesProvider` + `useVehicles()`                                             |
| Modify | `app/layout.tsx` — `await getVehicles()`, mount provider                                                             |
| Create | `components/layout/header/vehicle-picker.tsx` — cascading Y/M/M selects                                              |
| Modify | `components/layout/header/garage-menu.tsx` — popover hosts VehiclePicker; drop stub-list import                      |
| Modify | `components/layout/header/garage-chip.tsx` — `findGeneration(await getVehicles(), …)`                                |
| Modify | `components/layout/header/actions.ts` — validate handle against fetched list                                         |
| Modify | `components/layout/header/search.tsx` — `useVehicles()` → `readGarageGeneration(vehicles)`                           |
| Modify | `app/[category]/garage-redirect.tsx` — `useVehicles()`                                                               |
| Modify | `app/[category]/[[...vehicle]]/page.tsx` — `resolveVehiclePath(await getVehicles(), …)` in page + `generateMetadata` |
| Modify | `app/search/page.tsx` — `findGeneration(await getVehicles(), …)`                                                     |
| Modify | `PLAN-WEBHOOK.md` — §3 resolved: vehicle topics revalidate `TAGS.vehicles` (dual with `TAGS.menu`)                   |
| Create | `docs/shopify-vehicle-setup.md` — definition, initial entries, webhooks, tagging rules                               |

Untouched: `fitment-toggle.tsx` (its GarageMenu child self-serves from context;
the `garage` prop keeps coming from the page's server-side cookie read), URL
grammar, `?all=1` semantics, `getCollectionProducts` filters, sitemap, all of
`/search`'s query mechanics.

## Step 1 — Shopify layer

**`lib/shopify/queries/vehicles.ts`** (validate field shapes via shopify-dev-mcp
before writing, per repo rule — `metaobjects(type:, first:)` list query,
`unauthenticated_read_metaobjects` scope, same as nav):

```graphql
query getVehicles {
  metaobjects(type: "vehicle", first: 250) {
    nodes {
      make: field(key: "make") {
        value
      }
      model: field(key: "model") {
        value
      }
      yearStart: field(key: "year_start") {
        value
      }
      yearEnd: field(key: "year_end") {
        value
      }
      label: field(key: "label") {
        value
      }
      shortLabel: field(key: "short_label") {
        value
      }
    }
    pageInfo {
      hasNextPage
    }
  }
}
```

`first: 250` is the Storefront page cap; pagination out of scope —
`console.error` if `hasNextPage` (silent truncation would read as "vehicle
missing from picker").

**`getVehicles()` in `lib/shopify/index.ts`:**

- `"use cache"` + `cacheTag(TAGS.vehicles)` + `cacheLife("days")`.
- No-endpoint guard, and `try/catch` around the fetch → return
  `FALLBACK_VEHICLE_GENERATIONS` (missing scope / no definition / disabled
  storefront access throws rather than resolving null — same failure mode and
  same fallback pattern as `getNavMenu`). Empty node list (definition exists,
  no entries yet) → fallback too: `valid.length > 0 ? valid : FALLBACK`.
- `reshapeVehicles(nodes)`:
  - Per-entry validation, dropping failures with `console.error` (one bad
    entry must not blank the picker): `^[a-z0-9]+$` on make/model, integer
    4-digit years, `yearStart <= yearEnd`, non-empty `label`.
  - `shortLabel: node.shortLabel?.value || label`.
  - `handle: vehicleHandle(make, model, yearStart, yearEnd)` (derived — see
    data contract).
  - Sort: make asc, model asc, `yearStart` desc (drives picker ordering and
    makes overlap-dropping deterministic).
  - **Overlap guard:** two entries sharing make+model with intersecting year
    ranges would make `resolveVehiclePath` and the picker's year resolution
    ambiguous — keep the first (post-sort), drop the rest, `console.error`.

**`revalidate()`:** rename `menuWebhooks` → `metaobjectWebhooks`; on any
`metaobjects/*` topic revalidate **both** `TAGS.menu` and `TAGS.vehicles`.
The handler only reads the `x-shopify-topic` header, which is identical for
`nav_item` and `vehicle` subscriptions; distinguishing would mean parsing the
webhook body's `type` field. Both caches are tiny and metaobject edits are rare
admin actions, so dual invalidation is the right trade — comment this, with
body-parsing noted as the escalation if it ever matters.

**`lib/constants.ts`:** `TAGS.vehicles = "vehicles"`.

## Step 2 — `lib/fitment.ts` (stays client-safe, still no fetching)

- Rename `VEHICLE_GENERATIONS` → `FALLBACK_VEHICLE_GENERATIONS`; update the
  comment: served by `getVehicles()` only until vehicle metaobject entries
  exist in admin (and on fetch failure). Remove the "TODO: source from
  metaobject" markers here and in `garage-menu.tsx`.
- Add `vehicleHandle(make: string, model: string, yearStart: number, yearEnd: number): string`.
- Parameterize over an explicit list (no module-level list reads left):
  - `findGeneration(vehicles: VehicleGeneration[], handle: ...)`
  - `resolveVehiclePath(vehicles: VehicleGeneration[], segments: string[])`
  - `readGarageGeneration(vehicles: VehicleGeneration[])`
- Unchanged: `VehicleGeneration` type, `GARAGE_COOKIE`, `UNIVERSAL_FIT_TAG`,
  `vehiclePathSegments`, `fitmentTag`, `fitmentSearchClause`,
  `productFitsGeneration`.

The signature change makes every call site a compile error — `tsc` becomes the
checklist for Step 5; nothing can be silently missed.

## Step 3 — `components/vehicles-context.tsx`

`"use client"`; `createContext<VehicleGeneration[]>([])`,
`VehiclesProvider({ vehicles, children })`, `useVehicles()` hook.

`app/layout.tsx`: `const vehicles = await getVehicles();` then wrap
`<VehiclesProvider vehicles={vehicles}>` around the existing `CartProvider`
subtree. Awaiting is fine here — `getVehicles` is `use cache`, so the layout
stays prerenderable (Header already awaits `getNavMenu` the same way). Unlike
cart there's no reason to pass a promise: the list is shared, cached,
non-personal data needed synchronously by several islands.

## Step 4 — `components/layout/header/vehicle-picker.tsx`

Client component rendered inside GarageMenu's existing popover panel (which
keeps its trigger button, `row`/`drawer`/`inline` variants, outside-pointer
close, Escape handling, and "Clear vehicle" row). The flat `<ul>` of stub
generations is replaced by:

- **Three stacked native `<select>`s** (native for mobile ergonomics), labeled
  Year / Make / Model, styled with existing tokens (`border-tl-hairline`,
  `font-tl-text`, `rounded-[3px]`, `bg-tl-fog` focus) to match the panel.
- Derivations from `useVehicles()` (pure, computed in render):
  - `years`: every year covered by any generation's range, descending.
  - `makes(year)`: unique makes with a generation covering that year, alpha.
  - `models(year, make)`: unique models, alpha.
  - `resolve(year, make, model)`: the unique covering generation (uniqueness
    guaranteed by the reshape overlap guard).
- State: three selections; changing an upstream select resets downstream ones.
  Display capitalization for slugs in options is fine (`ford` → `Ford`) — the
  label field is for full display names, slugs only seed the dropdowns.
- When `current` is set (editing an existing truck), preselect
  `current.yearStart` / make / model.
- Confirm button (`Add my truck` / `Update truck`), enabled only when all three
  are chosen; calls the existing `choose(gen.handle)` path in GarageMenu
  (server action + `router.refresh()` — unchanged).

Cookie contract unchanged: the cookie stores the generation handle; the chosen
exact year is not persisted (the URL canonicalizes to `yearStart` anyway,
per Phase 1). Comment this in the picker.

## Step 5 — Consumer swaps (all mechanical, driven by tsc)

Server (call `getVehicles()` directly):

- `garage-chip.tsx`: `findGeneration(await getVehicles(), cookieValue)`.
- `header/actions.ts` `setGarageVehicle`: guard becomes
  `if (!findGeneration(await getVehicles(), handle)) return;` — still rejects
  unknown handles, now against live data.
- `app/search/page.tsx`: `findGeneration(await getVehicles(), cookie)`.
- `app/[category]/[[...vehicle]]/page.tsx`: `resolveVehiclePath(await
getVehicles(), vehicle)` in both the page body and `generateMetadata`. Both
  reads are cached — the shell stays prerenderable; the `searchParams`-only
  dynamic-hole rule from Phase 1 is unaffected.

Client (read `useVehicles()`):

- `header/search.tsx`: `const vehicles = useVehicles();` at top;
  `readGarageGeneration(vehicles)` in the focus handler.
- `garage-redirect.tsx`: same swap inside the effect; add `vehicles` to the
  dependency array (the `fired` ref still guards once-per-mount).
- `garage-menu.tsx`: `useVehicles()` feeds VehiclePicker.

Behavioral consequence to note in code where relevant: vehicle URLs and cookie
validity now live and die with metaobject entries. A deleted generation →
its URLs 404 after revalidation, and a cookie holding its handle degrades
silently to "no truck" (the Phase 1 pattern for unknown handles — already the
desired behavior).

## Step 6 — Webhooks + docs

- **Three new subscriptions** (Admin GraphQL only): `METAOBJECTS_CREATE` /
  `UPDATE` / `DELETE` with `filter: "type:vehicle"` — copy the aliased mutation
  from `docs/shopify-nav-setup.md` §2 with the filter swapped. Total goes
  9 → 12. The `vehicle` definition must exist first (Shopify validates the
  filter). Update `PLAN-WEBHOOK.md` §3 from "Phase 2 must decide" to the
  decided behavior (dual-tag revalidation).
- **Create `docs/shopify-vehicle-setup.md`** — admin checklist:
  1. Create the `vehicle` metaobject definition (field table above), regex
     validations on `make`/`model`, **Storefront access enabled**.
  2. Restate the binding slug contract (lowercase alphanumeric, common make
     names — `chevy` not `chevrolet`, `f150` not `f-150`; display text lives in
     `label` only).
  3. Enter the 5 initial generations with **exactly** the Phase 1 stub values
     (table with all six fields per entry) — mismatches break live URLs,
     visitor cookies, and existing product tags.
  4. Create the 3 vehicle webhook subscriptions; verify with the
     `webhookSubscriptions` listing query (expect 12).
  5. Product tagging rule: parts get `fits-<make>-<model>-<yearStart>-<yearEnd>`
     (exactly the derived handle), lifestyle products get `fits-universal`.
     Adding a new generation = create the metaobject entry, then tag the
     products that fit it.

## Verification

1. `rm -rf .next && npx tsc --noEmit` — the helper-signature change must
   surface every call site; `npm run prettier`.
2. `npm run build` — root layout, category shell, and `generateMetadata` stay
   prerenderable (`getVehicles` is `use cache`; nothing new awaits request
   data).
3. Manual via `npm run build && npm start` (never `npm run dev`):
   - **Pre-admin state** (no `vehicle` definition in the store): everything
     behaves exactly as Phase 1 — picker shows the 5 fallback trucks (as
     cascading selects), URLs resolve, `/search` toggle works. This is the
     deploy-safety property: Phase 2 can ship before admin setup.
   - **Post-admin:** picker years/makes/models cascade correctly (year
     narrows makes, make narrows models); confirm button disabled until all
     three chosen; add truck → chip shows metaobject `label`, condensed header
     shows `short_label`; category link → redirect lands on the vehicle URL
     built from metaobject slugs; `/lighting/<make>/<model>/<year>` resolves
     for every in-range year of a metaobject generation.
   - Existing cookie from Phase 1 (e.g. `ford-f150-2021-2026`) still resolves
     after the swap (derived-handle continuity).
   - Add a brand-new generation entry in admin → after webhook (or
     `curl -X POST ".../api/revalidate?secret=…" -H "x-shopify-topic: metaobjects/update"`)
     it appears in the picker and its URLs resolve. Delete it → URLs 404, a
     cookie pointing at it degrades to "Add Your Truck".
   - Bad data: entry with `F-150` as model (fails regex) is dropped with a
     console error, picker still renders; two overlapping `ford`/`f150` ranges
     → later one dropped with console error.
   - Revalidate with a `metaobjects/update` topic → nav AND vehicles refresh
     (dual-tag; accepted over-invalidation).

## Known limits (accepted)

- 250-entry cap, no pagination (logged when exceeded); revisit if the vehicle
  list ever approaches it.
- Overlapping generations resolve by dropping later entries with a logged
  error — admin fixes the data; the app never guesses.
- `fits-*` tags remain manually applied per product. **Phase 3 candidate**
  (recorded from the decision discussion): product metafield of `vehicle`
  references + Shopify Flow (or bulk script) deriving the tags automatically —
  better admin UX, zero app changes required since tags stay the filtering
  mechanism.
- Vehicle URLs still absent from the sitemap (deliberate; see Decisions).
- If all metaobject entries are deleted, the fallback stubs resurrect —
  a quirk of the fallback, acceptable during rollout. Once the metaobject is
  the stable source, deleting `FALLBACK_VEHICLE_GENERATIONS` (return `[]`
  instead) is a small follow-up; an empty list renders the garage UI with an
  empty picker and no redirects, which is correct once intentional.
- The picker's Year list spans all generations' ranges — with few entries it
  can offer years for which only one make exists; fine at this catalog size.
