import type { ImageLoaderProps } from 'next/image';
import manifest from './responsive-editorial.json';
export function editorialImageLoader({ src, width }: ImageLoaderProps) {
  const variants = (manifest as Record<string, Record<string, string>>)[src];
  if (!variants) return src; // Unknown CMS imagery retains its original source.
  return variants[width <= 384 ? '384' : width <= 640 ? '640' : width <= 960 ? '960' : '1440'];
}
