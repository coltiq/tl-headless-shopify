# Pages to build

The running list of pages that need real content and design, and what state
each one is in. **Scope: the header, Custom Work, and
Community.** Parts and Lifestyle are not settled yet, so neither they nor their
children are counted here — add them when they are.

Architecture lives in `CLAUDE.md`, admin setup in `docs/shopify-setup.md`,
outstanding risks in `OPEN-ITEMS.md`, the Custom Work spec in `custom-work.md`.
**This file is only the build queue.**

States: **stub** = the upstream template's placeholder, stock Tailwind, no
design. **scaffold** = our structure, our design system, TODOs where the copy
and content go. **built** = done.

---

## 1. Header

| Page        | Route        | State    | Notes                                                                                                                                                                                                                     |
| ----------- | ------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Homepage    | `/`          | stub     | Still the template's carousel + three-item grid, and both collections it wants (`hidden-homepage-carousel`, `hidden-homepage-featured-items`) are missing — see OPEN-ITEMS 1.5. Reachable from the wordmark on every page |
| Get a quote | `/quote`     | scaffold | The questionnaire itself is the work. **Question one is the scope split** — full build vs install — or the broad CTA sends install customers into the wrong form                                                          |
| Support hub | `/support`   | scaffold | Groups are laid out; the articles under them are text, not links, until they exist                                                                                                                                        |
| Contact     | `/contact`   | stub     | Template placeholder. The support popup enhances it rather than replacing it, so it has to work on its own                                                                                                                |
| Financing   | `/financing` | scaffold | At the root because one product covers builds and parts orders. Needs the lender, real terms, and **two worked examples** — a build and a parts order                                                                     |

**Not a page, but header work:**

- **The support popup** — chat, contact, order status, top questions, and a
  link to `/support`. The number lives in it, front and centre, because the
  announcement band hides under `group-data-[condensed]` and the popup becomes
  the only phone affordance once the header shrinks. OPEN-ITEMS 4.6.

---

## 2. Custom Work

| Page            | Route                          | State    | Notes                                                                                                                                                                     |
| --------------- | ------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Section landing | `/custom-work`                 | stub     | The only page in the section still on stock Tailwind. Outline in `custom-work.md` §3 — hero, the two tiers, the three children, selected work, retail cross-link, inquiry |
| Our Services    | `/custom-work/services`        | scaffold | **Purely the offer.** How the shop runs belongs to Inside the Shop                                                                                                        |
| Our Builds      | `/custom-work/builds`          | scaffold | Blocked on a content source — same decision the blog is waiting on                                                                                                        |
| Inside the Shop | `/custom-work/inside-the-shop` | scaffold | The place, and the process: design → build → delivery. No team section                                                                                                    |
| Build pricing   | `/custom-work/pricing`         | scaffold | Ranges and a typical figure, never a bare floor. One "what moves the number" line per service. The labour rate. No offers                                                 |

---

## 3. Community

Spec: `community.md`. Nothing here has a route except The Standard.

| Page              | Route           | State    | Notes                                                                                                                                                     |
| ----------------- | --------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Section landing   | `/community`    | scaffold | Three children as cards; copy is in                                                                                                                       |
| The Manual        | —               | none     | Reference, not a blog. Needs the content source before articles have anywhere to live                                                                     |
| Customer Builds   | —               | none     | 100+ entries already exist. **Every one carries a vehicle reference from day one** — retrofitting it later never happens (`community.md` §3.2)            |
| Submit your build | —               | none     | The form behind Customer Builds. Vehicle captured with the garage's picker, a rights checkbox, and a queue — **not** a live write path. `community.md` §4 |
| The Standard      | `/the-standard` | stub     | Title-only placeholder from its days as an L1                                                                                                             |

---

## 4. Behind the support hub

Not scheduled, but it is the largest single block of writing on this list and
it is easy to under-count at "the support page". Roughly fifteen to twenty
pages, each needing **its own route** — overlay-only content cannot rank and
cannot be pasted into a support reply.

- **Orders & shipping** — shipping policy, delivery times, order status,
  backorders, international
- **Returns & warranty** — return policy, how to start one, warranty, damaged
  or missing items
- **Buying help** — FAQ, find your fit, install guides, gift cards
- **Legal** — privacy, terms, refund policy, accessibility. These are the four
  Shopify already stores and serves on the Storefront API
  (`shop.refundPolicy` and siblings), so they are the cheapest of the set if
  you would rather not hand-write them

---

## 5. Not in the queue yet

Real work, deliberately held back — this file is the queue in the order things
are ready to build, and neither of these is. Here so they are not mistaken for
oversights.

- **The footer.** Still the stock template rendering one flat `<ul>`. A genuine
  dependency for the support pages, so it returns to the queue when they do.
  OPEN-ITEMS 4.6 carries the shape it needs.
- **`/app`.** Scaffolded and building, but **nothing links to it** — the
  announcement bar's two slots went to Get A Quote and Support. Its entry
  points are product pages for app-controlled lighting, the support popup, and
  a card in the box, none of which exist yet. It joins the queue when one does.

---

## 6. Decisions that block pages

- **The content source, now forced by Customer Builds.** 100+ entries rules
  out hand-built routes. A metaobject fits better than articles — the fields
  are structured, and a `vehicle` reference is the type the garage already
  uses. Whichever is chosen covers The Manual and Our Builds too.
  `community.md` §3.3.
- **Customer Builds submissions.** The Storefront API cannot write metaobjects,
  so self-serve upload needs an Admin API token and a moderation queue. Start
  manual. `community.md` §4.
- **Whether builds get their own pages.** `/custom-work/builds/<slug>` costs no
  nav change and no reservation. Worth it once a build has a page's worth of
  photos and story behind it.
