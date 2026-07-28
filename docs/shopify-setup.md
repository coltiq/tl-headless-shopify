# Shopify setup — the complete admin checklist

Everything that has to exist in the Shopify admin for this storefront to work,
in the order it has to be done. Authoritative for admin setup; how the app
_reads_ any of it is in `CLAUDE.md`, and what's still outstanding is in
`docs/plans/OPEN-ITEMS.md`.

**Read the order rules first — several steps fail if run out of sequence.**

## Order of operations

| Part | What                                       | Why it must come when it does                                           |
| ---- | ------------------------------------------ | ----------------------------------------------------------------------- |
| 0    | Environment + Storefront token             | Nothing reads without it                                                |
| 1    | Metaobject + metafield **definitions**     | Metaobject webhook filters are validated against existing definitions   |
| 2    | **Webhook subscriptions** (detail: Part 9) | Content created before the subscriptions can sit behind a day-old cache |
| 3    | Collections                                | The nav references them; the app resolves a category to a collection    |
| 4    | Nav entries                                | Needs the definition (Part 1) and the collections (Part 3)              |
| 5    | Vehicle entries                            | Needs the definition (Part 1)                                           |
| 6    | Product tagging                            | Needs the vehicle entries (Part 5) — tags embed the generation handle   |
| 7    | Storefront filters                         | Independent, but fitment filtering is silently inert until it's done    |
| 8    | Flush + verify                             | Last — proves the whole pipe                                            |
| 9    | Webhook reference                          | The mutations and inventory Part 2 sends you to                         |

Two hard ordering rules, both enforced by Shopify rather than by convention:

- **Definitions before webhooks.** Creating a `metaobjects/*` subscription
  before its definition exists fails with _"The specified filter is invalid,
  please ensure you specify the field(s) you wish to filter on."_
- **Webhooks before entries.** If content is created first, the storefront may
  have already cached the fallback for up to a day with nothing firing to
  refresh it. The manual flush in Part 8 covers this either way.

## What to build, and what to leave alone

Almost everything here is needed now. The exceptions are called out in place —
field tables carry a **Create it?** column, and anything marked _skip for now_
or **Phase 3B** is deferred until after the UI pass. Skipping is safe by design:
a metaobject field that doesn't exist resolves to `null`, and the app defaults
it correctly. Creating deferred fields early just puts controls in the admin
that visibly do nothing.

> **Phase 3 shipped 2026-07-25.** The multi-level category URL space is built.
> Until the `slug` and `collection` fields are actually filled in on the
> `nav_item` entries, the category tree is empty and only single-segment
> collection URLs resolve — which is why the deep nav links
> (`/lighting/rock-lights`, `/lighting/rock-lights/diy-kits`, …) still 404.
> **Part 4.3 is the work that turns them on.**

---

# Part 0 — Environment and access

Required in `.env.local` (see `.env.example`):

| Variable                          | Notes                                                                       |
| --------------------------------- | --------------------------------------------------------------------------- |
| `SHOPIFY_STORE_DOMAIN`            | e.g. `your-store.myshopify.com`; no brackets                                |
| `SHOPIFY_STOREFRONT_ACCESS_TOKEN` | A **private** Storefront token — sent as `Shopify-Storefront-Private-Token` |
| `SHOPIFY_REVALIDATION_SECRET`     | Shared secret in the webhook URL                                            |
| `COMPANY_NAME`                    | Footer copyright                                                            |
| `SITE_NAME`                       | Title template, metadata                                                    |

`VERCEL_PROJECT_PRODUCTION_URL` is set by the host and drives `baseUrl` for
canonicals and the sitemap; locally it falls back to `http://localhost:3000`.

**Token scopes.** The private Storefront token needs
`unauthenticated_read_metaobjects` on top of the usual product/collection
scopes. Without it, every metaobject query throws and the app silently serves
its fallbacks — the nav drops to the native menu and the garage picker shows
the five hardcoded trucks. It looks like it's working. It isn't.

---

# Part 1 — Definitions

## 1.1 `nav_item` metaobject

Settings → Custom data → Metaobjects → Add definition. **Name:** Nav item,
**Type:** `nav_item`.

The header nav comes from a self-referencing `nav_item` tree rather than a
native Shopify menu, because native menus cap at three nesting levels and the
header renders four (L1 nav bar → L2 rail → L3 column headings → L4 links).
Until this exists the storefront falls back to the native `main-menu-v2` menu.

**Field keys must match exactly** — a mismatched key resolves to `null`, and
the item is dropped or the whole nav falls back.

| Field key     | Type                                              | Create it?   | Notes                                                                                                                         |
| ------------- | ------------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| `label`       | Single line text                                  | **Yes**      | Display name; set as the definition's display name field. **Display only** — never used to build a URL                        |
| `link`        | Single line text                                  | **Yes**      | Plain text on purpose: the URL field type only accepts absolute URLs, but the nav needs relative paths. Empty = heading       |
| `children`    | Metaobject reference → Nav item, **list**         | **Yes**      | Self-reference. List order is display order                                                                                   |
| `style`       | Single line text, presets below                   | **Yes**      | Moves an L2 item out of the cards and renders it elsewhere in the panel — see "Panel styles"                                  |
| `description` | Single line text                                  | **Yes**      | One line of copy, shown only by the mega panel's flat layout and by a childless rail item — see below. Optional everywhere    |
| `kicker`      | Single line text                                  | **Yes**      | Only read by a `feature` item — the small label above its title ("Latest build"). Optional; absent renders no kicker          |
| `image`       | File                                              | **Yes**      | Only read by a `feature` item, as the panel's photograph. Optional; without it the feature card renders dark                  |
| `slug`        | Single line text                                  | **Yes**      | URL segment. Validation regex `^[a-z0-9]+(-[a-z0-9]+)*$`. Empty on L1 and on heading-only nodes                               |
| `collection`  | Collection reference                              | **Yes**      | **Explicit** — the app never infers a collection from the slug, because the two are allowed to differ                         |
| `layout`      | Single line text, preset `grid` / `landing`       | Skip for now | Read if present, but only `grid` renders — a node set to `landing` still shows the grid. Absent → `grid`                      |
| `show_grid`   | True/false                                        | Skip for now | Read if present, but unread until `landing` renders differently. Absent → true                                                |
| `sections`    | Metaobject reference → Category section, **list** | Skip for now | Not in the query at all, and it can't be created before the `category_section` definition that Part 1.5 says not to build yet |

