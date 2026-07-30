# Open items — red flags, accepted limits, deferred work

The single running list of everything still outstanding in this storefront.
Consolidated 2026-07-25 from the shipped build plans (garage Phase 1 and 2,
category URLs Phase 3) and the Phase 3 self-audit, all of which were folded
into `CLAUDE.md` and deleted.

Architecture and contracts live in `CLAUDE.md`. Admin setup lives in
`docs/shopify-setup.md`. **This file is only what is broken, bounded, or not
built yet.**

Nothing is deployed or indexed. Several entries below stop being cheap the
moment that changes — they're marked **before launch**.

---

## 1. Blocked on admin

### 1.1 The deep nav links still 404 — five of seven

**The single highest-impact item here, and it needs no code.**

Verified against the live store: `/lighting`, `/parts`, and `/custom-work`
resolve; `/lighting/rock-lights`, `/lighting/rock-lights/diy-kits`,
`/lighting/rock-lights/plug-play-kits`, and
`/lighting/rock-lights/singles-spares` all render the branded 404. Same failure
the 2026-07-24 audit found.

The `nav_item` entries have no `slug` or `collection` values, so the category
tree builds empty and the app falls back to `link`, which still holds
hand-typed deep paths nothing serves. The URL machinery is built and verified;
the data isn't there.

**Fix:** `docs/shopify-setup.md` Part 4.3. Safe one item at a time — a derived
path wins wherever a slug exists, and untouched items keep working off `link`.

### 1.2 Fitment is inert until the Tag filter is enabled

Search & Discovery → Filters → enable the **Tag** filter. Until then Shopify
**silently discards** the `filters` argument on `collection.products` — no
error, no warning — and every vehicle page is really being filtered by the
in-memory safety net over the first 100 products in the collection.

> **Verification gate, the moment it's on.** The app sends two `tag` filters and
> depends on them combining with **OR** (`fits-<generation>` OR
> `fits-universal`). If Shopify ANDs them, no product can match both and every
> vehicle page goes blank. That is a **code** fix, not an admin one, and it is
> untestable until the filter is enabled.

### 1.3 No product carries a `fits-*` tag yet

Selecting a truck currently empties every category page and every search.
`docs/shopify-setup.md` Part 6.

### 1.4 Almost the whole catalog is unlisted (deliberate, mid-build)

As of 2026-07-25 the Storefront API returns **2 products** for the entire store,
while admin shows 43 in `lighting` alone. That's the catalog being unlisted on
purpose while it's built out — not a publishing bug, and not something to
investigate.

**It does make most storefront-side checks meaningless until it changes.** An
empty or one-item category grid is currently expected, so Part 8.3's cascade
check ("a parent category's grid contains everything its children's grids do")
proves nothing yet. Compare collection item counts in admin instead, and re-run
the storefront checks once products go live.

### 1.5 Homepage collections don't exist

`hidden-homepage-carousel` and `hidden-homepage-featured-items` are missing —
the build logs `No collection found` for both and the homepage renders zero
products.

---

## 2. Red flags in the current build

### 2.1 `notFound()` returns HTTP 200, app-wide

Under `cacheComponents` the route shell is flushed before `notFound()` is
reached, so Next cannot set the status. This predates the fitment work
(`/product/does-not-exist` behaves the same).

The proxy can't fix it the way it fixed the redirects: it would have to know
every valid URL, not just the redirecting ones — a handle allowlist at the edge.

`robots: { index: false }` on `app/not-found.tsx` is the mitigation. **Before
launch:** watch Search Console for soft-404s, and escalate to the allowlist only
if they actually show up.

> Resolved 2026-07-25: the flat → deep **redirects** had the same root cause and
> were degrading to client-side redirects with a 200. `proxy.ts` now issues
> real 308s. `export const dynamic = "force-dynamic"` is rejected outright by
> `cacheComponents`, so the proxy was the only route.

### 2.2 Nothing guards the category tree walk

