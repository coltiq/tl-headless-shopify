# Community and The Manual — section spec

Covers three linked decisions taken together: **Community** is re-cut around
actual community content, the technical blog is promoted to a new L1 called
**The Manual**, and **The Standard** loses its nav slot without moving its URL.

**Nothing here is built.** Architecture and contracts live in `CLAUDE.md`; admin
setup in `docs/shopify-setup.md`; the sibling section spec in
`docs/plans/custom-work.md`.

---

## 1. The problem this fixes

Community held three things with three different **authors**: Customer Builds is
the customer speaking, the blog is the company teaching, The Standard is the
company declaring. Only the first is community. Bundling the other two under a
place name made the section read as a catch-all, and it buried the two assets
that do the most positioning work.

`docs/plans/OPEN-ITEMS.md` §4.2 previously argued the opposite — that Community
was "the only heading under which The Standard fits." That reasoning is
superseded here and the entry has been corrected.

---

## 2. The L1 set becomes five

**Custom Work · Parts · The Manual · Lifestyle · Community**

Bar order is authored, not derived — it is the `children` list order on the
`main-nav` root metaobject. The Manual sits beside Parts because that is the
adjacency that converts: someone reading how to wire rock lights is one click
from buying them.

Room is not a constraint. `NAV_LEVEL_CAPS.l1` is 8, and the bar is a
`page-width` flex row with `gap-8` (`components/layout/header/desktop-nav.tsx`),
so five uppercase 12px labels plus the garage chip fit comfortably.

---

## 3. The Manual — new L1

The technical article blog, promoted out of Community.

**It earns an L1 on merit**, not on traffic. It will be the largest content
surface on the site and the main organic acquisition channel, and it grows
children naturally (Lighting, Wiring, Fitment, Install Guides) — that is a
section, not a page.

**Be honest about what the nav slot buys.** Blog traffic arrives deep from
search, not through a menu. The slot is doing **positioning** work: it signals
expertise to someone deciding whether the prices are justified, which is the
same argument The Standard makes. That is the reason to spend a slot, and the
reason not to expect the slot to move traffic.

**Naming.** "The Manual" over "Learn" — distinctive, legible enough that a
first-time visitor knows roughly what is behind it, and it matches the plain
anti-marketing voice. **"The Lab" is unavailable**: `the-lab` is already a live
out-of-tree collection handle rendering flat at `/the-lab` (`CLAUDE.md`,
`app/[...path]/resolve.ts`), so a code route there would shadow it.

**Content source is deliberately still open**, and it blocks the nav entry — an
L1 pointing at a route that does not exist is worse than no L1. The recommendation
on the table, for the record:

> **Shopify articles plus a `products` metafield on the article.** Articles give
> a real editor, scheduling, and no deploy per post, which matters at the volume
> a technical blog reaches. The usual objection is that articles model product
> cross-links badly — you hand-write them into body HTML. A `products` metafield
> answers that: structured references, same as the build metaobject, without
> giving up the editor.

This is a **different** answer from Our Builds (`docs/plans/custom-work.md` §4),
which stays a metaobject because a build is a structured record rather than prose.
Decide both in one review, with two mechanisms, so the store does not grow two
content pipelines by accident.

Depth: no L2s at launch. The Manual is an index until article volume justifies
categories — same "don't add children until you need them" logic as Custom Work.

---

## 4. The Standard — no nav slot

**It keeps `/the-standard` and loses its nav entry.**

It is a one-page manifesto — a page you _send_ someone to, not one they browse
to. It is strongest linked from the homepage, the footer, product pages at the
moment someone balks at a price, and from Custom Work. A manifesto in a dropdown
is weaker than one placed where the objection actually occurs.

This follows the precedent already set for Support, which deliberately gets no
bar slot despite 15–20 pages behind it (OPEN-ITEMS §4.7).

No code changes: `the-standard` is already in `PROXY_RESERVED_SEGMENTS`
(`lib/constants.ts`) and `STATIC_ROUTES` (`app/sitemap.ts`). Only the `nav_item`
entry goes away.

---

## 5. Community — re-cut

Once the company-voice content leaves, Community is the non-transactional,
people-side section: **the archive, the pulse, and the place.**

| Label            | Path                 | What it is                                | Status                       |
| ---------------- | -------------------- | ----------------------------------------- | ---------------------------- |
| Customer Builds  | `/community/builds`  | Trucks customers built, running our parts | Decided                      |
| Socials          | `/community/socials` | Curated grid of the feed                  | Decided                      |
| Where to Find Us | `/community/visit`   | The shop as a place, plus shows and meets | **Proposed — not confirmed** |