### Panel styles

`style` presets to create: `default`, `links-row`, `feature`, `proof`. Three of
them turn an L2 item into panel furniture rather than a card.

| `style`     | What the item becomes                                                                                         |
| ----------- | ------------------------------------------------------------------------------------------------------------- |
| `default`   | A card in the panel (or a rail item in a deep section). The normal case                                       |
| `links-row` | A **holder**: its own label never renders, and its **children** become the button row under the rule          |
| `proof`     | A holder as well: its children render as a muted line of claims at the very foot. Text, not links             |
| `feature`   | The item itself, promoted to the large image card on the right. The other cards stack down the left beside it |

**`links-row` and `proof` hold children; `feature` is the item.** That trips
people up: for the first two you create a container entry whose label nobody
sees, then hang the real entries off it as children.

**The first child of a `links-row` is the primary button** and renders filled;
the rest are outlined. Authoring order sets the hierarchy — put "Get a quote"
first. Entries may point anywhere: `/quote`, an off-site financing application.
A `proof` child needs no `link` at all, since it renders as text.

**A `tel:` entry renders as plain text in the panel, not a button.** The mega
panel is desktop-only and nobody taps a number on a desktop, so an interactive
phone button there is a control that does nothing when clicked. The number
still shows. The same entry is tappable in the mobile drawer, which is where a
call can actually happen — so author it once and both behave correctly.

Only one `feature` per section. Everything on that card comes from the entry:

| On the card       | Field                                                     |
| ----------------- | --------------------------------------------------------- |
| Photograph        | `image` — absent, the card renders dark and still works   |
| Small label above | `kicker` — "Latest build", "New". Absent, nothing renders |
| Title             | `label`                                                   |
| Body copy         | `description`                                             |
| Destination       | `link`                                                    |
| Call to action    | `cta` — blank falls back to "View"                        |

**Write the `cta` without an arrow** — the app adds "→". And it has to read
correctly under that card's own title: "See the build" is right under a truck
and wrong under Inside the Shop, which is why blank gives you "View" rather
than nothing.

### How a section's depth changes its panel

The mega panel picks a layout from the shape of the section, so nothing has to
be configured — but it does mean **where you write `description` decides
whether anyone sees it**.

| The section's L2 items    | Panel                                                                                        |
| ------------------------- | -------------------------------------------------------------------------------------------- |
| All have children (Parts) | Rail of L2s on the left, the active one's L3 groups and L4 links on the right                |
| Some have children        | Same rail. Landing on a childless one shows **its** title, `description`, and a link through |
| None have children        | **Flat**: no rail, the L2s themselves in columns with their `description` beneath each       |

So `description` is worth writing on the L2 items of shallow sections —
Community, Custom Work — where it is the only copy in the panel. On Parts it is
never shown, because those L2s all have children. Leave it blank and the item
still renders as a plain heading; nothing breaks while the copy is unwritten.

The split is at **level 3, not level 4**: a section that has L3 headings but no
L4 links under them keeps the rail, and those headings render as a plain column
of links.

**"Skip for now" means skip.** A missing field key resolves to `null`, and the
walk defaults it correctly — the three Phase 3B fields cost nothing to leave
out, and creating them early just puts controls in the admin that visibly do
nothing. Add them with Phase 3B (`docs/plans/OPEN-ITEMS.md` §4.1).

`slug` and `collection` are the two that matter for the migration in Part 4.3 —
they're what turns the dead deep nav links on.

Then, under the definition's options, enable **Storefront API access**
(Storefronts: Read).

## 1.2 `vehicle` metaobject

**Name:** Vehicle, **Type:** `vehicle`. One entry per generation (a year
range), not per year. Until this exists the app falls back to five hardcoded
generations (`FALLBACK_VEHICLE_GENERATIONS` in `lib/fitment.ts`), so the
storefront ships and works before any of this is done.

| Field key     | Type             | Required | Notes                                                                                           |
| ------------- | ---------------- | -------- | ----------------------------------------------------------------------------------------------- |
| `make`        | Single line text | Yes      | **URL slug.** Add validation regex `^[a-z0-9]+$`. See the slug contract below                   |
| `model`       | Single line text | Yes      | **URL slug.** Same regex                                                                        |
| `year_start`  | Integer          | Yes      | 4-digit year                                                                                    |
| `year_end`    | Integer          | Yes      | 4-digit year, ≥ `year_start`                                                                    |
| `label`       | Single line text | Yes      | Truck name **with no years** — `Ford F-150`; set as the display name field. Never used for URLs |
| `short_label` | Single line text | No       | Condensed name, still no years — `F-150`. Falls back to `label` when empty                      |

Enable **Storefront API access**. Without it the query throws and the app
serves the fallback generations — the picker looks fine but shows the wrong
trucks.

### Labels carry no years

**A generation is internal.** It exists to pick a `fits-*` tag and to keep one
canonical URL per year range. Customers never see it.

What they see is the year they actually chose, composed at render time:
`label` = `Ford F-150`, visitor picks 2022, every surface reads
**"2022 Ford F-150"**. Pick 2024 and the same entry reads "2024 Ford F-150".

