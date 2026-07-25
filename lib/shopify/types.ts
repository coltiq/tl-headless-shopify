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
  // "links-row" pulls a level-2 item out of the mega panel rail and renders
  // its children as the links row beneath the rule (set via the nav_item
  // metaobject's `style` field).
  style?: "links-row";
  items: MenuItem[];
};

export type Announcement = {
  desktop: string | null;
  mobile: string | null;
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

export type Page = {
  id: string;
  title: string;
  handle: string;
  body: string;
  bodySummary: string;
  seo?: SEO;
  createdAt: string;
  updatedAt: string;
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
  children?: Maybe<{
    references: Maybe<{ nodes: ShopifyNavItem[] }>;
  }>;
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

export type ShopifyShopAnnouncementOperation = {
  data: {
    shop: {
      announcement: Maybe<{ value: string }>;
      announcementMobile: Maybe<{ value: string }>;
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

export type ShopifyPageOperation = {
  data: { pageByHandle: Page };
  variables: { handle: string };
};

export type ShopifyPagesOperation = {
  data: {
    pages: Connection<Page>;
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
