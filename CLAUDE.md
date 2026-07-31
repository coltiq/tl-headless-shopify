# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

A fork of Vercel's Next.js Commerce template: a server-rendered headless Shopify storefront using the Next.js App Router, React Server Components, Server Actions, and `useOptimistic`. Next.js 16 with `cacheComponents`/`useCache` enabled, React 19, Tailwind CSS v4 (PostCSS plugin, no tailwind config file), TypeScript strict mode.

@AGENTS.md

## Commands

Use npm (`package-lock.json` is current).

- `npm run dev` — dev server with Turbopack at localhost:3000
- `npm run build` — production build
- `npm run prettier` — format all files (uses `prettier-plugin-tailwindcss`)
- `npm run prettier:check` — check formatting; this is the only automated check. There is no test suite, linter, or standalone typecheck script — use `npx tsc --noEmit` to typecheck.

Requires env vars from `.env.example` in `.env.local`: `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_ACCESS_TOKEN` (a _private_ Storefront token, sent as `Shopify-Storefront-Private-Token`), `SHOPIFY_REVALIDATION_SECRET`, `COMPANY_NAME`, `SITE_NAME`.

## Docs

- `docs/shopify-setup.md` — the complete Shopify admin checklist in dependency order: metaobject/metafield definitions, webhooks, collections, nav entries, vehicle entries, product tagging, storefront filters. Authoritative for anything that has to exist in the admin, including the full webhook reference (Part 9).
- `docs/plans/OPEN-ITEMS.md` — every red flag, accepted limit, and deferred piece of work still outstanding. Read before touching routing, SEO, or fitment. The shipped plans it came from (garage Phase 1/2, category URLs Phase 3) were folded into this file and deleted.
- `docs/plans/PAGES.md` — the build queue: every page still to be written, what state it is in, and the decisions blocking the rest. Scoped to the header and Custom Work until the other L1s settle.
- `docs/plans/lifestyle.md` — the `/lifestyle` section spec: its categories, the Goods and Drops ideas that make it more than merch, why it has no links row, and the open question on the name. Nothing in it is built yet.
- `docs/plans/the-manual.md` — the `/the-manual` section spec: why it is an L1 rather than a Community child, article URLs, and the topic-category question. Nothing in it is built yet.
- `docs/plans/customer-builds.md` — the `/customer-builds` spec: one page rather than a section, the vehicle reference every entry carries, submissions, and why Community was dropped as a container. Nothing in it is built yet.
- `docs/plans/custom-work.md` — the `/custom-work` section spec: its three L2 code routes, why they nest under the section path, and why the section is capped at two nav levels. Nothing in it is built yet.

## Imports

`tsconfig.json` sets `baseUrl: "."` — imports are root-relative with no prefix, e.g. `import { getCart } from "lib/shopify"` and `import Price from "components/price"`.

## Architecture

### Shopify data layer (`lib/shopify/`)

`lib/shopify/index.ts` is the single integration point with Shopify's Storefront GraphQL API — all data access goes through it (the upstream template is designed so a different provider could replace this one directory). Structure:

- `shopifyFetch<T>()` — typed GraphQL POST; operation types in `lib/shopify/types.ts` pair a return shape with a `variables` shape (extracted via `ExtractVariables`).
- `queries/`, `mutations/`, `fragments/` — GraphQL documents as template strings.
- `reshape*` helpers convert raw Shopify shapes (edges/nodes connections) into the flat app-facing types that components consume. New fields must be threaded through both the fragment and the reshape step.
- Products tagged `nextjs-frontend-hidden` (`HIDDEN_PRODUCT_TAG`) are filtered out of listings.
- Cart mutations forward the buyer's IP (`getBuyerIp()`), which reads request headers — only callable from request-scoped contexts (Server Actions, route handlers), **not** inside `use cache` functions, which are shared across visitors.
- **Metaobject reads degrade, never throw.** A missing `unauthenticated_read_metaobjects` scope or disabled storefront access on a definition throws rather than resolving null. `getNavTree()` returns null (menu falls back to the native Shopify menu, category space goes empty) and `getVehicles()` returns `FALLBACK_VEHICLE_GENERATIONS`. Both look like working sites. They aren't — check the logs.
- **One bad admin entry never blanks a feature.** `reshapeVehicles` and the nav walk validate per node and drop offenders with `console.error`. Match that discipline in anything new.

### Caching and revalidation

This repo uses the Next.js `use cache` directive model, not `fetch` cache options:

- Catalog fetchers (`getCollection`, `getProducts`, etc.) declare `"use cache"` with `cacheTag(...)` from `TAGS` in `lib/constants.ts` (`collections`, `products`, `cart`, `menu`, `vehicles`) and `cacheLife("days")`.
- `getCart()` uses `"use cache: private"` because it reads the per-visitor `cartId` cookie.
- Cart Server Actions (`components/cart/actions.ts`) call `updateTag(TAGS.cart)` after mutations.
- Shopify webhooks hit `POST /api/revalidate` → `revalidate()` in `lib/shopify/index.ts`, which checks `SHOPIFY_REVALIDATION_SECRET` and maps `x-shopify-topic` to a tag. Metaobject topics revalidate `menu` **and** `vehicles`: the header is identical for `nav_item` and `vehicle` subscriptions, and telling them apart would mean parsing the webhook body.
- Collection **metafield** edits do not fire `collections/update`, so flipping `custom.fitment_disabled` doesn't auto-revalidate. See `docs/shopify-setup.md` Part 9.6.