So two generations of the same truck get the **same** `label` and
`short_label` — that's correct, it's the same truck, and the year tells them
apart. Never write `2021+ Ford F-150` or `15–20 F-150` into these fields; the
app would render "2022 2021+ Ford F-150".

### The vehicle slug contract (binding)

`make` and `model` are URL segments, not display names. Indexed URLs are
permanent, and both the garage cookie and the `fits-*` product tags embed these
values, so getting them wrong breaks live URLs, existing visitor cookies, and
existing product tags at once.

- Lowercase alphanumeric only — **no hyphens or spaces inside a value**.
- Common make names, not corporate ones: `chevy`, not `chevrolet`.
- Compact models: `f150`, not `f-150`; `1500`, not `ram-1500`.
- All display text lives in `label` / `short_label`. Never derive a URL from
  them.

**The metaobject's own Shopify handle is never read.** The app derives each
generation's handle as `<make>-<model>-<year_start>-<year_end>`, keeping it
deterministic and immune to handle typos or Shopify's auto-generation. Set the
entry handle to the same string anyway, for sanity when browsing the admin.

## 1.3 Collection metafield — `custom.fitment_disabled`

Settings → Custom data → Collections → Add definition. **Name** "Fitment
disabled", **Namespace and key** `custom.fitment_disabled`, **Type** True/false.
Enable **Storefront API access** — without it the API returns `null` and the
flag silently reads as "fitment on".

Category pages apply vehicle fitment **by default**; only Lifestyle (merch)
collections opt out. Unset/false = fitment on, so Parts collections need no
setup at all. Set it `true` on every Lifestyle collection (t-shirts, hats,
accessories…).

A Lifestyle collection missing the flag behaves like a parts category — the
garage redirect fires and vehicle URLs resolve beneath it. Visible symptom,
one-toggle fix.

## 1.4 Announcement bands

Everything in the two indigo bands at the top of the header — the rotating
message and the utility links beside it — comes from here. Nothing is
hardcoded any more except the `USD · EN` locale slot, which reflects what the
storefront actually supports rather than an editorial choice.

> **Replaces `custom.announcement` and `custom.announcement_mobile`** (plain
> text, one message, no link). Those keys are no longer read and can be
> deleted.

Two metaobject definitions, then four shop metafields pointing at them.

### 1.4.1 `announcement` metaobject

**Name:** Announcement, **Type:** `announcement`.

| Field key   | Type             | Create it? | Notes                                                                            |
| ----------- | ---------------- | ---------- | -------------------------------------------------------------------------------- |
| `label`     | Single line text | **Yes**    | The message. Set as the display name field                                       |
| `url`       | Single line text | **Yes**    | **Not the URL type** — see below. Leave empty for a message that isn't clickable |
| `link_text` | Single line text | **Yes**    | The part of `label` that becomes the link. Leave empty to link the whole label   |

**`link_text` must appear verbatim inside `label`** — that's how the clickable
run is located. Given `label` = "Free shipping over $199. See details" and
`link_text` = "See details", the band renders the sentence with just "See
details" underlined and clickable.

Leave `link_text` empty and the **whole label** is clickable with no underline.
A `link_text` that isn't a substring of `label` is dropped with a console error
and falls back to that whole-label behavior — so a typo is visible in the logs,
not silently unlinked.

`link_text` without a `url` links nowhere, so it's ignored (also logged).

### 1.4.2 `announcement_bar_link` metaobject

**Name:** Announcement bar link, **Type:** `announcement_bar_link`. These are
the utility links on the right of the desktop band, and the whole mobile links
band beneath the brand bar.

| Field key   | Type             | Create it? | Notes                                                                             |
| ----------- | ---------------- | ---------- | --------------------------------------------------------------------------------- |
| `label`     | Single line text | **Yes**    | Link text, rendered in the case you type it — capitalise it here if you want caps |
| `url`       | Single line text | **Yes**    | **Not the URL type** — see below. Required; a link with no destination is dropped |
| `icon_text` | Single line text | **Yes**    | An exact Heroicons name. **Preferred over `icon`** — see below                    |
| `icon`      | File             | **Yes**    | Optional fallback for custom art; the link renders without either                 |