`buildNavProjection` decides every category URL on the site, and there is no
test suite in this repo. Worse, `npm run build` currently exercises **none** of
it — the store has no slugs, so every prerendered path comes from the flat
collection fallback.

It was verified once with a fixture through `npx tsx`, covering derived paths at
three depths, L1 contributing no segment, headings attaching children to the
grandparent, `childPaths` bubbling through a heading, four-digit and duplicate
slug rejection, cross-L1 duplicate paths, explicit collection references,
missing references, root-first ancestors, `indexByHandle` first-wins, and six
slug-regex cases. All 19 passed. **That script was deleted.**

`lib/categories.ts` was kept free of `next/*` and env imports specifically so
this is easy to redo properly. **Highest-value follow-up in this document.**

### 2.3 `app/api/og` is a public image generator

Next's signed `opengraph-image` convention can't be used under a catch-all
segment (`Error: Catch-all must be the last part of the URL`), so category OG
cards come from a plain route handler taking `?title=`.

The title is trimmed, capped at 80 characters, and rendered as text into an
`ImageResponse` — no HTML parsing, nothing to inject — so exposure is bounded.
But it is a public surface the file convention would not have created. The
alternative, if that ever matters, is dropping per-category cards and letting
every category inherit the site-wide `app/opengraph-image.tsx`.

### 2.4 The proxy runs on every non-asset request

For the two path shapes that could be a flat collection URL (one segment, or a
handle plus `make/model/year`) it may block on one internal fetch per instance
per minute. Nav edits take up to 60s to change redirect behavior; the pages
themselves are unaffected, since they read the cached tree directly.

**Before launch:** if Vercel Deployment Protection covers production, confirm
the proxy's internal request to `/api/category-index` isn't blocked. It
degrades safely (falls through to `next()`), but the 308s quietly stop.

### 2.5 Cascading collection membership — largely solved by native nesting

The app assumes a parent collection contains everything in its descendants; that
assumption is what lets every category page be one query with native sorting.

**Shopify's collection editor nests collections natively** (the Collection card
in the right rail), and that membership reaches the Storefront API — verified
2026-07-25 with `lighting`, which owns no products directly and still returned
its nested rock-light product. So the cascade is computed, not curated, and the
old drift risk (a product added to a leaf but not its parents) is gone.

**What remains** is one level up: nesting is per-parent, so a child collection
that is never added to its parent's Collection card is silently absent from it.
Visible in the editor, but nothing warns. Worth eyeballing once the tree is
authored, and again whenever a category is added.

`docs/shopify-setup.md` 3.2 has the mechanism.

### 2.6 Moving a category in admin changes its URL

That is the point of derived paths, and it is free while nothing is indexed.
**Before launch** it needs either a redirect table or a rule that categories
don't move.

---

## 3. Accepted limits

**Catalog and fitment**

- `first: 100` per collection query. With server-side tag filtering the cap
  applies to _matching_ products, so it only bites when >100 products fit one
  vehicle in one category. Until the Tag filter is on, the in-memory safety net
  sees only the first 100 products in the collection. Pagination is out of scope.
- An untagged product vanishes from vehicle pages and filtered search.
  Deliberate — better hidden than shown with unconfirmed fitment.
- A Lifestyle collection created without `custom.fitment_disabled` behaves like
  a parts category (garage bounce fires, vehicle URLs resolve) until the flag is
  set. Visible symptom, one-toggle fix.
- 250 vehicle metaobject entries, one Storefront page, no pagination. Logged
  when exceeded.
- Overlapping generations for the same make+model are ambiguous, so the app
  keeps the first and drops the rest with an error. Admin fixes the data; the
  app never guesses.
- If every vehicle entry is deleted, the five fallback stubs resurrect. Fine
  during rollout. Once the metaobject is the stable source, returning `[]`
  instead is a small follow-up — an empty list renders the garage UI with an
  empty picker and no redirects, which is correct once intentional.
