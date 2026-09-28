import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ProductMedia } from '@/components/product-media';
import { CollectionsMotion } from '@/components/collections-motion';
import { SoftHavenForThat } from '@/components/soft-haven-for-that';
import { CollectionsChapterMotion } from '@/components/collections-chapter-motion';
import { CollectionsExperienceMotion } from '@/components/collections-experience-motion';
import { collections, getCollectionProducts } from '@/lib/collections';
import { products } from '@/lib/data';
import styles from './collections.module.css';

export const metadata: Metadata = {
  title: 'Collections | SoftHaven',
  description: 'Explore SoftHaven plush companions for thoughtful gifts, quiet comforts, and everyday moments.',
};

const giftBear = products.find((product) => product.id === 'amour') ?? products[0];

export default function CollectionsPage() {
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
            <span className={styles.eyebrow} data-collection-reveal>Explore our collections</span>
            <h2 id="collection-heading" data-collection-reveal>Meet Our Featured <em>Collections.</em></h2>
            <p data-collection-reveal>From timeless teddy bears to playful little characters, discover the SoftHaven collection that feels made for you.</p>
          </div>
          <div className={styles.collectionGrid}>
            {collections.filter((collection) => collection.featured).map((collection) => (
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
            ))}
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
            {collections.filter((collection) => !collection.featured).map((collection) => {
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

      <CollectionsChapterMotion>
        <section className={styles.chapterSection} aria-labelledby="chapter-heading">
          <div className={styles.chapterCopy}>
            <span className={styles.chapterEyebrow} data-chapter-eyebrow>Made for everyone <i aria-hidden="true" /></span>
            <h2 id="chapter-heading" data-chapter-heading>Soft Companions<br />for <em>Every<br />Chapter.</em></h2>
            <p data-chapter-copy>From quiet evenings at home to a thoughtful gift for someone special, our collections belong in life's little moments.</p>
            <Link className={styles.chapterCta} href="/about" data-chapter-cta>Our Story <span aria-hidden="true">→</span></Link>
          </div>
          <div className={styles.chapterWorld} data-chapter-art-parallax>
            <div className={styles.chapterArtwork} data-chapter-art-entrance>
              <Image
                src="/images/collections/softheaven-collections-world.png"
                alt="SoftHaven plush companions from across our collections"
                width={1672}
                height={940}
                unoptimized
                sizes="(max-width: 767px) 106vw, (max-width: 1100px) 58vw, 60vw"
              />
            </div>
          </div>
        </section>
      </CollectionsChapterMotion>

      <section className={styles.giftSection} aria-labelledby="gift-heading">
        <div className={styles.giftCopy}>
          <span className={styles.eyebrow}>Made for meaningful moments</span>
          <h2 id="gift-heading">Some hugs are<br />meant to be <em>given.</em></h2>
          <p>For birthdays, thank-yous, or simply because someone came to mind.</p>
          <Link className={styles.textLink} href="/shop?category=Love%20%26%20Gifting">Find a thoughtful gift <span aria-hidden="true">→</span></Link>
        </div>
        <figure className={styles.giftFigure}>
          <div className={styles.giftPhoto}>
            <ProductMedia product={giftBear} alt="Amour Velvet Heart Bear, a keepsake made for gifting" className={styles.giftImage} fit="cover" sizes="(max-width: 760px) 92vw, 56vw" />
          </div>
          <figcaption><span>Love &amp; gifting</span><strong>Amour Velvet Heart Bear</strong></figcaption>
        </figure>
      </section>

      <CollectionsExperienceMotion>
        <section className={styles.experienceSection} aria-labelledby="experience-heading">
          <Image className={styles.experienceCloud + ' ' + styles.experienceCloudLeft} src="/images/softhaven/experience/softhaven-experience-cloud-left.png" alt="" width={1400} height={525} aria-hidden="true" data-experience-cloud-left />
          <Image className={styles.experienceCloud + ' ' + styles.experienceCloudBottom} src="/images/softhaven/experience/softhaven-experience-cloud-bank.png" alt="" width={1400} height={466} aria-hidden="true" data-experience-cloud-bottom />
          <div className={styles.experienceCopy}>
            <span className={styles.experienceEyebrow} data-experience-eyebrow>Why choose SoftHaven <i aria-hidden="true" /></span>
            <h2 id="experience-heading" data-experience-heading>A Softer<br /><em>Experience.</em></h2>
            <p data-experience-description>Thoughtfully chosen companions for gifting, comforting and all the little moments in between.</p>
          </div>
          <div className={styles.experienceReasons} aria-label="The SoftHaven difference">
            <article className={styles.experienceReason} data-experience-reason>
              <span className={styles.experienceNumber} data-experience-number>01</span>
              <span className={styles.experienceIcon + ' ' + styles.experienceIconBlush} aria-hidden="true" data-experience-detail><svg viewBox="0 0 24 24"><path d="M20.8 8.7c0 5.2-8.8 10.1-8.8 10.1S3.2 13.9 3.2 8.7A4.4 4.4 0 0 1 11 6.1a4.4 4.4 0 0 1 9.8 2.6Z" /></svg></span>
              <h3 data-experience-detail>Thoughtfully<br />Selected</h3>
              <i className={styles.experienceAccent + ' ' + styles.experienceAccentBlush} aria-hidden="true" data-experience-detail />
              <p data-experience-detail>Carefully chosen companions with personality and charm.</p>
            </article>
            <span className={styles.experienceDivider} data-experience-divider aria-hidden="true" />
            <article className={styles.experienceReason} data-experience-reason>
              <span className={styles.experienceNumber + ' ' + styles.experienceNumberLavender} data-experience-number>02</span>
              <span className={styles.experienceIcon + ' ' + styles.experienceIconLavender} aria-hidden="true" data-experience-detail><svg viewBox="0 0 24 24"><path d="m12 3 1.4 5.6L19 10l-5.6 1.4L12 17l-1.4-5.6L5 10l5.6-1.4L12 3Z" /><path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z" /></svg></span>
              <h3 data-experience-detail>Made for<br />Meaningful Moments</h3>
              <i className={styles.experienceAccent + ' ' + styles.experienceAccentLavender} aria-hidden="true" data-experience-detail />
              <p data-experience-detail>For celebrations, thoughtful gifts and everyday comfort.</p>
            </article>
            <span className={styles.experienceDivider} data-experience-divider aria-hidden="true" />
            <article className={styles.experienceReason} data-experience-reason>
              <span className={styles.experienceNumber + ' ' + styles.experienceNumberBlue} data-experience-number>03</span>
              <span className={styles.experienceIcon + ' ' + styles.experienceIconBlue} aria-hidden="true" data-experience-detail><svg viewBox="0 0 24 24"><path d="M20 12v8H4v-8M2 8h20v4H2zM12 8v12M12 8H8.6A2.6 2.6 0 1 1 11.2 5c.8 1.1.8 3 0 3H12Zm0 0h3.4A2.6 2.6 0 1 0 12.8 5c-.8 1.1-.8 3 0 3H12Z" /></svg></span>
              <h3 data-experience-detail>Gifting,<br />Made Softer</h3>
              <i className={styles.experienceAccent + ' ' + styles.experienceAccentBlue} aria-hidden="true" data-experience-detail />
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
