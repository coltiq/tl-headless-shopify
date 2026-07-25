// Fetches the header nav as a `nav_item` metaobject tree (see
// docs/shopify-setup.md): the root entry's children are the L1 nav bar
// items, expanding four levels deep (L1 bar → L2 rail → L3 column headings →
// L4 links). GraphQL cannot recurse, so each level is spelled out.
//
// Shopify computes requested query cost from the shape, not actual data, and
// the `first` caps multiply (8×12×12×16 potential nodes) — trim here if the
// Storefront API rejects the query for cost, starting with the L4 cap, then
// the L2/L3 caps. Items beyond a cap are silently dropped; the caps are
// documented for menu editors in docs/shopify-setup.md.
export const getNavMenuQuery = /* GraphQL */ `
  query getNavMenu($handle: String!) {
    metaobject(handle: { handle: $handle, type: "nav_item" }) {
      children: field(key: "children") {
        references(first: 8) {
          nodes {
            ... on Metaobject {
              ...navItemFields
              children: field(key: "children") {
                references(first: 12) {
                  nodes {
                    ... on Metaobject {
                      ...navItemFields
                      children: field(key: "children") {
                        references(first: 12) {
                          nodes {
                            ... on Metaobject {
                              ...navItemFields
                              children: field(key: "children") {
                                references(first: 16) {
                                  nodes {
                                    ... on Metaobject {
                                      ...navItemFields
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  fragment navItemFields on Metaobject {
    label: field(key: "label") {
      value
    }
    link: field(key: "link") {
      value
    }
    style: field(key: "style") {
      value
    }
  }
`;
