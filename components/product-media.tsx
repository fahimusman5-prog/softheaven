'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Product } from '@/lib/data';
import { resolveProductMedia } from '@/lib/product-media';

type ProductMediaProps = {
  product?: Product;
  src?: string;
  sources?: string[];
  alt: string;
  className?: string;
  loading?: 'eager' | 'lazy';
  priority?: boolean;
  sizes?: string;
  fit?: 'cover' | 'contain';
  fallbackTitle?: string;
  fill?: boolean;
};

export function ProductMedia({
  product,
  src,
  sources = [],
  alt,
  className = '',
  loading = 'lazy',
  priority = false,
  sizes,
  fit = 'cover',
  fallbackTitle,
  fill = false,
}: ProductMediaProps) {
  const sourceList = useMemo(
    () => resolveProductMedia(product, src, sources),
    [product?.id, product?.image, product?.images, product?.gallery, product?.variants, src, sources],
  );
  const sourceKey = sourceList.join('\u0000');
  const [failed, setFailed] = useState<{ key: string; index: number } | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const index = failed?.key === sourceKey ? failed.index : 0;
  const title = fallbackTitle ?? product?.name ?? alt;

  useEffect(() => {
    const image = imageRef.current;
    if (image?.complete && image.naturalWidth > 0) {
      image.dataset.mediaState = 'loaded';
    }
  }, [sourceKey, index]);

  if (index >= sourceList.length) {
    return (
      <span className={`product-media-fallback ${className}`} role="img" aria-label={`${title}. Product image coming soon.`} data-media-state="fallback">
        <span className="product-media-fallback__mark" aria-hidden="true">
          <img src="/assets/soft-haven-logo-transparent.png" alt="" width="194" height="82" loading="lazy" />
        </span>
        <span className="product-media-fallback__copy">
          <strong>{title}</strong>
          <small>Image coming soon</small>
        </span>
      </span>
    );
  }

  return (
    <img
      ref={imageRef}
      className={className}
      src={sourceList[index]}
      alt={alt}
      loading={priority ? 'eager' : loading}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
      sizes={sizes}
      draggable={false}
      data-media-state="loading"
      data-media-source-index={index}
      style={{ objectFit: fit, ...(fill ? { position: 'absolute', inset: 0, width: '100%', height: '100%' } : {}) }}
      onLoad={(event) => { event.currentTarget.dataset.mediaState = 'loaded'; }}
      onError={() => setFailed({ key: sourceKey, index: index + 1 })}
    />
  );
}
