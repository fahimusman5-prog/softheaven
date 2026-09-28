import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { SectionReveal } from '@/components/section-reveal';
import { ProductMedia } from '@/components/product-media';
import { CollectionsMotion } from '@/components/collections-motion';
import { CollectionsChapterMotion } from '@/components/collections-chapter-motion';
import { CollectionsQualityMotion } from '@/components/collections-quality-motion';
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
              const product = getCollectionProducts(collection)[0];
              return (
              <Link
                key={collection.slug}
                className={styles.collectionCard + ' ' + styles[collection.tone]}
                href={'/shop?collection=' + collection.slug}
                aria-label={'Browse ' + collection.name}
                data-collection-card
              >
                <div className={styles.cardPhoto}>
                  {product && <ProductMedia product={product} alt={product.name} className={styles.photoImage} fit="contain" sizes="(max-width: 760px) 92vw, (max-width: 1050px) 46vw, 31vw" />}
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

      <CollectionsChapterMotion>
        <section className={styles.everyChapter} aria-labelledby="chapter-heading">
          <div className={styles.chapterCopy}>
            <span className={styles.eyebrow} data-chapter-eyebrow>Made for everyone</span>
            <h2 id="chapter-heading" data-chapter-heading>Soft Companions<br />for <em>Every Chapter.</em></h2>
            <p data-chapter-copy>From quiet evenings at home to a thoughtful gift for someone special, our collections belong in life’s little moments.</p>
            <Link className={styles.primaryButton} href="/about" data-chapter-cta>Our Story <span aria-hidden="true">→</span></Link>
          </div>
          <div className={styles.chapterArtParallax} data-chapter-art-parallax>
            <div className={styles.chapterArtEntrance} data-chapter-art-entrance>
              <span className={styles.chapterGlow} aria-hidden="true" />
              <div className={styles.chapterArtSky} data-sky-editorial-image>
                <ProductMedia
                  src="/images/collections/softheaven-collections-world.png"
                  alt="SoftHaven plush companions from across our collections"
                  className={styles.chapterArtwork}
                  fit="contain"
                  sizes="(max-width: 767px) 100vw, (max-width: 1199px) 58vw, 820px"
                />
              </div>
            </div>
          </div>
        </section>
      </CollectionsChapterMotion>

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

      <CollectionsQualityMotion>
        <section className={styles.qualitySection} aria-labelledby="quality-heading">
          <div className={styles.qualityVisual} data-quality-visual-wrap>
            <span className={styles.qualityGlow} aria-hidden="true" />
            <span className={styles.qualityCloud + ' ' + styles.qualityCloudBack} aria-hidden="true" data-quality-cloud-back />
            <div className={styles.qualityArtwork} data-quality-artwork>
              <ProductMedia
                src="/images/collections/softheaven-collections-world.png"
                alt="SoftHaven plush companions gathered among pastel clouds"
                className={styles.qualityImage}
                fit="contain"
                sizes="(max-width: 767px) 100vw, (max-width: 1099px) 48vw, 650px"
              />
            </div>
            <span className={styles.qualityCloud + ' ' + styles.qualityCloudFront} aria-hidden="true" data-quality-cloud-front />
          </div>
          <div className={styles.qualityCopy}>
            <span className={styles.eyebrow} data-quality-eyebrow>The SoftHaven Difference</span>
            <h2 id="quality-heading" data-quality-heading>Made to Feel<br /><em>Extra Special.</em></h2>
            <p data-quality-description>Thoughtfully selected plush companions with the softness, character and quality that make every hug feel a little more special.</p>
            <div className={styles.qualityMarkers} aria-label="The SoftHaven difference">
              <div className={styles.qualityMarker} data-quality-marker>
                <span className={styles.qualityIcon} aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3c3.4 2.3 5.5 5.2 5.5 8.3A5.5 5.5 0 0 1 12 16.8a5.5 5.5 0 0 1-5.5-5.5C6.5 8.2 9 5.3 12 3Z" /><path d="M12 16.8v4.2M9.3 21h5.4" /></svg></span>
                <span>Soft to the Touch</span>
              </div>
              <div className={styles.qualityMarker} data-quality-marker>
                <span className={styles.qualityIcon} aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 20.5S4 15.8 4 9.3A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 8 2.3c0 6.5-8 11.2-8 11.2Z" /><path d="m12 4 .7 1.8L14.5 6l-1.8.7L12 8.5l-.7-1.8L9.5 6l1.8-.7L12 4Z" /></svg></span>
                <span>Thoughtfully Selected</span>
              </div>
              <div className={styles.qualityMarker} data-quality-marker>
                <span className={styles.qualityIcon} aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 8h18v13H3zM2 4h20v4H2zM12 4v17M12 4c-1-3-6-4-6-1 0 2 3 2 6 1Zm0 0c1-3 6-4 6-1 0 2 3 2 6 1Z" /></svg></span>
                <span>Made for Meaningful Moments</span>
              </div>
            </div>
            <Link className={styles.qualityCta} href="/about" data-quality-cta>Discover the SoftHaven Story <span aria-hidden="true">→</span></Link>
          </div>
        </section>
      </CollectionsQualityMotion>

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
