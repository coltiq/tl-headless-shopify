# Custom Work — section spec

The L2 structure of the `/custom-work` L1 nav section: URLs, page contents, nav
entries, content sources, and the decisions behind them.

**Nothing here is built.** This is the spec the implementation pass works from.
Architecture and contracts live in `CLAUDE.md`; admin setup in
`docs/shopify-setup.md`; everything still outstanding site-wide in
`docs/plans/OPEN-ITEMS.md`.

Custom Work is the shop side, so it carries **no ecommerce furniture** — no
product grid, no cart, no filters, no garage bounce (OPEN-ITEMS §4.2).

---

## 1. The three children

| Label           | Path                           | What it is                                   |
| --------------- | ------------------------------ | -------------------------------------------- |
| Our Services    | `/custom-work/services`        | What you can have done, and how the job runs |
| Our Builds      | `/custom-work/builds`          | The shop's own work                          |
| Inside the Shop | `/custom-work/inside-the-shop` | The place and the people                     |

Two of the four children OPEN-ITEMS §4.2 originally named are gone, and the doc
has been corrected to match:

- **"The Process" is not a page.** It splits: the _engagement_ sequence (quote →
  scope → schedule → build → handoff) is a section inside Our Services; the
  _physical_ flow through the bays belongs to Inside the Shop. Keeping that line
  drawn is the highest-probability content failure in this section (§7).
- **"Start Your Build" is not a child.** It is `/quote`, reached by CTA from the
  landing and from all three L2s. Giving the funnel a nav slot would put a form
  in a menu of destinations.

---

## 2. URLs — nested under the section

```
/custom-work                       section landing
/custom-work/services              Our Services
/custom-work/builds                Our Builds
/custom-work/inside-the-shop       Inside the Shop
```

**This does not contradict "L1 is a section, not a segment."** That rule binds
the **category** space, where paths are _derived_ from `nav_item` tree position —
`/lighting`, never `/parts/lighting`. These are code routes with a hand-typed
`link`; nothing derives them, so nothing is being violated. Expect this to be
misread; it is why the paragraph exists.

Why nested rather than root-level (`/our-services`, `/our-builds`, …):

- **Zero namespace cost.** `custom-work` is already reserved forever in
  `PROXY_RESERVED_SEGMENTS` (`lib/constants.ts`). `proxy.ts` only inspects
  `segments[0]`, and only for 1- and 4-segment shapes, so a 2-segment path under
  a reserved first segment never reaches the index lookup. **No new reservation
  is needed.** Three root paths would permanently burn three names out of the
  namespace that every collection handle and every depth-1 category slug shares.
- **A third segment has somewhere to go** — `/custom-work/builds/<slug>`,
  `/custom-work/services/<service>` — at no cost and with no nav change (§5).
- **Breadcrumbs become real.** `app/[...path]/breadcrumbs.tsx` is exported,
  reusable, and emits BreadcrumbList JSON-LD.

**`/the-standard` is not a counter-precedent.** It sits at L2 under Community on
a root path because it _was_ an L1 and OPEN-ITEMS froze its URL. It proves nav
position and path are independent — not that new L2s should be flat.

**Labels keep the "Our", paths drop it.** `/custom-work/our-builds` stutters
against the section name, and `label` is display-only everywhere else in this
codebase.

URLs are free to change while nothing is deployed or indexed (OPEN-ITEMS §2.6,
§3). They stop being free at launch. This is the moment to disagree.

---

## 3. Page outlines

Voice: plain, declarative, second person, sentence case, em-dashes carrying the
rhythm. Match `app/community/page.tsx` and `app/quote/page.tsx`. Design system
throughout — `page-width`, `font-tl-sans` / `font-tl-text`, `text-tl-ink` /
`text-tl-steel` — not the stock Tailwind the current stub still uses.

### `/custom-work` — the landing

1. **Hero.** The shop side in one line, holding both tiers. Primary CTA _Start a
   quote_ → `/quote`; secondary tap-to-call from `SHOP_PHONE_DISPLAY` /
   `SHOP_PHONE_HREF` (`lib/constants.ts`).
2. **The two tiers.** Full build vs. install & package, side by side — the same
   split `/quote` opens with, stated before the visitor gets there.
3. **The three children.** Photo-led cards; same information shape as Community's
   `CHILDREN` array, richer treatment.
4. **Selected work.** Three or four builds → `/custom-work/builds`.
5. **Retail cross-link.** "Everything we install, we sell" → `/parts` and the
   lighting collections. Half of the both-ways cross-link OPEN-ITEMS §4.2
   requires; the other half is kit pages pointing back at the shop.
6. **Inquiry.** `/quote` + phone.

### `/custom-work/services`

1. Hero.
2. **What we do.** Grouped service list — lighting installs, lift & leveling,
   bumpers & armor, wheels & tires, audio, wiring & electrical, full builds — one
   line of copy each.
