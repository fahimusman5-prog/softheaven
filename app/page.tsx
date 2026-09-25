import Link from 'next/link';
import { images, products } from '@/lib/data';
import { ProductCard } from '@/components/product-card';
import { SectionReveal } from '@/components/section-reveal';
import { PortraitHeroCarousel, PortraitHeroSlide } from '@/components/portrait-hero-carousel';
import { PerfectMatch } from '@/components/perfect-match';

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

function CloudMoment({ variant }: { variant: 'hero' | 'favourites' | 'community' }) {
  const asset = variant === 'hero' || variant === 'community'
    ? '/assets/clouds/cloud-bank.webp'
    : '/assets/clouds/cloud-cluster.webp';

  return <span className={`soft-sky__moment soft-sky__moment--${variant}`} aria-hidden="true">
    <span className="soft-sky__moment-scroll" data-sky-transition-scroll>
      <span className="soft-sky__moment-drift" data-sky-transition-drift data-drift-x={variant === 'favourites' ? -24 : 20}>
        <img className="soft-sky__moment-cloud" src={asset} alt="" width="900" height="460" decoding="async" loading={variant === 'hero' ? 'eager' : 'lazy'} />
      </span>
    </span>
  </span>;
}

export default function HomePage() { return <>
  <section className="hero-portrait sky-moment-host" data-sky-host="hero"><CloudMoment variant="hero"/><div className="hero-portrait__copy"><span className="eyebrow">Handcrafted with love</span><h1>More Than Toys,<br/><em>More Love</em> <span className="hero-heart" aria-hidden="true">♡</span></h1><p>Discover our collection of soft companions, made to bring warmth, joy, and comfort to every moment.</p></div><PortraitHeroCarousel slides={carouselSlides}/></section>
  <SectionReveal><div className="trust-row"><div><BenefitIcon type="quality"/><strong>Premium Quality</strong><span>Made for better hugs</span></div><div><BenefitIcon type="selected"/><strong>Carefully Selected</strong><span>Curated with intention</span></div><div><BenefitIcon type="gift"/><strong>Gift-Ready Box</strong><span>Beautifully wrapped</span></div><div><BenefitIcon type="delivery"/><strong>Global Delivery</strong><span>Softness, worldwide</span></div></div></SectionReveal>
  <SectionReveal><PerfectMatch /></SectionReveal>
  <SectionReveal><section className="section sky-moment-host" data-sky-host="favourites"><CloudMoment variant="favourites"/><div className="section-heading"><div><span className="eyebrow">The ones everyone keeps talking about</span><h2>SoftHaven Favourites</h2><p>A quiet edit of our most-loved companions.</p></div><span className="filter-pill">All Favourites　⌄</span></div><div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product}/>)}</div></section></SectionReveal>
  <SectionReveal><section className="better-hugs"><div><span className="eyebrow">Crafted for comfort</span><h2>Made for Better Hugs</h2><p>Every SoftHaven companion is thoughtfully designed to feel as good as it looks.</p><div className="detail-grid">{['Hypoallergenic Fibers','Double-Lock Seams','Micro-Glass Beads','Hand-Embroidered'].map((item, i) => <div key={item}><b>0{i + 1}</b><h3>{item}</h3><p>Gentle materials and considered finishing, made to last.</p></div>)}</div></div><blockquote>“The weight, the softness, the tiny details — it feels like a hug you can keep.”<cite>— Sophie, verified collector</cite></blockquote></section></SectionReveal>
  <SectionReveal><section className="gift-feature"><div className="section-heading"><div><span className="eyebrow">Choose by feeling</span><h2>Find the Perfect Soft Gift</h2><p>For birthdays, new beginnings, or simply because.</p></div><div className="occasion-tabs"><button className="active">Warmth</button><button>Celebration</button><button>Comfort</button><button>Just because</button></div></div><div className="gift-panel"><div><span className="eyebrow">The Eternal Warmth Keepsake Box</span><h3>A little luxury,<br/><em>beautifully held.</em></h3><p>A thoughtful edit with everything they need to feel wrapped in your care.</p><Link className="primary-button" href="/product/aurelius-heritage-bear">Build the keepsake box →</Link></div><img src={images.gift} alt="Eternal Warmth Keepsake Box" data-sky-editorial-image/></div></section></SectionReveal>
  <SectionReveal><section className="testimonial-section sky-moment-host" data-sky-host="community"><CloudMoment variant="community"/><span className="eyebrow">Loved by 8,400+ collectors</span><h2>Hugs Around the World</h2><div className="quotes"><blockquote>“Brought tears to my sister&apos;s eyes.”<cite>— Eleanor L.</cite></blockquote><blockquote>“Architectural luxury for the bedroom.”<cite>— Marcus K.</cite></blockquote><blockquote>“The weighted calming touch really works.”<cite>— Claire L.</cite></blockquote></div></section></SectionReveal>
  <section className="society"><span className="eyebrow">A softer community</span><h2>Join the Keepsake Society</h2><p>Receive first access to new companions, quiet gifting notes,<br/>and invitations from the SoftHaven atelier.</p><Link className="primary-button" href="/contact">Join the society →</Link></section>
 </>; }