### Cart

Cart state lives in Shopify, identified by a `cartId` cookie. `components/cart/cart-context.tsx` is a client context that receives a `cartPromise` from the server (resolved with React's `use`) and layers `useOptimistic` updates over it; buttons trigger Server Actions in `components/cart/actions.ts` via `useActionState`. Checkout is a redirect to the Shopify-hosted checkout URL.

### Routes (`app/`)

- `/` — homepage; `/product/[handle]` — product detail; `/search` — text search with sort options from `lib/constants.ts` (`sorting`).
- `/contact`, `/app`, `/support`, `/quote`, `/financing`, `/the-standard`, `/parts`, `/custom-work`, `/lifestyle`, `/customer-builds`, `/the-manual` — custom code routes. The last five are the L1 nav sections; the rest are ordinary pages (`/the-standard` is a footer page, not in the nav). All of them **permanently reserve those paths**: a static route always beats the catch-all, so no collection handle or category slug can ever use them.
- `/custom-work/{services,builds,inside-the-shop,pricing}` — the section's own pages. Nested under the section, which is **not** a contradiction of "L1 contributes no segment": that rule governs derived category paths, and these are hand-typed `link` values on static routes. No new reservation needed — `proxy.ts` only inspects `segments[0]`, and only for 1- and 4-segment shapes. Spec: `docs/plans/custom-work.md`.
- `app/[...path]` — the category URL space (below).
- `/search/[collection]` — legacy, redirects to the canonical category path.
- `proxy.ts` — issues the **real** 308s (the file convention formerly called `middleware.ts`).
- Shopify CMS pages are never rendered. Every non-category page is a custom code route.

### The category URL space (`app/[...path]`)

**Category paths are derived from `nav_item` tree position.** An author types one `slug` per item; the app builds the path. Re-parenting an item in admin moves its URL, so the menu and the URL space cannot disagree — the previous design let them drift, and five of seven live nav links 404'd as a result.

- **L1 is a section, not a segment.** The five nav-bar items group the menu and contribute nothing to any URL. `/lighting` is valid; `/parts/lighting` never exists. L1's own `link` points at its code route.
- **A node with no slug is a heading** — it contributes no segment and its children attach to _its_ parent's path. Headings never appear in a URL or a breadcrumb.
- **A node with an invalid or duplicate slug is dropped along with its subtree**, with a `console.error`. The menu entry stays so the breakage is visible.
- **Slug rules (binding):** `^[a-z0-9]+(-[a-z0-9]+)*$`; **never four digits** (it would collide with the vehicle year segment); unique among siblings, and across the L1 sections at depth 1.
- **The collection is an explicit reference, never inferred from the slug** — the two are allowed to differ.
- **Collection membership cascades natively.** Shopify's collection editor nests collections (a parent's Collection card lists its children), and that membership reaches `collection.products` on the Storefront API — so a product in `rock-light-kits` is also in `rock-lights` and `lighting` without any per-product bookkeeping. Every category page is therefore one cached query with native Shopify sorting, and no page ever merges its descendants.
- **Safety net:** a node whose collection reference is missing or points at a deleted/unpublished collection renders its child links instead of a grid and logs an error. A bug indicator, not a supported page type.

`getNavTree()` fetches once; `buildNavProjection()` in `lib/categories.ts` walks it once and emits **both** the menu and the flat `CategoryNode[]`, so the two are the same pass over the same tree. `lib/categories.ts` is deliberately free of `next/*` and env imports (`menuUrlToPath` is injected) so the walk runs standalone — nothing else guards it.

Resolution order, in `app/[...path]/resolve.ts`, shared by the page, its metadata, and the OG card. Steps 1–2 are in-memory lookups against the cached index, so a real category always beats a vehicle reading of the same segments:

```
1. whole path in the category index?              → category, no vehicle
2. ≥4 segments, path minus last 3 in the index
   AND the last 3 resolve to a generation?        → category + vehicle
3. single segment that is a live collection?      → flat render (or 308 if in tree)
4. 4 segments, [0] a live collection,
   [1..3] a generation?                           → flat + vehicle (or 308)
5. notFound()
```

Collections with no tree position (`gift-cards`, `shop-labor`, `the-lab`) keep rendering flat at `/<handle>`; handles that _do_ have a tree position 308 to it.

**Redirects and 404s under `cacheComponents`:**

