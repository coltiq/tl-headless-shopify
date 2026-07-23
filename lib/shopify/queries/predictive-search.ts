export const getPredictiveSearchQuery = /* GraphQL */ `
  query getPredictiveSearch($query: String!) {
    predictiveSearch(
      query: $query
      limit: 8
      limitScope: EACH
      types: [PRODUCT, COLLECTION]
    ) {
      products {
        id
        title
        handle
        tags
        variants(first: 1) {
          edges {
            node {
              sku
            }
          }
        }
      }
      collections {
        id
        title
        handle
      }
    }
  }
`;
