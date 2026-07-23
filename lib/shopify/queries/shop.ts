export const getShopAnnouncementQuery = /* GraphQL */ `
  query getShopAnnouncement {
    shop {
      announcement: metafield(namespace: "custom", key: "announcement") {
        value
      }
      announcementMobile: metafield(
        namespace: "custom"
        key: "announcement_mobile"
      ) {
        value
      }
    }
  }
`;
