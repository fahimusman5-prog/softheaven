import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { images, products } from '@/lib/data';
import { siteConfig } from '@/lib/site-config';

type IconName = 'arrow' | 'heart' | 'instagram' | 'mail' | 'message' | 'play' | 'tiktok';

function Icon({ name }: { name: IconName }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, strokeWidth: 1.7 };
  if (name === 'arrow') return <svg viewBox="0 0 24 24" aria-hidden="true"><path {...common} d="M4 12h15m-6-6 6 6-6 6" /></svg>;
  if (name === 'heart') return <svg viewBox="0 0 24 24" aria-hidden="true"><path {...common} d="M20.8 8.8c0 5.4-8.8 10-8.8 10S3.2 14.2 3.2 8.8A4.7 4.7 0 0 1 12 6.1a4.7 4.7 0 0 1 8.8 2.7Z" /></svg>;
  if (name === 'instagram') return <svg viewBox="0 0 24 24" aria-hidden="true"><rect {...common} x="3.5" y="3.5" width="17" height="17" rx="5" /><circle {...common} cx="12" cy="12" r="4" /><circle cx="17.4" cy="6.8" r="1" fill="currentColor" /></svg>;
  if (name === 'mail') return <svg viewBox="0 0 24 24" aria-hidden="true"><rect {...common} x="3.5" y="5.5" width="17" height="13" rx="2" /><path {...common} d="m4.5 7 7.5 5.5L19.5 7" /></svg>;
  if (name === 'message') return <svg viewBox="0 0 24 24" aria-hidden="true"><path {...common} d="M19.5 4.5h-15A2.5 2.5 0 0 0 2 7v7.5A2.5 2.5 0 0 0 4.5 17H7v3l4-3h8.5a2.5 2.5 0 0 0 2.5-2.5V7a2.5 2.5 0 0 0-2.5-2.5Z" /><path {...common} d="M7 10.8h.01m5 0h.01m5 0h.01" /></svg>;
  if (name === 'play') return <svg viewBox="0 0 24 24" aria-hidden="true"><path {...common} d="m9 6 8 6-8 6V6Z" /></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path {...common} d="M8 5v14l11-7L8 5Z" /><path {...common} d="M4 5v14" /></svg>;
}

function ImageFrame({ src, alt, className = '', priority = false }: { src: string; alt: string; className?: string; priority?: boolean }) {
  return <div className={`about-image-frame ${className}`}><Image src={src} alt={alt} fill priority={priority} sizes="(max-width: 720px) 90vw, (max-width: 1100px) 46vw, 560px" /></div>;
}

function SectionLabel({ index, children }: { index: string; children: ReactNode }) {
  return <div className="about-section-label"><span>{index}</span><p>{children}</p></div>;
}

function AboutHero() {
  return <section className="about-hero" aria-labelledby="about-title">
    <div className="about-hero__copy">
      <p className="about-kicker">The SoftHaven atelier · {siteConfig.brand.location}</p>
      <h1 id="about-title">A softer kind of <em>happiness.</em></h1>
      <p className="about-hero__lede">ANTZ SoftHaven brings together plush companions, soft animal friends and thoughtful gifts for birthdays, little surprises and everyday comfort.</p>
      <div className="about-actions"><Link href="/shop" className="about-button about-button--primary">Meet the collection <Icon name="arrow" /></Link><Link href="#our-story" className="about-text-link">Read our story <Icon name="arrow" /></Link></div>
      <div className="about-hero__signature"><span className="about-signature-mark"><Icon name="heart" /></span><span>Soft things, chosen with care.</span></div>
    </div>
    <div className="about-hero__visual" aria-label="A selection of SoftHaven plush companions">
      <div className="about-hero__halo" />
      <ImageFrame src={images.bear} alt="Honey caramel teddy bear from the SoftHaven collection" className="about-hero__image about-hero__image--main" priority />
      <ImageFrame src={images.bunny} alt="Cloud cream bunny plush" className="about-hero__image about-hero__image--small" />
      <div className="about-hero__note"><span>Made for</span><strong>better hugs</strong><Icon name="heart" /></div>
      <span className="about-hero__spark about-hero__spark--one" aria-hidden="true" />
      <span className="about-hero__spark about-hero__spark--two" aria-hidden="true" />
    </div>
  </section>;
}

