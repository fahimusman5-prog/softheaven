'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Product, ProductVariant } from '@/lib/data';
import { getProductVariants } from '@/lib/data';
import { formatPrice } from '@/lib/format';
import { ProductCard } from '@/components/product-card';
import { getCartLineId, useCart } from '@/components/cart-provider';
import { ProductMedia } from '@/components/product-media';

type ProductDetailProps = {
  product: Product;
  relatedProducts: Product[];
};

function SearchIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.6"/><path d="m16 16 4.2 4.2"/></svg>;
}

function ChevronIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 9 5 5 5-5"/></svg>;
}

function CloseIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17"/></svg>;
}

function ZoomIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="5.5"/><path d="m15 15 4.5 4.5M10.5 8v5M8 10.5h5"/></svg>;
}

function uniqueImages(variant: ProductVariant) {
  return Array.from(new Set(variant.images?.length ? variant.images : [variant.image]));
}

export function ProductDetail({ product, relatedProducts }: ProductDetailProps) {
  const variants = useMemo(() => getProductVariants(product), [product]);
  const [selectedVariantId, setSelectedVariantId] = useState(variants[0]?.id);
  const [selectedImage, setSelectedImage] = useState(variants[0]?.image ?? product.image);
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState('');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const { add } = useCart();

  const selectedVariant = variants.find((variant) => variant.id === selectedVariantId) ?? variants[0];
  const gallery = selectedVariant ? uniqueImages(selectedVariant) : [product.image];
  const maxQuantity = selectedVariant?.stock === undefined ? 12 : Math.min(12, selectedVariant.stock);
  const lineId = selectedVariant ? getCartLineId(product, selectedVariant) : '';

  useEffect(() => {
    if (!lightboxOpen) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLightboxOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxOpen]);

  const selectVariant = (variant: ProductVariant) => {
    setSelectedVariantId(variant.id);
    setSelectedImage(variant.image);
    setQuantity(1);
    setFeedback('');
  };

  const addSelectedToCart = () => {
    if (!selectedVariant) return;
    if (selectedVariant.stock === 0) {
      setFeedback('This color is currently unavailable.');
      return;
    }
    if (selectedVariant.stock !== undefined && quantity > selectedVariant.stock) {
      setFeedback(`Only ${selectedVariant.stock} available.`);
      return;
    }

    for (let index = 0; index < quantity; index += 1) add(product, selectedVariant);
    setFeedback('Added to bag.');
  };

  return (
    <main className="product-detail-page">
      <nav className="product-detail-breadcrumbs" aria-label="Breadcrumb">
        <a href="/shop">Shop</a><span>/</span><span>{product.category}</span><span>/</span><strong>{product.name}</strong>
      </nav>

      <section className="product-detail-layout" aria-labelledby="product-detail-title">
        <div className="product-detail-gallery">
          <div className="product-detail-main-media">
            <button className="product-detail-image-button" type="button" onClick={() => setLightboxOpen(true)} aria-label={`Open larger image of ${product.name}`}>
              <ProductMedia product={product} src={selectedImage} alt={`${product.name} in ${selectedVariant?.color ?? product.color}`} className="product-detail-main-image" fit="contain" priority />
            </button>
            <button className="product-detail-zoom" type="button" onClick={() => setLightboxOpen(true)} aria-label="View product image larger"><ZoomIcon /></button>
          </div>

          <div className="product-detail-thumbs" aria-label="Product images">
            {gallery.map((image, index) => (
              <button className={image === selectedImage ? 'product-detail-thumb is-selected' : 'product-detail-thumb'} key={`${image}-${index}`} type="button" onClick={() => setSelectedImage(image)} aria-label={`View image ${index + 1}`} aria-pressed={image === selectedImage}>
                <ProductMedia product={product} src={image} alt="" className="product-detail-thumb-image" fit="contain" />
              </button>
            ))}
          </div>
        </div>

        <div className="product-detail-purchase">
          <p className="product-detail-category">{product.category}</p>
          <h1 id="product-detail-title">{product.name}</h1>
          <div className="product-detail-price-row">
            <strong>{formatPrice(selectedVariant?.price ?? product.price)}</strong>
            {selectedVariant?.compareAt && <del>{formatPrice(selectedVariant.compareAt)}</del>}
          </div>
          <p className="product-detail-description">{product.description}</p>

          <div className="product-detail-field">
            <div className="product-detail-field-heading"><span>Color</span><strong>{selectedVariant?.color ?? product.color}</strong></div>
            <div className="product-detail-color-options" role="group" aria-label="Choose a color">
              {variants.map((variant) => (
                <button className={variant.id === selectedVariant?.id ? 'product-detail-color-option is-selected' : 'product-detail-color-option'} key={variant.id} type="button" onClick={() => selectVariant(variant)} aria-pressed={variant.id === selectedVariant?.id}>
                  <span className="product-detail-color-swatch" style={{ backgroundImage: `url(${variant.image})` }} aria-hidden="true" />
                  <span>{variant.color}</span>
                </button>
              ))}
            </div>
          </div>

          {selectedVariant?.stock !== undefined && <p className={selectedVariant.stock > 0 ? 'product-detail-stock' : 'product-detail-stock is-unavailable'}>{selectedVariant.stock > 0 ? `${selectedVariant.stock} available` : 'Currently unavailable'}</p>}

          <div className="product-detail-actions">
            <div className="product-detail-quantity" aria-label="Quantity">
              <button type="button" onClick={() => setQuantity((current) => Math.max(1, current - 1))} aria-label="Decrease quantity">−</button>
              <span>{quantity}</span>
              <button type="button" onClick={() => setQuantity((current) => Math.min(Math.max(1, maxQuantity), current + 1))} aria-label="Increase quantity" disabled={maxQuantity <= quantity}>+</button>
            </div>
            <button className="product-detail-add" type="button" onClick={addSelectedToCart} disabled={selectedVariant?.stock === 0}>
              {selectedVariant?.stock === 0 ? 'Unavailable' : `Add to bag — ${formatPrice((selectedVariant?.price ?? product.price) * quantity)}`}
            </button>
          </div>
          {feedback && <p className="product-detail-feedback" role="status">{feedback}</p>}
          {lineId && <a className="product-detail-view-bag" href="/cart">View bag</a>}
        </div>
      </section>

      <section className="product-detail-information" aria-label="Product information">
        <div className="product-detail-info-block">
          <p className="eyebrow">Why you&apos;ll love it</p>
          <ul className="product-detail-highlights">
            {product.details.map((detail) => <li key={detail}>{detail}</li>)}
          </ul>
        </div>
        <div className="product-detail-info-block">
          <p className="eyebrow">About this plush</p>
          <p>{product.description}</p>
        </div>
        <details className="product-detail-info-block product-detail-details">
          <summary>Product details <ChevronIcon /></summary>
          <dl>
            <div><dt>Category</dt><dd>{product.category}</dd></div>
            <div><dt>Color</dt><dd>{selectedVariant?.color ?? product.color}</dd></div>
            {selectedVariant?.sku && <div><dt>SKU</dt><dd>{selectedVariant.sku}</dd></div>}
          </dl>
        </details>
      </section>

      {relatedProducts.length > 0 && <section className="product-detail-related" aria-labelledby="related-products-title">
        <div className="section-heading"><div><p className="eyebrow">Continue exploring</p><h2 id="related-products-title">You may also love</h2></div><a href="/shop">View all companions →</a></div>
        <div className="product-grid">{relatedProducts.slice(0, 4).map((relatedProduct) => <ProductCard key={relatedProduct.id} product={relatedProduct} />)}</div>
      </section>}

      {lightboxOpen && <div className="product-detail-lightbox" role="dialog" aria-modal="true" aria-label={`${product.name} image`} onClick={() => setLightboxOpen(false)}>
        <button className="product-detail-lightbox-close" type="button" onClick={() => setLightboxOpen(false)} aria-label="Close image viewer"><CloseIcon /></button>
        <span onClick={(event) => event.stopPropagation()}><ProductMedia product={product} src={selectedImage} alt={`${product.name} in ${selectedVariant?.color ?? product.color}`} className="product-detail-lightbox-image" fit="contain" priority /></span>
      </div>}
    </main>
  );
}
