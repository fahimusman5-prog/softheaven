import Link from 'next/link';
import type { SoftHavenCollection } from '@/lib/collections';
import { CollectionsRestorationMotion } from '@/components/collections-restoration-motion';
import styles from './collections-restored-content.module.css';

// Copy recovered from CollectionsDifference, SoftHavenForThat and the former
// Collections page. The collection catalogue remains supplied by getStorefront.
const qualities = ['Soft to the Touch', 'Thoughtfully Selected', 'Made for Meaningful Moments'];
const moments = ['Birthday Surprise', 'Just Because', 'A Comforting Hug'];
const reasons = [
  ['Thoughtfully Selected', 'Carefully chosen companions with personality and charm.'],
  ['Made for Meaningful Moments', 'For celebrations, thoughtful gifts and everyday comfort.'],
  ['Gifting, Made Softer', 'A little companion for moments worth remembering.'],
];

export function CollectionsRestoredContent({ collections }: { collections: SoftHavenCollection[] }) {
  return <CollectionsRestorationMotion>
    <div className={styles.journey} data-restored-collections>
      <section className={styles.index} id="collection-list" aria-labelledby="collection-list-title" data-restored-section>
        <div className={styles.indexIntro}>
          <span className={styles.eyebrow} data-restored-copy>More to discover <i aria-hidden="true" /></span>
          <h2 id="collection-list-title" data-restored-heading>More little worlds<br />to <em>fall in love with.</em></h2>
          <p data-restored-copy>Thoughtfully curated collections for every person, every mood and every special moment.</p>
        </div>
        <nav className={styles.collectionIndex} aria-label="All SoftHaven collections">
          {collections.map((collection, index) => <Link className={styles.collectionRow} href={`/shop?collection=${encodeURIComponent(collection.slug)}`} key={collection.slug} data-restored-row>
            <span className={styles.number} aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
            <span className={styles.rowCopy}><strong>{collection.name}</strong>{collection.description && <span>{collection.description}</span>}</span>
            <span className={styles.arrow} aria-hidden="true">→</span>
          </Link>)}
        </nav>
      </section>

      <section className={styles.difference} aria-labelledby="collections-difference-title" data-restored-section>
        <div>
          <span className={styles.eyebrow} data-restored-copy>The SoftHaven Difference <i aria-hidden="true" /></span>
          <h2 id="collections-difference-title" data-restored-heading>Made to Feel<br /><em>Extra Special.</em></h2>
        </div>
        <div className={styles.differenceCopy}>
          <p data-restored-copy>Thoughtfully selected plush companions with the softness, character and quality that make every hug feel a little more special.</p>
          <ul className={styles.qualities} aria-label="The SoftHaven difference">{qualities.map((quality, index) => <li key={quality} data-restored-row><span aria-hidden="true">{['♡', '✧', '✿'][index]}</span>{quality}</li>)}</ul>
          <Link className={styles.textLink} href="/about" data-restored-copy>Discover the SoftHaven Story <span aria-hidden="true">→</span></Link>
        </div>
      </section>

      <section className={styles.moment} aria-labelledby="softhaven-moment-title" data-restored-section>
        <figure className={styles.momentVisual} data-restored-image>
          <picture><source media="(max-width: 767px)" srcSet="/assets/collections/restored/companions-mobile.webp" /><img src="/assets/collections/restored/companions.webp" alt="A caramel teddy, blue-eared bunny, grey kitten and brown-and-white puppy nestled together in pastel clouds" width={1100} height={733} loading="lazy" decoding="async" /></picture>
          <figcaption>{moments.map(moment => <span key={moment}>{moment}</span>)}</figcaption>
        </figure>
        <div className={styles.momentCopy}>
          <span className={styles.eyebrow} data-restored-copy>Whatever the moment <i aria-hidden="true" /></span>
          <h2 id="softhaven-moment-title" data-restored-heading>There&apos;s a SoftHaven<br /><em>For That.</em></h2>
          <p data-restored-copy>Big celebrations, little surprises, comforting hugs or simply because — find a companion made for the moment.</p>
          <Link className={styles.textLink} href="/shop" data-restored-copy>Find Your Perfect Match <span aria-hidden="true">→</span></Link>
        </div>
      </section>

      <section className={styles.experience} aria-labelledby="experience-heading" data-restored-section>
        <div>
          <span className={styles.eyebrow} data-restored-copy>Why choose SoftHaven <i aria-hidden="true" /></span>
          <h2 id="experience-heading" data-restored-heading>A Softer<br /><em>Experience.</em></h2>
          <p data-restored-copy>Thoughtfully chosen companions for gifting, comforting and all the little moments in between.</p>
        </div>
        <ol className={styles.reasons} aria-label="A softer experience">{reasons.map(([title, description], index) => <li key={title} data-restored-row><span className={styles.number} aria-hidden="true">0{index + 1}</span><div><h3>{title}</h3><p>{description}</p></div></li>)}</ol>
      </section>

      <section className={styles.finale} aria-labelledby="collections-finale-title" data-restored-section>
        <span className={styles.eyebrow} data-restored-copy>Find your favourite <i aria-hidden="true" /></span>
        <h2 id="collections-finale-title" data-restored-heading>There&apos;s a soft friend<br /><em>waiting for you.</em></h2>
        <p data-restored-copy>Explore the full SoftHaven collection and find the companion that feels just right.</p>
        <Link className={styles.finaleButton} href="/shop" data-restored-copy>Meet all companions <span aria-hidden="true">→</span></Link>
        <Link className={styles.browseLink} href="#collection-list">Browse every collection <span aria-hidden="true">↑</span></Link>
      </section>
    </div>
  </CollectionsRestorationMotion>;
}
