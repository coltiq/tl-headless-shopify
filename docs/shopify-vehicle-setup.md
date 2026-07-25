# Vehicle setup (vehicle metaobjects)

The garage picker and every vehicle URL (`/lighting/ford/f150/2021`) are
sourced from a `vehicle` metaobject — one entry per generation (year range),
not per year. Until the definition exists, the storefront falls back to five
hardcoded generations (`FALLBACK_VEHICLE_GENERATIONS` in `lib/fitment.ts`)
automatically, so the app ships and works before any of this is done.

This is a one-time manual setup. **Follow the steps in order** — definition,
then webhooks, then entries — and finish with the manual cache flush in
step 5. The ordering constraints are the same as the nav metaobject
(`docs/shopify-nav-setup.md`): Shopify validates a metaobject webhook's
`filter` against existing definitions, so the definition must exist first;
and entries created before the subscriptions may sit behind a day-old cached
fallback with nothing firing to refresh it.

## 1. Create the metaobject definition

Settings → Custom data → Metaobjects → Add definition:

- **Name:** Vehicle, **Type:** `vehicle`

Fields — **the keys must match exactly**; a mismatched key resolves to `null`
on the storefront and the entry is dropped with a console error:

| Field key     | Type             | Required | Notes                                                                                                    |
| ------------- | ---------------- | -------- | -------------------------------------------------------------------------------------------------------- |
| `make`        | Single line text | Yes      | **URL slug.** Add a regex validation: `^[a-z0-9]+$`. See the slug contract below.                        |
| `model`       | Single line text | Yes      | **URL slug.** Same regex validation.                                                                     |
| `year_start`  | Integer          | Yes      | 4-digit year.                                                                                            |
| `year_end`    | Integer          | Yes      | 4-digit year, ≥ `year_start`.                                                                            |
| `label`       | Single line text | Yes      | Display name, e.g. `2021+ Ford F-150` (set as the definition's display name field). Never used for URLs. |
| `short_label` | Single line text | No       | Condensed chip text, e.g. `21+ F-150`. Falls back to `label` when empty.                                 |

Then, under the definition's options, enable **Storefront API access**
(Storefronts: Read). Without it the Storefront API throws and the app serves
the fallback generations — the picker looks fine but shows the wrong trucks.
The private Storefront token needs the `unauthenticated_read_metaobjects`
scope (already required by the nav).

### The slug contract (binding)

`make` and `model` are URL segments, not display names. Indexed URLs are
permanent and both the garage cookie and the `fits-*` product tags embed
these values, so getting them wrong breaks live URLs, existing visitor
cookies, and existing product tags at once.

- Lowercase alphanumeric only — **no hyphens or spaces inside a value**.
- Common make names, not corporate ones: `chevy`, not `chevrolet`.
- Compact models: `f150`, not `f-150`; `1500`, not `ram-1500`.
- All display text lives in `label` / `short_label`. Never derive a URL from
  them.

**The metaobject's own Shopify handle is never read.** The app derives each
generation's handle as `<make>-<model>-<year_start>-<year_end>`, so it stays
deterministic and immune to handle typos or Shopify's auto-generation. Set
the entry handle to the same string anyway for sanity when browsing the
admin.

## 2. Create the webhook subscriptions

Metaobject webhook topics do **not** appear in Settings → Notifications →
Webhooks — create them through the Admin GraphQL API (the
[GraphiQL app](https://shopify-graphiql-app.shopifycloud.com/) or `shopify`
CLI) on a recent API version. This is `docs/shopify-nav-setup.md` §2's
mutation with the filter swapped to `type:vehicle`; every caveat listed
there (mandatory filter, `uri` not `callbackUrl`, the URL cannot be on a
domain connected to the store, subscriptions die with the app that created
them) applies identically here.

Substitute the deployed site domain and `SHOPIFY_REVALIDATION_SECRET` in all
three spots:

```graphql
mutation CreateVehicleWebhooks {
  create: webhookSubscriptionCreate(
    topic: METAOBJECTS_CREATE
    webhookSubscription: {
      uri: "https://<site-domain>/api/revalidate?secret=<SHOPIFY_REVALIDATION_SECRET>"
      format: JSON
      filter: "type:vehicle"
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
      filter: "type:vehicle"
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
      filter: "type:vehicle"
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

Check that all three `userErrors` arrays are empty. These are subscriptions
10–12 of 12 — verify the full inventory with the listing query in
`PLAN-WEBHOOK.md` ("Verifying a deployed environment", step 5).

Note that `metaobjects/*` deliveries carry an identical `x-shopify-topic`
header for `nav_item` and `vehicle`, so the app revalidates **both** the nav
and vehicle caches on any metaobject webhook. Editing a nav item refreshes
the vehicle list too, and vice versa — deliberate, and cheap.

## 3. Create the entries

Content → Metaobjects → Vehicle. Enter the five generations the storefront
already ships as fallbacks **with exactly these values** — they are baked
into live URLs, existing visitor cookies, and the `fits-*` tags already
applied to products:

| `make`   | `model`     | `year_start` | `year_end` | `label`                      | `short_label`   |
| -------- | ----------- | ------------ | ---------- | ---------------------------- | --------------- |
| `ford`   | `f150`      | 2021         | 2026       | `2021+ Ford F-150`           | `21+ F-150`     |
| `ford`   | `f150`      | 2015         | 2020       | `2015–2020 Ford F-150`       | `15–20 F-150`   |
| `chevy`  | `silverado` | 2019         | 2025       | `2019+ Chevy Silverado 1500` | `19+ Silverado` |
| `ram`    | `1500`      | 2019         | 2025       | `2019+ Ram 1500`             | `19+ Ram 1500`  |
| `toyota` | `tacoma`    | 2016         | 2023       | `2016–2023 Toyota Tacoma`    | `16–23 Tacoma`  |

(The derived handles are `ford-f150-2021-2026`, `ford-f150-2015-2020`,
`chevy-silverado-2019-2025`, `ram-1500-2019-2025`,
`toyota-tacoma-2016-2023`.) `label` and `short_label` are display-only and
safe to reword later; the four slug/year fields are not.

Rules the app enforces on read (`reshapeVehicles` in `lib/shopify/index.ts`):

- An entry failing validation — bad slug, non-4-digit year,
  `year_start > year_end`, empty `label` — is **dropped** with a
  `console.error`, and the rest of the picker still renders.
- Two entries sharing a make+model with **overlapping year ranges** make
  year → generation resolution ambiguous. The app keeps one and drops the
  rest with a `console.error`; fix the data in admin. Ranges for the same
  truck must be adjacent, not overlapping (2015–2020 then 2021–2026).
- Cap of 250 entries (one Storefront page). Beyond that, entries go missing
  and the app logs an error; add pagination before the list gets near it.
- If **every** entry is deleted, the five fallbacks resurrect. Expected
  during rollout; see the Phase 2 known limits in `PLAN-GARAGE-PHASE2.md`.

## 4. Tag products for fitment

Fitment matching is tag-based — the metaobject supplies the vehicle list and
the URLs, not the product↔vehicle relationships.

- **Parts:** tag each product `fits-<make>-<model>-<year_start>-<year_end>`,
  i.e. exactly the derived handle — `fits-ford-f150-2021-2026`. A product can
  carry as many `fits-*` tags as it has generations.
- **Lifestyle / merch:** tag `fits-universal` so it still surfaces in
  fitment-filtered search and on vehicle pages.
- An untagged product **vanishes** from vehicle pages and filtered search.
  That's deliberate — better hidden than shown with unconfirmed fitment.
- The **Tag** filter must be enabled in the Search & Discovery app
  (`docs/shopify-nav-setup.md` §5.5) or Shopify silently ignores the tag
  filter on collection pages.

Adding a new generation is therefore two steps: create the metaobject entry,
then tag the products that fit it. Tag edits fire `products/update` and
revalidate normally.

## 5. Flush the cache and verify

```sh
curl -X POST "https://<site-domain>/api/revalidate?secret=<SHOPIFY_REVALIDATION_SECRET>" \
  -H "x-shopify-topic: metaobjects/update"
```

Then verify on the storefront:

1. Open the garage picker — the Year → Make → Model selects cascade (picking
   a year narrows the makes, picking a make narrows the models) and the
   confirm button stays disabled until all three are chosen.
2. Add a truck → the header chip shows your `label`, and the condensed
   (scrolled) header shows `short_label`.
3. Click a category link → you land on
   `/<category>/<make>/<model>/<year_start>`. Every in-range year resolves
   too (`/lighting/ford/f150/2024`), canonicalizing to the first year.
4. Edit an entry's `label` in admin → confirm a `POST /api/revalidate`
   arrives in the app logs and the chip text updates shortly after. If
   filtered metaobject deliveries turn out to be flaky (see the nav doc's
   step 4 warning), vehicle edits will only surface at cache expiry — re-run
   the curl above as a stopgap.

Deleting a generation is a real deletion: its URLs 404 after revalidation,
and a visitor whose cookie points at it silently reverts to "Add Your Truck".
