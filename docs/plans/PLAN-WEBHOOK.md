# Webhook setup (deploy-time only)

> ⚠️ **Superseded — kept as a historical record.** This document's contents were
> folded into **`docs/shopify-setup.md` Part 9** on 2026-07-25, which is now the
> authoritative version and is maintained. Read that instead; edit that if
> something changes. Anything below may drift.

> **When this matters:** webhooks require a publicly reachable URL, so none of this
> applies to local dev — Shopify can't call `localhost`. Locally, caches refresh when
> `cacheLife` expires or the server restarts. Do this checklist **once per deployed
> environment** (production site, and again for any preview domain you care about).
> Until webhooks exist, the deployed site still works — content edits just take up to
> a day (`cacheLife("days")`) to appear instead of seconds.

## How revalidation works in this app

Shopify POSTs to `https://<site-domain>/api/revalidate?secret=<SHOPIFY_REVALIDATION_SECRET>`.
The handler (`revalidate()` in `lib/shopify/index.ts`) checks the secret, reads the
topic from the `x-shopify-topic` header, and maps it to a cache tag:

| Topic group | Topics                                                                                              | Tag revalidated               | Refreshes                                                           |
| ----------- | --------------------------------------------------------------------------------------------------- | ----------------------------- | ------------------------------------------------------------------- |
| Products    | `products/create`, `products/update`, `products/delete`                                             | `TAGS.products`               | product pages, grids, search, predictive search                     |
| Collections | `collections/create`, `collections/update`, `collections/delete`                                    | `TAGS.collections`            | category pages, collection metadata, sidebar, sitemap, nav fallback |
| Metaobjects | `metaobjects/create`, `metaobjects/update`, `metaobjects/delete` (filter `type:nav_item`/`vehicle`) | `TAGS.menu` + `TAGS.vehicles` | header nav **and** the vehicle list / garage picker                 |

Any other topic is acknowledged and ignored.

**Metaobject topics revalidate both tags.** The handler only reads
`x-shopify-topic`, which is identical for `nav_item` and `vehicle`
subscriptions — distinguishing them would mean parsing the webhook body's
`type` field. Both caches are tiny and metaobject edits are rare admin
actions, so a nav edit also refreshes vehicles and vice versa. Body parsing is
the escalation if that ever stops being a good trade.

## Subscriptions to create

### 1. Products + collections (6 topics)

Creatable either in **admin UI** (Settings → Notifications → Webhooks → Create webhook,
format JSON, paste the URL above) or via the Admin GraphQL API. GraphQL version — one
aliased request, substitute domain + secret in every `uri`:

```graphql
mutation CreateCatalogWebhooks {
  productsCreate: webhookSubscriptionCreate(
    topic: PRODUCTS_CREATE
    webhookSubscription: {
      uri: "https://<site-domain>/api/revalidate?secret=<SHOPIFY_REVALIDATION_SECRET>"
      format: JSON
    }
  ) {
    webhookSubscription {
      id
      topic
    }
    userErrors {
      field
      message
    }
  }
  productsUpdate: webhookSubscriptionCreate(
    topic: PRODUCTS_UPDATE
    webhookSubscription: {
      uri: "https://<site-domain>/api/revalidate?secret=<SHOPIFY_REVALIDATION_SECRET>"
      format: JSON
    }
  ) {
    webhookSubscription {
      id
      topic
    }
    userErrors {
      field
      message
    }
  }
  productsDelete: webhookSubscriptionCreate(
    topic: PRODUCTS_DELETE
    webhookSubscription: {
      uri: "https://<site-domain>/api/revalidate?secret=<SHOPIFY_REVALIDATION_SECRET>"
      format: JSON
    }
  ) {
    webhookSubscription {
      id
      topic
    }
    userErrors {
      field
      message
    }
  }
  collectionsCreate: webhookSubscriptionCreate(
    topic: COLLECTIONS_CREATE
    webhookSubscription: {
      uri: "https://<site-domain>/api/revalidate?secret=<SHOPIFY_REVALIDATION_SECRET>"
      format: JSON
    }
  ) {
    webhookSubscription {
      id
      topic
    }
    userErrors {
      field
      message
    }
  }
  collectionsUpdate: webhookSubscriptionCreate(
    topic: COLLECTIONS_UPDATE
    webhookSubscription: {
      uri: "https://<site-domain>/api/revalidate?secret=<SHOPIFY_REVALIDATION_SECRET>"
      format: JSON
    }
  ) {
    webhookSubscription {
      id
      topic
    }
    userErrors {
      field
      message
    }
  }
  collectionsDelete: webhookSubscriptionCreate(
    topic: COLLECTIONS_DELETE
    webhookSubscription: {
      uri: "https://<site-domain>/api/revalidate?secret=<SHOPIFY_REVALIDATION_SECRET>"
      format: JSON
    }
  ) {
    webhookSubscription {
      id
      topic
    }
    userErrors {
      field
      message
    }
  }
}
```