**Prefer `icon_text`.** Type the **exact** export name of a
[Heroicons](https://heroicons.com) 24px **outline** icon — `PhoneIcon`,
`TruckIcon`, `WrenchScrewdriverIcon`, `ChatBubbleLeftRightIcon`. Copy it from
the icon's page rather than guessing: the whole outline set is available and
nothing needs a deploy, but the match is case-sensitive and exact. A name that
doesn't resolve logs `Unknown icon_text "..."` and renders no icon — check the
logs, not the header, since the band still looks fine without one.

`icon_text` wins when both are set, because it renders as inline SVG and
inherits the band's text colour in every state. An uploaded file can't be
recoloured by the app.

**An uploaded `icon` must already be the right colour** — it sits on the indigo
band, so upload **white** SVG or PNG. Both forms render 15px tall on desktop,
12px on mobile, so a square-ish simple glyph works; don't worry about exact
pixel size.

Icons are decorative either way (`alt=""` / `aria-hidden`): the label sits right
beside them, and having a screen reader read both would be repetition.

### 1.4.3 Shop metafields

Settings → Custom data → Shop. All four are **metaobject reference, list**,
with **Storefront API access** enabled.

| Namespace / key                        | References              | Drives                     |
| -------------------------------------- | ----------------------- | -------------------------- |
| `custom.announcement_list`             | `announcement`          | Desktop band message       |
| `custom.announcement_list_mobile`      | `announcement`          | Mobile band message        |
| `custom.announcement_bar_links`        | `announcement_bar_link` | Desktop band utility links |
| `custom.announcement_bar_links_mobile` | `announcement_bar_link` | Mobile links band          |

**An empty mobile list means "same as desktop."** The mobile lists exist so
mobile can carry shorter copy — the band is one truncated line — not so every
message has to be written twice. Fill in only the desktop list and both bands
show it.

The app reads fields **by key**, not by metaobject type, so if you'd rather
keep mobile entries in their own definitions (`announcement_mobile`,
`announcement_bar_link_mobile`) you can — point the `*_mobile` metafields at
them and keep the same field keys. Reusing the one definition is simpler and
lets a single entry appear in both lists.

### 1.4.4 Behaviour worth knowing

- **More than one announcement rotates every 7 seconds.** A single announcement
  never starts a timer. Rotation pauses while the pointer is over the band or
  keyboard focus is inside it.
- **Each band collapses when it has nothing to show**, and the page offset
  shrinks with it. The desktop band survives on utility links alone, so adding
  links before writing any announcement still shows them.
- **Caps:** 10 announcements, 6 bar links per list. Anything beyond is dropped
  by the query and logged.
- **Two bar links is what the mobile band is designed for.** More render, split
  evenly, but get cramped fast.
- **`url` is single line text, deliberately — not Shopify's URL type.** The URL
  type validates against a scheme (`https`, `http`, `mailto`, `tel`, `sms`), so
  it rejects a bare path like `/custom-work`. Same reason `nav_item.link` is
  plain text. Using it would force every internal link to be absolute, which
  sends visitors to the Shopify domain instead of keeping them on this
  storefront. The trade is that nothing validates the value — a typo renders a
  working-looking link that 404s.
- **Prefer relative paths** in `url` — `/custom-work`, not
  `https://www.thetrucklab.com/pages/custom-work`. Absolute URLs still work
  and render as external links (`rel="noopener noreferrer"`), which is right
  for genuinely off-site destinations and wrong for your own pages. This app
  never renders Shopify CMS pages (see Part 8.1).

## 1.5 `category_section` metaobject — **Phase 3B, do not build yet**

Recorded so the schema isn't reinvented later. Authored landing pages are
deferred until after the UI pass, when the section shape can be designed
against the real page instead of guessed at.

| Field key    | Type                    | Notes                                      |
| ------------ | ----------------------- | ------------------------------------------ |
| `heading`    | Single line text        | Required                                   |
| `body`       | Multi-line text         | Optional intro copy                        |
| `image`      | File                    | Optional                                   |
| `collection` | Collection reference    | Products come from here…                   |
| `products`   | Product reference, list | …or are hand-picked here (takes priority)  |
| `limit`      | Integer                 | How many to show when a collection is used |

---

# Part 2 — Webhook subscriptions

**Do this now, before creating any entries.** Six for products and
collections, then **three per metaobject type you created** — `nav_item`,
`vehicle`, and each announcement type from Part 1.4. Twelve with the two
original types; eighteen if you add `announcement` and `announcement_bar_link`.

The full mutations, the inventory table, and the known gaps are in **Part 9**
at the bottom of this document. Create them, confirm every `userErrors` array
comes back empty, then continue to Part 3.

Webhooks require a publicly reachable URL, so **none of this applies to local
development** — Shopify cannot call `localhost`. Locally, caches refresh when
`cacheLife` expires or the server restarts. Do Part 2 and Part 9 once per
deployed environment.

---

# Part 3 — Collections

## 3.1 Create the collections the nav will reference

Every category in the nav resolves to a Shopify collection. Create them before
authoring the nav, so the `collection` reference field has something to point
at.

**Handles are global and must be unique**, so two different parents can't both
have a child called "kits" — use `rock-light-kits` and `lightbar-kits`.

## 3.2 Membership must cascade — nest the collections

The app assumes **a parent collection contains everything in its descendants**:
a product in `rock-light-kits` is also in `rock-lights` and in `lighting`. That
assumption is what lets every category page be a single query with native
Shopify sorting, and never merge its descendants.

**Shopify does this natively.** In the collection editor's right rail, the
**Collection** card pulls another collection's products into this one:

```
Collection: Lighting
  Collection card →  Rock Lights, Wheel Lights, Wiring
  Products card   →  (empty — Lighting owns no products directly)
  Collection items: everything in those three
```

Nest each child under its parent and the whole tree cascades with no
per-product bookkeeping at all.

**Verified 2026-07-25 against the Storefront API.** `lighting` owned no products
directly, listed `rock-lights` in its Collection card, and `collection.products`
returned the rock-light product — so nested membership reaches the storefront,
which is the only thing the app cares about.

Why this beats the alternatives:

- **Computed, not a snapshot.** Add a product to `rock-lights` and it appears in
  `lighting` immediately, with nothing else to touch.
- **The hierarchy lives in one place** — the parent — instead of being copied
  into every product's tags.
- **Adding a leaf touches only its parent.** Nothing above needs editing.

What still needs care:

- **Nesting is per-parent, one level at a time.** Each collection lists its
  direct children; the tree is what makes it transitive. A child created and
  never nested is simply invisible to its parent — visible in the editor, but
  nothing warns you.
- Products added to a parent directly are fine; they sit alongside the nested
  ones.

The legacy **automated-collection conditions** (Products card → _Add
condition_ — tag, type, vendor, price…) still exist and still cannot reference
a collection: `CollectionRuleColumn` has no "product is in collection X". You
don't need them for the hierarchy. They remain useful for cross-cutting
collections like "Sale" or "New arrivals".

## 3.3 Hidden collections

Collections whose handle starts with `hidden-` are filtered out of the `/search`
sidebar, the sitemap, and predictive search, and their pages 404. **The prefix
is the only thing that hides a collection** — there is no other flag.

Two hidden collections are **required by the homepage**:

| Handle                           | Drives                   |
| -------------------------------- | ------------------------ |
| `hidden-homepage-carousel`       | Homepage carousel        |
| `hidden-homepage-featured-items` | Homepage three-item grid |

Until they exist the homepage renders zero products and the build logs
`No collection found` for both.

### What to do with the rest

Every other collection in the store is a **public category page at
`/<handle>`**, whether or not you meant it to be. Go through them once and ask:
**would you put this in the nav?**

- **Yes** → leave it alone.
- **No, but I may want it as a source later** (a "Best Sellers" rail, a future
  landing page) → **rename the handle** to `hidden-<handle>`. It keeps working
  as a merchandising source; it just stops being a page.
- **No, and I don't want it** → **delete it.** Hidden clutter is still clutter.

Sort devices like `best-selling-products`, `newest-products`, and `all` are
never browsable categories — prefix or delete, but don't leave them public. If
one reappears after deletion, a theme or app is regenerating it; prefix that one
instead of deleting it again.

> **Before deleting, check nothing nests it.** A collection listed in another
> collection's **Collection card** (3.2) is contributing its products to that
> parent. Deleting it silently removes them from every parent that pulled it in,
> with no warning and no error — the parent page just quietly shrinks. Also
> confirm no `nav_item` `collection` field points at it (that would leave a
> category rendering child links instead of a grid) and that the footer menu
> doesn't link to it.

**Renaming a handle is safe while nothing is indexed.** Nav `collection` fields
store a reference, not a handle, so category pages survive a rename untouched.
Only out-of-tree collections take their URL from the handle, and changing those
URLs costs nothing until the site is live — after that it needs a redirect.

---

# Part 4 — Nav entries

Content → Metaobjects → Nav item.

## 4.1 The root

Create one **root** entry with handle **`main-nav`** (label "Main nav", no
link). The app looks this handle up — it must match exactly. The root's
`children` are the L1 nav bar items.

## 4.2 The four L1 sections

L1 items **group the menu and contribute nothing to any URL**. They are
standalone destinations backed by custom code routes, which is why their links
don't look like category paths:

| Label       | `link`         | Route status                  |
| ----------- | -------------- | ----------------------------- |
| Custom Work | `/custom-work` | Title-only placeholder, built |
| Parts       | `/parts`       | Title-only placeholder, built |
| Lifestyle   | `/lifestyle`   | Title-only placeholder, built |
| Community   | `/community`   | Scaffolded                    |

Because these are code routes, **a collection can never use those four
handles** — a static route always beats the category resolver.

**Custom Work is deliberately plain-language, not a sub-brand.** Truck Lab is
one brand with two faces — retail and shop — and neither is subordinate, so the
build side gets no name of its own competing for recognition. The label also
has to hold both a ground-up truck and a bolt-on install without implying
either: "Custom Builds" reads as big-money-only and loses the lift-and-bumper
customer, "Customize" reads as a configurator, and anything containing "Shop"
reads as a product grid on a storefront. If the label changes, it is a single
`nav_item.label` edit — but the path is baked into
`PROXY_RESERVED_SEGMENTS`, `app/sitemap.ts`, and the route folder.

### L2 items that point at code routes

Not every L2 is a category. Community and Custom Work are shallow sections whose
children are custom pages, and those are authored the opposite way to Part 4.3:
**set `link`, and leave `slug` and `collection` empty.** A node with no slug
produces no category node and no URL of its own, so the menu falls back to
`link` — which is what keeps nav position and path independent here.

| Parent      | Label           | `link`                         | Route status                                  |
| ----------- | --------------- | ------------------------------ | --------------------------------------------- |
| Community   | Blog            | —                              | No route yet; needs a content source decision |
| Community   | Customer Builds | —                              | No route yet                                  |
| Community   | The Standard    | `/the-standard`                | Title-only placeholder, built                 |
| Custom Work | Our Services    | `/custom-work/services`        | Spec'd, not built                             |
| Custom Work | Our Builds      | `/custom-work/builds`          | Spec'd, not built                             |
| Custom Work | Inside the Shop | `/custom-work/inside-the-shop` | Spec'd, not built                             |

**Write a `description` on every one of these.** Both sections are shallow — no
L2 has children — so the mega panel renders flat, and the description is the
only copy in the panel. Blank means a bare title. See "How a section's depth
changes its panel" in Part 1.1.

**Custom Work's children nest under the section** (`/custom-work/services`, not
`/our-services`). That is not a contradiction of "L1 contributes no segment":
that rule governs **derived** category paths, and these are hand-typed `link`
values on code routes. Full spec in `docs/plans/custom-work.md`.

