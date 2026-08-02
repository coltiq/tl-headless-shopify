// Fetches the shop's own builds as `truck_build` metaobject entries, behind
// /custom-work/builds and its per-build pages. Needs the
// unauthenticated_read_metaobjects scope and storefront access enabled on the
// definition, same as nav_item and vehicle — see docs/shopify-setup.md.
//
// **One query serves the index and every detail page.** The set is tens of
// entries, it is cached under TAGS.builds, and the detail page resolves its
// slug against that same cached list — so a build page costs no extra Shopify
// traffic. Revisit only if the count approaches the page cap.
//
// `first: 100` is well under the 250 cap; getTruckBuilds logs if hasNextPage
// ever goes true, because silent truncation reads as "build missing from the
// grid".
//
// `sortKey`/`reverse` give newest-edited-first as the default order. The real
// ordering is the optional `sort_order` field, applied in reshapeTruckBuilds —
// this only decides what happens when it is unset.
//
// The vehicle reference pulls the same keys as queries/vehicles.ts so a
// VehicleGeneration can be rebuilt from it without a second fetch. The
// generation handle is derived (vehicleHandle), never read.
export const getTruckBuildsQuery = /* GraphQL */ `
  query getTruckBuilds {
    metaobjects(
      type: "truck_build"
      first: 100
      sortKey: "updated_at"
      reverse: true
    ) {
      nodes {
        type
        fields {
          key
        }
        title: field(key: "title") {
          value
        }
        slug: field(key: "slug") {
          value
        }
        scope: field(key: "scope") {
          value
        }
        summary: field(key: "summary") {
          value
        }
        body: field(key: "body") {
          value
        }
        year: field(key: "year") {
          value
        }
        sortOrder: field(key: "sort_order") {
          value
        }
        hero: field(key: "hero") {
          reference {
            ... on MediaImage {
              image {
                url
                width
                height
                altText
              }
            }
          }
        }
        gallery: field(key: "gallery") {
          references(first: 20) {
            nodes {
              ... on MediaImage {
                image {
                  url
                  width
                  height
                  altText
                }
              }
            }
          }
        }
        vehicle: field(key: "vehicle") {
          reference {
            ... on Metaobject {
              make: field(key: "make") {
                value
              }
              model: field(key: "model") {
                value
              }
              yearStart: field(key: "year_start") {
                value
              }
              yearEnd: field(key: "year_end") {
                value
              }
              label: field(key: "label") {
                value
              }
              shortLabel: field(key: "short_label") {
                value
              }
            }
          }
        }
        products: field(key: "products") {
          references(first: 24) {
            nodes {
              ... on Product {
                handle
                title
                featuredImage {
                  url
                  width
                  height
                  altText
                }
              }
            }
          }
        }
      }
      pageInfo {
        hasNextPage
      }
    }
  }
`;
