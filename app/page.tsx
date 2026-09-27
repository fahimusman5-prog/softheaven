import Link from 'next/link';
import { images, products } from '@/lib/data';
import { ProductCard } from '@/components/product-card';
import { SectionReveal } from '@/components/section-reveal';
import { PortraitHeroCarousel, PortraitHeroSlide } from '@/components/portrait-hero-carousel';
import { PerfectMatch } from '@/components/perfect-match';
import { HomeMotion } from '@/components/home-motion';
import { HomeCategoryMarquee } from '@/components/home-category-marquee';
import { HomeTestimonialCarousel } from '@/components/home-testimonial-carousel';
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
  <SectionReveal><div className="trust-row"><div><BenefitIcon type="quality"/><strong>Premium Quality</strong><span>Made for better hugs</span></div><div><BenefitIcon type="selected"/><strong>Carefully Selected</strong><span>Curated with intention</span></div><div><BenefitIcon type="gift"/><strong>Gift-Ready Box</strong><span>Beautifully wrapped</span></div><div><BenefitIcon type="gift"/><strong>Love &amp; Gifting</strong><span>Thoughtful keepsakes</span></div></div></SectionReveal>
  <SectionReveal><HomeCategoryMarquee /></SectionReveal>
  <SectionReveal><PerfectMatch /></SectionReveal>
  <SectionReveal><section className="section"><div className="section-heading"><div><span className="eyebrow">A considered edit</span><h2>SoftHaven Favourites</h2><p>Meet the companions in our collection.</p></div><Link className="filter-pill" href="/shop">Explore the collection <span aria-hidden="true">→</span></Link></div><div className="product-grid home-product-grid">{products.map((product) => <ProductCard key={product.id} product={product} imageClassName="home-motion-image"/>)}</div></section></SectionReveal>
  <SectionReveal><section className="better-hugs home-better-hugs"><div><span className="eyebrow">Crafted for comfort</span><h2>Made for better <span className="home-inline-image"><ProductMedia product={products[0]} alt="" fit="cover"/></span> hugs</h2><p>Every SoftHaven companion is thoughtfully designed to feel as good as it looks.</p><div className="detail-grid">{['Hypoallergenic Fibers','Double-Lock Seams','Micro-Glass Beads','Hand-Embroidered'].map((item) => <div key={item}><h3>{item}</h3><p>Gentle materials and considered finishing, made to last.</p></div>)}</div></div><aside className="home-hug-note"><span className="eyebrow">Designed for slow moments</span><p>Grounded softness for slower evenings, and hugs you can keep.</p></aside></section></SectionReveal>
  <SectionReveal><OccasionGift products={products}/></SectionReveal>
  <SectionReveal><section className="testimonial-section home-testimonials"><span className="eyebrow">A softer kind of company</span><h2>Meet your new companion</h2><HomeTestimonialCarousel products={products}/></section></SectionReveal>
  <section className="society home-society"><span className="eyebrow">A softer community</span><h2>Join the Keepsake Society</h2><p>Receive first access to new companions, quiet gifting notes,<br/>and invitations from the SoftHaven atelier.</p><Link className="primary-button" href="/contact">Join the society <span aria-hidden="true">→</span></Link></section>
 </div></HomeMotion>; }