**Adding children to any of these L2s changes the panel for all of them** — the
layout flips from flat to the rail, and the siblings' descriptions stop showing
until each row is hovered. Deliberate; see `docs/plans/custom-work.md` §5.

## 4.3 Category items (L2 and below) — **the Phase 3 migration**

**Fill in `slug` (the URL segment) and `collection` (the reference), and clear
`link`.** The app builds the full path from tree position, with L1 skipped:

```
Parts                         (L1 — section, contributes no segment)
 └ Lighting        slug: lighting        → /lighting
    └ Rock Lights  slug: rock-lights     → /lighting/rock-lights
       └ Kits      slug: rock-light-kits → /lighting/rock-lights/rock-light-kits
```

An author types **one** slug per item; the app never sees a full path in admin
and never infers one from a collection handle. Re-parenting an item moves its
URL automatically, so the menu and the URL space can never disagree — which is
exactly the failure this replaces.

**Why the deep nav links 404 right now.** The existing entries put a multi-level
path straight into `link` (`/lighting/rock-lights/diy-kits`). Nothing derives
that path, so nothing serves it. The app now prefers a derived path and falls
back to `link` only when there's no slug, so the migration is safe to do one
item at a time — each item starts working the moment it gets a `slug` and a
`collection`, and untouched items keep their old behavior.

