# The Manual — section spec

Reference content: explainers, product research, electrical basics, suspension
and lift teardowns, what we learned building our own parts.

Scaffolded at `/the-manual`. No articles exist yet.

---

## 1. Why it is an L1

It began as a child of Community and did not belong there. Community is about
**people** — customer trucks, events, what the shop stands for. The Manual is
**expertise**, and a reference library sitting inside a section about people is
the odd item in every list it appears in.

The stronger argument is traffic. This is the section most likely to bring
strangers to the site at all — someone searching how rock light wiring works
has no reason to know the shop exists — and burying the one part of the site
built to be found two clicks down is backwards.

Cost: the L1 set goes to five. The cap is eight (`NAV_LEVEL_CAPS`), and five
labels plus the garage chip fit the bar comfortably.

---

## 2. Reference, not a blog

**The content improves with age.** An explainer on lift versus levelling is as
useful in three years and accumulates rankings the whole time; you update it in
place. A blog is the format that decays, and a neglected one advertises the
neglect with a dateline — "last post: March" is worse than never having
started.

So **no dates on articles**, and the index is grouped by topic rather than
ordered by recency. That single choice is what lets the section sit untouched
for four months without looking abandoned.

The genuinely time-stamped content the shop produces has homes already:
launches in the announcement rotator, trucks in Our Builds and Customer Builds,
events as a Community child when they exist. Nothing is missing.

---

## 3. URLs and SEO

Articles live at `/the-manual/<slug>`. The section is already reserved in
`PROXY_RESERVED_SEGMENTS`, and a 2-segment path never reaches the proxy's index
lookup, so article routes need no further reservation.

**The section name is close to irrelevant for search.** Arrivals land on the
article from Google, not through the nav. The ranking work is the article's own
title, path, and content — `/the-manual/rock-light-wiring-basics`, not a clever
section label. Name the section for the people already on the site.

Two things worth doing at article level, both cheap and both invisible later if
skipped:

- **Answer the question in the first paragraph.** Search intent here is
  informational; the article that buries the answer under brand copy loses to
  the one that does not.
- **Cross-link to the products the article implicates.** An explainer on rock
  light wiring should link the harnesses. That is the only line connecting this
  section to revenue, and without it The Manual is a traffic firehose pointed at
  the floor.

---

## 4. Open — topics as L2 nav entries?

The index groups by topic: electrical, suspension, lighting, buying guides. The
question is whether those become **nav entries** or stay on-page.

Against: any child on an L2 flips the mega panel from flat to the rail, and a
topic with articles under it is exactly that. Four topics as L2s would put The
Manual on the deep layout with a 262px rail — which is fine for Parts, whose
rail is a catalogue, and heavy for four words.

For: topic landing pages are genuinely rankable, and a nav that shows them
tells a visitor the section has range.

**Leave it flat until there are enough articles that the index is unwieldy.**
Topic pages can exist as URLs without being nav entries — the same distinction
`custom-work.md` §5 draws between nav depth and URL depth.

---

## 5. Content source

Shared with Customer Builds, and decided by that section's volume: a metaobject
rather than hand-built routes (`customer-builds.md` §2.3). An article needs a title,
slug, body, topic, and a hero image; nothing about that is special enough to
justify a second mechanism.
