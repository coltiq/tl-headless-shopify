import OpengraphImage from "components/opengraph-image";
import { getCollection } from "lib/shopify";

export default async function Image({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const collection = await getCollection(category);
  const title = collection?.seo?.title || collection?.title;

  return await OpengraphImage(title ? { title } : undefined);
}