3. **How it works.** The engagement sequence: quote → scope → schedule → build →
   handoff. This is where "The Process" went.
4. **What it costs.** How quoting works, honestly — then link to
   `/custom-work/pricing`, which carries the numbers.
5. CTA → `/quote`.

### `/custom-work/builds`

1. Hero.
2. **The grid.** Per build: photo, truck, scope, one line. No filters.
3. **A sentence distinguishing this from Community's Customer Builds**, linking
   there. Without it the two read as the same page (§7).
4. CTA → `/quote`.

### `/custom-work/pricing` — added after the spec

Not one of the three L2s: a page reached from the links row's third button and
from Services, for the visitor who wants a number before they will ask for one.

1. Hero.
2. **The chart.** Per service a **range and a typical figure**, never a bare
   floor — "from $800" anchors someone at $800 and makes the $2,400 quote feel
   like a switch.
3. **What moves the number**, one line per service. This is where the expertise
   shows, and it pre-empts the call a bare table generates.
4. **The labour rate**, published.
5. **One or two real builds with their totals.**
6. CTA → `/quote`.

Offers stay off this page. A pricing page leading with discounts reads as a
sale, which fights the standard the shop sells on; the announcement rotator is
the home for those.

### `/custom-work/financing` — added after the spec

The links row's other button. Nested rather than at `/financing` because this is
**build** financing — a five-figure job over months. Instalments on a $200 light
bar are a checkout feature. If it ever covers both, move it to the root and
reserve the segment.

1. Hero.
2. **Who the lender is and what the terms are.** A financing page that will not
   name a rate reads as a page hiding one.
3. **A worked example** against a real build total.
4. **What applying involves**, and whether it touches credit.
5. CTA → `/quote`.

### `/custom-work/inside-the-shop`

1. Hero.
2. **The place.** Bays, equipment, photo-led.
3. **The people.** Team.
4. **How a truck moves through the shop.** Spatial, not commercial — the
   commercial sequence lives in Services.
5. **Feed slot.** Reserved; renders nothing until the content source is settled.
6. CTA → `/quote`.

---

## 4. Our Builds — content source

**Decide the shape now, ship hardcoded, build the metaobject later.**

The index launches with a `BUILDS` array in the route file, exactly like
`CHILDREN` in `app/community/page.tsx`. That means a deploy per build — fine at
three to six, wrong at thirty. **Per-build detail pages wait for the
metaobject.**

Target shape, recorded so it isn't reinvented (mirrors how `category_section` is
parked in `docs/shopify-setup.md` 1.5) — **do not build yet**:

| Field              | Type                             | Notes                                                       |
| ------------------ | -------------------------------- | ----------------------------------------------------------- |
| `title`            | Single line text                 |                                                             |
| `slug`             | Single line text                 | `/custom-work/builds/<slug>`                                |
| `scope`            | Single line text, preset         | `full-build` / `install`                                    |
| `summary`          | Single line text                 | Card copy                                                   |
| `body`             | Multi-line text                  |                                                             |
| `hero` / `gallery` | File / File list                 | Shopify Files CDN — already whitelisted in `next.config.ts` |
| `products`         | Product reference, list          | **The retail cross-link, for free**                         |
| `vehicle`          | Metaobject reference → `vehicle` | Optional; ties a build to a generation                      |

**Does this ride along with the blog's content-source decision** (OPEN-ITEMS
§4.2)? Partly. The blog is prose and Shopify articles are a real candidate;
builds are structured records with a product list, which articles model badly.
Decide them **together but differently** — one review, two mechanisms — so the
store doesn't grow two content pipelines by accident.

---

## 5. Depth — no L3 nav entries under any of the three

**All three L2s stay childless.** This is a real trade, not an omission.

### The mechanic that decides it

`components/layout/header/desktop-nav.tsx` computes `hasAnyChildren` across the
rail items. Give **any one** L2 children and the whole Custom Work panel flips
from flat to the rail layout. The other two L2s become rail rows: they still show
`description` and a "Visit X →" link, but **only when that row is active**. Three
cards visible at a glance become one visible body and two names.

The cost of putting children under Our Services is paid by Our Builds and Inside
the Shop. That asymmetry is the argument.

### Our Services — no, and the panel isn't the main reason

Seven services are seven paragraphs, not seven pages. Thin, near-identical pages
per service is the doorway-page pattern — it dilutes rather than ranks, and it
buries the list two clicks deep instead of one scroll down.

**Nav depth and URL depth are separate purchases:**

- **Nav depth** is a menu entry. That is what costs the flat panel.
- **URL depth** is a page at `/custom-work/services/lift-kits`, linked from the
  Services page body. It costs **nothing** — code routes have no depth cap, and a
  3-segment path under an already-reserved first segment needs no reservation and
  never reaches the proxy's index lookup.

