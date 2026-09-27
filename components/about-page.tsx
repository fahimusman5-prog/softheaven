import Link from 'next/link';
import { images } from '@/lib/data';
import { ProductMedia } from './product-media';
import styles from '@/app/about/about.module.css';

type IconName = 'arrow' | 'gift' | 'heart' | 'sparkle';

function Icon({ name }: { name: IconName }) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    strokeWidth: 1.7,
  };

  if (name === 'arrow') return <svg viewBox="0 0 24 24" aria-hidden="true"><path {...common} d="M4 12h15m-6-6 6 6-6 6" /></svg>;
  if (name === 'heart') return <svg viewBox="0 0 24 24" aria-hidden="true"><path {...common} d="M20.8 8.8c0 5.4-8.8 10-8.8 10S3.2 14.2 3.2 8.8A4.7 4.7 0 0 1 12 6.1a4.7 4.7 0 0 1 8.8 2.7Z" /></svg>;
  if (name === 'sparkle') return <svg viewBox="0 0 24 24" aria-hidden="true"><path {...common} d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2Z" /></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path {...common} d="M3 8h18v13H3zM2 4h20v4H2zM12 4v17M12 4c-1-3-6-4-6-1 0 2 3 2 6 1Zm0 0c1-3 6-4 6-1 0 2-3 2-6 1Z" /></svg>;
}

function ProductImage({ src, alt, className, priority = false, fit = 'contain' }: { src: string; alt: string; className?: string; priority?: boolean; fit?: 'contain' | 'cover' }) {
  return (
    <div className={`${styles.productImage} ${className ?? ''}`}>
      <ProductMedia
        src={src}
        alt={alt}
        fill
        priority={priority}
        fit={fit}
        sizes="(max-width: 700px) 90vw, (max-width: 1100px) 44vw, 620px"
      />
    </div>
  );
}

const principles = [
  { title: 'Thoughtful Design', text: 'Friendly shapes and considered details make each companion feel personal.', icon: 'heart' as const },
  { title: 'Quality Focus', text: 'We choose pieces for their character, comfort and place in everyday life.', icon: 'sparkle' as const },
  { title: 'More Than a Gift', text: 'A soft companion is a simple way to let someone know you care.', icon: 'gift' as const },
];
const iconStyles = { heart: styles.iconHeart, sparkle: styles.iconSparkle, gift: styles.iconGift };

function AboutHero() {
  return (
    <section className={styles.hero} aria-labelledby="about-title">
      <div className={styles.heroCopy}>
        <p className={styles.eyebrow}>Our Story</p>
        <h1 id="about-title">A Softer<br />Kind of<br /><em>Happiness.</em><span className={styles.headingHeart} aria-hidden="true">♡</span></h1>
        <p className={styles.heroLede}>At SoftHaven, we believe in the quiet magic of soft things — companions that bring comfort, joy and warmth to everyday moments.</p>
        <Link className={styles.button} href="/shop">Explore SoftHaven <Icon name="arrow" /></Link>
      </div>
      <div className={styles.heroVisual} aria-label="SoftHaven plush companions">
        <span className={`${styles.orbit} ${styles.orbitOne}`} aria-hidden="true" />
        <span className={`${styles.orbit} ${styles.orbitTwo}`} aria-hidden="true" />
        <span className={styles.sparkle} aria-hidden="true"><Icon name="sparkle" /></span>
        <ProductImage src={images.bunny} alt="Cloud cream bunny plush from the SoftHaven collection" className={styles.heroProduct} priority fit="cover" />
        <ProductImage src={images.bear} alt="Honey caramel teddy bear from the SoftHaven collection" className={styles.heroCompanion} fit="cover" />
        <span className={styles.heroCloud} aria-hidden="true" />
      </div>
    </section>
  );
}

function BrandPrinciples() {
  return (
    <section className={styles.principles} aria-labelledby="principles-title">
      <p className={styles.eyebrow} id="principles-title">What Makes Us Different</p>
      <div className={styles.principleGrid}>
        {principles.map((item) => (
          <article className={styles.principleCard} key={item.title}>
            <span className={`${styles.iconBubble} ${iconStyles[item.icon]}`}><Icon name={item.icon} /></span>
            <h2>{item.title}</h2>
            <p>{item.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function MomentCollage() {
  return (
    <div className={styles.collage} aria-label="A few SoftHaven companions for meaningful moments">
      <ProductImage src={images.sloth} alt="Several soft plush companions nestled on a blanket" className={`${styles.collageImage} ${styles.collageMain}`} fit="cover" />
      <ProductImage src={images.bear} alt="A teddy bear companion from SoftHaven" className={`${styles.collageImage} ${styles.collageTop}`} fit="cover" />
      <ProductImage src={images.heart} alt="Amour Velvet Heart Bear from the SoftHaven collection" className={`${styles.collageImage} ${styles.collageBottom}`} fit="cover" />
    </div>
  );
}

function EveryMoment() {
  return (
    <section className={styles.everyMoment} aria-labelledby="moment-title">
      <div className={styles.momentCopy}>
        <p className={styles.eyebrow}>Made For</p>
        <h2 id="moment-title">Every <em>Moment</em></h2>
        <p>Whether it’s a thoughtful gift, a celebration or simply something soft to keep close, SoftHaven is made for meaningful everyday moments.</p>
        <Link className={styles.textLink} href="/collections">Explore Collections <Icon name="arrow" /></Link>
      </div>
      <MomentCollage />
    </section>
  );
}

function BrandPromise() {
  return (
    <section className={styles.promise} aria-labelledby="promise-title">
      <div className={styles.promiseVisual}>
        <img className={styles.promiseTeddies} src="/assets/header-teddies.png" alt="Two teddy bear companions from SoftHaven" loading="lazy" />
        <span className={styles.promiseCloud} aria-hidden="true" />
      </div>
      <div className={styles.promiseCopy}>
        <p className={styles.eyebrow}>Our Promise</p>
        <h2 id="promise-title">Bringing a Little<br /><em>More Love</em> to the World.</h2>
        <p>Soft companions and thoughtful gifts for the moments worth holding close.</p>
        <Link className={styles.button} href="/shop">Shop Now <Icon name="arrow" /></Link>
      </div>
    </section>
  );
}

export function AboutPage() {
  return (
    <div className={styles.aboutPage}>
      <AboutHero />
      <BrandPrinciples />
      <EveryMoment />
      <BrandPromise />
    </div>
  );
}
