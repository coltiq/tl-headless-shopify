export type Maybe<T> = T | null;

export type Connection<T> = {
  edges: Array<Edge<T>>;
};

export type Edge<T> = {
  node: T;
};

export type Cart = Omit<ShopifyCart, "lines"> & {
  lines: CartItem[];
};

export type CartProduct = {
  id: string;
  handle: string;
  title: string;
  featuredImage: Image;
};

export type CartItem = {
  id: string | undefined;
  quantity: number;
  cost: {
    totalAmount: Money;
  };
  merchandise: {
    id: string;
    title: string;
    selectedOptions: {
      name: string;
      value: string;
    }[];
    product: CartProduct;
  };
};

export type Collection = Omit<ShopifyCollection, "fitmentDisabled"> & {
  path: string;
  // true only on Lifestyle collections (opt-out flag) — fitment UI and
  // vehicle URLs are disabled there. Missing metafield → false.
  fitmentDisabled: boolean;
};

export type Image = {
  url: string;
  altText: string;
  width: number;
  height: number;
};

export type Menu = {
  title: string;
  path: string;
};

export type MenuItem = {
  title: string;
  path: string;
  // Pulls a level-2 item out of the cards/rail and renders it somewhere else
  // in the panel, set via the nav_item metaobject's `style` field:
  // "links-row" renders its children as buttons beneath the rule, "proof" as
  // a muted strip at the foot, "feature" promotes the item itself to the
  // panel's image card.
  style?: "links-row" | "feature" | "proof";
  // One line of copy from the nav_item `description` field, shown by the mega
  // panel's flat layout and by a childless rail item's body. Optional
  // throughout: without it those layouts still render the title alone.
  description?: string;
  // From the nav_item `image` field. Only read by the feature card today.
  image?: {
    url: string;
    width: number;
    height: number;
    altText: string | null;
  };
  items: MenuItem[];
};

// One rotating announcement. `linkText` is the substring of `label` that
// becomes the clickable, underlined part; when it's null the whole label is
// clickable and not underlined. With no `url` the label is plain text.
export type Announcement = {
  label: string;
  url: string | null;
  linkText: string | null;
};

// A utility link in the announcement band ("Custom builds", "Get the app").
// The icon is an uploaded file, so it must already be the right color — the
// app can't recolor a raster or a remote SVG.
export type AnnouncementBarLink = {
  label: string;
  url: string;
  // An exact Heroicons export name from the `icon_text` field. Takes precedence
  // over `icon`: it renders as inline SVG and inherits `currentColor`, where an
  // uploaded file is an <img> stuck at whatever colour it was drawn in.
  iconName: string | null;
  icon: { url: string; width: number; height: number } | null;
};

// Desktop lists plus their mobile overrides. Each mobile list falls back to
// its desktop counterpart when empty, so a store that wants one message
// everywhere fills in one list.
export type ShopAnnouncements = {
  announcements: Announcement[];
  barLinks: AnnouncementBarLink[];
  mobileAnnouncements: Announcement[];
  mobileBarLinks: AnnouncementBarLink[];
};

export type PredictiveProduct = {
  id: string;
  title: string;
  path: string;
  sku: string | null;
  tags: string[];
};

export type PredictiveCollection = {
  id: string;
  title: string;
  path: string;
};

export type PredictiveSearchResult = {
  products: PredictiveProduct[];
  collections: PredictiveCollection[];
};

export type Money = {
  amount: string;
  currencyCode: string;
};

export type Product = Omit<ShopifyProduct, "variants" | "images"> & {
  variants: ProductVariant[];
  images: Image[];
};

export type ProductOption = {
  id: string;
  name: string;
  values: string[];
};

export type ProductVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: {
    name: string;
    value: string;
  }[];
  price: Money;
};

export type SEO = {
  title: string;
  description: string;
};

export type ShopifyCart = {
  id: string | undefined;
  checkoutUrl: string;
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
    totalTaxAmount: Money;
  };
  lines: Connection<CartItem>;
  totalQuantity: number;
};