So per-service pages stay available later with **zero nav change**. The trigger is
a service having a page's worth of unique content and real local search intent
behind it ("lift install" plus a city) — one or two services, not seven.

### The escape hatch, already built: `style: "links-row"`

If the service list ever has to be reachable from the bar without collapsing the
cards, the mechanism exists. A `links-row` L2 is filtered out of `railItems`
**before** `hasAnyChildren` is computed, and the flat branch renders `FlatItems`
_and_ `LinksRow`. So a fourth L2 styled `links-row`, whose children are the
individual services, adds a row of links at the foot of the panel **and keeps the
three-card layout intact**.

Two caveats:

- **Mobile ignores `style` entirely.** `components/layout/header/mobile-drawer.tsx`
  branches purely on `child.items.length`, so that same group renders as a
  drill-in row beside the three real items. The links row is a desktop
  affordance; the drawer gains a fourth entry.
- **Anchors survive.** `menuUrlToPath` (`lib/shopify/index.ts`) only strips the
  domain, `/collections/`, `/collections` and `/pages`, so
  `/custom-work/services#lighting` passes through untouched.

### Our Builds — no

Individual builds churn, and a menu is the worst place for content that turns
over. They belong in the page's grid. Per-build pages are URL depth (§4), not nav
depth.

### Inside the Shop — no, and this is the one to watch

The deferred feed is the most likely future child, and adding it is exactly the
edit that flips the panel and demotes the other two. When the feed lands the
choice is: give it a nav entry and accept the rail, or link it from the page body
and keep the cards. **Default to the page body.**

---

## 6. Admin work

Three `nav_item` entries under the Custom Work L1, in this order. Each has
`label` and `link` set and `description` written, with **`slug` and `collection`
left empty** — the same authoring as `/the-standard`. A node with no slug
produces no `CategoryNode` and no `[...path]` route; the menu falls back to
`link`, so nav position and URL stay independent.

| Label           | `link`                         | `description`                                                                |
| --------------- | ------------------------------ | ---------------------------------------------------------------------------- |
| Our Services    | `/custom-work/services`        | Lighting, lift, armor, wheels, wiring — installed by the people who sell it. |
| Our Builds      | `/custom-work/builds`          | Trucks we've built, start to finish.                                         |
| Inside the Shop | `/custom-work/inside-the-shop` | The bays, the equipment, and the people doing the work.                      |

**`description` is not optional here.** Custom Work's L2s have no children, so
the mega panel renders flat and the description is the only copy in the panel.
Leave it blank and the card is a bare title.

Authoring reference: `docs/shopify-setup.md` Part 4.2.

---

## 7. Code work

- **Modify** `app/custom-work/page.tsx` — rewrite onto the design system.
- **Create** `app/custom-work/services/page.tsx`,
  `app/custom-work/builds/page.tsx`,
  `app/custom-work/inside-the-shop/page.tsx`. Each a default-exported server
  component with `export const metadata`, rendering `<Footer />` itself — it is
  **not** in `app/layout.tsx`.
- **Modify** `app/sitemap.ts` — add the three paths to `STATIC_ROUTES`.
- **`lib/constants.ts` needs no change.** The nested paths are covered by the
  existing `custom-work` reservation. Worth a comment saying so, or someone will
  add them believing they were forgotten.
- **`next.config.ts` needs no change** — all imagery comes from
  `cdn.shopify.com/s/files/**`, already whitelisted.
- **OG images:** inherit the site-wide `app/opengraph-image.tsx` for now. The file
  convention _would_ work here (only catch-all segments are barred), so per-route
  cards are a later upgrade, not a constraint.
- **No shared section library.** The repo has none, and these are the first four
  pages that would justify one — extracting a hero/CTA/feature-grid abstraction
  from zero real uses is guesswork. Build the four concretely, then simplify. The
  one exception worth naming in advance: the children-card grid will by then have
  two real uses (Community and this landing) and should be lifted at that point,
  not before.

---

## 8. Risks and open questions

- **Services' "how it works" and Inside the Shop's "how a truck moves through the
  shop" will collide** unless the split holds: commercial sequence vs. physical
  place. Most likely content failure in this section.
- **Our Builds vs. Community's Customer Builds.** Both pages need a sentence
  pointing at the other. Two build galleries with no distinguishing copy is worse
  than one.
- **The flat panel is one nav edit away from collapsing** (§5). Any child on any
  of the three demotes the other two from visible cards to hover-to-reveal rail
  rows. Nothing warns; it only surfaces if someone opens the panel.
- **Photography is the blocking dependency.** All four pages are photo-led by
  design; without images they are prose stubs. Shopify Files is the intended home.
- **Hardcoded builds cap out around six.** Past that the metaobject stops being
  optional.
- **URLs are free to change until launch, and not after.**
