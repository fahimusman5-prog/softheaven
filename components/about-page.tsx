import Link from 'next/link';
import Image from 'next/image';
import { images } from '@/lib/data';
import { ProductMedia } from './product-media';
import { AboutPrinciples } from './about-principles';
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

function ProductImage({ src, alt, className, priority = false, fit = 'contain', optimized = false, sizes }: { src: string; alt: string; className?: string; priority?: boolean; fit?: 'contain' | 'cover'; optimized?: boolean; sizes?: string }) {
  return (
    <div className={`${styles.productImage} ${className ?? ''}`}>
      {optimized ? (
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes ?? '(max-width: 700px) 90vw, (max-width: 1100px) 44vw, 620px'}
          unoptimized
          className={styles.giftingImage}
        />
      ) : (
        <ProductMedia
          src={src}
          alt={alt}
          fill
          priority={priority}
          fit={fit}
          sizes={sizes ?? '(max-width: 700px) 90vw, (max-width: 1100px) 44vw, 620px'}
        />
      )}
    </div>
  );
}

function AboutHero() {
  return (
    <section className={styles.hero} aria-labelledby="about-title">
      <div className={styles.heroCopy}>
        <p className={styles.eyebrow}>Our Story</p>
        <h1 id="about-title">A Softer<br />Kind of<br /><span className={styles.heartLine}><em>Happiness.</em><span className={styles.headingHeart} aria-hidden="true">♡</span></span></h1>
        <p className={styles.heroLede}>At SoftHaven, we believe in the quiet magic of soft things — the kind that bring comfort, joy and a little more love into everyday life.</p>
        <Link className={styles.button} href="#principles">Our Journey <Icon name="arrow" /></Link>
      </div>
      <div className={styles.heroVisual}>
        <span className={`${styles.orbit} ${styles.orbitOne}`} aria-hidden="true" />
        <span className={styles.heroHeart} aria-hidden="true">♡</span>
        <span className={styles.sparkle} aria-hidden="true"><Icon name="sparkle" /></span>
        <Image className={styles.heroTeddy} src="/assets/about/story-teddy.webp" alt="Cream teddy bear with a lavender bow, seated among pastel clouds" fill priority unoptimized sizes="(max-width: 900px) 94vw, (max-width: 1500px) 55vw, 760px" />
        <Image className={`${styles.heroCloud} ${styles.heroCloudBack}`} src="/assets/clouds/generated/dream-cloud-06.webp" alt="" aria-hidden="true" unoptimized width={1280} height={640} sizes="(max-width: 900px) 100vw, 720px" />
        <Image className={styles.heroCloud} src="/assets/clouds/soft-cloud-bank.webp" alt="" aria-hidden="true" unoptimized width={1400} height={340} sizes="(max-width: 900px) 100vw, 900px" />
      </div>
    </section>
  );
}

function MomentCollage() {
  return (
    <div className={styles.collage} aria-label="A few SoftHaven companions for meaningful moments">
      <ProductImage src={images.sloth} alt="Several soft plush companions nestled on a blanket" className={`${styles.collageImage} ${styles.collageMain}`} fit="cover" />
      <ProductImage src={images.bear} alt="A teddy bear companion from SoftHaven" className={`${styles.collageImage} ${styles.collageTop}`} fit="cover" />
      <ProductImage
        src="/images/about/softheaven-gifting-moment.webp"
        alt="Three plush companions gathered in a pastel gift box"
        className={`${styles.collageImage} ${styles.collageBottom}`}
        fit="cover"
        optimized
        sizes="(max-width: 620px) 38vw, (max-width: 900px) 40vw, (max-width: 1100px) 27vw, (max-width: 1600px) 24vw, 400px"
      />
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
        <Image className={styles.promiseTeddies} src="/assets/about/plush-group.webp" alt="Three SoftHaven plush companions gathered together" fill unoptimized sizes="(max-width: 620px) 88vw, (max-width: 1100px) 45vw, 650px" />
        <Image className={styles.promiseCloud} src="/assets/clouds/soft-cloud-bank.webp" alt="" aria-hidden="true" unoptimized width={1400} height={340} sizes="(max-width: 620px) 100vw, 680px" />
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
      <div id="principles"><AboutPrinciples /></div>
      <EveryMoment />
      <BrandPromise />
    </div>
  );
}
