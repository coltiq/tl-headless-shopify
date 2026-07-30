# Customer Builds — spec

Trucks the shop has worked on. 100+ already exist from install work: real,
photographable, and not showcase pieces.

Scaffolded at `/customer-builds`. Nothing in it is built.

---

## 1. An L1, and one page rather than a section

It was a child of a **Community** container until a look at the segment showed
nobody wraps this:

- **Custom Offsets** — nav is Shop · Add My Truck · Search Gallery · Brands ·
  Resources. The gallery _and_ the submission CTA are both top level.
- **Rough Country** — surfaces Customer Builds directly.
- **Krietz Customs**, the closest analogue as a custom shop — Build Your
  Vehicle · Gallery · Financing · All Services · Tools & Resources · Shop
  Apparel · Contact. Gallery is top level; there is no community section.
- **Offroad Alliance** — community handled entirely through event recaps and an
  Instagram feed on the homepage.

The gallery is the draw, so it goes in the bar. Community as a container was
also failing on its own terms: it had one strong child and two invented to
justify the wrapper.

**One page, not a section.** The grid, the social feed and the submit CTA live
here, so the L1 has no children and renders as a plain link with no dropdown.
It graduates to a container the day the grid outgrows sharing a page.

**Community is not dead, it is early.** The name earns its keep once
Ambassadors or Events is real — both are patterns in the segment — at which
point this becomes a child of it again.

---

## 2. The content

A cleaner split than "ours versus theirs":

- **Our Builds** (`/custom-work/builds`) — the highlight reel. Curated,
  start-to-finish projects the shop leads with.
- **Customer Builds** (`/customer-builds`) — the body of work. Volume, variety, and every
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

**Not in this section, and not in the nav.** It is company philosophy, which is
footer territory on almost every store, and it was the odd item in a list about
trucks and people.

`/the-standard` stays a real page and a reserved segment; it loses only its nav
entry.

Worth remembering when it gets written: the argument does its hardest work
**on the Custom Work landing**, where someone is deciding whether to trust the
shop with a truck. The footer page can be the full version.
