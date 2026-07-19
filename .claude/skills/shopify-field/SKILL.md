---
name: shopify-field
description: Workflow for exposing a new Shopify Storefront API field in this app. Use when asked to add, surface, display, or expose a new field on products, collections, carts, or variants (e.g. "show the product vendor", "add compareAtPrice", "surface collection images").
---

# Exposing a new Shopify field

All Shopify data flows through one pipeline: GraphQL fragment → raw `Shopify*` type →
`reshape*` helper → app-facing type → components. A new field must be threaded through
every step or it will silently be `undefined` at runtime (TypeScript won't catch a
field missing from the query).

## Step 0 — Validate the field against the schema first

Before writing any code, confirm the field exists and get its exact shape using the
shopify-dev-mcp tools:

1. `learn_shopify_api(api: "storefront-graphql")` — save the `conversationId`.
2. `search_docs_chunks` with the object/field name to find its type and arguments.
3. After editing a fragment, run the full query/fragment through
   `validate_graphql_codeblocks` and fix any reported errors before moving on.

Never add a field to a fragment from memory alone.

## Step 1 — Add the field to the right fragment

Fragments live in `lib/shopify/fragments/`:

- `product.ts` — `fragment product on Product` (includes variants, images via
  `imageFragment`, seo via `seoFragment`).
- `cart.ts` — `fragment cart on Cart` (embeds the product fragment on line merchandise).
- `image.ts`, `seo.ts` — shared sub-fragments.
- Collection fields have no fragment file; edit the queries in
  `lib/shopify/queries/collection.ts` directly.

Notes:
- Connection fields must be requested as `edges { node { ... } }` with a `first:`
  argument (see `variants(first: 250)`, `images(first: 20)`).
- Money fields need `{ amount currencyCode }`; images should spread `...image`.
- The cart fragment embeds the product fragment, so product-fragment changes also
  enlarge every cart query — keep the fragment lean.

## Step 2 — Update both types in `lib/shopify/types.ts`

Two layers, both required:

1. **Raw type** (`ShopifyProduct`, `ShopifyCollection`, `ShopifyCart`,
   `ProductVariant`, `CartItem`…): mirror the GraphQL response exactly. A connection
   field is `Connection<T>`; a nullable field is `T | null` (use `Maybe<T>`).
2. **App-facing type** (`Product`, `Collection`, `Cart`): what components consume.
   Scalars are usually inherited automatically (`Product = Omit<ShopifyProduct,
   "variants" | "images"> & {...}`), but a new connection field must be added to the
   `Omit<...>` list and re-declared as a flat array (`T[]`).

If the field belongs to a different query root, also update the matching
`Shopify*Operation` type (data + variables shapes) so `shopifyFetch<T>` stays typed.

## Step 3 — Thread it through the reshape helper in `lib/shopify/index.ts`

- `reshapeProduct` — spreads `...rest`, so plain scalars flow through with no code
  change. Connections must be flattened explicitly with `removeEdgesAndNodes(...)`
  (see how `images`/`variants` are destructured out and rebuilt). New image lists
  should go through `reshapeImages` to get alt-text fallbacks.
- `reshapeCollection` / `reshapeCart` — same pattern; cart lines are already
  flattened, and `reshapeCart` patches a missing `totalTaxAmount`.
- If the fetcher returns the query result directly (e.g. `getPage`), there is no
  reshape step — the raw and app-facing shapes must match.

Check the "Shopify not configured" fallback objects (e.g. in `getCollections`) —
if the new field is required on the app-facing type, add it there too or the build
breaks when env vars are absent.

## Step 4 — Consume it in components

- Imports are root-relative with no prefix: `import { getProduct } from "lib/shopify"`.
- Server components call the fetchers directly; cart UI reads from the optimistic
  cart context (`components/cart/cart-context.tsx`) — if a cart field must render
  optimistically, extend the reducer's optimistic update logic too.
- Money values render via `components/price.tsx`.

## Step 5 — Verify

- `npx tsc --noEmit` and `npm run build` (never `npm run dev` — it doesn't exit).
- `npm run prettier` before committing.
- Remember: a field missing from the fragment is a runtime `undefined`, not a type
  error — double-check the fragment, not just the types.

## Constraints — do not violate

- **Never call `getBuyerIp()` or read `cookies()`/`headers()` inside a `"use cache"`
  function.** Cached entries are shared across visitors. Request-scoped reads belong
  only in Server Actions and route handlers; `getCart` is the exception via
  `"use cache: private"`.
- **Catalog fetchers must keep `"use cache"` + `cacheTag(...)` using `TAGS` from
  `lib/constants.ts`** (`collections`, `products`, `cart`) plus `cacheLife("days")`,
  or webhook revalidation (`POST /api/revalidate`) stops reaching them.
- **Respect `HIDDEN_PRODUCT_TAG` filtering**: listing paths go through
  `reshapeProducts`, which drops products tagged `nextjs-frontend-hidden`. Any new
  product-returning fetcher must reuse `reshapeProduct`/`reshapeProducts`, and `tags`
  must stay in the product fragment — the filter depends on it.