Run it in the [GraphiQL app](https://shopify-graphiql-app.shopifycloud.com/) or the
`shopify` CLI on a recent API version (needs `write_webhooks` scope... admin-created
apps have it by default).

### 2. Nav metaobjects (3 topics, API-only)

Metaobject topics don't appear in the admin UI — Admin GraphQL only, and the
`nav_item` metaobject **definition must exist before** the subscriptions (Shopify
validates the `filter` against existing definitions). The exact aliased mutation
(`METAOBJECTS_CREATE`/`UPDATE`/`DELETE` with `filter: "type:nav_item"`) is already
written out in **`docs/shopify-setup.md` §2** — use that.

### 3. Vehicle metaobjects (3 topics, API-only)

Same shape as §2 with `filter: "type:vehicle"` — the exact mutation is written out
in **`docs/shopify-setup.md` §2**, alongside the rest of the vehicle admin
setup (definition, entries, product tagging). Three more subscriptions, 9 → 12 total.
The `vehicle` definition must exist first, same validation rule as `nav_item`.

Handler side is already done (Phase 2 Step 1): vehicle data caches under
`TAGS.vehicles`, and `metaobjects/*` topics revalidate it together with `TAGS.menu`
per the note above. Until these subscriptions exist the site still works — vehicle
edits just take up to a day (`cacheLife("days")`) to appear.

## Known gaps (verified 2026-07-24 against Shopify docs + community)

- **Collection metafield edits do NOT fire `collections/update`.** The topic fires on
  manual product add/remove and rule changes only. Consequence: flipping
  `custom.fitment_disabled` on a collection won't auto-revalidate — it takes effect
  when the day-long cache expires, or immediately if you also make a trivial
  collection edit (touch the description) to force the webhook. There is no webhook
  topic for metafield _values_ (only `metafield_definitions/*` for definitions).
- **Product metafield/tag edits are fine:** tags are core product fields and metafield
  edits on products do fire `products/update` — so `fits-*` tagging revalidates
  normally.
- `collections/update` also does **not** fire when a smart-collection's membership
  changes because a product attribute changed — but in that case `products/update`
  fires, and product grids are dual-tagged (`TAGS.collections, TAGS.products`), so
  the app still refreshes.

## Verifying a deployed environment

1. `curl -X POST "https://<site-domain>/api/revalidate?secret=<secret>" -H "x-shopify-topic: collections/update"` → `{"status":200,"revalidated":true,...}`; wrong secret → `{"status":401}`.
2. Rename a product in admin → product page reflects it within seconds.
3. Edit a nav_item label → header nav updates within seconds.
4. Edit a vehicle entry's label → the garage chip updates within seconds.
5. List live subscriptions to confirm all 12 exist:

```graphql
query {
  webhookSubscriptions(first: 20) {
    nodes {
      id
      topic
      filter
      endpoint {
        __typename
        ... on WebhookHttpEndpoint {
          callbackUrl
        }
      }
    }
  }
}
```