- `fits-*` tags are applied manually per product. See §4.3.

**URLs and SEO**

- **Vehicle URLs are absent from the sitemap**, deliberately. Categories ×
  generations is a combinatorial pile of near-duplicates while the catalog is
  thin, and they're crawlable anyway. Revisit when real `fits-*` coverage makes
  them distinct: one addition to `app/sitemap.ts` emitting category × generation
  first-year URLs for fitment-enabled collections.
- **Cross-vehicle near-duplicates while the catalog is thin.** With few products
  (or mostly `fits-universal`), `/lighting/ford/f150/2021` and
  `/lighting/chevy/silverado/2019` can render the same grid under different
  titles. Google soft-deduplicates rather than penalizing. Escalation lever if
  Search Console flags it: noindex a vehicle page whose filtered grid equals the
  full collection. Don't build until needed.
- Nav caps (8/12/12/16) bound the category URL space, not just the menu. The app
  logs when a level is sitting on one.
- Depth is unbounded in the resolver but capped at four nav levels by the query —
  three URL segments. Going deeper means another nesting level in `nav.ts` and a
  cost review.
- A collection in two places in the tree gets two paths; first in walk order
  wins the canonical, the other still renders. Visible in the sitemap if it
  happens.
- Category path segments are case-sensitive: `/Lighting` is a 404. Vehicle
  segments are lowercased before resolution, so `/lighting/Ford/f150/2021`
  resolves and canonicalizes down. Fixing the category half means lowercasing
  the whole path or adding a redirect.
- Any single-segment URL that isn't a collection handle or a real route 404s.
  Intentional — there is no CMS fallback; custom pages are code routes.

**Admin ergonomics**

- `layout: landing` is stored and ignored — a node set to it renders the grid.
  Admin can set a field that visibly does nothing until §4.1 ships.
- The picker's Year list spans every generation's range, so it can offer years
  for which only one make exists. Fine at this catalog size.

---

## 4. Deferred work

### 4.1 Phase 3B — authored landing pages

Deferred by decision on 2026-07-25: every category uses the default full grid
until after the UI pass, when the section schema can be designed against the
real page instead of guessed at. `layout` defaults to `grid` and `sections` is
simply unread until then.

- The `category_section` metaobject schema is already recorded in
  `docs/shopify-setup.md` Part 1.5. **Don't build it yet.**
- `nav_item.sections` is **deliberately not in the nav query.** It is a
  metaobject-reference _list_, so selecting it adds another multiplying
  connection at all four levels of a query whose caps already multiply
  8×12×12×16 — and a cost rejection drops the entire nav to the native-menu
  fallback, i.e. the whole site's navigation and category space disappear.
  Paying that risk for a field nothing reads is a bad trade. Add it with this
  step, alongside a fresh cost review.
- `CategoryNode` correspondingly has no `sectionIds`. Two lines when needed.
- Rendering intent: sections render top to bottom, `show_grid` decides whether
  the full grid follows, and **each section's products go through the same
  fitment filter as the grid** — otherwise a landing page quietly becomes the
  one place that shows parts that don't fit.

### 4.2 The L1 sections are title-only stubs

`/parts`, `/custom-work`, `/lifestyle` render a heading and nothing else;
`/community` and `/the-standard` are scaffolds. Real pages come after the
backend work.

`/custom-work` is **fully spec'd in `docs/plans/custom-work.md`** — URLs, page
outlines, nav entries, content source, and the depth decision. It is the shop
side, so it gets **no ecommerce furniture** — no product grid, no cart, no
filters, no garage bounce. It should cross-link with the retail side both ways
(kit pages point at the shop that designed them; the shop section points at the
kits it produced).

The child set narrowed from four to three: **Our Services**
(`/custom-work/services`), **Our Builds** (`/custom-work/builds`), **Inside the
Shop** (`/custom-work/inside-the-shop`). The Process folded into Our Services as
a section; Start Your Build is `/quote`, reached by CTA rather than given a nav
slot. Children nest under the section path, which does not conflict with "L1
contributes no segment" — that rule governs derived category paths, not
hand-typed `link` values on code routes.