function StorySection() {
  return <section className="about-story about-section" id="our-story" aria-labelledby="story-title">
    <div className="about-story__visual"><ImageFrame src={images.heart} alt="Velvet heart bear gift from SoftHaven" className="about-story__image" /><span className="about-photo-caption">A little warmth, ready to give.</span></div>
    <div className="about-story__copy"><SectionLabel index="01">Our story</SectionLabel><h2 id="story-title">The loveliest things are often the <em>softest.</em></h2><p>SoftHaven is a considered edit of plush companions and giftable keepsakes. We keep the range focused so finding something meaningful feels easy, whether it is for a birthday, a quiet room or someone who could use a little extra comfort.</p><p>Every piece in the catalogue is chosen for the feeling it brings into a space: warmth, calm, playfulness and the kind of familiarity that makes a companion worth keeping.</p><Link href="/shop" className="about-inline-link">Browse the companions <Icon name="arrow" /></Link></div>
  </section>;
}

const principles = [
  ['01', 'Curated, never crowded', 'A small edit makes room for better choices and more personal gifting.'],
  ['02', 'Made for feeling', 'Soft textures, comforting shapes and friendly faces belong in everyday life.'],
  ['03', 'Gifting with intention', 'A companion can say what a card cannot: I thought of you.'],
  ['04', 'A warmer room', 'The right plush friend changes the mood of a shelf, a bed or a whole day.'],
];

function PrinciplesSection() {
  return <section className="about-principles about-section" aria-labelledby="principles-title">
    <div className="about-principles__intro"><SectionLabel index="02">Why SoftHaven</SectionLabel><h2 id="principles-title">Small details. <em>Big comfort.</em></h2><p>We are here for the soft side of life—the pieces that make a gift feel more personal and a room feel more like home.</p></div>
    <div className="about-principles__list">{principles.map(([index, title, text]) => <article className="about-principle" key={index}><span>{index}</span><div><h3>{title}</h3><p>{text}</p></div><Icon name="arrow" /></article>)}</div>
  </section>;
}

function QualitySection() {
  const qualityDetails = products[0]?.details.slice(0, 3) ?? [];
  return <section className="about-quality about-section" aria-labelledby="quality-title">
    <div className="about-quality__visual"><ImageFrame src={images.bear} alt="Close view of a SoftHaven caramel teddy bear" className="about-quality__image" /><span className="about-quality__stamp">SoftHaven<br /><small>chosen for comfort</small></span></div>
    <div className="about-quality__copy"><SectionLabel index="03">The SoftHaven standard</SectionLabel><h2 id="quality-title">Good design should feel good <em>in the hand.</em></h2><p>We look for the quiet things that turn a plush toy into a lasting companion: a comforting touch, a friendly expression and details that feel considered up close.</p><ul className="about-detail-list">{qualityDetails.map((detail) => <li key={detail}><span aria-hidden="true">✦</span>{detail}</li>)}</ul><Link href="/shop" className="about-inline-link">See the details <Icon name="arrow" /></Link></div>
  </section>;
}

const categoryColors = ['peach', 'sage', 'lilac'];
function CollectionSection() {
  const collections = Array.from(new Map(products.map((product) => [product.category, product])).values());
  return <section className="about-collections about-section" id="collections" aria-labelledby="collections-title">
    <div className="about-section-heading"><div><SectionLabel index="04">Find your soft side</SectionLabel><h2 id="collections-title">A companion for <em>every feeling.</em></h2></div><Link href="/shop" className="about-inline-link">View all <Icon name="arrow" /></Link></div>
    <div className="about-collection-grid">{collections.map((product, index) => <Link href={`/shop?category=${encodeURIComponent(product.category)}`} className={`about-collection about-collection--${categoryColors[index % categoryColors.length]}`} key={product.category}><div className="about-collection__image"><Image src={product.image} alt={product.name} fill sizes="(max-width: 720px) 82vw, 30vw" /></div><div className="about-collection__copy"><span>{product.category}</span><h3>{product.name.replace(/^The /, '')}</h3><p>{product.description}</p><strong>Explore <Icon name="arrow" /></strong></div></Link>)}</div>
  </section>;
}

