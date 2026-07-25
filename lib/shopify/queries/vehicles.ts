// Fetches vehicle generations as `vehicle` metaobject entries (one per
// make/model/year-range — see docs/shopify-vehicle-setup.md). Needs the
// unauthenticated_read_metaobjects scope and storefront access enabled on the
// definition, same as nav_item.
//
// `first: 250` is the Storefront API page cap; pagination is out of scope —
// getVehicles logs an error if hasNextPage ever becomes true.
export const getVehiclesQuery = /* GraphQL */ `
  query getVehicles {
    metaobjects(type: "vehicle", first: 250) {
      nodes {
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
      pageInfo {
        hasNextPage
      }
    }
  }
`;
