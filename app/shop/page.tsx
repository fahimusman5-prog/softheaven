import type { Metadata } from 'next';
import ShopClient from '@/components/shop-page-client';
import { getStorefront } from '@/lib/storefront';
type Params = {
  search?: string | string[];
  category?: string | string[];
  collection?: string | string[];
};
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Params>;
}): Promise<Metadata> {
  const p = await searchParams;
  const { categories, collections } = await getStorefront();
  const category = categories.find((c) => c.name === p.category);
  const collection = collections.find((c) => c.slug === p.collection);
  return {
    title:
      collection?.seoTitle ??
      category?.seo_title ??
      collection?.name ??
      category?.name ??
      'Shop',
    description:
      collection?.seoDescription ??
      category?.seo_description ??
      collection?.description ??
      'Meet the SoftHaven collection.',
  };
}
export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  return <ShopClient params={await searchParams} />;
}
