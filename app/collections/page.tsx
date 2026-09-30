import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { CollectionsDifference } from '@/components/collections-difference';
import { SoftHavenForThat } from '@/components/soft-haven-for-that';
import styles from './collections.module.css';

export const metadata: Metadata = {
  title: 'Collections | SoftHaven',
  description: 'Explore SoftHaven plush companions for thoughtful gifts, quiet comforts, and everyday moments.',
};

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

      <CollectionsDifference />

      <SoftHavenForThat />

      <section className={styles.experienceSection} aria-labelledby="experience-heading">
        <div className={styles.experienceCopy}>
          <span className={styles.experienceEyebrow}>Why choose SoftHaven <i aria-hidden="true" /></span>
          <h2 id="experience-heading">A Softer<br /><em>Experience.</em></h2>
          <p>Thoughtfully chosen companions for gifting, comforting and all the little moments in between.</p>
        </div>
        <div className={styles.experienceReasons} aria-label="The SoftHaven difference">
          <article className={styles.experienceReason}>
            <span className={styles.experienceNumber}>01</span>
            <span className={`${styles.experienceIcon} ${styles.experienceIconBlush}`} aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M20.8 8.7c0 5.2-8.8 10.1-8.8 10.1S3.2 13.9 3.2 8.7A4.4 4.4 0 0 1 11 6.1a4.4 4.4 0 0 1 9.8 2.6Z" /></svg></span>
            <h3>Thoughtfully<br />Selected</h3>
            <i className={`${styles.experienceAccent} ${styles.experienceAccentBlush}`} aria-hidden="true" />
            <p>Carefully chosen companions with personality and charm.</p>
          </article>
          <article className={styles.experienceReason}>
            <span className={`${styles.experienceNumber} ${styles.experienceNumberLavender}`}>02</span>
            <span className={`${styles.experienceIcon} ${styles.experienceIconLavender}`} aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m12 3 1.4 5.6L19 10l-5.6 1.4L12 17l-1.4-5.6L5 10l5.6-1.4L12 3Z" /><path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z" /></svg></span>
            <h3>Made for<br />Meaningful Moments</h3>
            <i className={`${styles.experienceAccent} ${styles.experienceAccentLavender}`} aria-hidden="true" />
            <p>For celebrations, thoughtful gifts and everyday comfort.</p>
          </article>
          <article className={styles.experienceReason}>
            <span className={`${styles.experienceNumber} ${styles.experienceNumberBlue}`}>03</span>
            <span className={`${styles.experienceIcon} ${styles.experienceIconBlue}`} aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M20 12v8H4v-8M2 8h20v4H2zM12 8v12M12 8H8.6A2.6 2.6 0 1 1 11.2 5c.8 1.1.8 3 0 3H12Zm0 0h3.4A2.6 2.6 0 1 0 12.8 5c-.8 1.1-.8 3 0 3H12Z" /></svg></span>
            <h3>Gifting,<br />Made Softer</h3>
            <i className={`${styles.experienceAccent} ${styles.experienceAccentBlue}`} aria-hidden="true" />
            <p>A little companion for moments worth remembering.</p>
          </article>
        </div>
        <div className={styles.experienceVisual}>
          <Image src="/images/softhaven/experience/softhaven-experience-teddy-cloud.webp" alt="SoftHaven Story Teddy resting in a soft pastel cloud bank" width={1113} height={1413} unoptimized className={styles.experienceTeddy} sizes="(max-width: 760px) 74vw, (max-width: 1100px) 300px, 350px" />
        </div>
      </section>

    </main>
  );
}
