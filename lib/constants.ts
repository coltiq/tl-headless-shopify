export type SortFilterItem = {
  title: string;
  slug: string | null;
  sortKey: "RELEVANCE" | "BEST_SELLING" | "CREATED_AT" | "PRICE";
  reverse: boolean;
};

export const defaultSort: SortFilterItem = {
  title: "Relevance",
  slug: null,
  sortKey: "RELEVANCE",
  reverse: false,
};

export const sorting: SortFilterItem[] = [
  defaultSort,
  {
    title: "Trending",
    slug: "trending-desc",
    sortKey: "BEST_SELLING",
    reverse: false,
  }, // asc
  {
    title: "Latest arrivals",
    slug: "latest-desc",
    sortKey: "CREATED_AT",
    reverse: true,
  },
  {
    title: "Price: Low to high",
    slug: "price-asc",
    sortKey: "PRICE",
    reverse: false,
  }, // asc
  {
    title: "Price: High to low",
    slug: "price-desc",
    sortKey: "PRICE",
    reverse: true,
  },
];

export const TAGS = {
  collections: "collections",
  products: "products",
  cart: "cart",
  menu: "menu",
  vehicles: "vehicles",
  announcements: "announcements",
};

// The nav_item metaobject entry the header tree — and therefore the whole
// category URL space — is rooted at, plus the native Shopify menu used when
// that metaobject can't be read. See docs/shopify-setup.md Part 4.
export const NAV_ROOT_HANDLE = "main-nav";
export const HEADER_MENU_HANDLE = "main-menu-v2";

// Must match the `first:` caps in lib/shopify/queries/nav.ts. Entries beyond a
// cap are silently dropped by Shopify; since Phase 3 these caps bound the
// category URL space too, so the app logs when a level is sitting on one.
export const NAV_LEVEL_CAPS = { l1: 8, l2: 12, l3: 12, l4: 16 } as const;

// Static code routes that always beat the [...path] catch-all, so middleware
// must never treat their first segment as a collection handle. The four L1 nav
// sections are in here permanently — see docs/shopify-setup.md Part 4.2.
export const NEXT_MIDDLEWARE_RESERVED_SEGMENTS = new Set([
  "parts",
  "custom-work",
  "lifestyle",
  "behind-the-build",
  "contact",
  "search",
  "product",
]);

export const HIDDEN_PRODUCT_TAG = "nextjs-frontend-hidden";
export const DEFAULT_OPTION = "Default Title";
export const SHOPIFY_GRAPHQL_API_ENDPOINT = "/api/2025-07/graphql.json";
