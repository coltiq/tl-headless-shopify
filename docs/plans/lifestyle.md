# Lifestyle — section spec

Everything that isn't a truck part and isn't a service. **Not merch.** The
working definition, in the owner's words: _the stuff you use outside of your
truck — the other stuff around truck culture_, and things that project the
brand _at any time of day, not just driving or at shows_.

`/lifestyle` is a title-only placeholder. Nothing here is built.

---

## 1. Categories

| Category              | Notes                                                                                         |
| --------------------- | --------------------------------------------------------------------------------------------- |
| **Apparel**           | Tees, hoodies, long sleeve. Style and size are **filters**, not sub-collections               |
| **Hats**              | Split out rather than under Apparel — highest volume, and people shop for it by name          |
| **Goods**             | See §2. The category that makes the section more than a merch shop                            |
| **Stickers & Decals** | Cheap, high margin, and the only product that turns a customer into an advertisement          |
| **Detailing**         | Wash, ceramic, wheel cleaner, towels. Repeat purchase, and the natural follow-on from a build |
| **Drops**             | See §3                                                                                        |

These are **real categories** — `nav_item` entries with a `slug` and a
`collection`, not code routes. So their URLs are `/apparel`, `/hats`,
`/goods` — **not** `/lifestyle/apparel`. L1 contributes no segment; Custom
Work's children nest only because they are hand-typed links on static routes.

Lifestyle collections set `custom.fitment_disabled` — no garage bounce, no
vehicle URLs beneath them. A t-shirt does not fit a truck.

**Six categories is past what the flat panel wants.** This is the section most
likely to earn the rail layout eventually, which makes it structurally more
like Parts than Custom Work — despite starting flat.

---

## 2. Goods — the category the section was missing

From Roland Sands Design, the closest analogue in another niche: a custom
motorcycle shop that became an apparel and gear brand while still selling
parts. Their shop splits into Apparel, Helmets, Parts, and **Goods & Gifts** —
bags, skateboards, jewellery, glassware, air fresheners.

That last one is the answer to "how is this more than merch." Glassware and air
fresheners are the brand in someone's hand at times they are nowhere near the
vehicle. Truck Lab equivalents: **enamel mugs, glassware, air fresheners,
keychains, patches, blankets, koozies, dog collars.**

It is also a catch-all, which matters structurally: with it, a new small item
never needs a new category. Without it, six categories becomes nine.

---

## 3. Drops — the identity mechanic

From Hoonigan, whose nav carries **Collections** — named, thematic, seasonal
runs rather than product groupings. People buy a _drop_, not a t-shirt.

This is the cheapest thing on the list that makes merch into identity: it needs
no partner, no film and no writing, just a theme and a limited run. Scarcity
plus a name is what makes a shirt worth owning rather than worth having.

Collabs are the same mechanic with someone else's name attached — a local
artist, another brand — and are worth doing once the format works.

---

## 4. No links row

Two candidates passed the test of being genuinely section-specific rather than
store-wide:

- **Rep Truck Lab** — an ambassador application. The literal expression of what
  the section is for, and the only place on the site where asking makes sense.
- **Club & bulk orders** — a truck club wanting twenty shirts. Real revenue,
  and paint matching and powder coating mean custom runs are not a stretch.

**Both need programs behind them that do not exist**, so the section has no
links row for now. It is per-section and optional — authoring no `links-row`
entry means the panel simply does not have one.

The section's call to action is the **feature card**: merch sells on image, and
a photograph of the newest drop does more than any row of buttons.

Rejected as store-wide (they belong in the footer or the announcement band, not
a section panel): gift cards, best sellers, new arrivals. Rejected as
product-page content: size guide, decal application. Rejected as store-wide
content: **Watch** — video would be builds and teardowns as much as lifestyle,
so it is a footer link or eventually its own nav item, the way Hoonigan has it.

---

## 5. Open — the name

**Lifestyle** is the only marketing word in a nav that otherwise says exactly
what things are: Custom Work, Parts, Customer Builds, The Manual, The Standard.

- **Merch** was rejected — it reads creator-economy, _stuff with a logo sold to
  fans_, which is the opposite of the intent.
- **Gear** fits the naming register and is a wider container, but sits next to
  Parts, where "gear" can mean recovery equipment.
- **Lifestyle** is honest **if** Goods and Drops are real, because then most of
  the section genuinely is not merch.

Leaving it as Lifestyle on that condition. If the section ships as apparel,
hats and stickers alone, the name is a promise it is not keeping and Gear is
the better word.

---

## 6. What none of this creates

Worth stating plainly, because the research kept pointing at it: brands people
represent — Harley's H.O.G. chapters, YETI's ambassador films, Deus's Culture
magazine — earn that through **people, events and video**, not through product
ranges. A section can display a lifestyle; it cannot manufacture one.

The lever that costs least and does most is photography, and it is not a nav
decision.
