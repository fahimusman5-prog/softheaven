'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useCatalogue } from '@/components/catalogue-provider';

export function HomeEditorialJourney() {
  const { collections, sections } = useCatalogue();
  const root = useRef<HTMLElement>(null);
  const familyCollections = collections.filter((collection) => collection.featured);
  const [activeFamilySlug, setActiveFamilySlug] = useState(familyCollections[0]?.slug ?? '');
  const [previewFamilySlug, setPreviewFamilySlug] = useState<string | null>(null);
  const activeFamily = familyCollections.find((collection) => collection.slug === (previewFamilySlug ?? activeFamilySlug)) ?? familyCollections[0];
  const familyImages: Record<string, string> = {
    'teddy-classic-cuddles': '/assets/collections/soft-family-editorial.webp',
    'bunny-sweet-friends': '/images/collections/bunny-sweet-friends.webp',
    'wild-wonderful': '/images/collections/wild-wonderful.webp',
  };
  const familySummaries: Record<string, string> = {
    'teddy-classic-cuddles': 'Timeless comfort.',
    'bunny-sweet-friends': 'Gentle little personalities.',
    'wild-wonderful': 'Made for playful hearts.',
  };
  const featuredCollections = collections.filter((collection) => ['teddy-classic-cuddles', 'bunny-sweet-friends', 'wild-wonderful'].includes(collection.slug));

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
      gsap.to('[data-family-parallax="word"]', { y: -20, ease: 'none', scrollTrigger: { trigger: '.journey-family', start: 'top bottom', end: 'bottom top', scrub: 1 } });
      gsap.to('[data-family-parallax="cloud"]', { y: -34, ease: 'none', scrollTrigger: { trigger: '.journey-family', start: 'top bottom', end: 'bottom top', scrub: 1 } });
      gsap.to('[data-discover-parallax="word"]', { y: -22, ease: 'none', scrollTrigger: { trigger: '.journey-discover', start: 'top bottom', end: 'bottom top', scrub: 1 } });
      gsap.to('[data-discover-parallax="clouds"]', { y: -38, ease: 'none', scrollTrigger: { trigger: '.journey-discover', start: 'top bottom', end: 'bottom top', scrub: 1 } });
      gsap.from('[data-story-enter="photo"]', {
        y: 25, scale: .985, opacity: .92, duration: 1.15, ease: 'power3.out',
        scrollTrigger: { trigger: '.journey-details', start: 'top 82%', once: true },
      });
      gsap.from('[data-story-enter="detail"]', {
        y: 30, scale: .96, opacity: .65, duration: 1, delay: .12, ease: 'power3.out',
        scrollTrigger: { trigger: '.journey-details', start: 'top 80%', once: true },
      });
      gsap.from('[data-story-enter="copy"] > *', {
        y: 16, opacity: .85, duration: .85, stagger: .09, ease: 'power3.out',
        scrollTrigger: { trigger: '.journey-details', start: 'top 78%', once: true },
      });
      gsap.to('[data-story-parallax="word"]', { y: -20, ease: 'none', scrollTrigger: { trigger: '.journey-details', start: 'top bottom', end: 'bottom top', scrub: 1 } });
      gsap.to('[data-story-parallax="photo"]', { y: -24, ease: 'none', scrollTrigger: { trigger: '.journey-details', start: 'top bottom', end: 'bottom top', scrub: 1 } });
      gsap.to('[data-story-parallax="detail"]', { y: -42, ease: 'none', scrollTrigger: { trigger: '.journey-details', start: 'top bottom', end: 'bottom top', scrub: 1 } });
      gsap.to('[data-story-parallax="clouds"]', { y: -48, ease: 'none', scrollTrigger: { trigger: '.journey-details', start: 'top bottom', end: 'bottom top', scrub: 1 } });
      gsap.from('[data-next-hug-enter="photo"]', {
        y: 35, scale: .985, opacity: .92, duration: .98, ease: 'power3.out', clearProps: 'transform,opacity',
        scrollTrigger: { trigger: '.journey-next-hug', start: 'top 80%', once: true },
      });
      gsap.from('[data-next-hug-enter="copy"] > *', {
        y: 25, opacity: .86, duration: .82, stagger: .1, ease: 'power3.out', clearProps: 'transform,opacity',
        scrollTrigger: { trigger: '.journey-next-hug', start: 'top 78%', once: true },
      });
    }, node);

    const nextHugArt = node.querySelector<HTMLElement>('[data-next-hug-pointer]');
    const supportsPointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const moveNextHug = (event: PointerEvent) => {
      if (!nextHugArt) return;
      const bounds = nextHugArt.getBoundingClientRect();
      nextHugArt.style.setProperty('--hug-pointer-x', `${((event.clientX - bounds.left) / bounds.width - .5) * 8}px`);
      nextHugArt.style.setProperty('--hug-pointer-y', `${((event.clientY - bounds.top) / bounds.height - .5) * 8}px`);
    };
    const resetNextHug = () => {
      nextHugArt?.style.setProperty('--hug-pointer-x', '0px');
      nextHugArt?.style.setProperty('--hug-pointer-y', '0px');
    };
    if (nextHugArt && supportsPointer) {
      nextHugArt.addEventListener('pointermove', moveNextHug);
      nextHugArt.addEventListener('pointerleave', resetNextHug);
    }
    return () => {
      nextHugArt?.removeEventListener('pointermove', moveNextHug);
      nextHugArt?.removeEventListener('pointerleave', resetNextHug);
      context.revert();
    };
  }, []);

  if (!activeFamily || featuredCollections.length < 3) return null;
  return (
    <section className="home-journey" ref={root} aria-label="The SoftHaven story">
      {sections['discover'] && <><section className="journey-discover" aria-labelledby="journey-discover-title">
        <span className="journey-discover__word" data-discover-parallax="word" aria-hidden="true">Companions</span>
        <div className="journey-discover__inner">
          <div className="journey-discover__intro" data-journey-reveal>
            <span className="eyebrow">{sections['discover']?.eyebrow} <i aria-hidden="true" /></span>
            <h2 id="journey-discover-title">{sections['discover']?.title}<br /><em>{sections['discover']?.highlight}</em></h2>
            <p>{sections['discover']?.description}</p>
            <Link className="journey-discover__cta" href={sections['discover']?.cta_url ?? '/shop'}>{sections['discover']?.cta_label} <span aria-hidden="true">→</span></Link>
          </div>
          <div className="journey-discover__scene" aria-label="SoftHaven plush collection">
            <div className="journey-discover__bunny"><Image src="/assets/home-collections/bunny-editorial.jpg" alt="A white plush bunny with a pink satin bow" fill unoptimized sizes="(max-width: 700px) 46vw, 290px" /></div>
            <div className="journey-discover__teddy"><Image src={sections['discover']?.image ?? '/assets/home-collections/teddy-editorial.jpg'} alt="A caramel teddy bear wearing a lavender satin bow" fill unoptimized sizes="(max-width: 700px) 78vw, (max-width: 1100px) 48vw, 600px" /></div>
            <div className="journey-discover__detail"><Image src="/assets/home-collections/detail-editorial.jpg" alt="Lavender satin bow and gold teddy charm on plush fur" fill unoptimized sizes="(max-width: 700px) 34vw, 250px" /></div>
            <Link className="journey-discover__float journey-discover__float--teddy" href={`/shop?collection=${featuredCollections[0].slug}`}><span aria-hidden="true">✦</span><span><strong>{featuredCollections[0].name}</strong><small>Timeless favourites.</small></span></Link>
            <Link className="journey-discover__float journey-discover__float--bunny" href={`/shop?collection=${featuredCollections[1].slug}`}><span aria-hidden="true">♡</span><span><strong>{featuredCollections[1].name}</strong><small>Soft. Playful. Adorable.</small></span></Link>
            <Link className="journey-discover__float journey-discover__float--wild" href={`/shop?collection=${featuredCollections[2].slug}`}><span aria-hidden="true">⊞</span><span><strong>{featuredCollections[2].name}</strong><small>For little dreamers.</small></span></Link>
          </div>
        </div>
        <div className="journey-discover__clouds" data-discover-parallax="clouds" aria-hidden="true"><Image src="/assets/clouds/soft-cloud-bank.webp" alt="" fill unoptimized sizes="100vw" /></div>
        <nav className="journey-discover__rail" aria-label="Explore featured collections">
          {featuredCollections.map((collection, index) => <Link className={`journey-discover__rail-item journey-discover__rail-item--${index + 1}`} href={`/shop?collection=${collection.slug}`} key={collection.slug}>
            <span className="journey-discover__number">0{index + 1}</span><span className="journey-discover__rail-icon" aria-hidden="true">{['✦', '♡', '⊞'][index]}</span><strong>{collection.name}</strong><span className="journey-discover__arrow" aria-hidden="true">→</span>
          </Link>)}
        </nav>
      </section></>}

      {sections['details'] && <><section className="journey-details" aria-labelledby="journey-details-title">
        <svg className="journey-details__clip-defs" width="0" height="0" aria-hidden="true" focusable="false">
          <defs><clipPath id="journey-story-organic-clip" clipPathUnits="objectBoundingBox"><path d="M .015 .59 C .035 .31 .22 .025 .43 .025 C .59 .015 .615 .19 .75 .22 C .84 .245 .94 .195 .985 .38 C 1 .445 .99 .64 .96 .79 C .93 .93 .78 .98 .63 .94 C .47 .895 .37 .99 .2 .935 C .06 .895 .005 .78 .015 .59 Z" /></clipPath></defs>
        </svg>
        <span className="journey-details__word" data-story-parallax="word" aria-hidden="true">SOFT</span>
        <div className="journey-details__inner">
          <div className="journey-details__art" aria-label="SoftHaven teddy and bunny editorial photography">
            <div className="journey-details__photo-parallax" data-story-parallax="photo">
              <div className="journey-details__photo-enter" data-story-enter="photo">
                <div className="journey-details__photo-outline"><div className="journey-details__photo-mask"><Image src={sections['details']?.image ?? '/assets/home-story/teddy-bunny-editorial.jpg'} alt="Caramel teddy with lavender bow cuddled beside a cream bunny with pink bow" fill unoptimized sizes="(max-width: 760px) 100vw, (max-width: 1100px) 55vw, 900px" /></div></div>
              </div>
            </div>
            <Image className="journey-details__cloud journey-details__cloud--left" src="/assets/clouds/soft-cloud-cluster.webp" width={700} height={370} alt="" unoptimized aria-hidden="true" />
            <div className="journey-details__cloud-parallax" data-story-parallax="clouds"><Image className="journey-details__cloud journey-details__cloud--front" src="/assets/clouds/soft-cloud-bank.webp" width={1500} height={600} alt="" unoptimized aria-hidden="true" /></div>
            <div className="journey-details__detail-parallax" data-story-parallax="detail"><div className="journey-details__detail" data-story-enter="detail"><Image src="/assets/home-collections/detail-editorial.jpg" alt="Lavender satin ribbon and gold teddy charm on plush fur" fill unoptimized sizes="(max-width: 760px) 36vw, 270px" /></div></div>
            <svg className="journey-details__heart" viewBox="0 0 100 85" fill="none" aria-hidden="true"><path d="M49 73C31 58 8 41 14 24c5-16 26-15 35 3 9-18 31-18 37-4 8 19-20 39-37 50Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M49 73c13 9 26 7 37 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            <svg className="journey-details__sparkle" viewBox="0 0 40 40" aria-hidden="true"><path d="M20 0c2.2 12 7.8 17.8 20 20-12.2 2.2-17.8 8-20 20C17.8 28 12.2 22.2 0 20 12.2 17.8 17.8 12 20 0Z" fill="currentColor" /></svg>
          </div>
          <div className="journey-details__copy" data-story-enter="copy">
            <span className="eyebrow">{sections['details']?.eyebrow} <i aria-hidden="true" /></span>
            <h2 id="journey-details-title">{sections['details']?.title}<br /><em>{sections['details']?.highlight}</em></h2>
            <p>{sections['details']?.description}</p>
            <Link className="journey-details__cta" href={sections['details']?.cta_url ?? '/shop'}>{sections['details']?.cta_label} <span aria-hidden="true">→</span></Link>
            <div className="journey-details__benefits" aria-label="SoftHaven qualities">
              <span><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 4C9 4 5 9 5 17c6 1 15-2 15-13ZM4 21c3-5 7-8 12-11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>Soft to hold</span>
              <span><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 20s-8-5.4-8-11a4.5 4.5 0 0 1 8-2.7A4.5 4.5 0 0 1 20 9c0 5.6-8 11-8 11Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>Made to gift</span>
              <span><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m12 2 2.9 6 6.6.9-4.8 4.7 1.1 6.6L12 17.1l-5.8 3.1 1.1-6.6-4.8-4.7L9.1 8 12 2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>Easy to love</span>
            </div>
          </div>
        </div>
      </section></>}

      {sections['family'] && <><section className="journey-family" aria-labelledby="journey-family-title">
        <span className="journey-family__cloud journey-family__cloud--top" data-family-parallax="cloud" aria-hidden="true"><Image src="/assets/clouds/soft-cloud-cluster.webp" alt="" fill unoptimized sizes="420px" /></span>
        <span className="journey-family__word" data-family-parallax="word" aria-hidden="true">FAMILY</span>
        <div className="journey-family__heading">
          <span className="eyebrow">{sections['family']?.eyebrow} <i aria-hidden="true" /></span>
          <h2 id="journey-family-title">{sections['family']?.title}<br /><em>{sections['family']?.highlight}</em></h2>
          <p>{sections['family']?.description}</p>
          <div className="journey-family__list" role="group" aria-label="Choose a collection">
            {familyCollections.map((collection, index) => <button
              className={`journey-family__item${activeFamily.slug === collection.slug ? ' is-active' : ''}`}
              type="button"
              key={collection.slug}
              aria-pressed={activeFamilySlug === collection.slug}
              onMouseEnter={() => setPreviewFamilySlug(collection.slug)}
              onMouseLeave={() => setPreviewFamilySlug(null)}
              onFocus={() => setPreviewFamilySlug(collection.slug)}
              onBlur={() => setPreviewFamilySlug(null)}
              onClick={() => { setActiveFamilySlug(collection.slug); setPreviewFamilySlug(null); }}>
              <span className="journey-family__number">0{index + 1}</span>
              <span className="journey-family__icon" aria-hidden="true">{index === 0 ? '♡' : index === 1 ? '♧' : '✦'}</span>
              <span className="journey-family__label"><strong>{collection.name}</strong><small>{familySummaries[collection.slug]}</small></span>
              <span className="journey-family__arrow" aria-hidden="true">→</span>
            </button>)}
          </div>
        </div>
        <div className="journey-family__visual">
          <span className="journey-family__heart" aria-hidden="true">♡</span>
          <div className="journey-family__image" aria-live="polite"><picture key={activeFamily.slug}>{activeFamily.slug === 'teddy-classic-cuddles' && <source media="(max-width: 700px)" srcSet="/assets/collections/soft-family-editorial-mobile.webp" />}<Image src={familyImages[activeFamily.slug]} alt={activeFamily.slug === 'teddy-classic-cuddles' ? 'Editorial plush family with a caramel teddy, cream bunny, lamb, puppy and kitten' : activeFamily.imageAlt ?? `${activeFamily.name} plush companions`} fill unoptimized sizes="(max-width: 700px) 94vw, (max-width: 1100px) 58vw, 64vw" /></picture></div>
          <span className="journey-family__sparkle" aria-hidden="true">✧</span>
          <article className="journey-family__note" aria-live="polite">
            <span>✧</span><div><small>Currently meeting</small><h3>{activeFamily.name}</h3><Link href={`/shop?collection=${activeFamily.slug}`}>Explore collection <span aria-hidden="true">→</span></Link></div>
          </article>
        </div>
        <span className="journey-family__cloud journey-family__cloud--bottom" data-family-parallax="cloud" aria-hidden="true"><Image src="/assets/clouds/soft-cloud-bank.webp" alt="" fill unoptimized sizes="100vw" /></span>
      </section></>}

      {sections['next-hug'] && <><section className="journey-next-hug" aria-labelledby="journey-next-hug-title">
        <svg className="journey-next-hug__defs" width="0" height="0" aria-hidden="true" focusable="false"><defs><clipPath id="next-hug-organic-clip" clipPathUnits="objectBoundingBox"><path d="M .01 .53 C .025 .26 .16 .18 .27 .065 C .38 -.04 .53 .05 .63 .085 C .79 .14 .83 .105 .94 .235 C 1 .31 .995 .45 .965 .55 C .925 .68 1 .76 .93 .88 C .86 1 .68 .94 .55 .98 C .39 1.02 .23 .95 .12 .9 C .015 .85 -.005 .69 .01 .53 Z" /></clipPath></defs></svg>
        <span className="journey-next-hug__word" aria-hidden="true">HUG</span>
        <Image className="journey-next-hug__cloud journey-next-hug__cloud--top" src="/assets/clouds/soft-cloud-distant.webp" width={700} height={300} alt="" unoptimized aria-hidden="true" />
        <div className="journey-next-hug__inner">
          <div className="journey-next-hug__copy" data-next-hug-enter="copy"><span className="journey-next-hug__eyebrow">{sections['next-hug']?.eyebrow} <i aria-hidden="true" /></span><h2 id="journey-next-hug-title">{sections['next-hug']?.title}<br /><em>{sections['next-hug']?.highlight}</em><br />is waiting.</h2><p>{sections['next-hug']?.description}</p><Link className="journey-next-hug__cta" href={sections['next-hug']?.cta_url ?? '/shop'}>{sections['next-hug']?.cta_label} <span aria-hidden="true">→</span></Link><Link className="journey-next-hug__link" href="/shop">or explore every soft friend</Link></div>
          <div className="journey-next-hug__art" data-next-hug-enter="photo" data-next-hug-pointer aria-label="Caramel teddy and cream bunny in a sunlit bedroom"><div className="journey-next-hug__photo-outline"><div className="journey-next-hug__photo"><Image src={sections['next-hug']?.image ?? '/assets/home-story/teddy-bunny-editorial.jpg'} alt="Caramel teddy with a lavender bow beside a cream bunny with a pink bow" fill unoptimized sizes="(max-width: 760px) 94vw, (max-width: 1100px) 54vw, 920px" priority /></div></div><span className="journey-next-hug__note">this one&apos;s<br />waiting for you ♡</span><svg className="journey-next-hug__doodle" viewBox="0 0 100 84" fill="none" aria-hidden="true"><path d="M48 74C31 58 8 40 14 23c5-16 26-14 34 4 9-18 31-18 38-4 7 18-20 39-38 51Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /><path d="M16 70c14 8 33 7 47 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg><Image className="journey-next-hug__cloud journey-next-hug__cloud--left" src="/assets/clouds/soft-cloud-cluster.webp" width={700} height={370} alt="" unoptimized aria-hidden="true" /><Image className="journey-next-hug__cloud journey-next-hug__cloud--front" src="/assets/clouds/soft-cloud-bank.webp" width={1400} height={303} alt="" unoptimized aria-hidden="true" /></div>
        </div>
      </section></>}
    </section>
  );
}
