import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getStorefront } from '@/lib/storefront';
import { CollectionsPageMotion } from '@/components/collections-page-motion';
import { CollectionsFilmStrip } from '@/components/collections-film-strip';
import styles from './collections.module.css';

export const metadata: Metadata = {
  title: 'Collections | SoftHaven',
  description: 'Find your kind of soft. Thoughtfully curated plush companions for gifting, quiet comforts, and everyday moments.',
};

function Cloud({ depth, position, asset = 'soft-cloud-bank', eager = false }: { depth: 'far' | 'mid' | 'front'; position: string; asset?: string; eager?: boolean }) {
  return <div className={`${styles.cloud} ${styles[position]}`} data-cloud-depth={depth} aria-hidden="true">
    <Image src={`/assets/clouds/${asset}.webp`} alt="" width={1400} height={asset === 'soft-cloud-bank' ? 303 : 600} unoptimized loading={eager ? 'eager' : 'lazy'} />
  </div>;
}

function BenefitIcon({ type }: { type: 'heart' | 'sparkle' | 'gift' }) {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">{type === 'heart' ? <path d="M20.8 8.7c0 5.2-8.8 10.1-8.8 10.1S3.2 13.9 3.2 8.7A4.4 4.4 0 0 1 12 6.1a4.4 4.4 0 0 1 8.8 2.6Z" /> : type === 'sparkle' ? <path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2Z" /> : <path d="M20 12v8H4v-8M2 8h20v4H2zM12 8v12M12 8H8.6A2.6 2.6 0 1 1 11.2 5c.8 1.1.8 3 0 3H12Zm0 0h3.4A2.6 2.6 0 1 0 12.8 5c-.8 1.1-.8 3 0 3H12Z" />}</svg>;
}

const benefits = [
  { icon: 'heart' as const, title: <>Thoughtfully<br />Selected</>, description: 'Carefully chosen companions with personality and charm.' },
  { icon: 'sparkle' as const, title: <>Made for<br />Meaningful Moments</>, description: 'For celebrations, thoughtful gifts and everyday comfort.' },
  { icon: 'gift' as const, title: <>Gifting,<br />Made Softer</>, description: 'A little companion for moments worth remembering.' },
];
const selections = [
  { slug: 'teddy-classic-cuddles', title: 'Classic & Timeless', description: 'Teddy companions with familiar warmth.', image: '/assets/home-collections/teddy-editorial.jpg' },
  { slug: 'bunny-sweet-friends', title: 'Soft & Playful', description: 'Characters made for everyday company.', image: '/assets/home-collections/bunny-editorial.jpg' },
  { title: 'Made to Gift', description: 'Something meaningful for someone special.', image: '/assets/collections/soft-family-editorial-mobile.webp' },
];