Three rules the walk enforces, worth knowing before authoring:

- **A node with no `slug` is a heading.** It contributes no segment, and its
  children attach to _its_ parent's path. That's how a "Shop by truck" column
  heading can sit in the mega panel without inventing a URL level.
- **A node with a bad slug is dropped, along with everything under it** — the
  menu entry stays (so the breakage is visible) but the URLs disappear. Check
  the server logs for `Dropping nav_item …` after any nav edit.
- **Every category node needs a `collection`.** A node without one renders a
  page listing its child categories instead of a grid, and logs an error. It is
  a bug indicator, not a supported page type.

### Category slug rules (binding)

- Lowercase alphanumeric plus internal hyphens. `plug-play`, never `p&p` — `&`
  is not URL-safe and `%26` in a path is a permanent readability tax.
- **A slug may never be four digits.** `/lighting/2021` would collide with the
  vehicle year segment. Four-digit slugs are dropped with a console error.
- Slugs must be unique among siblings — and, because L1 contributes no segment,
  also across the four L1 sections at the first level. Two sections both
  holding a `lighting` child produce one `/lighting`; the second is dropped
  with an error.
- **`/contact`, `/app`, `/support`, `/quote`, `/the-standard`, `/search`, and
  `/product` are reserved too**, for the
  same reason — they are static code routes, so no slug or collection handle
  may use them either. The full list is
  `PROXY_RESERVED_SEGMENTS` in `lib/constants.ts`.
- **The four L1 handles are reserved forever.** `/parts`, `/custom-work`,
  `/lifestyle`, and `/community` are static code routes and always beat
  the category resolver, so no slug (and no collection handle) can ever use
  them.

### How a URL resolves (for reference)

Given a path, the app tries, in order: the whole path as a category; the path
minus its last three segments as a category with `make/model/year` appended;
a single segment as a bare collection handle; a collection handle plus
`make/model/year`. A real category always wins over a vehicle reading of the
same segments. Anything left over is a 404.

Two consequences worth remembering:

- **A collection whose handle has a tree position is only canonical at its tree
  path.** `/rock-lights` redirects to `/lighting/rock-lights`.
- **Collections outside the tree keep rendering flat** at `/<handle>` —
  `gift-cards`, `shop-labor`, `the-lab`, `best-sellers`. They need no nav entry
  and no slug.

### Link formats for non-category destinations

Handles must match Shopify exactly — a typo renders a working-looking link that
404s, and nothing validates it.

| Destination                      | Enter                                                                                                    |
| -------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Category (collection)            | **Nothing** — use `slug` + `collection` instead, and leave `link` empty                                  |
| Product                          | `/product/<handle>`                                                                                      |
| Custom page                      | The route's path, e.g. `/contact`. **Shopify CMS pages are never rendered**                              |
| All products / search            | `/search`                                                                                                |
| Pre-filtered vehicle link (rare) | `/<category path>/<make>/<model>/<year>` — usually unnecessary, the garage redirect lands visitors there |
| Heading only (no link)           | Leave empty                                                                                              |

Full store URLs pasted from the admin also work — the domain is stripped, and
`/collections/<handle>` is rewritten to `/<handle>`.

## 4.4 Per-level item caps

Extras are **silently dropped by Shopify** — see `lib/shopify/queries/nav.ts`
before raising them. These caps also bound the category URL space: a tree wider
or deeper than the caps quietly loses pages, not just menu entries. The app now
logs `nav_item level N is at its cap …` whenever a level is sitting on one, so
check the server logs before assuming a page is missing for another reason.

| Level              | Cap |
| ------------------ | --- |
| L1 (nav bar)       | 8   |
| L2 (rail)          | 12  |
| L3 (column groups) | 12  |
| L4 (links)         | 16  |

Depth is capped at four nav levels, i.e. **three URL segments** after L1 is
skipped (`/lighting/rock-lights/kits`). The resolver itself has no depth limit;
going deeper means adding a nesting level in `nav.ts` and re-reviewing query
cost.

---

# Part 5 — Vehicle entries

Content → Metaobjects → Vehicle. Enter the five generations the storefront
already ships as fallbacks, **with exactly these values** — they are baked into
live URLs, existing visitor cookies, and the `fits-*` tags applied to products.

| `make`   | `model`     | `year_start` | `year_end` | `label`                | `short_label` |
| -------- | ----------- | ------------ | ---------- | ---------------------- | ------------- |
| `ford`   | `f150`      | 2021         | 2026       | `Ford F-150`           | `F-150`       |
| `ford`   | `f150`      | 2015         | 2020       | `Ford F-150`           | `F-150`       |
| `chevy`  | `silverado` | 2019         | 2025       | `Chevy Silverado 1500` | `Silverado`   |
| `ram`    | `1500`      | 2019         | 2025       | `Ram 1500`             | `Ram 1500`    |
| `toyota` | `tacoma`    | 2016         | 2023       | `Toyota Tacoma`        | `Tacoma`      |

The two F-150 rows sharing a label is intentional — see "Labels carry no years"
above. A visitor who picks 2018 sees "2018 Ford F-150" and gets the 2015–2020
generation's parts; one who picks 2022 sees "2022 Ford F-150" and gets the
2021–2026 generation's. Neither ever sees a year range.

Derived handles: `ford-f150-2021-2026`, `ford-f150-2015-2020`,
`chevy-silverado-2019-2025`, `ram-1500-2019-2025`, `toyota-tacoma-2016-2023`.
`label` and `short_label` are display-only and safe to reword later; the four
slug/year fields are not.

Rules the app enforces on read (`reshapeVehicles` in `lib/shopify/index.ts`):