export type ShopifyCollection = {
  handle: string;
  title: string;
  description: string;
  // Aliased `custom.fitment_disabled` boolean metafield; null when unset.
  fitmentDisabled: Maybe<{ value: string }>;
  seo: SEO;
  updatedAt: string;
};

export type ShopifyProduct = {
  id: string;
  handle: string;
  availableForSale: boolean;
  title: string;
  description: string;
  descriptionHtml: string;
  options: ProductOption[];
  priceRange: {
    maxVariantPrice: Money;
    minVariantPrice: Money;
  };
  variants: Connection<ProductVariant>;
  featuredImage: Image;
  images: Connection<Image>;
  seo: SEO;
  tags: string[];
  updatedAt: string;
};

export type ShopifyCartOperation = {
  data: {
    cart: ShopifyCart;
  };
  variables: {
    cartId: string;
  };
};

export type ShopifyCreateCartOperation = {
  data: { cartCreate: { cart: ShopifyCart } };
};

export type ShopifyAddToCartOperation = {
  data: {
    cartLinesAdd: {
      cart: ShopifyCart;
    };
  };
  variables: {
    cartId: string;
    lines: {
      merchandiseId: string;
      quantity: number;
    }[];
  };
};

export type ShopifyRemoveFromCartOperation = {
  data: {
    cartLinesRemove: {
      cart: ShopifyCart;
    };
  };
  variables: {
    cartId: string;
    lineIds: string[];
  };
};

export type ShopifyUpdateCartOperation = {
  data: {
    cartLinesUpdate: {
      cart: ShopifyCart;
    };
  };
  variables: {
    cartId: string;
    lines: {
      id: string;
      merchandiseId: string;
      quantity: number;
    }[];
  };
};

export type ShopifyCollectionOperation = {
  data: {
    collection: ShopifyCollection;
  };
  variables: {
    handle: string;
  };
};

export type ShopifyCollectionProductsOperation = {
  data: {
    collection: {
      products: Connection<ShopifyProduct>;
    };
  };
  variables: {
    handle: string;
    reverse?: boolean;
    sortKey?: string;
    // Same-type filters OR together: [{tag: fits-<gen>}, {tag: fits-universal}].
    filters?: { tag: string }[];
  };
};

export type ShopifyCollectionsOperation = {
  data: {
    collections: Connection<ShopifyCollection>;
  };
};

export type ShopifyMenuOperation = {
  data: {
    menu?: {
      items: {
        title: string;
        url: string;
      }[];
    };
  };
  variables: {
    handle: string;
  };
};

export type ShopifyHeaderMenuItem = {
  title: string;
  url: Maybe<string>;
  items?: ShopifyHeaderMenuItem[];
};

export type ShopifyHeaderMenuOperation = {
  data: {
    menu?: Maybe<{
      items: ShopifyHeaderMenuItem[];
    }>;
  };
  variables: {
    handle: string;
  };
};

// Raw shape of a nav_item metaobject at every level of the nav query — the
// `children` alias is identical per level, so one recursive type covers the
// whole tree. Fields are Maybe because unset metaobject fields resolve to
// null, and a non-Metaobject reference wired into a children list
// deserializes as {} under the `... on Metaobject` fragment.
export type ShopifyNavItem = {
  label: Maybe<{ value: string }>;
  link: Maybe<{ value: string }>;
  style: Maybe<{ value: string }>;
  description: Maybe<{ value: string }>;
  image: Maybe<{
    reference: Maybe<{
      image: Maybe<{
        url: string;
        width: number;
        height: number;
        altText: Maybe<string>;
      }>;
    }>;
  }>;
  // Category fields. `slug` is one URL segment; the path is built from tree
  // position. `collection.reference` is `{}` rather than null when the
  // reference points at something that isn't a Collection.
  slug: Maybe<{ value: string }>;
  layout: Maybe<{ value: string }>;
  showGrid: Maybe<{ value: string }>;
  collection: Maybe<{
    reference: Maybe<{ handle?: string; title?: string }>;
  }>;
  children?: Maybe<{
    references: Maybe<{ nodes: ShopifyNavItem[] }>;
  }>;
};

