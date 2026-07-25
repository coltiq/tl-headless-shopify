# Header nav setup (nav_item metaobjects)

The header nav is sourced from a self-referencing `nav_item` metaobject tree
instead of a Shopify navigation menu, because native menus cap at three
nesting levels and the header renders four (L1 nav bar → L2 rail → L3 column
headings → L4 links). Until the metaobject exists, the storefront falls back
to the native `main-menu-v2` menu automatically.

This is a one-time manual setup. **Follow the steps in order** — definition,
then webhooks, then entries — and finish with the manual cache flush in
step 4:

- The definition must exist **before** the webhook subscriptions: Shopify
  validates a metaobject webhook's `filter` against existing definitions, and
  creating the subscription first fails with "The specified filter is
  invalid, please ensure you specify the field(s) you wish to filter on."
- The webhook subscriptions should exist **before** the nav entries: if
  content is created first, the storefront may have already cached the
  fallback menu for up to a day with nothing firing to refresh it (the manual
  flush in step 4 covers this either way).

## 1. Create the metaobject definition

Settings → Custom data → Metaobjects → Add definition:

- **Name:** Nav item, **Type:** `nav_item`

Fields — **the keys must match exactly**; a mismatched key silently resolves
to `null` on the storefront (the item is dropped, or the whole nav falls back
to the native menu):