Paths nest under the section for the same reasons as Custom Work
(`docs/plans/custom-work.md` §2): `community` is already reserved, `proxy.ts`
only inspects `segments[0]` for 1- and 4-segment shapes, so no new reservation is
needed and a third segment stays free for `/community/builds/<slug>`.

**Customer Builds is still the child that has to ship** — without it the section
name over-promises. Distinct from Custom Work's Our Builds (the shop's own work);
both pages need a sentence pointing at the other.

**Socials is a curated grid on Shopify Files, not a live API.** `next.config.ts`
whitelists only `cdn.shopify.com/s/files/**`, so a live integration needs a config
change plus token handling — and live social embeds are the single most common
silent breakage on a storefront (token expiry, rate limits, API deprecations). A
curated grid that _looks_ like a feed is faster, never breaks, and costs a
periodic upload. Reuse the feature-section layout from the Custom Work landing.

### Where to Find Us — why it is the strongest addition

**It fills a real gap.** There is no shop address or hours anywhere in the
codebase — `lib/constants.ts` exports only `SHOP_PHONE_DISPLAY` and
`SHOP_PHONE_HREF`, and `/contact` is a placeholder with no details. For a shop
whose differentiator is being a physical place, that is a hole.

It is also genuinely community — an invitation to show up rather than transact —
and it is what an online-only competitor cannot copy.

**It fixes the staleness problem that killed a standalone Events page.** The shop
is always somewhere to find you, so the page is never empty between bookings;
shows and meets become a block on it rather than its whole premise.

Needs new constants for address and hours, following the existing pattern where
display and href are separate and an empty value hides the slot.

### What was rejected, and why

- **Truck of the Month** — draws from the same pool as Customer Builds, so today
  it reads as a duplicate. Revisit once the archive is deep enough that a
  spotlight reads as curation. Deferred, not dead.
- **Submit Your Build** — it is a CTA, not a destination. Same call as
  `/quote` in Custom Work: a form in a menu of destinations is a category error.
  It belongs on Customer Builds as the on-ramp block, not in the nav.
- **Giveaways** — episodic. Better as a homepage band when one is running than as
  a standing nav entry that is usually empty.
- **A fourth item invented to fill the row.** Everything considered either
  duplicated Customer Builds (any truck gallery — Spotted, a registry), The
  Manual (Q&A, how-tos), or Inside the Shop (the team). **Three is a good
  section**, and three childless L2s render as a clean flat panel. Padding it is
  exactly the over-promising failure this re-cut exists to fix.

---

## 6. Admin work

**Add** one L1 `nav_item` for The Manual — `label: The Manual`, `link:
/the-manual`, `slug` and `collection` empty — positioned third in the root's
`children`.

**Rewrite** Community's children: remove the Blog entry (it becomes The Manual)
and The Standard entry (no nav slot); add Customer Builds, Socials, and Where to
Find Us with `link` set and `slug`/`collection` empty.

`description` is required on all of them — Community's L2s have no children, so
the panel renders flat and the description is the only copy in it
(`desktop-nav.tsx`). Drafts:

| Label            | `description`                                        |
| ---------------- | ---------------------------------------------------- |
| Customer Builds  | Trucks you built, running our parts.                 |
| Socials          | What we're posting, and what you're tagging us in.   |
| Where to Find Us | The shop, the hours, and where we'll be parked next. |

---

## 7. Code work

- **Create** `app/the-manual/page.tsx` — blocked on the content-source decision.
- **Create** `app/community/builds/page.tsx`, `app/community/socials/page.tsx`,
  `app/community/visit/page.tsx`.
- **Rewrite** `app/community/page.tsx` — its `CHILDREN` array still lists Blog,
  Customer Builds, and The Standard.
- **Modify** `lib/constants.ts` — add `the-manual` to `PROXY_RESERVED_SEGMENTS`
  (a **new root segment**, unlike the nested Community children), plus shop
  address and hours constants for Where to Find Us.
- **Modify** `app/sitemap.ts` — add `/the-manual` and the three Community paths
  to `STATIC_ROUTES`.
- **`next.config.ts` needs no change** given the curated-grid decision.

---

## 8. Risks

- **The Manual's nav entry cannot ship before its content source.** An L1
  pointing at nothing is worse than four L1s.
- **The flat panel is one nav edit away from collapsing**, same as Custom Work
  (`docs/plans/custom-work.md` §5). Giving any Community L2 children — article
  categories, an events sub-page — flips the panel to the rail and demotes the
  siblings to hover-to-reveal rows.
- **Where to Find Us publishes an address and hours.** Wrong hours are worse than
  no hours; whatever ships needs an owner.
- **The Standard gets quieter.** Losing the nav slot only works if the contextual
  links actually get built. If they don't, the page is orphaned — worse than the
  dropdown it replaced.
- **Five L1s is the practical ceiling** before the bar needs a different
  treatment, well under the cap of 8.
