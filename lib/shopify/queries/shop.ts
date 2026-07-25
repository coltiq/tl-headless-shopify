// Both announcement bands come from shop metafields holding **lists of
// metaobject references**, so the copy, its link, and the utility links beside
// it are all editable without a deploy. See docs/shopify-setup.md Part 1.4.
//
// Desktop and mobile have separate lists so mobile can carry shorter copy. The
// app falls back to the desktop list when a mobile list is empty, so a store
// that wants the same text everywhere fills in one list.
//
// Fields are read **by key**, not by metaobject type, so the mobile metafields
// may point at the same `announcement` / `announcement_bar_link` definitions or
// at parallel `*_mobile` ones — whichever the admin prefers.
//
// Caps are deliberate: the bar shows one announcement at a time on a 7s
// rotation, and the utility links have to fit a 38px band. `pageInfo` is
// selected so silent truncation can be logged rather than read as "my
// announcement disappeared".
export const getShopAnnouncementsQuery = /* GraphQL */ `
  query getShopAnnouncements {
    shop {
      announcements: metafield(namespace: "custom", key: "announcement_list") {
        ...announcementList
      }
      announcementsMobile: metafield(
        namespace: "custom"
        key: "announcement_list_mobile"
      ) {
        ...announcementList
      }
      barLinks: metafield(namespace: "custom", key: "announcement_bar_links") {
        ...barLinkList
      }
      barLinksMobile: metafield(
        namespace: "custom"
        key: "announcement_bar_links_mobile"
      ) {
        ...barLinkList
      }
    }
  }

  fragment announcementList on Metafield {
    references(first: 10) {
      nodes {
        ... on Metaobject {
          label: field(key: "label") {
            value
          }
          url: field(key: "url") {
            value
          }
          linkText: field(key: "link_text") {
            value
          }
        }
      }
      pageInfo {
        hasNextPage
      }
    }
  }

  fragment barLinkList on Metafield {
    references(first: 6) {
      nodes {
        ... on Metaobject {
          label: field(key: "label") {
            value
          }
          url: field(key: "url") {
            value
          }
          icon: field(key: "icon") {
            reference {
              ... on MediaImage {
                image {
                  url
                  width
                  height
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
