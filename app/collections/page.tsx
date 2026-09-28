import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { CollectionsMotion } from '@/components/collections-motion';
import { CollectionsExperienceMotion } from '@/components/collections-experience-motion';
import { ProductMedia } from '@/components/product-media';
import { SectionReveal } from '@/components/section-reveal';
import { SoftHavenForThat } from '@/components/soft-haven-for-that';
import { collections } from '@/lib/collections';
import { products } from '@/lib/data';
import styles from './collections.module.css';

export const metadata: Metadata = {
  title: 'Collections | SoftHaven',
  description: 'Explore SoftHaven plush companions for thoughtful gifts, quiet comforts, and everyday moments.',
};

export default function CollectionsPage() {
  const amour = products.find((product) => product.id === 'amour') ?? products[0];
  const bunny = products.find((product) => product.id === 'celeste') ?? products[0];
  const sloth = products.find((product) => product.id === 'oliver') ?? products[0];

  return (
    <main className={styles.page} data-collections-page>
      <section className={styles.hero} aria-labelledby="collections-title">
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}>Our collections</span>
          <h1 id="collections-title">Find Your<br />Kind of <em>Soft.</em></h1>
          <p>Thoughtfully curated collections for every person, every mood and every special moment.</p>
          <Link className={styles.primaryButton} href="#collection-list">Explore Collections <span aria-hidden="true">→</span></Link>
        </div>
        <figure className={styles.heroArt}>
          <Image
            src="/assets/soft-haven-collections-hero.png"
            alt="A pastel teddy bear nestled among soft clouds"
            fill
            priority
            unoptimized
            sizes="(max-width: 760px) 92vw, 52vw"
            className={styles.heroTeddies}
          />
          <figcaption className={styles.heroNote}>Different collections. The same soft happiness.</figcaption>
        </figure>
      </section>

      <CollectionsMotion>
        <section className={styles.collectionSection} id="collection-list" aria-labelledby="collection-heading">
          <div className={styles.sectionHeading}>
            <span className={styles.eyebrow} data-collection-reveal>Meet the SoftHaven family</span>
            <h2 id="collection-heading" data-collection-reveal>A world of<br />soft companions.</h2>
            <p data-collection-reveal>From timeless teddies to playful characters, find a SoftHaven collection that feels right for you.</p>
            <Link className={styles.textLink} href="/shop" data-collection-reveal>Explore all collections <span aria-hidden="true">→</span></Link>
          </div>
          <div className={styles.collectionGrid}>
            {collections.map((collection, index) => (
              <Link
                key={collection.slug}
                className={`${styles.collectionCard} ${styles[collection.tone]}`}
                href={`/shop?collection=${collection.slug}`}
                aria-label={`Browse ${collection.name}`}
                data-collection={collection.slug}
                data-collection-card
                data-collection-index={index + 1}
              >
                <span className={styles.cardPhoto}>
                  {collection.image ? (
                    <ProductMedia
                      src={collection.image}
                      alt={collection.imageAlt ?? collection.name}
                      className={styles.photoImage}
                      fit="cover"
                      sizes="(max-width: 760px) 46vw, (max-width: 1050px) 34vw, 22vw"
                    />
                  ) : (
                    <span className={styles.collectionPlaceholder}><small>Coming soon</small></span>
                  )}
                </span>
                <span className={styles.cardDetails}>
                  <span><strong>{collection.name}</strong>{collection.image && <small>{collection.description}</small>}</span>
                  <span className={styles.cardArrow} aria-hidden="true">→</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      </CollectionsMotion>

      <SoftHavenForThat />

      <SectionReveal>
        <section className={styles.everyChapter} aria-labelledby="chapter-heading">
          <div className={styles.chapterCopy}>
            <span className={styles.eyebrow}>A closer look</span>
            <h2 id="chapter-heading">It’s the little<br />things.</h2>
            <p>Soft textures, little personalities, and the moments that turn a companion into someone’s favourite.</p>
            <Link className={styles.textLink} href="/about">The SoftHaven story <span aria-hidden="true">→</span></Link>
          </div>
          <div className={styles.collage} aria-label="SoftHaven companions and thoughtful gifting">
            <div className={`${styles.collageImage} ${styles.collageMain}`}>
              <ProductMedia product={bunny} alt={bunny.name} fit="cover" sizes="(max-width: 760px) 92vw, 32vw" />
            </div>
            <div className={`${styles.collageImage} ${styles.collageTop}`}>
              <ProductMedia product={amour} alt={amour.name} fit="cover" sizes="(max-width: 760px) 45vw, 22vw" />
            </div>
            <div className={`${styles.collageImage} ${styles.collageBottom}`}>
              <ProductMedia product={sloth} alt={sloth.name} fit="cover" sizes="(max-width: 760px) 45vw, 22vw" />
            </div>
          </div>
        </section>
      </SectionReveal>

      <SectionReveal>
        <section className={styles.feature} aria-labelledby="feature-heading">
          <div className={styles.featureCopy}>
            <span className={styles.eyebrow}>Made for meaningful moments</span>
            <h2 id="feature-heading">Some hugs are<br />meant to be <em>given.</em></h2>
            <p>For birthdays, thank-yous, or simply because someone came to mind.</p>
            <Link className={styles.textLink} href="/shop?category=Love%20%26%20Gifting">Find a thoughtful gift <span aria-hidden="true">→</span></Link>
          </div>
          <figure className={styles.featureFigure}>
            <div className={styles.featureArt}>
              <ProductMedia product={amour} alt="Amour Velvet Heart Bear, a keepsake made for gifting" fit="cover" sizes="(max-width: 760px) 92vw, 54vw" />
            </div>
            <figcaption>Amour Velvet Heart Bear</figcaption>
          </figure>
        </section>
      </SectionReveal>

      <CollectionsExperienceMotion>
        <section className={styles.experienceSection} aria-labelledby="experience-heading">
          <Image className={`${styles.experienceCloud} ${styles.experienceCloudLeft}`} src="/images/softhaven/experience/softhaven-experience-cloud-left.png" alt="" width={1400} height={525} aria-hidden="true" data-experience-cloud-left />
          <Image className={`${styles.experienceCloud} ${styles.experienceCloudBottom}`} src="/images/softhaven/experience/softhaven-experience-cloud-bank.png" alt="" width={1400} height={466} aria-hidden="true" data-experience-cloud-bottom />
          <div className={styles.experienceCopy}>
            <span className={styles.experienceEyebrow} data-experience-eyebrow>Why choose SoftHaven <i aria-hidden="true" /></span>
            <h2 id="experience-heading" data-experience-heading>A Softer<br /><em>Experience.</em></h2>
            <p data-experience-description>Thoughtfully chosen companions for gifting, comforting and all the little moments in between.</p>
          </div>
          <div className={styles.experienceReasons} aria-label="The SoftHaven difference">
            <article className={styles.experienceReason} data-experience-reason>
              <span className={styles.experienceNumber} data-experience-number>01</span>
              <span className={`${styles.experienceIcon} ${styles.experienceIconBlush}`} aria-hidden="true" data-experience-detail><svg viewBox="0 0 24 24"><path d="M20.8 8.7c0 5.2-8.8 10.1-8.8 10.1S3.2 13.9 3.2 8.7A4.4 4.4 0 0 1 11 6.1a4.4 4.4 0 0 1 9.8 2.6Z" /></svg></span>
              <h3 data-experience-detail>Thoughtfully<br />Selected</h3>
              <i className={`${styles.experienceAccent} ${styles.experienceAccentBlush}`} aria-hidden="true" data-experience-detail />
              <p data-experience-detail>Carefully chosen companions with personality and charm.</p>
            </article>
            <span className={styles.experienceDivider} data-experience-divider aria-hidden="true" />
            <article className={styles.experienceReason} data-experience-reason>
              <span className={`${styles.experienceNumber} ${styles.experienceNumberLavender}`} data-experience-number>02</span>
              <span className={`${styles.experienceIcon} ${styles.experienceIconLavender}`} aria-hidden="true" data-experience-detail><svg viewBox="0 0 24 24"><path d="m12 3 1.4 5.6L19 10l-5.6 1.4L12 17l-1.4-5.6L5 10l5.6-1.4L12 3Z" /><path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z" /></svg></span>
              <h3 data-experience-detail>Made for<br />Meaningful Moments</h3>
              <i className={`${styles.experienceAccent} ${styles.experienceAccentLavender}`} aria-hidden="true" data-experience-detail />
              <p data-experience-detail>For celebrations, thoughtful gifts and everyday comfort.</p>
            </article>
            <span className={styles.experienceDivider} data-experience-divider aria-hidden="true" />
            <article className={styles.experienceReason} data-experience-reason>
              <span className={`${styles.experienceNumber} ${styles.experienceNumberBlue}`} data-experience-number>03</span>
              <span className={`${styles.experienceIcon} ${styles.experienceIconBlue}`} aria-hidden="true" data-experience-detail><svg viewBox="0 0 24 24"><path d="M20 12v8H4v-8M2 8h20v4H2zM12 8v12M12 8H8.6A2.6 2.6 0 1 1 11.2 5c.8 1.1.8 3 0 3H12Zm0 0h3.4A2.6 2.6 0 1 0 12.8 5c-.8 1.1-.8 3 0 3H12Z" /></svg></span>
              <h3 data-experience-detail>Gifting,<br />Made Softer</h3>
              <i className={`${styles.experienceAccent} ${styles.experienceAccentBlue}`} aria-hidden="true" data-experience-detail />
              <p data-experience-detail>A little companion for moments worth remembering.</p>
            </article>
          </div>
          <div className={styles.experienceVisual} data-experience-artwork>
            <Image src="/images/softhaven/experience/softhaven-experience-teddy-cloud.webp" alt="SoftHaven Story Teddy resting in a soft pastel cloud bank" width={1113} height={1413} unoptimized className={styles.experienceTeddy} sizes="(max-width: 760px) 74vw, (max-width: 1100px) 300px, 350px" />
          </div>
        </section>
      </CollectionsExperienceMotion>

    </main>
  );
}