| Field key  | Type                                                     | Required | Notes                                                                                                                                                           |
| ---------- | -------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `label`    | Single line text                                         | Yes      | Display name (set as the definition's display name field).                                                                                                      |
| `link`     | Single line text                                         | No       | Plain text on purpose — the URL field type only accepts absolute URLs, but the nav needs relative paths like `/search/exhaust`. Empty = non-navigating heading. |
| `children` | Metaobject reference → Nav item, **list**                | No       | Self-reference. Order in this list is the display order.                                                                                                        |
| `style`    | Single line text, preset choices: `default`, `links-row` | No       | `links-row` on a level-2 item moves it out of the mega panel rail; its children render as the links row at the bottom of the panel (the old "Resources" row).   |

Then, under the definition's options, enable **Storefront API access**
(Storefronts: Read). The private Storefront token must have the
`unauthenticated_read_metaobjects` scope.

## 2. Create the webhook subscriptions

Metaobject webhook topics do **not** appear in Settings → Notifications →
Webhooks — the subscriptions must be created through the Admin GraphQL API
(e.g. the [GraphiQL app](https://shopify-graphiql-app.shopifycloud.com/) or
`shopify` CLI) on a recent API version. All three topics can go in one
aliased request — substitute the deployed site domain and the
`SHOPIFY_REVALIDATION_SECRET` value in all three spots:

```graphql
mutation CreateNavWebhooks {
  create: webhookSubscriptionCreate(
    topic: METAOBJECTS_CREATE
    webhookSubscription: {
      uri: "https://<site-domain>/api/revalidate?secret=<SHOPIFY_REVALIDATION_SECRET>"
      format: JSON
      filter: "type:nav_item"
    }
  ) {
    webhookSubscription {
      id
      topic
      filter
    }
    userErrors {
      field
      message
    }
  }
  update: webhookSubscriptionCreate(
    topic: METAOBJECTS_UPDATE
    webhookSubscription: {
      uri: "https://<site-domain>/api/revalidate?secret=<SHOPIFY_REVALIDATION_SECRET>"
      format: JSON
      filter: "type:nav_item"
    }
  ) {
    webhookSubscription {
      id
      topic
      filter
    }
    userErrors {
      field
      message
    }
  }
  delete: webhookSubscriptionCreate(
    topic: METAOBJECTS_DELETE
    webhookSubscription: {
      uri: "https://<site-domain>/api/revalidate?secret=<SHOPIFY_REVALIDATION_SECRET>"
      format: JSON
      filter: "type:nav_item"
    }
  ) {
    webhookSubscription {
      id
      topic
      filter
    }
    userErrors {
      field
      message
    }
  }
}
```

Notes:

- The `filter` is **mandatory**, not optional scoping: the `metaobjects/*`
  topics require a filter, wildcards (`type:*`) are rejected, and the type is
  validated against existing definitions — hence step 1 first. A filter that
  passes validation but names the wrong type silently suppresses all
  deliveries.
- Use `uri` (current field), not the legacy `callbackUrl`.
- The `uri` must be the deployed public URL — Shopify cannot reach localhost.
- **The `uri` cannot be on any domain connected to the store** (Settings →
  Domains — e.g. `thetrucklab.com`, `www.thetrucklab.com`, the `*.myshopify.com`
  hosts); Shopify rejects those with "Address cannot be any of the domains…"
  even though the custom domain actually points at Vercel, not Shopify. Use
  the hosting platform's own deployment URL instead (the project's production
  `*.vercel.app` alias) — same deployment, same cache, so the revalidation
  applies to the custom domain too. If Vercel Deployment Protection covers
  production `*.vercel.app` URLs, Shopify's POSTs will be blocked before
  reaching the route — scope protection to previews only or append a
  "Protection Bypass for Automation" token.
- Subscriptions belong to the app that created them: uninstalling the
  GraphiQL app deletes its subscriptions.
- Check that all three `userErrors` arrays are empty, then verify:

```graphql
query CheckNavWebhooks {
  webhookSubscriptions(
    first: 10
    topics: [METAOBJECTS_CREATE, METAOBJECTS_UPDATE, METAOBJECTS_DELETE]
  ) {
    nodes {
      id
      topic
      filter
      uri
    }
  }
}
```

Without these subscriptions, nav edits only appear on the storefront when
the cache expires (`cacheLife("days")` — up to a day later).

## 3. Create the entries

Content → Metaobjects → Nav item:

- Create one **root** entry with handle **`main-nav`** (label "Main nav", no
  link). The app looks this handle up — it must match exactly.
- The root's `children` are the L1 nav bar items; each level nests via
  `children` from there. Depth rendered: 4 levels below the root.

Link formats for the `link` field (handles must match Shopify exactly — a
typo renders a working-looking link that 404s, nothing validates it):

| Destination                      | Enter                                                                                                                     |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Category (collection)            | `/<handle>` (e.g. `/lighting`; `/collections/<handle>` also works — rewritten)                                            |
| Product                          | `/product/<handle>`                                                                                                       |
| Custom page                      | the route's path, e.g. `/contact` (pages are custom-built code routes; Shopify CMS pages are **not** rendered — they 404) |
| All products / search            | `/search`                                                                                                                 |
| Pre-filtered vehicle link (rare) | `/<handle>/<make>/<model>/<year>` (usually unnecessary — the garage redirect lands visitors there)                        |
| Heading only (no link)           | leave empty                                                                                                               |

Full store URLs pasted from the admin also work — the domain is stripped
automatically.

Per-level item caps (extras are **silently dropped** — see
`lib/shopify/queries/nav.ts` before raising them):

| Level              | Cap |
| ------------------ | --- |
| L1 (nav bar)       | 8   |
| L2 (rail)          | 12  |
| L3 (column groups) | 12  |
| L4 (links)         | 16  |

## 4. Flush the cache and verify delivery

Regardless of webhook setup, finish with a manual revalidation so the
storefront drops any cached fallback menu immediately:

```sh
curl -X POST "https://<site-domain>/api/revalidate?secret=<SHOPIFY_REVALIDATION_SECRET>" \
  -H "x-shopify-topic: metaobjects/update"
```

Then **verify the webhook pipe end-to-end** (the curl above proves the
route, not Shopify's delivery — there are community reports of filtered
metaobject subscriptions registering successfully but never delivering):
edit any `nav_item` entry in the admin and confirm a `POST /api/revalidate`
arrives in the app logs, and the change appears on the storefront shortly
after. If delivery turns out to be flaky, nav edits will only surface at
cache expiry (up to a day) — re-run the curl above as a stopgap.

## 5. Fitment / category-page admin checklist

Category pages (`/<handle>`) apply vehicle fitment by default; only
Lifestyle (merch) collections opt out. One-time setup:

1. **Collection metafield definition** — Settings → Custom data →
   Collections → Add definition: **Name** "Fitment disabled", **Namespace
   and key** `custom.fitment_disabled`, **Type** True/false. Enable
   **Storefront API access** — without it the Storefront API returns `null`
   and the flag silently reads as "fitment on".
2. **Set it `true` on every Lifestyle collection** (t-shirts, hats,
   accessories…). Unset/false is the default and means fitment on, so Parts
   collections need no setup. A Lifestyle collection missing the flag
   behaves like a parts category (garage redirect fires, vehicle URLs
   resolve) until it's set — visible symptom, one-toggle fix.
3. **Tag every Lifestyle _product_ `fits-universal`** so merch still
   appears in fitment-filtered search (parts get `fits-<generation>` tags).
   An untagged product vanishes from filtered views — deliberate, but worth
   knowing when a product "disappears".
4. **Pre-deploy link sweep** — audit the footer menu
   (`next-js-frontend-footer-menu`) and every nav metaobject `link` field:
   any CMS-page link (`/pages/<handle>`, or a bare `/<handle>` pointing at a
   Shopify page) now 404s. Each such link must either get its custom code
   route built or be removed from the menu before deploy. End state: no
   CMS-page links anywhere — every page is a custom-designed code route.
5. **Search & Discovery app** — Filters → Edit filters → enable the **Tag**
   filter. Without it the Storefront API silently ignores the `filters`
   argument on `collection.products`, and vehicle pages fall back to the
   in-memory safety net (first 100 collection products only).

**Webhook caveat (verified 2026-07-24):** collection metafield edits do
**not** fire `collections/update` (that topic fires on product add/remove
and rule changes only — unlike products, where metafield edits do fire
`products/update`). Flipping `fitment_disabled` therefore won't
auto-revalidate: it takes effect when the day-long cache expires, or
immediately if you also make a trivial collection edit (touch the
description) to force the webhook — or run the manual revalidation curl
from step 4 with `-H "x-shopify-topic: collections/update"`. Fitment
**tags** on products are core fields — tag edits fire `products/update`
normally. Full webhook inventory and creation steps: `PLAN-WEBHOOK.md`.