- An entry failing validation — bad slug, non-4-digit year,
  `year_start > year_end`, empty `label` — is **dropped** with a
  `console.error`; the rest of the picker still renders.
- Two entries sharing a make+model with **overlapping year ranges** make
  year → generation resolution ambiguous. The app keeps one and drops the rest
  with an error. Ranges for the same truck must be adjacent, not overlapping
  (2015–2020 then 2021–2026).
- Cap of 250 entries (one Storefront page). Beyond that entries go missing and
  the app logs an error; add pagination before the list gets near it.
- If **every** entry is deleted, the five fallbacks resurrect. Expected during
  rollout.

Deleting a generation is a real deletion: its URLs 404 after revalidation, and
a visitor whose cookie points at it silently reverts to "Add Your Truck".

Adding a new generation is always two steps — create the entry, then tag the
products that fit it (Part 6).

---

# Part 6 — Product tagging

Fitment matching is **tag-based**. The vehicle metaobject supplies the vehicle
list and the URLs; it does not describe which product fits what.

| Tag                                           | Applies to                                                          |
| --------------------------------------------- | ------------------------------------------------------------------- |
| `fits-<make>-<model>-<year_start>-<year_end>` | Parts — exactly the derived handle, e.g. `fits-ford-f150-2021-2026` |
| `fits-universal`                              | Lifestyle / merch, and anything that fits everything                |
| `nextjs-frontend-hidden`                      | Hides a product from every listing                                  |

A product can carry as many `fits-*` tags as it has generations.

**An untagged product vanishes** from vehicle pages and from fitment-filtered
search. That is deliberate — better hidden than shown with unconfirmed fitment
— but it's the first thing to check when a product "disappears".

> **Current state:** no product in the store carries any tag, so selecting a
> truck currently empties every category page and every search. This part is
> what makes the garage feature functional.

Tag edits are core product fields and fire `products/update`, so they
revalidate normally.

---

# Part 7 — Storefront filters

**Search & Discovery app → Filters → Edit filters → enable the Tag filter.**

Without it, Shopify **silently ignores** the `filters` argument the app sends on
`collection.products`. No error, no warning — the unfiltered list simply comes
back, and category pages fall back to an in-memory safety net that only sees the
first 100 products in the collection.

Verified inert as of 2026-07-25: a product with zero tags is returned through a
`fits-ford-f150-2021-2026` filter, and the only filters the storefront exposes
are `custom.build_preference` and Price.

> **Verification gate — do this the moment the Tag filter is on.** The app sends
> two tag filters and relies on them combining with **OR**
> (`fits-<generation>` OR `fits-universal`). If Shopify ANDs them instead, no
> product can ever match both and every vehicle page goes blank. That would be a
> **code** fix, not an admin one. It is untestable until the filter is enabled,
> because the argument is currently being discarded wholesale.

---

# Part 8 — Flush, sweep, and verify

## 8.1 Link sweep

Audit the footer menu (`next-js-frontend-footer-menu`) and every nav `link`
field. Shopify CMS pages are **not rendered** by this storefront — any
`/pages/<handle>` link, or a bare `/<handle>` pointing at a Shopify page, 404s.
Each must either get its custom code route built or be removed from the menu.
End state: no CMS-page links anywhere; every page is a custom code route.

## 8.2 Flush the cache

Regardless of webhook setup, finish with a manual revalidation so the storefront
drops any cached fallback immediately:

```sh
curl -X POST "https://<site-domain>/api/revalidate?secret=<SHOPIFY_REVALIDATION_SECRET>" \
  -H "x-shopify-topic: metaobjects/update"
```

Swap the topic for `collections/update` or `products/update` to flush those
caches.

## 8.3 Verify on the storefront

1. **Nav** — every link resolves. Edit a `nav_item` label in admin, confirm a
   `POST /api/revalidate` arrives in the app logs, and the header updates
   within seconds.
2. **Garage picker** — Year → Make → Model cascade (picking a year narrows the
   makes, picking a make narrows the models); the confirm button stays disabled
   until all three are chosen.
3. **Chip** — picking 2022 shows **"2022 Ford F-150"**, not a year range; the
   condensed (scrolled) header shows "2022 F-150". Pick a different year on the
   same truck and the chip follows it.
4. **Vehicle URLs** — clicking a category with a truck set lands you on
   `/<category path>/<make>/<model>/<the year you picked>`. Every in-range year
   resolves, shows that year in the `<h1>` and title, and canonicalizes to the
   generation's first year. The vehicle suffix works at **any** depth,
   including depth 3.
5. **Category paths** — every derived path resolves; `/lighting/2021` and
   `/a/b/c/d` land on the branded 404; `/rock-lights` sends you to
   `/lighting/rock-lights`; `/gift-cards` still renders flat. The breadcrumb
   trail matches the nav position at every depth.
6. **Nav logs** — after any nav edit, check the server logs for
   `Dropping nav_item …` and `nav_item level N is at its cap …`. Both are
   silent in the UI and both cost URLs.
7. **Fitment** — a tagged part appears on its vehicle's page; an untagged one
   does not. `/search` with a truck set filters; the toggle turns it off via
   `?all=1` and stays visible in the off state. The PDP shows the fitment badge
   once a truck is set.
8. **Cascade** — a parent category's grid contains everything its children's
   grids do.
9. **Fitment-disabled** — a collection with `custom.fitment_disabled` set shows
   no garage bounce and no vehicle URLs beneath it.

> The curl in 8.2 proves the route, not Shopify's delivery. There are community
> reports of filtered metaobject subscriptions registering successfully but
> never delivering — so verify end-to-end by editing an entry and watching the
> logs. If delivery is flaky, edits only surface at cache expiry (up to a day),
> and the curl is the stopgap.

---