// One category page, flattened out of the nav_item tree. Flat with
// parentPath/childPaths rather than nested children: no cycles, no
// duplication, and trivially serializable across the `use cache` boundary.
export type CategoryNode = {
  // Derived from tree position with L1 skipped, e.g. "/lighting/rock-lights".
  path: string;
  segments: string[];
  slug: string;
  // From `label` — display only.
  title: string;
  // Explicit reference. null means the admin entry is incomplete or points at
  // a deleted/unpublished collection; the page renders child links instead.
  collectionHandle: string | null;
  // `landing` is Phase 3B and currently renders as `grid`.
  layout: "grid" | "landing";
  showGrid: boolean;
  parentPath: string | null;
  childPaths: string[];
};

export type ShopifyNavMenuOperation = {
  data: {
    metaobject: Maybe<{
      children: Maybe<{
        references: Maybe<{ nodes: ShopifyNavItem[] }>;
      }>;
    }>;
  };
  variables: {
    handle: string;
  };
};

// Raw shape of a `vehicle` metaobject entry. Fields are Maybe because unset
// metaobject fields resolve to null; reshapeVehicles validates and drops bad
// entries. Handles are derived from fields (vehicleHandle), never read from
// the metaobject — cookies and fits-* tags embed them.
export type ShopifyVehicleNode = {
  make: Maybe<{ value: string }>;
  model: Maybe<{ value: string }>;
  yearStart: Maybe<{ value: string }>;
  yearEnd: Maybe<{ value: string }>;
  label: Maybe<{ value: string }>;
  shortLabel: Maybe<{ value: string }>;
};

export type ShopifyVehiclesOperation = {
  data: {
    metaobjects: {
      nodes: ShopifyVehicleNode[];
      pageInfo: { hasNextPage: boolean };
    };
  };
};

// Raw metaobject shapes behind the announcement band. Fields are Maybe
// because unset metaobject fields resolve to null, and a reference pointing at
// something that isn't the expected type deserializes as {}.
export type ShopifyAnnouncementNode = {
  // Present so a key mismatch can name the keys that *do* exist.
  type?: string;
  fields?: { key: string }[];
  label: Maybe<{ value: string }>;
  url: Maybe<{ value: string }>;
  linkText: Maybe<{ value: string }>;
};

export type ShopifyAnnouncementBarLinkNode = {
  type?: string;
  fields?: { key: string }[];
  label: Maybe<{ value: string }>;
  url: Maybe<{ value: string }>;
  iconText: Maybe<{ value: string }>;
  icon: Maybe<{
    reference: Maybe<{
      image: Maybe<{ url: string; width: number; height: number }>;
    }>;
  }>;
};

type ShopifyMetaobjectList<T> = Maybe<{
  references: Maybe<{
    nodes: T[];
    pageInfo: { hasNextPage: boolean };
  }>;
}>;

export type ShopifyShopAnnouncementsOperation = {
  data: {
    shop: {
      announcements: ShopifyMetaobjectList<ShopifyAnnouncementNode>;
      announcementsMobile: ShopifyMetaobjectList<ShopifyAnnouncementNode>;
      barLinks: ShopifyMetaobjectList<ShopifyAnnouncementBarLinkNode>;
      barLinksMobile: ShopifyMetaobjectList<ShopifyAnnouncementBarLinkNode>;
    };
  };
};

export type ShopifyPredictiveSearchOperation = {
  data: {
    predictiveSearch: Maybe<{
      products: {
        id: string;
        title: string;
        handle: string;
        tags: string[];
        variants: Connection<{ sku: Maybe<string> }>;
      }[];
      collections: {
        id: string;
        title: string;
        handle: string;
      }[];
    }>;
  };
  variables: {
    query: string;
  };
};

export type ShopifyProductOperation = {
  data: { product: ShopifyProduct };
  variables: {
    handle: string;
  };
};

export type ShopifyProductRecommendationsOperation = {
  data: {
    productRecommendations: ShopifyProduct[];
  };
  variables: {
    productId: string;
  };
};

export type ShopifyProductsOperation = {
  data: {
    products: Connection<ShopifyProduct>;
  };
  variables: {
    query?: string;
    reverse?: boolean;
    sortKey?: string;
  };
};