**The section is capped at two levels.** No L3 nav entries under any of the
three: a child on any one of them flips the mega panel from flat to the rail and
demotes the other two from visible cards to hover-to-reveal rows. Per-service and
per-build **pages** stay available — URL depth costs nothing and needs no nav
change. Reasoning and the `links-row` escape hatch are in the spec, §5.

`/community` is the brand side, and it is a **container**: Customer Builds and
The Standard, with Events and Giveaways when they exist. The Manual left for
its own L1.

**The Manual is reference, not a blog** — explainers, product research,
electrical basics, suspension. Written to be looked up and updated in place, so
it never carries the stale dateline that makes a neglected blog worse than no
blog. The genuinely time-stamped content the shop produces has homes already:
launches in the announcement rotator, trucks in Our Builds and Customer Builds,
events as their own child when they exist.
It is **not** where support lives — see 4.7.

Named Community rather than About because it is the only section whose contents
are expected to grow — About shrinks the moment events land, Journal narrows to
articles, and a place name makes company philosophy read as furniture. It is
also the only heading under which The Standard fits: "what we stand for" reads
as the terms of belonging rather than corporate boilerplate.

**Customer Builds is now the section's largest piece, not its thinnest.** 100+
trucks exist from install work — the body of work against Our Builds'
highlight reel. Full spec in `docs/plans/community.md`; the one thing that
cannot be deferred is the **vehicle reference on every entry**, because
retrofitting it onto a hundred published rows is a job nobody does.

Originally recorded as the child that had to ship: With nothing but a blog
behind it the section name over-promises, and customer trucks are free content,
social proof to link from product pages, and model-specific search traffic.
Distinct from Custom Work's Our Builds, which is the shop's own work.

`/the-standard` is now an **L2 under Community**, not an L1 section. Its URL
does not move: an L2 with an explicit `link` and no `slug` falls back to the
link, so nav position and path are independent here.

**The blog needs a content-source decision before it gets a route.** Shopify
articles are queryable on the Storefront API, which beats a deploy per post —
settle that before scaffolding, and name the blog at the same time.

**The L1 set is five.** Custom Work · Parts · Lifestyle · Community · The
Manual. The Manual was a Community child until it was clear it did not belong
there — reference and expertise against a section about people — and until the
point that it is the section most likely to bring strangers to the site at all,
which is a poor thing to bury two clicks down. Support
deliberately gets no bar slot (4.7), and the category rail inside the Parts
panel is why the bar does not need category items on it — promoting categories
to L1 would consume the rail's level and burn the L1 cap of 8.

### 4.3 "Shop without truck" deletes the truck

In the garage panel it calls the same clear as **Delete**, so a visitor who
wants to browse everything for a moment loses the truck they entered.

The mechanism for the right behaviour already exists — `?all=1`, which the
category pages and the search toggle both use — but it is **per-URL and
deliberately not sticky** (`CLAUDE.md`): a stored "fitment off" flag would make
the garage appear to stop working three clicks later with nothing on screen
explaining why. So wiring the button to `?all=1` only widens the page you are
standing on, which is arguably worse than deleting because it looks like it
worked and then quietly stops.

Doing it properly means a browsing mode that survives navigation — a second
cookie or a URL flag carried across links — **plus a visible indicator** that
fitment is off and a one-click way back. That is a design decision, not a
patch, which is why the button deletes for now rather than half-working.

### 4.4 The garage holds one truck

"Add truck" in the garage summary opens the picker and **replaces** what is
there. It should append: keep several trucks and let the visitor choose which
one they are browsing with, which is what the panel's own layout already
implies — a vehicle row with a chevron, and Add sitting separately from Edit.

What it actually touches:

