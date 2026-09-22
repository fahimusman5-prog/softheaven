import type { Metadata } from 'next';
import { findProduct, products } from '@/lib/data';
import { ProductDetail } from '@/components/product-detail';

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = findProduct(slug);
  return {
    title: `${product.name} | SoftHaven`,
    description: product.description,
    openGraph: { title: `${product.name} | SoftHaven`, description: product.description, images: [product.image] },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = findProduct(slug);
  const relatedProducts = products.filter((candidate) => candidate.id !== product.id && candidate.category === product.category);
  const remainingProducts = products.filter((candidate) => candidate.id !== product.id && !relatedProducts.some((related) => related.id === candidate.id));

  return <ProductDetail product={product} relatedProducts={[...relatedProducts, ...remainingProducts]} />;
}
