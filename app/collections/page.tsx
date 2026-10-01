import type { Metadata } from 'next';
import Link from 'next/link';
import { getStorefront } from '@/lib/storefront';
import { CollectionsDiscoveryMotion } from '@/components/collections-discovery-motion';
import { HomeSmoothScroll } from '@/components/home-smooth-scroll';
import styles from './collections.module.css';

export const metadata: Metadata = {
  title: 'Collections',
  description: 'Find your soft companion. Discover Teddy & Classic Cuddles, Bunny & Sweet Friends, and Wild & Wonderful at SoftHaven.',
};

const campaigns = [
  { slug: 'teddy-classic-cuddles', art: 'teddy', icon: 'sparkle', description: 'Timeless companions for everyday hugs.', alt: 'A caramel teddy with a lavender satin bow resting among pastel clouds' },
  { slug: 'bunny-sweet-friends', art: 'bunny', icon: 'heart', description: 'Gentle little personalities for peaceful moments.', alt: 'A cream bunny with long floppy ears and a pink bow nestled in soft clouds' },
  { slug: 'wild-wonderful', art: 'lion', icon: 'leaf', description: 'Playful characters with big imaginations.', alt: 'A golden plush lion with a soft caramel mane resting on pastel clouds' },
] as const;

function CollectionIcon({ type }: { type: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {type === 'heart' ? <path d="M20.8 8.7c0 5.2-8.8 10.1-8.8 10.1S3.2 13.9 3.2 8.7A4.4 4.4 0 0 1 11 6.1a4.4 4.4 0 0 1 9.8 2.6Z" /> : type === 'leaf' ? <><path d="M20 4C8 3 3 9 6 16c8 5 14-1 14-12Z" /><path d="M4 21 16 9" /></> : <path d="m12 3 2.1 6.9L21 12l-6.9 2.1L12 21l-2.1-6.9L3 12l6.9-2.1L12 3Z" />}
  </svg>;
}

export default async function CollectionsPage() {
  const { collections } = await getStorefront();
  const featured = campaigns.flatMap((campaign) => {
    const collection = collections.find((item) => item.slug === campaign.slug);
    return collection ? [{ ...campaign, collection }] : [];
  });
  return (
    <div className={styles.page} data-collections-page>
      <HomeSmoothScroll />
      <CollectionsDiscoveryMotion>
        <section className={styles.discovery} aria-labelledby="collections-title">
          <div className={styles.intro}>
            <span className={styles.eyebrow} data-collection-enter>Meet the collection <i aria-hidden="true" /></span>
            <h1 id="collections-title"><span data-collection-enter>Find your soft</span><em data-collection-enter>companion.</em></h1>
            <p data-collection-enter>From timeless teddy bears to playful personalities, discover a <span>SoftHaven</span> friend made for every kind of moment.</p>
            <Link className={styles.primaryButton} href="#collection-list" data-collection-enter>Explore all collections <span aria-hidden="true">→</span></Link>
            <ul className={styles.benefits} aria-label="The SoftHaven promise">
              {[['heart', 'Thoughtful designs'], ['leaf', 'Premium materials'], ['sparkle', 'Made with love']].map(([icon, text]) => <li key={text} data-collection-enter><span><CollectionIcon type={icon} /></span>{text}</li>)}
            </ul>
          </div>
          <div className={styles.composition} aria-label="Featured collection families">
            {featured.map(({ collection, art, description, alt, icon }, index) => <div className={styles.cardEntrance} key={collection.slug} data-collection-card>
              <Link className={`${styles.card} ${index === 0 ? styles.heroCard : styles.smallCard}`} href={`/shop?collection=${encodeURIComponent(collection.slug)}`} aria-label={`Explore ${collection.name}`} data-collection={collection.slug}>
                <span className={styles.media} data-collection-image>
                  <picture>
                    <source media="(max-width: 767px)" srcSet={`/assets/collections/discovery/${art}-mobile.webp`} />
                    <img src={`/assets/collections/discovery/${art}.webp`} alt={alt} width={art === 'teddy' ? 1536 : 1254} height={art === 'teddy' ? 768 : 1254} loading={index === 0 ? 'eager' : 'lazy'} fetchPriority={index === 0 ? 'high' : 'auto'} decoding="async" />
                  </picture>
                </span>
                <span className={styles.cardCopy}>
                  <span className={styles.cardNumber}>0{index + 1}<CollectionIcon type={icon} /></span>
                  <h2>{index === 0 && collection.name.includes('&') ? <>{collection.name.split('&')[0]}&<br />{collection.name.split('&').slice(1).join('&').trim()}</> : collection.name}</h2>
                  <span className={styles.cardDescription}>{description}</span>
                  <span className={styles.cardCta}>Explore collection <span aria-hidden="true">→</span></span>
                </span>
              </Link>
            </div>)}
          </div>
        </section>
        <section className={styles.directory} id="collection-list" aria-labelledby="collection-list-title">
          <div><span className={styles.eyebrow}>More to discover <i aria-hidden="true" /></span><h2 id="collection-list-title">Every kind of <em>soft.</em></h2><p>Find the family that feels like you.</p></div>
          <nav aria-label="All SoftHaven collections">{collections.map((collection, index) => <Link href={`/shop?collection=${encodeURIComponent(collection.slug)}`} key={collection.slug}><span className={styles.directoryNumber}>{String(index + 1).padStart(2, '0')}</span><span>{collection.name}</span><span aria-hidden="true">↗</span></Link>)}</nav>
        </section>
      </CollectionsDiscoveryMotion>
    </div>
  );
}
