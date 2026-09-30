export type ProductVariant = {
  id: string;
  color: string;
  image: string;
  images?: string[];
  price: number;
  compareAt?: number;
  stock?: number;
  sku?: string;
  active?: boolean;
};

export type Product = {
  featured?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAt?: number;
  category: string;
  color: string;
  description: string;
  image: string;
  images?: string[];
  gallery?: string[];
  details: string[];
  variants?: ProductVariant[];
};

export const images = {
  bear: '/images/collections/teddy-classic-cuddles.webp',
  bunny: '/images/collections/bunny-sweet-friends.webp',
  sloth: '/images/collections/wild-wonderful.webp',
  heart: '/images/about/about-gifting-moment.webp',
  gift: '/images/about/about-gifting-moment.webp',
};

/*
 * These catalog numbers are the existing storefront values. The repository does
 * not contain an authoritative LKR price list, so the migration preserves the
 * numeric values instead of inventing an exchange-rate conversion; replace them
 * with approved rupee amounts when the source price list is available.
 */
export const products: Product[] = [
  { id: 'aurelius', slug: 'aurelius-heritage-bear', name: 'The Aurelius Heritage Bear', price: 88, compareAt: 115, category: 'Teddy Bear Collection', color: 'Honey Caramel', image: images.bear, description: 'A grounded sensory instrument for softer rooms, slower evenings, and better hugs.', details: ['0.8 Denier Cloud Fleece', 'Weighted Micro-Glass Core', 'French Double-Lock Seams', 'Brass Ear-Stamp №'] },
  { id: 'celeste', slug: 'celeste-cloud-bunny', name: 'Celeste Cloud Bunny', price: 72, category: 'Soft Animal Friends', color: 'Cloud Cream', image: images.bunny, description: 'A quiet, cloud-soft companion with a little extra room for tenderness.', details: ['Hypoallergenic fibers', 'Hand-finished features', 'Lavender-safe lining'] },
  { id: 'oliver', slug: 'oliver-sleeping-sloth', name: 'Oliver Sleeping Sloth', price: 64, category: 'Soft Animal Friends', color: 'Oatmeal', image: images.sloth, description: 'The gentle reminder to take the long way home.', details: ['Weighted paws', 'Machine-safe finish', 'Calming tactile texture'] },
  { id: 'amour', slug: 'amour-velvet-heart-bear', name: 'Amour Velvet Heart Bear', price: 78, category: 'Love & Gifting', color: 'Rosewood', image: images.heart, description: 'A velvet-hearted keepsake for the person who makes every room warmer.', details: ['Velvet-touch outer', 'Gift inscription card', 'Keepsake presentation box'] },
];

export const findProduct = (slug: string) => products.find((product) => product.slug === slug) ?? products[0];

export function getProductVariants(product: Product): ProductVariant[] {
  const variants = product.variants?.filter((variant) => variant.active !== false);
  if (variants?.length) return variants;

  return [{
    id: `${product.id}-default`,
    color: product.color,
    image: product.image,
    images: [product.image],
    price: product.price,
    compareAt: product.compareAt,
  }];
}
