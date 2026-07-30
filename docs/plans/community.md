# Community — section spec

The brand side. A **container**, not a page with a menu: its children are what
justify the nav slot, and the section is named for what it grows into rather
than what it holds today.

Nothing in here is built. `/community` is a scaffold, `/the-standard` a
title-only placeholder, and the other two children have no routes yet.

Why "Community" and not "About" is in `OPEN-ITEMS.md` §4.2 and not repeated
here. The short version: it is the only section whose contents are expected to
grow, and the only heading under which The Standard reads as terms of belonging
rather than corporate boilerplate.

---

## 1. The children

| Child               | Route           | State                  |
| ------------------- | --------------- | ---------------------- |
| **Customer Builds** | —               | No route yet           |
| **The Standard**    | `/the-standard` | Title-only placeholder |

The Manual left for its own L1 (`the-manual.md`): reference and expertise
against a section about people, and the section most likely to bring strangers
to the site — a poor thing to bury two clicks down.

**Two children is thin for a flat panel**, and the fix is already built: give
Customer Builds the `feature` style so the panel renders two cards down the
left against a photographed truck on the right. That layout wants exactly this
shape.

Deferred until they exist: **Events**, **Giveaways**. Both were considered and
neither has anything behind it yet.

Adding a fourth child is free — the panel's flat layout wraps. Adding a
**grandchild** is not: a child on any one of these flips the mega panel from
flat to the rail and demotes the others from cards to hover-to-reveal rows.
Same constraint as Custom Work, same reasoning (`custom-work.md` §5).

---

## 2. Customer Builds

**Not the thin child — the one with the most material on the site.** 100+
trucks already exist from install work: jobs that are real and photographable
but not showcase pieces.

That gives a cleaner split than "ours versus theirs":

- **Our Builds** (`/custom-work/builds`) — the highlight reel. Curated,
  start-to-finish projects the shop leads with.
- **Customer Builds** (here) — the body of work. Volume, variety, and every
  truck that left with our parts on it.

The name survives the fact that the shop did the installing: in truck culture
"my build" is whatever is on your truck, whoever turned the wrenches.

### 2.1 The entry format has to be cheap

At a hundred entries a write-up each will never happen — twelve will get
published and the rest never will. Per build: **a photo, the truck, the parts,
one line.** Anything heavier is a format that guarantees the page stays a tenth
full.

### 2.2 Every entry carries a vehicle reference — from day one

**This is the one thing that must not be deferred.** An entry needs the
generation it belongs to (or make/model/year, resolved the same way the garage
does it) _before_ a hundred rows exist, because retrofitting a vehicle onto a
hundred published entries is a job nobody ever does.

Nothing has to read it at first. It unlocks, in rough order of effort:

- **Grouping and filtering by vehicle.** A hundred trucks in a flat grid is a
  wall; by make and model it is useful. That axis already exists — same
  `make`/`model` slugs the garage and the URL grammar use.
- **Model-specific search traffic.** "2022 F-150 rock light install" is a real
  query with almost no good answers, and this is dozens of pages of it.
- **"Builds like yours."** With a truck in the garage, showing customer builds
  matching that generation on category pages or the grid — the fitment system
  paying off somewhere other than filtering products.

### 2.3 Content source

100+ entries settles a question that was open for The Manual: **nobody
hand-codes a hundred routes.** This needs a metaobject definition or Shopify
articles, and whichever is chosen covers The Manual too (`the-manual.md` §5).

A metaobject is the better fit — the fields are structured (vehicle reference,
parts, photo) rather than a body of prose, and a `vehicle` metaobject reference
is exactly the field type the garage already uses.

---

## 3. Submissions

Customers uploading their own trucks. **Not built, and it is a bigger job than
it looks.**

### 3.1 The constraint that shapes it

**The Storefront API cannot write metaobjects.** It is read-only for them, and
this app holds a Storefront token and nothing else (Part 0). Publishing a
submission therefore needs either:

- an **Admin API token** and a server-side route that creates the entry — a new
  secret, a new write surface, and rate limits to think about; or
- an **off-site form** (or email) that lands in a queue a human works through.

### 3.2 What it needs regardless of route

- **Moderation.** Public upload with no review means spam and worse, on a page
  whose whole job is making the brand look good. Nothing publishes unreviewed.
- **Rights.** An explicit checkbox licensing the photo for use on the site and
  socials. Without it every entry is a takedown waiting to happen.
- **Image handling.** Uploads need somewhere to live and a size ceiling —
  Shopify Files via the Admin API, or a service.
- **The vehicle**, captured at submission. Reuse the garage's picker rather
  than a free-text field, or the whole benefit of §3.2 is lost to typos.

### 3.3 Start manual

A form that queues — email, or a form service — with staff publishing the
entry, is the right first version. Submissions will trickle where the existing
100 are a backlog, so the automation would sit idle while carrying a write
surface and a moderation problem. Manual entry also keeps the quality bar,
which is the only thing protecting a page that exists to impress.

Build the self-serve pipeline when the queue is genuinely the bottleneck.

---

## 4. The Standard

The bar the shop holds itself to — why the wiring is clean, why it costs what
it costs. Company philosophy, values, and the people.

Already has its route from the days it was an L1. Its URL does not move now
that it sits at L2: a node with an explicit `link` and no `slug` falls back to
the link, so nav position and path are independent here.
