import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { SectionReveal } from '@/components/section-reveal';
import { ProductMedia } from '@/components/product-media';
import { products } from '@/lib/data';
import { CollectionsMotion } from '@/components/collections-motion';
import { SoftHavenForThat } from '@/components/soft-haven-for-that';
import { collections, getCollectionProducts } from '@/lib/collections';
import styles from './collections.module.css';

export const metadata: Metadata = {
  title: 'Collections | SoftHaven',
  description: 'Explore SoftHaven plush companions for thoughtful gifts, quiet comforts, and everyday moments.',
};

const benefits = [
  { icon: '♡', title: 'Thoughtful Selection', copy: 'Companions chosen for the moments that matter.' },
  { icon: '✧', title: 'Made for Meaningful Moments', copy: 'A little softness to share, keep, or give.' },
  { icon: '▧', title: 'Perfect for Gifting', copy: 'Find a thoughtful gift for someone you love.' },
  { icon: '⌂', title: 'Made for Everyone', copy: 'Comfort and joy have no age limit.' },
];

export default function CollectionsPage() {
  const love = products.find((product) => product.id === 'amour') ?? products[0];
  const bunny = products.find((product) => product.id === 'celeste') ?? products[0];
  const sloth = products.find((product) => product.id === 'oliver') ?? products[0];
  const featuredCollections = collections.filter((collection) => collection.featured);
  const moreCollections = collections.filter((collection) => !collection.featured);

  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="collections-title">
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}>Our collections</span>
          <h1 id="collections-title">Find Your<br />Kind of <em>Soft.</em></h1>
          <p>Thoughtfully curated collections for every person, every mood and every special moment.</p>
          <Link className={styles.primaryButton} href="#collection-list">Explore Collections <span aria-hidden="true">→</span></Link>
        </div>
        <div className={styles.heroArt}>
          <Image src="/assets/soft-haven-collections-hero.png" alt="A pastel teddy bear nestled among soft clouds, hearts, and stars" fill priority unoptimized sizes="(max-width: 760px) 92vw, 52vw" className={styles.heroTeddies} />
          <span className={styles.heroNote}>Different collections.<br />The same soft happiness.</span>
        </div>
      </section>

      <CollectionsMotion>
        <section className={styles.collectionSection} id="collection-list" aria-labelledby="collection-heading">
          <div className={styles.sectionHeading}>
            <span className={styles.eyebrow} data-collection-reveal>Explore our collections</span>
            <h2 id="collection-heading" data-collection-reveal>Meet Our Featured <em>Collections.</em></h2>
            <p data-collection-reveal>From timeless teddy bears to playful little characters, discover the SoftHaven collection that feels made for you.</p>
          </div>
          <div className={styles.collectionGrid}>
            {featuredCollections.map((collection) => {
              return (
              <Link
                key={collection.slug}
                className={styles.collectionCard + ' ' + styles[collection.tone]}
                href={'/shop?collection=' + collection.slug}
                aria-label={'Browse ' + collection.name}
                data-collection={collection.slug}
                data-collection-card
              >
                <div className={styles.cardPhoto}>
                  {collection.image && <ProductMedia src={collection.image} alt={collection.imageAlt ?? collection.name} className={styles.photoImage} fit="cover" sizes="(max-width: 760px) 92vw, (max-width: 1050px) 46vw, 31vw" />}
                  <span className={styles.cardSymbol} aria-hidden="true">{collection.symbol}</span>
                </div>
                <div className={styles.cardDetails}>
                  <span><strong>{collection.name}</strong><small>{collection.description}</small></span>
                  <span className={styles.cardArrow} aria-hidden="true">→</span>
                </div>
              </Link>
              );
            })}
          </div>
        </section>
      </CollectionsMotion>

      <SoftHavenForThat />

      <CollectionsMotion>
        <section className={styles.moreFriends} aria-labelledby="more-friends-heading">
          <div className={styles.moreFriendsHeading}>
            <span className={styles.eyebrow} data-collection-reveal>SoftHaven has more to discover</span>
            <h2 id="more-friends-heading" data-collection-reveal>More Friends to <em>Meet.</em></h2>
            <p data-collection-reveal>There are more little personalities waiting to find their way into your world.</p>
          </div>
          <div className={styles.moreFriendsGrid}>
            {moreCollections.map((collection) => {
              const product = getCollectionProducts(collection)[0];
              return (
                <Link key={collection.slug} href={'/shop?collection=' + collection.slug} className={styles.moreFriendCard + ' ' + styles[collection.tone]} data-collection-card>
                  <span className={styles.moreFriendArt} aria-hidden="true">
                    <span>{collection.symbol}</span>
                    {!product && <small>New friends are on their way</small>}
                  </span>
                  <span className={styles.moreFriendCopy}>
                    <strong>{collection.name}</strong>
                    <small>{collection.description}</small>
                    <span className={styles.moreFriendLink}>Explore this collection <span aria-hidden="true">→</span></span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      </CollectionsMotion>

      <SectionReveal>
        <section className={styles.feature} aria-labelledby="feature-heading">
          <div className={styles.featureArt}>
            <span className={styles.featureGlow} aria-hidden="true" />
            <ProductMedia product={love} alt={love.name} fit="contain" sizes="(max-width: 760px) 72vw, 34vw" />
            <span className={styles.giftTag} aria-hidden="true">A little<br />more love</span>
          </div>
          <div className={styles.featureCopy}>
            <span className={styles.eyebrow}>Thoughtful by design</span>
            <h2 id="feature-heading">More Than<br /><em>Just Plushies.</em></h2>
            <p>Each collection is a small invitation to bring warmth, comfort and a little more happiness into everyday life.</p>
            <Link className={styles.primaryButton} href="/shop">Explore All Collections <span aria-hidden="true">→</span></Link>
          </div>
        </section>
      </SectionReveal>

      <SectionReveal>
        <section className={styles.benefits} aria-labelledby="benefits-heading">
          <div className={styles.benefitsTitle}>
            <span className={styles.eyebrow}>Why choose SoftHaven</span>
            <h2 id="benefits-heading">A Softer<br /><em>Experience.</em></h2>
          </div>
          <div className={styles.benefitGrid}>
            {benefits.map((benefit) => (
              <article className={styles.benefitCard} key={benefit.title}>
                <span className={styles.benefitIcon} aria-hidden="true">{benefit.icon}</span>
                <h3>{benefit.title}</h3>
                <p>{benefit.copy}</p>
              </article>
            ))}
          </div>
        </section>
      </SectionReveal>

      <SectionReveal>
        <section className={styles.finalCta} aria-labelledby="final-heading">
          <div className={styles.ctaCloud} aria-hidden="true" />
          <div className={styles.ctaCopy}>
            <span className={styles.eyebrow}>A softer day starts here</span>
            <h2 id="final-heading">Ready to Find Your Favorite?</h2>
            <p>Meet the companions in our current collections.</p>
            <Link className={styles.primaryButton} href="/shop">Shop All Collections <span aria-hidden="true">→</span></Link>
          </div>
          <Image src="/assets/header-teddies.png" alt="" aria-hidden="true" fill unoptimized sizes="(max-width: 760px) 62vw, 28vw" className={styles.ctaTeddies} />
        </section>
      </SectionReveal>
    </main>
  );
}
