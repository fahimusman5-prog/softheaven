import type { Metadata } from 'next';
import { getStorefront } from '@/lib/storefront';
import { notFound } from 'next/navigation';
import { ProductReviews } from '@/components/product-reviews';
import { ProductDetail } from '@/components/product-detail';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { products } = await getStorefront();
  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();
  return {
    title: product.seoTitle ?? product.name,
    description: product.seoDescription ?? product.description,
    openGraph: {
      title: `${product.name} | SoftHaven`,
      description: product.description,
      images: [product.image],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { products } = await getStorefront();
  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();
  const relatedProducts = products.filter(
    (candidate) =>
      candidate.id !== product.id && candidate.category === product.category,
  );
  const remainingProducts = products.filter(
    (candidate) =>
      candidate.id !== product.id &&
      !relatedProducts.some((related) => related.id === candidate.id),
  );

  return (
    <>
      <ProductDetail
        product={product}
        relatedProducts={[...relatedProducts, ...remainingProducts]}
      />
      <ProductReviews productId={product.id} />
    </>
  );
}
