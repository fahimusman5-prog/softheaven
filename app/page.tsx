import Link from 'next/link';
import { images, products } from '@/lib/data';
import { ProductCard } from '@/components/product-card';
import { SectionReveal } from '@/components/section-reveal';
import { PortraitHeroCarousel, PortraitHeroSlide } from '@/components/portrait-hero-carousel';
import { HomeMotion } from '@/components/home-motion';
import { HomeCollections } from '@/components/home-collections';
import { HomeEditorialStory } from '@/components/home-editorial-story';
import { OccasionGift } from '@/components/occasion-gift';
import { ProductMedia } from '@/components/product-media';

const carouselSlides: PortraitHeroSlide[] = [
  { id: 'aurelius-hero', image: images.bear, name: products[0].name, descriptor: 'A timeless companion for every hug.', category: 'Classic teddy' },
  { id: 'amour-hero', image: images.heart, name: products[3].name, descriptor: 'A velvet-hearted keepsake.', category: 'Love and gifting' },
  { id: 'celeste-hero', image: images.bunny, name: products[1].name, descriptor: 'A cloud-soft companion for tender days.', category: 'Soft animal friend' },
  { id: 'oliver-hero', image: images.sloth, name: products[2].name, descriptor: 'The gentle reminder to take it slow.', category: 'Soft animal friend' },
  { id: 'keepsake-hero', image: images.gift, name: 'Eternal Warmth Keepsake Box', descriptor: 'A little luxury, beautifully held.', category: 'Gift-ready edit' },
  { id: 'aurelius-hero-detail', image: images.bear, name: products[0].name, descriptor: 'Grounded softness for slower evenings.', category: 'Heritage archive' },
  { id: 'celeste-hero-detail', image: images.bunny, name: products[1].name, descriptor: 'Made for room-filling tenderness.', category: 'New arrival' },
];

function BenefitIcon({ type }: { type: 'quality' | 'selected' | 'gift' | 'delivery' }) {
  if (type === 'quality') return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.1 5.4 5.9.4-4.5 3.8 1.4 5.8-4.9-3.1-4.9 3.1 1.4-5.8L4 8.8l5.9-.4L12 3Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5" /></svg>;
  if (type === 'selected') return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4.5h14v15H5zM8 8h8M8 12h8M8 16h4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" /></svg>;
  if (type === 'gift') return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10h16v10H4zM3 7h18v3H3zM12 7v13M12 7H8.7a2.2 2.2 0 1 1 2.2-2.2L12 7Zm0 0h3.3a2.2 2.2 0 1 0-2.2-2.2L12 7Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5" /></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 8.5h11v8h-11zM14.5 11h3l3 3v2.5h-6zM7 19a1.6 1.6 0 1 0 0-3.2A1.6 1.6 0 0 0 7 19Zm11 0a1.6 1.6 0 1 0 0-3.2A1.6 1.6 0 0 0 18 19Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5" /></svg>;
}

export default function HomePage() { return <HomeMotion><div className="home-page">
  <section className="hero-portrait"><div className="hero-portrait__copy"><span className="eyebrow">Handcrafted with love</span><h1>More Than Toys,<br/><em>More Love</em></h1><p>Discover our collection of soft companions, made to bring warmth, joy, and comfort to every moment.</p></div><PortraitHeroCarousel slides={carouselSlides}/></section>
  <SectionReveal><div className="trust-row home-trust-row"><div><BenefitIcon type="quality"/><strong>Soft companions</strong><span>Meet the collection</span></div><div><BenefitIcon type="selected"/><strong>Animal friends</strong><span>Find your favourite</span></div><div><BenefitIcon type="gift"/><strong>Love &amp; gifting</strong><span>Thoughtful keepsakes</span></div><div><BenefitIcon type="gift"/><strong>Teddy bears</strong><span>Explore classic hugs</span></div></div></SectionReveal>
  <SectionReveal><HomeCollections /></SectionReveal>
  <SectionReveal><section className="section"><div className="section-heading"><div><span className="eyebrow">A considered edit</span><h2>SoftHaven Favourites</h2><p>Meet the companions in our collection.</p></div><Link className="filter-pill" href="/shop">Explore the collection <span aria-hidden="true">→</span></Link></div><div className="product-grid home-product-grid">{products.map((product) => <ProductCard key={product.id} product={product} imageClassName="home-motion-image"/>)}</div></section></SectionReveal>
  <SectionReveal><section className="better-hugs home-better-hugs" aria-labelledby="home-better-hugs-title"><div className="home-better-hugs__copy"><span className="eyebrow">The feeling of SoftHaven</span><h2 id="home-better-hugs-title">Made for better hugs</h2><p>Soft companions for slower evenings, thoughtful gifts and little moments worth keeping close.</p><ul className="home-better-hugs__benefits"><li><span aria-hidden="true">♡</span><div><strong>Everyday softness</strong><small>A companion to keep close.</small></div></li><li><span aria-hidden="true">✳</span><div><strong>Thoughtful gifting</strong><small>Find a plush for someone special.</small></div></li><li><span aria-hidden="true">⌂</span><div><strong>A little more comfort</strong><small>Discover a favourite for home.</small></div></li></ul><Link className="text-button" href="/shop">Explore the collection <span aria-hidden="true">→</span></Link></div><div className="home-better-hugs__visual" data-sky-editorial-image><ProductMedia product={products[1]} alt={products[1].name} fit="cover" fill sizes="(max-width: 700px) 92vw, (max-width: 1100px) 48vw, 600px" className="home-better-hugs__image"/><span className="home-better-hugs__caption">{products[1].name}</span></div></section></SectionReveal>
  <SectionReveal><OccasionGift products={products}/></SectionReveal>
  <SectionReveal><HomeEditorialStory product={products[2]} /></SectionReveal>
  <section className="society home-society"><span className="eyebrow">Your next little favourite</span><h2>A softer day starts here</h2><p>Take a look around and find the companion that feels right for you.</p><Link className="primary-button" href="/shop">Explore SoftHaven <span aria-hidden="true">→</span></Link></section>
 </div></HomeMotion>; }
