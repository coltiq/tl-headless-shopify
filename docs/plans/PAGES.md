# Pages to build

The running list of pages that need real content and design, and what state
each one is in. **Scope: the header and the Custom Work section.** Parts,
Lifestyle and Community are not settled yet, so neither they nor their children
are counted here — add them when they are.

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
| The app     | `/app`       | scaffold | Needs the app's real name, screenshots, feature list, and the two store URLs in `lib/constants.ts`. **Currently linked from nowhere** — the announcement bar carries Get A Quote and Support instead                      |
| Financing   | `/financing` | scaffold | At the root because one product covers builds and parts orders. Needs the lender, real terms, and **two worked examples** — a build and a parts order                                                                     |

**Not a page, but header work:**

- **The support popup** — chat, contact, order status, top questions, and a
  link to `/support`. The number lives in it, front and centre, because the
  announcement band hides under `group-data-[condensed]` and the popup becomes
  the only phone affordance once the header shrinks. OPEN-ITEMS 4.6.
- **The footer** — still the stock Vercel template rendering one flat `<ul>`.
  Everything in the support plan depends on it: four grouped columns plus a
  muted legal row.

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

## 3. Behind the support hub

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

## 4. Decisions that block pages

- **The blog's content source.** Shopify articles are queryable on the
  Storefront API, which beats a deploy per post. Settles Community's blog
  **and** Our Builds, which needs the same mechanism.
- **Whether builds get their own pages.** `/custom-work/builds/<slug>` costs no
  nav change and no reservation. Worth it once a build has a page's worth of
  photos and story behind it.
