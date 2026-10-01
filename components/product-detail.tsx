'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Product, ProductVariant } from '@/lib/data';
import { getProductVariants } from '@/lib/data';
import { getCartLineId, useCart } from '@/components/cart-provider';
import { useCatalogue } from '@/components/catalogue-provider';
import { useWishlist } from '@/components/wishlist-provider';
import { ProductMedia } from '@/components/product-media';
import { ProductReviews, type ReviewSummary } from '@/components/product-reviews';

const money = (value: number) => `LKR ${new Intl.NumberFormat('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)}`;
function Icon({ name }: { name: 'bag' | 'truck' | 'shield' | 'gift' | 'chevron' | 'zoom' | 'heart' | 'details' | 'return' }) {
  const paths = { heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>, details: <><path d="M6 3h9l4 4v14H6zM14 3v5h5M9 12h7M9 16h5"/></>, return: <><path d="M3 10a9 9 0 0 1 15-6l3 3M21 3v4h-4M21 14A9 9 0 0 1 6 20l-3-3M3 21v-4h4"/></>, bag: <><path d="M5 7h14l1 14H4L5 7Z"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/></>, truck: <><path d="M2 5h12v12H2zM14 9h4l4 4v4h-8"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></>, shield: <><path d="m12 2 8 3v6c0 5-8 10-8 10S4 16 4 11V5l8-3Z"/><path d="m8 11 3 3 5-6"/></>, gift: <><path d="M3 10h18v4H3zM5 14v7h14v-7M12 10v11"/><path d="M12 10S4 9 6 5s6 5 6 5Zm0 0s8-1 6-5-6 5-6 5Z"/></>, chevron: <path d="m9 5 7 7-7 7"/>, zoom: <><circle cx="10" cy="10" r="6"/><path d="m15 15 6 6M7 10h6M10 7v6"/></> };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
function Accordion({ title, icon, children }: { title: string; icon: 'details' | 'heart' | 'truck' | 'return'; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const id = `pdp-${title.toLowerCase().replaceAll(' ', '-')}`;
  return <div className="pdp-accordion"><button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}><Icon name={icon}/><strong>{title}</strong><span className={open ? 'is-open' : ''}><Icon name="chevron"/></span></button><div id={id} className={`pdp-accordion-body ${open ? 'is-open' : ''}`} inert={!open} aria-hidden={!open}><div>{children}</div></div></div>;
}
export function ProductDetail({ product, relatedProducts }: { product: Product; relatedProducts: Product[] }) {
  const variants = useMemo(() => getProductVariants(product).filter(v => v.active !== false), [product]);
  const [selectedId, setSelectedId] = useState(variants[0]?.id);
  const [imageIndex, setImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState('');
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const { add, lines } = useCart();
  const { ids: wishlistIds, toggle: toggleWishlist } = useWishlist();
  const saved = wishlistIds.includes(product.id);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const { categories, collections } = useCatalogue();
  const variant = variants.find(v => v.id === selectedId) ?? variants[0];
  const gallery = Array.from(new Set([variant?.image, ...(variant?.images ?? []), product.image, ...(product.images ?? []), ...(product.gallery ?? [])].filter((s): s is string => Boolean(s))));
  const selectedImage = gallery[imageIndex] ?? gallery[0];
  const price = variant?.price ?? product.price;
  const compareAt = variant?.compareAt ?? product.compareAt;
  const alreadyInBag = variant ? lines.find(l => getCartLineId(l.product, l.variant) === getCartLineId(product, variant))?.quantity ?? 0 : 0;
  const capacity = variant?.stock === undefined ? 0 : Math.max(0, Math.min(12, variant.stock) - alreadyInBag);
  const unavailable = !variant || variant.stock === undefined || variant.stock <= 0;
  const lowStock = !unavailable && variant.stock! <= (variant.lowStockThreshold ?? 5);
  const category = categories.find(c => c.name === product.category);
  const collection = collections.find(c => c.productIds.includes(product.id));
  const badge = unavailable ? null : lowStock ? 'Low stock' : compareAt && compareAt > price ? 'Sale' : product.bestSeller ? 'Best seller' : product.newArrival ? 'New' : null;
  const selectVariant = (next: ProductVariant) => { setSelectedId(next.id); setImageIndex(0); setQuantity(1); setFeedback(''); };
  const moveImage = (direction: number) => { if (gallery.length > 1) setImageIndex(current => (current + direction + gallery.length) % gallery.length); };
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    // GSAP registration is idempotent; the shared sky normally registers first.
    if (!(gsap.core as typeof gsap.core & { globals: () => Record<string, unknown> }).globals().ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        gsap.from('.pdp-gallery', { y: 30, opacity: 0, scale: .985, duration: .85, clearProps: 'all' });
        gsap.from('.pdp-purchase > *', { y: 20, opacity: 0, duration: .6, stagger: .065, clearProps: 'all' });
        gsap.from('.pdp-breadcrumb', { y: 8, opacity: 0, duration: .55, clearProps: 'all' });
        if (element.querySelector('.pdp-related')) gsap.from('.pdp-related-card', { y: 30, opacity: 0, stagger: .08, duration: .7, clearProps: 'all', scrollTrigger: { trigger: '.pdp-related', start: 'top 88%', once: true } });
        gsap.from('.pdp-reviews', { y: 24, duration: .7, clearProps: 'all', scrollTrigger: { trigger: '.pdp-reviews', start: 'top 90%', once: true } });

      }, element);
      return () => context.revert();
    });
    return () => media.revert();
  }, [product.id]);
  const addToBag = () => {
    if (!variant || unavailable) return;
    if (quantity > capacity) { setFeedback(capacity ? `You can add ${capacity} more to your bag.` : 'The available quantity is already in your bag.'); return; }
    for (let i = 0; i < quantity; i++) add(product, variant);
    setQuantity(Math.max(1, Math.min(quantity, capacity - quantity)));
    setFeedback(`${quantity} ${quantity === 1 ? 'companion' : 'companions'} added to your bag.`);
  };
  return <div className="pdp" ref={root}>
    <div className="pdp-atmosphere" aria-hidden="true"><span/><span/><span/><span/><span/></div>
    <div className="pdp-container">
      <nav className="pdp-breadcrumb" aria-label="Breadcrumb"><Link href="/shop">Shop</Link><Icon name="chevron"/>{collection ? <Link href={`/shop?collection=${encodeURIComponent(collection.slug)}`}>{collection.name}</Link> : category ? <Link href={`/shop?category=${encodeURIComponent(category.slug)}`}>{product.category}</Link> : <span>{product.category}</span>}<Icon name="chevron"/><span aria-current="page">{product.name}</span></nav>
      <section className="pdp-layout" aria-labelledby="pdp-title">
        <div className="pdp-gallery-column">
        <div className="pdp-gallery">
          <div className="pdp-stage" onTouchStart={e => { touchStart.current = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY }; }} onTouchEnd={e => { const start = touchStart.current; touchStart.current = null; if (!start || gallery.length < 2) return; const dx = e.changedTouches[0].clientX - start.x; const dy = e.changedTouches[0].clientY - start.y; if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) { e.preventDefault(); moveImage(dx < 0 ? 1 : -1); } }} onTouchCancel={() => { touchStart.current = null; }} onKeyDown={e => { if (e.key === 'ArrowLeft') moveImage(-1); if (e.key === 'ArrowRight') moveImage(1); }}>
            {badge && <span className="pdp-badge">{badge}</span>}
            <button type="button" className="pdp-image-open" onClick={() => dialog.current?.showModal()} aria-label={`View larger image of ${product.name}`}><ProductMedia key={selectedImage} src={selectedImage} sources={gallery} alt={`${product.name}${variant?.color ? ` in ${variant.color}` : ''}`} fit="cover" className="pdp-hero-image" priority sizes="(max-width: 767px) 95vw, 56vw" fallbackTitle={product.name}/></button>
            <button type="button" className="pdp-gallery-heart" aria-pressed={saved} aria-label={`${saved ? 'Unsave' : 'Save'} ${product.name}`} onClick={() => toggleWishlist(product.id)}><Icon name="heart"/></button>
            {gallery.length > 1 && <><button type="button" className="pdp-gallery-arrow pdp-prev" aria-label="Previous product image" onClick={() => moveImage(-1)}><Icon name="chevron"/></button><button type="button" className="pdp-gallery-arrow pdp-next" aria-label="Next product image" onClick={() => moveImage(1)}><Icon name="chevron"/></button><span className="pdp-image-count" aria-live="polite">{imageIndex + 1} / {gallery.length}</span></>}
            <button type="button" className="pdp-zoom" onClick={() => dialog.current?.showModal()} aria-label="Enlarge product image"><Icon name="zoom"/></button>
          </div>
          {gallery.length > 1 && <div className="pdp-thumbs" role="group" aria-label="Product images">{gallery.map((image, i) => <button type="button" key={image} aria-label={`View ${product.name}, image ${i + 1}`} aria-pressed={i === imageIndex} onClick={() => setImageIndex(i)}><ProductMedia src={image} alt={`${product.name}, view ${i + 1}`} fit="cover"/></button>)}</div>}
        </div>
      {relatedProducts.length > 0 && <section className="pdp-related" aria-labelledby="pdp-related-title">
          <div className="pdp-section-heading"><h2 id="pdp-related-title"><span><Icon name="heart"/></span>You may also love</h2><Link href="/shop">View all <span aria-hidden="true">→</span></Link></div>
          <div className="pdp-related-grid" style={{ '--pdp-related-count': Math.min(4, relatedProducts.filter(p => p.id !== product.id).length) } as React.CSSProperties}>{relatedProducts.filter(p => p.id !== product.id).slice(0, 4).map(p => <article className="pdp-related-card" key={p.id}>
            <div className="pdp-related-image"><Link href={`/product/${p.slug}`} aria-label={`View ${p.name}`}><ProductMedia product={p} alt={p.name} fit="cover"/></Link><button type="button" className="pdp-related-heart" aria-pressed={wishlistIds.includes(p.id)} aria-label={`${wishlistIds.includes(p.id) ? 'Unsave' : 'Save'} ${p.name}`} onClick={() => toggleWishlist(p.id)}><Icon name="heart"/></button></div>
            <Link href={`/product/${p.slug}`}><h3>{p.name}</h3><span>{money(getProductVariants(p)[0]?.price ?? p.price)}</span></Link>
          </article>)}</div>
        </section>}
        </div>
        <div className="pdp-purchase-column">
        <div className="pdp-purchase">
          <p className="pdp-eyebrow">{collection?.name ?? product.category}</p>
          <h1 id="pdp-title">{product.name}</h1>
          <a href="#customer-love" className="pdp-review-link">{summary ? summary.count ? <><span className="pdp-stars" aria-label={`${summary.average.toFixed(1)} out of 5 stars`}>{'★'.repeat(Math.round(summary.average))}{'☆'.repeat(5 - Math.round(summary.average))}</span><span>({summary.count} reviews)</span></> : 'No reviews yet' : 'Read customer reviews'}<span aria-hidden="true">↗</span></a>
          <div className="pdp-price"><strong>{money(price)}</strong>{compareAt && compareAt > price ? <del>{money(compareAt)}</del> : null}</div>
          <p className="pdp-description">{product.shortDescription || (product.description.length > 220 ? `${product.description.slice(0, 217).replace(/\s+\S*$/, '')}…` : product.description)}</p>
          {variants.length > 0 && <div className="pdp-variants"><div className="pdp-field-heading"><span>Colour</span><strong>{variant?.color}</strong></div><div className="pdp-variant-options" role="group" aria-label="Choose a colour">{variants.map(v => <button type="button" key={v.id} aria-pressed={v.id === variant?.id} onClick={() => selectVariant(v)}><ProductMedia src={v.image || product.image} alt={`${product.name} in ${v.color}`} fit="contain"/><span>{v.color}{(v.stock === undefined || v.stock <= 0) && <small>Unavailable</small>}</span></button>)}</div></div>}
          <p className={`pdp-stock ${unavailable ? 'is-unavailable' : lowStock ? 'is-low' : ''}`}><span className="pdp-stock-dot" aria-hidden="true"/>{unavailable ? 'Currently unavailable' : lowStock ? `Only ${variant.stock} left` : 'In stock'}<small>{unavailable ? 'Explore more companions below.' : 'Ready to ship'}</small></p>
          <div className="pdp-actions"><div className="pdp-quantity" role="group" aria-label="Quantity"><button type="button" aria-label="Decrease quantity" disabled={unavailable || quantity <= 1} onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button><output aria-live="polite">{quantity}</output><button type="button" aria-label="Increase quantity" disabled={unavailable || quantity >= capacity} onClick={() => setQuantity(q => Math.min(capacity, q + 1))}>+</button></div><button type="button" className="pdp-add" disabled={unavailable || capacity === 0} onClick={addToBag}><Icon name="bag"/>{unavailable ? 'Currently unavailable' : capacity === 0 ? 'Already in your bag' : 'Add to bag'}</button></div>
          <button type="button" className="pdp-wishlist" aria-pressed={saved} onClick={() => toggleWishlist(product.id)}><Icon name="heart"/>{saved ? 'Added to wishlist' : 'Add to wishlist'}</button>
          {feedback && <div className="pdp-bag-feedback"><p role="status">{feedback}</p><Link href="/cart">View bag <span aria-hidden="true">↗</span></Link></div>}
          <div className="pdp-benefits"><span><Icon name="truck"/>Islandwide delivery</span><span><Icon name="shield"/>Secure checkout</span><span><Icon name="gift"/>Carefully packed</span></div>
        </div>
        <div className="pdp-accordions"><Accordion title="Product Details" icon="details"><p>{product.description}</p><ul>{(product.details ?? []).map(detail => <li key={detail}>{detail}</li>)}</ul><dl><div><dt>Colour</dt><dd>{variant?.color || product.color}</dd></div>{variant?.sku && <div><dt>SKU</dt><dd>{variant.sku}</dd></div>}</dl></Accordion><Accordion title="Care Instructions" icon="heart"><p>{(product.details ?? []).filter(d => /wash|care|clean|machine|hand.?wash/i.test(d)).join('. ') || 'Follow the care label supplied with your companion. For product-specific care advice, please contact our team.'}</p><Link href="/contact">Ask about care →</Link></Accordion><Accordion title="Delivery Information" icon="truck"><p>Delivery charges for your address are calculated at checkout. For delivery timing and assistance with your order, contact our team.</p><Link href="/contact">Delivery enquiries →</Link></Accordion><Accordion title="Returns & Exchanges" icon="return"><p>Need help with an item you received? Contact us with your order details so our team can advise on returns or exchanges.</p><Link href="/contact">Get help with your order →</Link></Accordion></div>
        </div>
      </section>
      <ProductReviews productId={product.id} onSummary={setSummary}/>
    </div>
    <dialog ref={dialog} className="pdp-lightbox" aria-label={`${product.name} image viewer`} onClick={e => { if (e.target === e.currentTarget) dialog.current?.close(); }} onKeyDown={e => { if (e.key === 'ArrowLeft') moveImage(-1); if (e.key === 'ArrowRight') moveImage(1); }}><button type="button" className="pdp-lightbox-close" onClick={() => dialog.current?.close()} aria-label="Close image viewer">×</button><ProductMedia src={selectedImage} sources={gallery} alt={`${product.name} in ${variant?.color ?? product.color}`} fit="contain"/>{gallery.length > 1 && <div className="pdp-lightbox-controls"><button type="button" onClick={() => moveImage(-1)}>← Previous</button><span>{imageIndex + 1} / {gallery.length}</span><button type="button" onClick={() => moveImage(1)}>Next →</button></div>}</dialog>
  </div>;
}
