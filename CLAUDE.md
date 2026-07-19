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

Requires env vars from `.env.example` in `.env.local`: `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_ACCESS_TOKEN` (a *private* Storefront token, sent as `Shopify-Storefront-Private-Token`), `SHOPIFY_REVALIDATION_SECRET`, `COMPANY_NAME`, `SITE_NAME`.

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

- `/` — homepage; `/product/[handle]` — product detail; `/search` and `/search/[collection]` — listings with sort options defined in `lib/constants.ts` (`sorting`).
- `/[page]` — catch-all rendering Shopify CMS pages by handle.
- Dynamic OpenGraph images via `opengraph-image.tsx` files sharing `components/opengraph-image.tsx`.
