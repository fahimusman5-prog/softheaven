import type { Product } from './data';

// Add product-specific local files here when approved photography is supplied.
const localProductImages: Partial<Record<Product['id'], string>> = {};

type MediaProduct = Product & {
  images?: string[];
  gallery?: string[];
  variants?: Array<{ image?: string; images?: string[] }>;
};

export function resolveProductMedia(product?: MediaProduct, src?: string, extraSources: string[] = []) {
  if (!product) return unique([src, ...extraSources]);

  const variantSources = (product.variants ?? []).flatMap((variant) => [variant.image, ...(variant.images ?? [])]);
  return unique([
    localProductImages[product.id],
    product.image,
    ...(product.images ?? []),
    ...(product.gallery ?? []),
    ...variantSources,
    ...extraSources,
    src,
  ]);
}

function unique(sources: Array<string | undefined>) {
  return Array.from(new Set(sources.map((source) => source?.trim()).filter((source): source is string => Boolean(source))));
}