- **The cookie.** `tl_garage` is one `<generation handle>:<year>` pair. It needs
  a list plus a pointer at the active one, and a cap — three or four — because
  every request carries it. **Nothing is deployed, so there is no migration to
  write.** That stops being true at launch.
- **`resolveGarageCookie`** returns a single `VehicleSelection`; it would return
  the list and the active one. Every caller of it, and the `actions.ts` server
  actions, change shape.
- **Not the URL space.** A URL describes one truck by grammar
  (`/<category>/<make>/<model>/<year>`), so multiple vehicles is a _storage_
  feature. The only routing change is which truck `garage-redirect.tsx` picks —
  the active one.
- **Not the filtering.** Category pages already filter on one generation's tag;
  they would keep doing that, for whichever truck is active.
- **The panel.** The vehicle row's chevron becomes a real list of saved trucks
  instead of a disclosure, Delete removes one rather than emptying the garage,
  and the heading's plural finally earns itself.

The UI shape is already close, because it was drawn from a reference built for
several vehicles. It is the storage layer underneath that assumes one.

### 4.5 Automating `fits-*` tags

Recorded from the Phase 2 decision discussion, not built: a product metafield of
`vehicle` references plus Shopify Flow (or a bulk script) deriving the tags
automatically. Better admin UX, and **zero app changes** — tags stay the
filtering mechanism either way.

### 4.6 Link sweep before launch

Audit the footer menu (`next-js-frontend-footer-menu`) and every nav `link`
field. Shopify CMS pages are not rendered, so any `/pages/<handle>` link — or a
bare `/<handle>` pointing at a Shopify page — 404s. End state: no CMS-page links
anywhere, every page a custom code route.

### 4.7 Support architecture — decided, not built

15–20 policy and help pages are coming (shipping, returns, warranty, FAQ,
fitment help, order status, legal). **Support gets no L1 nav slot.** Three tiers
instead:

1. **The header contact popup is the entry point**, not the container — chat,
   phone/email/hours, order status, the top six or eight questions, and a link
   to the hub. **The phone number goes front and centre in it**, because that is
   what covers the condensed header: the announcement band carries the number on
   desktop but hides under `group-data-[condensed]`, so once the header shrinks
   the chat icon's popup is the only phone affordance left. Mobile's copy lives
   at the foot of the drawer. Today it is a plain `/contact` link (`components/layout/header/
index.tsx`, and "Contact support" in `mobile-drawer.tsx`); the popup enhances
   it, and `/contact` keeps working underneath. Build it as a client island
   alongside `garage-menu`/`vehicle-picker`, fed from a cached source — a
   per-request fetch there drags the layout dynamic under `cacheComponents`.
   **Load any chat widget lazily on open**, never in the root layout.
2. **`/support` hub** — all of them, grouped.
3. **Every article and policy stays a real indexed URL.** Overlay-only content
   cannot rank, cannot be pasted into a support reply, and legal needs stable
   links regardless (Shopify's checkout links policies directly). This is the
   binding constraint on the popup: it surfaces support, it never stores it.

**The footer needs grouped columns before any of this lands.** It is still the
stock Vercel template — `FooterMenu` renders one flat `<ul>` and its `Menu` type
carries no children, so 20 links would render as a 20-item column. Four labelled
columns (Orders & Shipping · Returns & Warranty · Help · Company) plus a muted
legal row absorb the volume; with the popup as the primary path the footer only
needs the top eight, and the hub carries the long tail. Shopify menus nest two
levels, so the columns can be authored in admin once the footer takes a nested
source (the nav's `MenuItem` already carries `.items`).

Storefront fields confirmed against the 2025-07 schema if authored content is
ever preferred over hand-built routes: `shop.refundPolicy`, `shippingPolicy`,
`privacyPolicy`, `termsOfService`, `subscriptionPolicy` (each `title`, `handle`,
`body`), and `page(handle:)` / `pages(first:)`. Not the current plan — the pages
are being hand-built — but it is the escape hatch if the volume gets tedious.