# Part 9 — Webhook reference

> Deploy-time only: webhooks need a publicly
> reachable URL, so none of this applies locally. Until they exist the deployed
> site still works — content edits just take up to a day (`cacheLife("days")`)
> to appear instead of seconds.

## 9.1 How revalidation works here

Shopify POSTs to
`https://<site-domain>/api/revalidate?secret=<SHOPIFY_REVALIDATION_SECRET>`.
The handler (`revalidate()` in `lib/shopify/index.ts`) checks the secret, reads
`x-shopify-topic`, and maps it to a cache tag. Any other topic is acknowledged
and ignored.

| Topic group | Topics                                                                                 | Tag revalidated                                      | Refreshes                                                                     |
| ----------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------- |
| Products    | `products/create`, `products/update`, `products/delete`                                | `TAGS.products`                                      | product pages, grids, search, predictive search                               |
| Collections | `collections/create`, `collections/update`, `collections/delete`                       | `TAGS.collections`                                   | category pages, collection metadata, sidebar, sitemap, nav fallback           |
| Metaobjects | `metaobjects/create`, `metaobjects/update`, `metaobjects/delete` (one filter per type) | `TAGS.menu` + `TAGS.vehicles` + `TAGS.announcements` | header nav, the vehicle list / garage picker, **and** both announcement bands |

**Metaobject topics revalidate both tags.** The handler only reads
`x-shopify-topic`, which is identical for `nav_item` and `vehicle`
subscriptions — telling them apart would mean parsing the webhook body's `type`
field. Both caches are tiny and metaobject edits are rare admin actions, so a
nav edit also refreshes vehicles and vice versa. Body parsing is the escalation
if that ever stops being a good trade.

## 9.2 Products + collections (6 topics)

Creatable either in the **admin UI** (Settings → Notifications → Webhooks →
Create webhook, format JSON, paste the URL above) or via the Admin GraphQL API.
GraphQL version — one aliased request, substitute domain + secret in every
`uri`:

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

Run it in the [GraphiQL app](https://shopify-graphiql-app.shopifycloud.com/) or
the `shopify` CLI on a recent API version (needs `write_webhooks`; admin-created
apps have it by default).

## 9.3 Nav metaobjects (3 topics, API-only)

Metaobject topics do **not** appear in the admin UI. The `nav_item` definition
must exist first (Part 1.1).

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

## 9.4 Vehicle metaobjects (3 topics, API-only)

Identical to 9.3 with `filter: "type:vehicle"` in all three spots. The `vehicle`
definition must exist first (Part 1.2).

## 9.5 Announcement metaobjects (3 topics per type, API-only)

Identical again, with `filter: "type:announcement"` and
`filter: "type:announcement_bar_link"` — one set of three per definition you
created in Part 1.4 (plus any `*_mobile` definitions, if you made separate
ones). Each definition must exist before its subscription.

**These are the least urgent subscriptions in this document.** The announcement
fetcher uses `cacheLife("hours")` rather than the day-long lifetime everything
else gets, so band edits surface within the hour even with no webhook at all.
Skipping them costs you freshness, not correctness.

## 9.6 Caveats that apply to every metaobject subscription

- The `filter` is **mandatory**, not optional scoping: `metaobjects/*` topics
  require one, wildcards (`type:*`) are rejected, and the type is validated
  against existing definitions. A filter that passes validation but names the
  wrong type silently suppresses all deliveries.
- Use `uri` (current field), not the legacy `callbackUrl`.
- The `uri` must be the deployed public URL — Shopify cannot reach localhost.
- **The `uri` cannot be on any domain connected to the store** (Settings →
  Domains — e.g. `thetrucklab.com`, `www.thetrucklab.com`, the `*.myshopify.com`
  hosts). Shopify rejects those with _"Address cannot be any of the domains…"_
  even though the custom domain actually points at Vercel, not Shopify. Use the
  hosting platform's own deployment URL instead (the project's production
  `*.vercel.app` alias) — same deployment, same cache, so the revalidation
  applies to the custom domain too.
- If Vercel Deployment Protection covers production `*.vercel.app` URLs,
  Shopify's POSTs are blocked before reaching the route — scope protection to
  previews only, or append a "Protection Bypass for Automation" token.
- Subscriptions belong to the app that created them: uninstalling the GraphiQL
  app deletes its subscriptions.

## 9.7 Known gaps (verified 2026-07-24 against Shopify docs + community)

- **Collection metafield edits do NOT fire `collections/update`.** That topic
  fires on manual product add/remove and rule changes only. Consequence:
  flipping `custom.fitment_disabled` won't auto-revalidate — it takes effect
  when the day-long cache expires, or immediately if you also make a trivial
  collection edit (touch the description) to force the webhook, or run the curl
  in 8.2 with `-H "x-shopify-topic: collections/update"`. There is no webhook
  topic for metafield _values_ (only `metafield_definitions/*`).
- **Product metafield and tag edits are fine** — tags are core product fields
  and product metafield edits do fire `products/update`, so `fits-*` tagging
  revalidates normally.
- `collections/update` also does **not** fire when a smart collection's
  membership changes because a product attribute changed — but `products/update`
  does, and product grids are dual-tagged (`TAGS.collections, TAGS.products`),
  so the app still refreshes.

## 9.8 Verifying a deployed environment

1. `curl -X POST "https://<site-domain>/api/revalidate?secret=<secret>" -H "x-shopify-topic: collections/update"`
   → `{"status":200,"revalidated":true,...}`; wrong secret → `{"status":401}`.
2. Rename a product in admin → the product page reflects it within seconds.
3. Edit a `nav_item` label → the header nav updates within seconds.
4. Edit a `vehicle` entry's label → the garage chip updates within seconds.
5. List live subscriptions and confirm all 12 exist:

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