export default async function CollectionsPage() {
  const { collections } = await getStorefront();
  return <CollectionsPageMotion>
    <div className={styles.page} data-collections-page>
      <section className={styles.hero} aria-labelledby="collections-title" data-collections-section="hero">
        <div className={styles.heroGlow} aria-hidden="true" />
        <Cloud depth="far" position="heroFar" asset="soft-cloud-distant" eager />
        <div className={`${styles.container} ${styles.heroLayout}`}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow} data-hero-enter>Our collections</span>
            <h1 id="collections-title"><span data-hero-enter>Find Your</span><span data-hero-enter>Kind of <em>Soft.</em></span></h1>
            <p data-hero-enter>Thoughtfully curated collections for every person, every mood and every special moment.</p>
            <Link className={styles.primaryButton} data-soft-cta href="#edit-title" data-hero-enter>Explore Collections <span aria-hidden="true">→</span></Link>
          </div>
          <div className={styles.heroArt} data-hero-art>
            <picture><source media="(max-width: 700px)" srcSet="/assets/collections/redesign/hero-mobile.webp" /><Image src="/assets/collections/redesign/hero.webp" alt="A pastel plush teddy with a lavender satin bow nestled in pink, lavender and blue clouds" width={1351} height={1164} preload unoptimized sizes="(max-width: 700px) 100vw, 58vw" /></picture>
          </div>
        </div>
        <Cloud depth="mid" position="heroMid" asset="soft-cloud-cluster" eager />
        <Cloud depth="front" position="heroFront" eager />
      </section>

      <section className={`${styles.container} ${styles.edit}`} aria-labelledby="edit-title" data-collections-section="edit">
        <div className={styles.editVisual}>
          <span className={styles.softWord} aria-hidden="true">SOFT</span>
          <svg width="0" height="0" className={styles.maskDefinition} aria-hidden="true"><defs><clipPath id="collections-editorial-mask" clipPathUnits="objectBoundingBox"><path d="M.02,.35 C.09,.29 .12,.12 .27,.10 L.60,.02 C.72,-.02 .77,.06 .79,.18 C.81,.27 .96,.25 .99,.46 C1.03,.64 .97,.85 .82,.91 C.61,1 .31,.99 .10,.93 C-.03,.89 -.04,.48 .02,.35Z" /></clipPath></defs></svg>
          <div className={styles.editPhoto}><picture><source media="(max-width: 700px)" srcSet="/assets/collections/redesign/edit-mobile.webp" /><Image src="/assets/collections/redesign/edit.webp" alt="A caramel teddy with a lavender bow and a cream bunny with a pink bow together on luxurious bedding among flowers" fill unoptimized sizes="(max-width: 900px) 90vw, 50vw" /></picture></div>
          <div className={styles.editLabel}><BenefitIcon type="sparkle" /><span><strong>SoftHaven Edit</strong><small>Thoughtfully selected.</small></span></div>
          <Cloud depth="front" position="editCloud" asset="soft-cloud-cluster" />
        </div>
        <div className={styles.editCopy}>
          <span className={`${styles.eyebrow} ${styles.rule}`}>The SoftHaven Edit</span>
          <h2 id="edit-title">Not Just Chosen.<br /><em>Chosen for You.</em></h2>
          <p>Some companions make you smile. Others simply feel like they were always meant to be yours.</p>
          <nav className={styles.selectionRows} aria-label="Find a companion for you">{selections.map(selection => {
            const collection = collections.find(item => item.slug === selection.slug);
            return <Link className={styles.selectionRow} href={collection ? `/shop?collection=${collection.slug}` : '/shop'} key={selection.title}><span className={styles.thumbnail}><Image src={selection.image} alt="" width={64} height={64} unoptimized /></span><span className={styles.rowCopy}><strong>{selection.title}</strong><small>{selection.description}</small></span><span className={styles.rowArrow} aria-hidden="true">→</span></Link>;
          })}</nav>
          <Link className={styles.primaryButton} data-soft-cta href="/shop">Discover your companion <span aria-hidden="true">→</span></Link>
        </div>
      </section>

      <CollectionsFilmStrip collections={collections} />

      <section className={styles.experience} aria-labelledby="experience-title" data-collections-section="experience">
        <div className={`${styles.container} ${styles.experienceLayout}`}>
          <div className={styles.experienceCopy}><span className={`${styles.eyebrow} ${styles.rule}`}>Why choose SoftHaven</span><h2 id="experience-title">A Softer<br /><em>Experience.</em></h2><p>Thoughtfully chosen companions for gifting, comforting and all the little moments in between.</p></div>
          <div className={styles.benefits}>{benefits.map((benefit, index) => <article className={styles.benefit} key={benefit.icon}><span className={styles.benefitNumber} aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><span className={styles.benefitIcon}><BenefitIcon type={benefit.icon} /></span><h3>{benefit.title}</h3><span className={styles.benefitAccent} aria-hidden="true" /><p>{benefit.description}</p></article>)}</div>
          <div className={styles.experienceVisual}><Image src="/assets/collections/redesign/peek.webp" alt="A teddy peeking out from soft pastel clouds" width={650} height={825} unoptimized sizes="(max-width: 700px) 65vw, 22vw" /><span aria-hidden="true" className={styles.heartAccent}>♡</span></div>
        </div>
        <Cloud depth="mid" position="experienceCloudLeft" asset="soft-cloud-cluster" />
        <Cloud depth="front" position="experienceCloudFront" />
      </section>

      <section className={`${styles.container} ${styles.ending}`} aria-labelledby="ending-title" data-collections-section="ending">
        <div className={styles.endingFrame}><span className={styles.eyebrow}>Find your favourite</span><h2 id="ending-title">There&apos;s a soft friend<br /><em>waiting for you.</em></h2><p>Explore the full SoftHaven collection and find the companion that feels just right.</p><Link className={styles.primaryButton} data-soft-cta href="/shop">Meet all companions <span aria-hidden="true">→</span></Link></div>
        <Cloud depth="mid" position="endingCloudLeft" asset="soft-cloud-cluster" />
        <Cloud depth="front" position="endingCloudRight" />
      </section>
    </div>
  </CollectionsPageMotion>;
}
