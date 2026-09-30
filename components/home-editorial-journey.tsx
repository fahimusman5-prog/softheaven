'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { collections, getCollectionProducts } from '@/lib/collections';
import { products } from '@/lib/data';
import { ProductMedia } from '@/components/product-media';

export function HomeEditorialJourney() {
  const root = useRef<HTMLElement>(null);
  const [selectedSlug, setSelectedSlug] = useState(collections[0].slug);
  const selected = collections.find((collection) => collection.slug === selectedSlug) ?? collections[0];
  const featuredProduct = getCollectionProducts(selected)[0];
  const bunny = products.find((product) => product.id === 'celeste') ?? products[0];
  const sloth = products.find((product) => product.id === 'oliver') ?? products[0];
  const gift = products.find((product) => product.id === 'amour') ?? products[0];

  useEffect(() => {
    const node = root.current;
    if (!node || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      node.querySelectorAll<HTMLElement>('[data-journey-reveal]').forEach((element) => {
        gsap.from(element, {
          y: element.dataset.journeyDirection === 'up' ? 30 : 22,
          duration: 0.82,
          ease: 'power3.out',
          clearProps: 'transform',
          scrollTrigger: { trigger: element, start: 'top 88%', once: true },
        });
      });
      gsap.from('[data-family-item]', {
        y: (index) => 52 + ((index % 3) * 13),
        duration: 0.85,
        ease: 'power3.out',
        stagger: 0.1,
        clearProps: 'transform',
        scrollTrigger: { trigger: '[data-family-list]', start: 'top 82%', once: true },
      });
    }, node);

    return () => context.revert();
  }, []);

  return (
    <section className="home-journey" ref={root} aria-label="The SoftHaven story">
      <section className="chosen-care" aria-labelledby="chosen-care-title">
        <div className="chosen-care__cloud chosen-care__cloud--left" aria-hidden="true" />
        <div className="chosen-care__cloud chosen-care__cloud--right" aria-hidden="true" />
        <div className="chosen-care__cloud chosen-care__cloud--foreground" aria-hidden="true" />
        <div className="chosen-care__copy" data-journey-reveal>
          <span className="chosen-care__ghost" aria-hidden="true">SOFT</span>
          <span className="chosen-care__eyebrow">Why SoftHaven <i aria-hidden="true" /></span>
          <h2 id="chosen-care-title"><span>Chosen with care.</span><em>Kept for years.</em></h2>
          <p>More than something soft to hold. We choose companions for the celebrations, quiet moments and everyday memories that stay with you.</p>
          <Link className="chosen-care__cta" href="/about"><span>Discover our story</span><b aria-hidden="true">→</b></Link>
          <div className="chosen-care__features" aria-label="The SoftHaven difference">
            <span><i className="chosen-care__feature-icon chosen-care__feature-icon--leaf" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M19.5 4.5C11 5 5.3 9.2 5 16.3c-.1 2.1 1.1 3.2 3.2 3.1C15.3 19.1 19 13.7 19.5 4.5Z" /><path d="M6 19c3.8-5.2 7.7-8.7 12.5-12.5" /></svg></i><strong>Soft to hold</strong></span>
            <span><i className="chosen-care__feature-icon chosen-care__feature-icon--heart" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M20.5 8.7c0 5.1-8.5 10.1-8.5 10.1S3.5 13.8 3.5 8.7a4.4 4.4 0 0 1 8.5-1.6 4.4 4.4 0 0 1 8.5 1.6Z" /></svg></i><strong>Made to gift</strong></span>
            <span><i className="chosen-care__feature-icon chosen-care__feature-icon--star" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m12 3 2.1 5.7 6 .4-4.6 3.8 1.5 5.9-5-3.2-5 3.2 1.5-5.9-4.6-3.8 6-.4L12 3Z" /></svg></i><strong>Easy to love</strong></span>
          </div>
        </div>
        <div className="chosen-care__visual" data-journey-reveal data-journey-direction="up">
          <div className="chosen-care__photo"><Image src="/assets/softhaven/why-softhaven-editorial.webp" alt="A caramel teddy bear and cream bunny nestled together in pastel clouds" fill priority sizes="(max-width: 700px) 94vw, 54vw" /></div>
          <div className="chosen-care__detail"><Image src="/assets/softhaven/why-softhaven-detail.webp" alt="Close-up of plush fur, a lavender satin bow and a bear charm" fill sizes="(max-width: 700px) 36vw, 19vw" /></div>
          <span className="chosen-care__heart" aria-hidden="true">♡</span>
        </div>
      </section>

      <section className="journey-discover" aria-labelledby="journey-discover-title">
        <div className="journey-discover__intro" data-journey-reveal>
          <span className="eyebrow">Find your kind of companion</span>
          <h2 id="journey-discover-title">Find the One<br />That <em>Feels Like You.</em></h2>
          <p>Every personality is different. Explore the SoftHaven collections and find the companion that matches your world.</p>
          <div className="journey-collection-tabs" role="tablist" aria-label="Choose a SoftHaven collection">
            {collections.map((collection) => (
              <button
                type="button"
                key={collection.slug}
                role="tab"
                aria-selected={selected.slug === collection.slug}
                className={selected.slug === collection.slug ? 'is-selected' : ''}
                onClick={() => setSelectedSlug(collection.slug)}
              >{collection.name}</button>
            ))}
          </div>
        </div>
        <div className="journey-discover__visual" role="tabpanel" aria-label={selected.name}>
          {featuredProduct ? (
            <ProductMedia key={featuredProduct.id} product={featuredProduct} alt={featuredProduct.name} fit="cover" className="journey-discover__image" sizes="(max-width: 760px) 90vw, 56vw" />
          ) : (
            <div className="journey-discover__empty" aria-live="polite"><span aria-hidden="true">{selected.symbol}</span><strong>New friends are on their way</strong><small>This collection is growing. Meet the SoftHaven friends already here.</small></div>
          )}
          <div className="journey-discover__panel" aria-live="polite">
            <span className="eyebrow">SoftHaven collection</span>
            <h3>{selected.name}</h3>
            <p>{selected.description}</p>
            <Link className="text-button" href={`/shop?collection=${selected.slug}`}>Explore collection <span aria-hidden="true">→</span></Link>
          </div>
        </div>
      </section>

      <section className="journey-details" aria-labelledby="journey-details-title">
        <div className="journey-details__collage" aria-label="SoftHaven companions and gifting details">
          <div className="journey-details__photo journey-details__photo--main" data-journey-reveal data-journey-direction="up"><ProductMedia product={bunny} alt={bunny.name} fit="cover" sizes="(max-width: 760px) 90vw, 42vw" /></div>
          <div className="journey-details__photo journey-details__photo--top" data-journey-reveal><ProductMedia product={sloth} alt={sloth.name} fit="cover" sizes="(max-width: 760px) 42vw, 20vw" /></div>
          <div className="journey-details__photo journey-details__photo--gift" data-journey-reveal data-journey-direction="up"><ProductMedia product={gift} alt={gift.name} fit="cover" sizes="(max-width: 760px) 42vw, 20vw" /></div>
        </div>
        <div className="journey-details__copy" data-journey-reveal>
          <span className="eyebrow">SoftHaven details</span>
          <h2 id="journey-details-title">It’s the<br /><em>little things.</em></h2>
          <p>From the feel of the fabric to each character’s expression, our companions bring a little more warmth to everyday moments.</p>
          <ol>
            <li><span>01</span><div><strong>The Feel</strong><small>Soft companions made for happy hugs.</small></div></li>
            <li><span>02</span><div><strong>The Character</strong><small>Distinct expressions, colours and personalities.</small></div></li>
            <li><span>03</span><div><strong>The Moment</strong><small>For gifting, decorating or keeping close.</small></div></li>
          </ol>
        </div>
      </section>

      <section className="journey-gift" aria-labelledby="journey-gift-title">
        <div className="journey-gift__copy" data-journey-reveal>
          <span className="eyebrow">Made for meaningful moments</span>
          <h2 id="journey-gift-title">Some hugs are<br /><em>meant to be given.</em></h2>
          <p>Birthdays, little surprises, celebrations — or no reason at all. Find a SoftHaven companion for someone special.</p>
          <Link className="primary-button" href={`/product/${gift.slug}`}>Find the perfect gift <span aria-hidden="true">→</span></Link>
        </div>
        <div className="journey-gift__visual" data-journey-reveal data-journey-direction="up"><ProductMedia product={gift} alt={gift.name} fit="cover" className="journey-gift__image" sizes="(max-width: 760px) 90vw, 48vw" /><span>{gift.name}</span></div>
      </section>

      <section className="journey-family" aria-labelledby="journey-family-title">
        <div className="journey-family__heading" data-journey-reveal>
          <span className="eyebrow">Meet the SoftHaven family</span>
          <h2 id="journey-family-title">A world of<br /><em>soft companions.</em></h2>
          <p>From timeless teddies to playful characters, find a SoftHaven collection that feels right for you.</p>
          <Link className="text-button" href="/collections">Explore all collections <span aria-hidden="true">→</span></Link>
        </div>
        <div className="journey-family__list" data-family-list>
          {collections.map((collection) => {
            const product = getCollectionProducts(collection)[0];
            return <Link className={`journey-family__item${product ? '' : ' is-coming'}`} href={`/shop?collection=${collection.slug}`} key={collection.slug} data-family-item>
              <span className="journey-family__art">{product ? <ProductMedia product={product} alt={product.name} fit="contain" sizes="(max-width: 760px) 38vw, 16vw" /> : <span aria-hidden="true">{collection.symbol}</span>}</span>
              <strong>{collection.name}</strong>
              {!product && <small>Coming soon</small>}
            </Link>;
          })}
        </div>
      </section>

      <section className="journey-final" aria-labelledby="journey-final-title">
        <div className="journey-final__copy" data-journey-reveal>
          <span className="eyebrow">A softer day starts here</span>
          <h2 id="journey-final-title">There’s always room<br />for <em>one more hug.</em></h2>
          <p>Find the SoftHaven companion waiting for you.</p>
          <div><Link className="primary-button" href="/shop">Explore all plushies <span aria-hidden="true">→</span></Link><Link className="text-button" href="/contact">Need help choosing? <span aria-hidden="true">→</span></Link></div>
        </div>
        <div className="journey-final__art" data-journey-reveal data-journey-direction="up"><ProductMedia product={bunny} alt={bunny.name} fit="cover" sizes="(max-width: 760px) 80vw, 34vw" /></div>
      </section>
    </section>
  );
}
