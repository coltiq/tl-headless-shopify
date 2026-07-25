# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

A fork of Vercel's Next.js Commerce template: a server-rendered headless Shopify storefront using the Next.js App Router, React Server Components, Server Actions, and `useOptimistic`. Next.js 16 with `cacheComponents`/`useCache` enabled, React 19, Tailwind CSS v4 (PostCSS plugin, no tailwind config file), TypeScript strict mode.

## Commands

Use npm (`package-lock.json` is current; `pnpm-lock.yaml` is a leftover from the upstream template).

- `npm run dev` — dev server with Turbopack at localhost:3000
- `npm run build` — production build
- `npm run prettier` — format all files (uses `prettier-plugin-tailwindcss`)
- `npm run prettier:check` — check formatting; this is the only automated check (`test` script just runs it). There is no test suite, linter, or standalone typecheck script — use `npx tsc --noEmit` to typecheck.

Requires env vars from `.env.example` in `.env.local`: `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_ACCESS_TOKEN` (a _private_ Storefront token, sent as `Shopify-Storefront-Private-Token`), `SHOPIFY_REVALIDATION_SECRET`, `COMPANY_NAME`, `SITE_NAME`.

## Docs

- `docs/shopify-setup.md` — the complete Shopify admin checklist in dependency order: metaobject/metafield definitions, webhooks, collections, nav entries, vehicle entries, product tagging, storefront filters. Authoritative for anything that has to exist in the admin, including the full webhook reference (Part 9).
- `docs/PHASE3-RED-FLAGS.md` — self-audit of the category-URL build: where it deviates from the plan, and where the plan was wrong about the framework. Read before touching routing or SEO — in particular, `notFound()` still returns HTTP 200 under `cacheComponents`.
- `docs/plans/` — build plans, current and historical. `PLAN-CATEGORY-URLS.md` Steps 1–6 and 8 are shipped (Step 7 / Phase 3B deferred); `PLAN-GARAGE.md` / `PLAN-GARAGE-PHASE2.md` are shipped; `PLAN-WEBHOOK.md` is superseded by the setup doc.

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

### Caching and revalidation

This repo uses the Next.js `use cache` directive model, not `fetch` cache options:

- Catalog fetchers (`getCollection`, `getProducts`, etc.) declare `"use cache"` with `cacheTag(...)` from `TAGS` in `lib/constants.ts` (`collections`, `products`, `cart`) and `cacheLife("days")`.
- `getCart()` uses `"use cache: private"` because it reads the per-visitor `cartId` cookie.
- Cart Server Actions (`components/cart/actions.ts`) call `updateTag(TAGS.cart)` after mutations.
- Shopify webhooks hit `POST /api/revalidate` → `revalidate()` in `lib/shopify/index.ts`, which checks `SHOPIFY_REVALIDATION_SECRET` and calls `revalidateTag(tag, "seconds")` for product/collection topics.

### Cart

Cart state lives in Shopify, identified by a `cartId` cookie. `components/cart/cart-context.tsx` is a client context that receives a `cartPromise` from the server (resolved with React's `use`) and layers `useOptimistic` updates over it; buttons trigger Server Actions in `components/cart/actions.ts` via `useActionState`. Checkout is a redirect to the Shopify-hosted checkout URL.

### Routes (`app/`)

- `/` — homepage; `/product/[handle]` — product detail; `/search` — listing with sort options defined in `lib/constants.ts` (`sorting`).
- `app/[...path]` — the category URL space. Paths are **derived from the `nav_item` tree** (`getCategoryTree()` → `lib/categories.ts`), with the four L1 sections contributing no segment; an optional trailing `make/model/year` filters by fitment at any depth. `app/[...path]/resolve.ts` holds the resolution order shared by the page, its metadata, and the OG card. Static siblings (`/parts`, `/design-build`, `/lifestyle`, `/behind-the-build`, `/contact`, `/search`) always beat it.
- `/search/[collection]` — legacy, redirects to the canonical category path.
- `middleware.ts` — issues the **real** 308s (flat handle → tree path, legacy `/search/<handle>`). `permanentRedirect()` inside a page is not a 308 under `cacheComponents`; the shell flushes first and Next degrades it to a client-side redirect with a 200. Middleware reads `app/api/category-index` (which calls the cached `getCategoryTree()`, so no extra Shopify traffic) and memoizes it for 60s. It falls through to `next()` on any failure — never break rendering from here.
- Dynamic OpenGraph images via `opengraph-image.tsx` files sharing `components/opengraph-image.tsx`.

## Rules

- Never run `npm run dev` to verify changes — it doesn't exit. Use `npx tsc --noEmit` and `npm run build` instead.
- Never modify or consult `pnpm-lock.yaml`; npm is the package manager.
- Before writing any new Storefront GraphQL query or mutation, validate field names against the schema via the shopify-dev-mcp server.
