import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { SectionReveal } from '@/components/section-reveal';
import { ProductMedia } from '@/components/product-media';
import { products } from '@/lib/data';
import styles from './collections.module.css';

export const metadata: Metadata = {
  title: 'Collections | SoftHaven',
  description: 'Explore SoftHaven plush companions for thoughtful gifts, quiet comforts, and everyday moments.',
};

// Presentation families intentionally map to the three filters already supported by /shop.
const collections = [
  {
    title: 'Plushie Collections',
    description: 'Cuddly companions for comfort, hugs, and happier days.',
    category: 'Teddy Bear Collection',
    product: products.find((product) => product.id === 'aurelius') ?? products[0],
    symbol: '♡',
    tone: 'rose',
  },
  {
    title: 'Precious Collections',
    description: 'Thoughtful plush gifts for the moments you want to keep.',
    category: 'Love & Gifting',
    product: products.find((product) => product.id === 'amour') ?? products[0],
    symbol: '✧',
    tone: 'lilac',
  },
  {
    title: 'Animal Collections',
    description: 'Gentle animal friends to bring a little joy to every day.',
    category: 'Soft Animal Friends',
    product: products.find((product) => product.id === 'celeste') ?? products[0],
    symbol: '⌁',
    tone: 'blue',
  },
] as const;

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

      <SectionReveal>
        <section className={styles.collectionSection} id="collection-list" aria-labelledby="collection-heading">
          <div className={styles.sectionHeading}>
            <span className={styles.eyebrow}>Explore our collections</span>
            <h2 id="collection-heading">Three Special <em>Collections.</em></h2>
            <p>Different personalities, the same soft comfort. Find the collection that feels right for you.</p>
          </div>
          <div className={styles.collectionGrid}>
            {collections.map((collection) => (
              <Link
                key={collection.category}
                className={styles.collectionCard + ' ' + styles[collection.tone]}
                href={'/shop?category=' + encodeURIComponent(collection.category)}
                aria-label={'Browse ' + collection.title}
              >
                <div className={styles.cardPhoto}>
                  <ProductMedia product={collection.product} alt={collection.product.name} className={styles.photoImage} fit="cover" sizes="(max-width: 760px) 92vw, (max-width: 1050px) 46vw, 31vw" />
                  <span className={styles.cardSymbol} aria-hidden="true">{collection.symbol}</span>
                </div>
                <div className={styles.cardDetails}>
                  <span><strong>{collection.title}</strong><small>{collection.description}</small></span>
                  <span className={styles.cardArrow} aria-hidden="true">→</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </SectionReveal>

      <SectionReveal>
        <section className={styles.everyChapter} aria-labelledby="chapter-heading">
          <div className={styles.chapterCopy}>
            <span className={styles.eyebrow}>Made for everyone</span>
            <h2 id="chapter-heading">Soft Companions<br />for <em>Every Chapter.</em></h2>
            <p>From quiet evenings at home to a thoughtful gift for someone special, our collections belong in life’s little moments.</p>
            <Link className={styles.primaryButton} href="/about">Our Story <span aria-hidden="true">→</span></Link>
          </div>
          <div className={styles.collage}>
            <div className={styles.collageImage + ' ' + styles.collageMain} data-sky-editorial-image>
              <ProductMedia product={bunny} alt={bunny.name} fit="cover" sizes="(max-width: 760px) 92vw, 32vw" />
            </div>
            <div className={styles.collageImage + ' ' + styles.collageTop}>
              <ProductMedia product={love} alt={love.name} fit="cover" sizes="(max-width: 760px) 45vw, 22vw" />
            </div>
            <div className={styles.collageImage + ' ' + styles.collageBottom}>
              <ProductMedia product={sloth} alt={sloth.name} fit="cover" sizes="(max-width: 760px) 45vw, 22vw" />
            </div>
          </div>
        </section>
      </SectionReveal>

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