- `permanentRedirect()` inside a page is **not** a 308 — the route shell is flushed before it is reached, and Next degrades it to a client-side `__next-page-redirect` served with a 200. `export const dynamic` would fix it and is rejected outright by `cacheComponents`. **`proxy.ts` issues the real 308s**, reading `app/api/category-index` (backed by the cached `getCategoryTree()`, so no extra Shopify traffic) and memoizing it for 60s. It falls through to `next()` on any failure — never break rendering from there. Never map a handle to its own flat path: `/lighting` → `/lighting` loops forever, and that is the common shape for a depth-1 category.
- `notFound()` still returns **HTTP 200**, app-wide. `robots: { index: false }` on `app/not-found.tsx` is the mitigation.

`opengraph-image` files cannot exist under a catch-all segment, so category OG cards come from `app/api/og?title=` via `ogImageUrl()` in `lib/utils.ts`.

Nav query caps (8/12/12/16, in `lib/shopify/queries/nav.ts`) bound the URL space, not just the menu — the app logs when a level is sitting on one. Depth is capped at four nav levels, i.e. three URL segments.

**The mega panel picks its layout from the section's depth**, in `components/layout/header/desktop-nav.tsx`. A section whose L2 items all have children renders the rail plus the active item's groups; one where **none** do (Community, Custom Work) drops the rail and renders the L2s flat, with their `description` beneath each. In a mixed section the rail stays and a childless item shows its own description and a link, because restructuring the panel as the cursor moves down the rail is worse than either layout. The split is at L3, not L4 — a childless L3 group already renders as a plain link. `description` is optional throughout; without it these layouts render the title alone.

### Vehicle fitment (the garage)

The whole design exists so **every page stays cacheable**: vehicle identity lives in the URL, which is shareable and indexable, and is never read from a server-side cookie on a cacheable page. The `tl_garage` cookie only drives a client-side redirect from bare category URLs.

- **The generation is internal and never displayed.** It picks a `fits-*` tag and defines one canonical URL per year range; that is all. What the visitor sees is the exact year they chose, composed at render time: `vehicleLabel({ gen, year })` → "2022 Ford F-150". Vehicle metaobject `label` / `short_label` therefore carry **no years** (`Ford F-150` / `F-150`), and two generations of the same truck share them. `VehicleSelection = { gen, year }` is the type that travels; a bare `VehicleGeneration` should never reach a component that renders text.
- **URL grammar:** `/<category path>/<make>/<model>/<year>` at any depth. Any in-range year resolves and shows **that** year in the `<h1>`, title, and banner; all of them canonicalize to the generation's **first year**, so one URL per generation still carries the ranking signal. `?all=1` widens back to the full grid and suppresses the redirect — deliberately per-URL, never sticky, because a sticky "fitment off" flag would make the garage silently stop working three clicks later.
- **The garage cookie is `<generation handle>:<year>`.** A bare handle with no year is still accepted and degrades to the generation's first year. A year the generation doesn't cover (admin narrowed the range) is ignored the same way — the app never renders a year the truck doesn't come in.
- **`lib/fitment.ts` is client-safe and never fetches.** Every helper takes the vehicle list explicitly: server callers pass `await getVehicles()`, client islands pass `useVehicles()` (`components/vehicles-context.tsx`, mounted in the root layout).
- **A generation's handle is derived, never read** from the vehicle metaobject's own Shopify handle: `` `${make}-${model}-${yearStart}-${yearEnd}` ``. Cookie values and `fits-*` product tags embed it, so it must be deterministic and immune to admin typos.
- **Slug contract (binding — live URLs, visitor cookies, and product tags all bake it in):** `make`/`model` are URL slugs, lowercase alphanumeric with **no hyphens or spaces inside a value**; common make names (`chevy`, not `chevrolet`); compact models (`f150`, not `f-150`). All display text lives in `label` / `short_label` and is never used to build a URL.
- **Fitment matching is tags-only.** `fits-<generation handle>` on parts, `fits-universal` on merch and anything that fits everything. An untagged product vanishes from vehicle pages and filtered search — deliberate, and the first thing to check when a product "disappears".
- **Server-side filtering with an in-memory safety net.** Category pages pass two `ProductFilter`s that Shopify ORs together (`fits-<gen>` OR `fits-universal`), then re-filter in memory, because Shopify silently ignores `filters` until the Tag filter is enabled in the Search & Discovery app. Do not remove the safety net.
- **`custom.fitment_disabled`** is an opt-out boolean on collections. Unset/false = fitment on, so Parts collections need no admin setup; Lifestyle collections set it true and then have no garage bounce and no vehicle URLs beneath them.
- `/search` never takes vehicle URL segments — it gets a "Fits my vehicle" toggle instead, on by default when a truck is set, off via `?all=1`, and visible in both states.

## Rules

- Never run `npm run dev` to verify changes — it doesn't exit. Use `npx tsc --noEmit` and `npm run build`, then `npm start` for manual checks.
- npm is the package manager. Never run pnpm here — it regenerates `pnpm-lock.yaml` and a stray `pnpm-workspace.yaml`, neither of which belongs in the repo.
- Before writing any new Storefront GraphQL query or mutation, validate field names against the schema via the shopify-dev-mcp server.
- `proxy.ts` must never be the reason a page fails to render — every failure path falls through to `NextResponse.next()`.