function DeliverySection() {
  return <section className="about-delivery about-section" aria-labelledby="delivery-title"><div className="about-delivery__copy"><SectionLabel index="05">A softer way to order</SectionLabel><h2 id="delivery-title">From SoftHaven to <em>your door.</em></h2><p>Choose a companion, add it to your bag and share your delivery details through the checkout flow. If you need a little guidance, our care team is ready to help.</p><Link href="/contact" className="about-button about-button--secondary">Talk to the concierge <Icon name="arrow" /></Link></div><div className="about-delivery__steps"><div><span>01</span><strong>Choose your companion</strong><p>Browse the current collection and find the feeling that fits.</p></div><div><span>02</span><strong>Make it personal</strong><p>Send it as a considered gift or keep it close for yourself.</p></div><div><span>03</span><strong>We keep it simple</strong><p>Questions about an order or delivery belong in the contact room.</p></div></div></section>;
}

function PromiseSection() {
  return <section className="about-promise about-section" aria-labelledby="promise-title"><div className="about-promise__heading"><SectionLabel index="06">Our promise</SectionLabel><h2 id="promise-title">Keep the good things <em>close.</em></h2></div><div className="about-promise__body"><p>We want choosing a SoftHaven companion to feel clear, warm and easy—from the first image to the moment it becomes part of someone&apos;s everyday.</p><div className="about-promise__values"><span>Quality</span><span>Choice</span><span>Care</span></div></div></section>;
}

type SocialKey = 'whatsapp' | 'instagram' | 'tiktok' | 'email';
const socialDetails: Array<{ key: SocialKey; label: string; icon: IconName; href: string | null; detail: string }> = [
  { key: 'whatsapp', label: 'WhatsApp', icon: 'message', href: siteConfig.social.whatsapp, detail: siteConfig.social.whatsapp ? 'Chat with SoftHaven' : 'Not configured yet' },
  { key: 'instagram', label: 'Instagram', icon: 'instagram', href: siteConfig.social.instagram, detail: siteConfig.social.instagram ? 'Follow the soft side' : 'Not configured yet' },
  { key: 'tiktok', label: 'TikTok', icon: 'tiktok', href: siteConfig.social.tiktok, detail: siteConfig.social.tiktok ? 'See the companions in motion' : 'Not configured yet' },
  { key: 'email', label: 'Email', icon: 'mail', href: siteConfig.contact.email ? `mailto:${siteConfig.contact.email}` : null, detail: siteConfig.contact.email ?? 'Not configured yet' },
];

function SocialLink({ item }: { item: typeof socialDetails[number] }) {
  const href = item.href ?? '/contact';
  const common = <><span className="about-social__icon"><Icon name={item.icon} /></span><span><strong>{item.label}</strong><small>{item.detail}</small></span><Icon name="arrow" /></>;
  return item.href?.startsWith('http') ? <a className="about-social" href={href} target="_blank" rel="noreferrer">{common}</a> : <Link className="about-social" href={href}>{common}</Link>;
}

function ConnectSection() {
  return <section className="about-connect about-section" aria-labelledby="connect-title"><div className="about-connect__copy"><SectionLabel index="07">Stay close</SectionLabel><h2 id="connect-title">A little more softness, <em>now and then.</em></h2><p>For gifting guidance, delivery questions or a hello from the atelier, find the channel that feels easiest.</p><Link href="/contact" className="about-text-link">Visit the contact room <Icon name="arrow" /></Link></div><div className="about-social-grid">{socialDetails.map((item) => <SocialLink item={item} key={item.key} />)}</div></section>;
}

function FinalCta() {
  return <section className="about-final-cta" aria-labelledby="final-cta-title"><div className="about-final-cta__image"><Image src={images.heart} alt="Heart-shaped plush gift from SoftHaven" fill sizes="(max-width: 720px) 90vw, 420px" /></div><div><p className="about-kicker">Ready when you are</p><h2 id="final-cta-title">Bring home a little <em>more love.</em></h2><p>Meet the current SoftHaven companions and choose the one that feels like yours.</p><div className="about-actions"><Link href="/shop" className="about-button about-button--primary">Explore the collection <Icon name="arrow" /></Link><Link href="/contact" className="about-text-link">Ask a question <Icon name="arrow" /></Link></div></div></section>;
}

export function AboutPage() {
  return <div className="about-experience"><AboutHero /><StorySection /><PrinciplesSection /><QualitySection /><CollectionSection /><DeliverySection /><PromiseSection /><ConnectSection /><FinalCta /></div>;
}
