export const getAnnouncementBarQuery = /* GraphQL */ `
  query getAnnouncementBar {
    shop {
      announcements: metafield(namespace: "custom", key: "announcement_list") {
        references(first: 20) {
          edges {
            node {
              ... on Metaobject {
                text: field(key: "text") {
                  value
                }
                # The definition's display name is "url" but the immutable key is "link".
                url: field(key: "link") {
                  value
                }
                labelText: field(key: "label_text_for_url") {
                  value
                }
              }
            }
          }
        }
      }
      links: metafield(namespace: "custom", key: "announcement_bar_links") {
        references(first: 20) {
          edges {
            node {
              ... on Metaobject {
                label: field(key: "label") {
                  value
                }
                url: field(key: "url") {
                  value
                }
                icon: field(key: "icon") {
                  reference {
                    ... on GenericFile {
                      url
                      mimeType
                    }
                    ... on MediaImage {
                      image {
                        url
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
`;
