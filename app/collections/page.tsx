import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ProductMedia } from '@/components/product-media';
import { CollectionsMotion } from '@/components/collections-motion';
import { CollectionsChapterMotion } from '@/components/collections-chapter-motion';
import { collections, getCollectionProducts } from '@/lib/collections';
import { products } from '@/lib/data';
import styles from './collections.module.css';

export const metadata: Metadata = { title: 'Collections | SoftHaven', description: 'Explore SoftHaven plush companions for thoughtful gifts, quiet comforts, and everyday moments.' };
const bunny = products.find((product) => product.id === 'celeste') ?? products[0];
const teddy = products.find((product) => product.id === 'aurelius') ?? products[0];
const sloth = products.find((product) => product.id === 'oliver') ?? products[0];
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
          <Image src="/assets/soft-haven-collections-hero.png" alt="A pastel teddy bear nestled among soft clouds" fill priority unoptimized sizes="(max-width: 760px) 92vw, 52vw" className={styles.heroTeddies} />
          <figcaption className={styles.heroNote}>Different collections. The same soft happiness.</figcaption>
        </figure>
      </section>
      <CollectionsMotion>
        <section className={styles.collectionSection} id="collection-list" aria-labelledby="collection-heading">
          <div className={styles.sectionHeading}>
            <span className={styles.eyebrow} data-collection-reveal>Meet the SoftHaven family</span>
            <h2 id="collection-heading" data-collection-reveal>A world of<br />soft companions.</h2>
            <p data-collection-reveal>From timeless teddies to playful characters, find a collection that feels right for you.</p>
            <Link className={styles.textLink} href="/shop" data-collection-reveal>Explore all collections <span aria-hidden="true">→</span></Link>
          </div>
          <div className={styles.collectionGrid} aria-label="Shop SoftHaven collections">
            {collections.map((collection, index) => {
              const product = getCollectionProducts(collection)[0];
              return <Link key={collection.slug} className={`${styles.collectionCard} ${styles[collection.tone]}`} href={`/shop?collection=${collection.slug}`} aria-label={`Browse ${collection.name}`} data-collection-card data-collection-index={index + 1}>
                <span className={styles.cardPhoto}>{product ? <ProductMedia product={product} alt={product.name} className={styles.photoImage} fit="cover" sizes="(max-width: 760px) 46vw, (max-width: 1050px) 30vw, 22vw" /> : <span className={styles.collectionPlaceholder}><strong>{collection.name}</strong><small>Coming soon</small></span>}</span>
                <span className={styles.cardDetails}><strong>{collection.name}</strong><span className={styles.cardArrow} aria-hidden="true">→</span></span>
              </Link>;
            })}
          </div>
        </section>
      </CollectionsMotion>
      <CollectionsChapterMotion>
        <section className={styles.everyChapter} aria-labelledby="chapter-heading">
          <div className={styles.chapterCopy}>
            <span className={styles.eyebrow} data-chapter-eyebrow>Why SoftHaven</span>
            <h2 id="chapter-heading" data-chapter-heading>Made to Feel<br /><em>Better.</em></h2>
            <p data-chapter-copy>A familiar face, a comforting texture, a little softness close by. Our companions are chosen for the everyday moments that matter.</p>
            <Link className={styles.textLink} href="/about" data-chapter-cta>Our approach to softer days <span aria-hidden="true">→</span></Link>
          </div>
          <figure className={styles.chapterFigure} data-chapter-art-parallax>
            <div className={styles.chapterArtEntrance} data-chapter-art-entrance><ProductMedia product={bunny} alt="Celeste Cloud Bunny, a soft blue-eared plush companion" className={styles.chapterArtwork} fit="cover" sizes="(max-width: 767px) 92vw, 58vw" /></div>
            <figcaption><span>SoftHaven companion</span><strong>Celeste Cloud Bunny</strong></figcaption>
          </figure>
        </section>
      </CollectionsChapterMotion>
      <section className={styles.littleThings} aria-labelledby="little-things-heading">
        <div className={styles.editorialPhotoGrid}>
          <figure className={`${styles.editorialPhoto} ${styles.editorialPhotoLarge}`}><ProductMedia product={bunny} alt="Celeste Cloud Bunny, a soft blue-eared plush companion" className={styles.editorialImage} fit="cover" sizes="(max-width: 760px) 90vw, 38vw" /></figure>
          <figure className={styles.editorialPhoto}><ProductMedia product={teddy} alt="The Aurelius Heritage Bear" className={styles.editorialImage} fit="cover" sizes="(max-width: 760px) 44vw, 24vw" /></figure>
          <figure className={styles.editorialPhoto}><ProductMedia product={sloth} alt="Oliver Sleeping Sloth" className={styles.editorialImage} fit="cover" sizes="(max-width: 760px) 44vw, 24vw" /></figure>
        </div>
        <div className={styles.littleCopy}>
          <span className={styles.eyebrow}>A closer look</span>
          <h2 id="little-things-heading">It’s the Little Things.</h2>
          <p>Every friend has a feel and personality all their own. Those small details are what make a companion feel like yours.</p>
          <ol className={styles.chapterList}><li><span>01</span><strong>The Feel</strong></li><li><span>02</span><strong>The Character</strong></li><li><span>03</span><strong>The Moment</strong></li></ol>
        </div>
      </section>
      <section className={styles.giftSection} aria-labelledby="gift-heading">
        <div className={styles.giftCopy}>
          <span className={styles.eyebrow}>Made for meaningful moments</span>
          <h2 id="gift-heading">Some hugs are<br />meant to be <em>given.</em></h2>
          <p>For birthdays, thank-yous, or simply because someone came to mind.</p>
          <Link className={styles.textLink} href="/shop?category=Love%20%26%20Gifting">Find a thoughtful gift <span aria-hidden="true">→</span></Link>
        </div>
        <figure className={styles.giftFigure}><div className={styles.giftPhoto}><ProductMedia product={giftBear} alt="Amour Velvet Heart Bear, a keepsake made for gifting" className={styles.giftImage} fit="cover" sizes="(max-width: 760px) 92vw, 56vw" /></div><figcaption><span>Love &amp; gifting</span><strong>Amour Velvet Heart Bear</strong></figcaption></figure>
      </section>
      <section className={styles.finalCta} aria-labelledby="final-heading">
        <div className={styles.finalCopy}>
          <span className={styles.eyebrow}>A softer day starts here</span>
          <h2 id="final-heading">There’s always room<br />for one more hug.</h2>
          <p>Find the SoftHaven companion waiting for you.</p>
          <div className={styles.finalLinks}><Link className={styles.primaryButton} href="/shop">Explore all plushies <span aria-hidden="true">→</span></Link><Link className={styles.textLink} href="/contact">Need help choosing? <span aria-hidden="true">→</span></Link></div>
        </div>
        <figure className={styles.finalPhoto}><Image src="/assets/header-teddies.png" alt="SoftHaven plush companions ready for a new home" fill unoptimized sizes="(max-width: 760px) 92vw, 48vw" className={styles.finalImage} /></figure>
      </section>
    </main>
  );
}
