'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useCatalogue } from '@/components/catalogue-provider';

export function HomeEditorialJourney() {
  const {collections,sections} = useCatalogue();
  const root = useRef<HTMLElement>(null);
  const familyCollections = collections.filter((collection) => collection.featured);
  const [activeFamilySlug, setActiveFamilySlug] = useState(familyCollections[0]?.slug??'');
  const [previewFamilySlug, setPreviewFamilySlug] = useState<string | null>(null);
  const activeFamily = familyCollections.find((collection) => collection.slug === (previewFamilySlug ?? activeFamilySlug)) ?? familyCollections[0];
  const [discoverHoverSlug, setDiscoverHoverSlug] = useState<string | null>(null);
  const familyImages: Record<string, string> = {
    'teddy-classic-cuddles': '/assets/collections/soft-family-editorial-final-complete.webp',
    'bunny-sweet-friends': '/images/collections/bunny-sweet-friends.webp',
    'wild-wonderful': '/images/collections/wild-wonderful.webp',
  };
  const familySummaries: Record<string, string> = {
    'teddy-classic-cuddles': 'Timeless comfort.',
    'bunny-sweet-friends': 'Gentle little personalities.',
    'wild-wonderful': 'Made for playful hearts.',
  };
  const featuredCollections = collections.filter((collection) => ['teddy-classic-cuddles', 'bunny-sweet-friends', 'wild-wonderful'].includes(collection.slug));
  const discoverNames: Record<string, string> = {
    'teddy-classic-cuddles': 'Teddy & Classic Cuddles',
    'bunny-sweet-friends': 'Bunny & Sweet Friends',
    'wild-wonderful': 'Wild & Wonderful',
  };
  const discoverImages: Record<string, string> = {
    'teddy-classic-cuddles': '/assets/home-collections/teddy-classic-cuddles-complete.webp',
    'bunny-sweet-friends': '/assets/home-collections/bunny-sweet-friends-complete.webp',
    'wild-wonderful': '/assets/home-collections/wild-wonderful-complete.webp',
  };

  useEffect(() => {
    const node = root.current;
    if (!node) return;
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      media.add({ reduce: '(prefers-reduced-motion: reduce)', mobile: '(max-width: 767px)', desktop: '(min-width: 768px)' }, (match) => {
        if (match.conditions?.reduce) return;
        const mobile = Boolean(match.conditions?.mobile);
        const scenes = [
          { section: '.journey-discover', clouds: '[data-discover-parallax="clouds"]', word: '[data-discover-parallax="word"]' },
          { section: '.journey-details', clouds: '[data-story-parallax="clouds"]', word: '[data-story-parallax="word"]' },
          { section: '.journey-family', clouds: '[data-family-parallax="cloud"]', word: '[data-family-parallax="word"]' },
        ];
        scenes.forEach(({ section, clouds, word }) => {
          const timeline = gsap.timeline({ scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: mobile ? .35 : .7, invalidateOnRefresh: true } });
          timeline.fromTo(clouds, { x: 0, y: 0 }, { x: mobile ? 24 : 70, y: mobile ? -3 : -10, ease: 'none' }, 0);
          if (!mobile) timeline.fromTo(word, { y: 12 }, { y: -32, ease: 'none' }, 0);
        });
        if (!mobile) {
          gsap.fromTo('[data-story-parallax="photo"]', { y: 15 }, { y: -30, ease: 'none', scrollTrigger: { trigger: '.journey-details', start: 'top bottom', end: 'bottom top', scrub: .7 } });
          gsap.fromTo('[data-story-parallax="detail"]', { y: 20 }, { y: -50, ease: 'none', scrollTrigger: { trigger: '.journey-details', start: 'top bottom', end: 'bottom top', scrub: .7 } });
        }
      });
    }, node);
    return () => { media.revert(); context.revert(); };
  }, []);

  if(!activeFamily || featuredCollections.length<3) return null;
  return (
    <section className="home-journey" ref={root} aria-label="The SoftHaven story">
      {sections['discover']&&<><section className="journey-discover" aria-labelledby="journey-discover-title">
        <span className="journey-discover__word" data-discover-parallax="word" aria-hidden="true">Companions</span>
        <div className="journey-discover__inner">
          <div className="journey-discover__intro" data-journey-reveal>
            <span className="eyebrow">{sections['discover']?.eyebrow} <i aria-hidden="true" /></span>
            <h2 id="journey-discover-title">{sections['discover']?.title}<br /><em>{sections['discover']?.highlight}</em></h2>
            <p>{sections['discover']?.description}</p>
            <Link className="journey-discover__cta" href={sections['discover']?.cta_url??'/shop'}>{sections['discover']?.cta_label} <span aria-hidden="true">→</span></Link>
          </div>
          <div className="journey-discover__scene" aria-label="SoftHaven plush collection">
            <div className={`journey-discover__bunny ${discoverHoverSlug === featuredCollections[1].slug ? 'is-emphasized' : ''}`}><Image src={discoverImages[featuredCollections[1].slug]} alt="Creamy-white, blush-pink and pale lavender plush bunnies together" fill unoptimized sizes="(max-width: 700px) 46vw, (max-width: 1100px) 19vw, 290px" /></div>
            <div className={`journey-discover__teddy ${discoverHoverSlug === featuredCollections[0].slug ? 'is-emphasized' : ''}`}><Image src={discoverImages[featuredCollections[0].slug]} alt="Four teddy bears in caramel, cream, pink and mocha gathered together" fill unoptimized sizes="(max-width: 700px) 78vw, (max-width: 1100px) 48vw, 600px" /></div>
            <div className={`journey-discover__detail ${discoverHoverSlug === featuredCollections[2].slug ? 'is-emphasized' : ''}`}><Image src={discoverImages[featuredCollections[2].slug]} alt="Grey elephant, husky, mint dinosaur and pastel giraffe plush companions" fill unoptimized sizes="(max-width: 700px) 34vw, 250px" /></div>
            <Link className={`journey-discover__float journey-discover__float--teddy ${discoverHoverSlug === featuredCollections[0].slug ? 'is-emphasized' : ''}`} href={`/shop?collection=${featuredCollections[0].slug}`} onMouseEnter={() => setDiscoverHoverSlug(featuredCollections[0].slug)} onMouseLeave={() => setDiscoverHoverSlug(null)} onFocus={() => setDiscoverHoverSlug(featuredCollections[0].slug)} onBlur={() => setDiscoverHoverSlug(null)}><span aria-hidden="true">✦</span><strong>{discoverNames[featuredCollections[0].slug]}</strong></Link>
            <Link className={`journey-discover__float journey-discover__float--bunny ${discoverHoverSlug === featuredCollections[1].slug ? 'is-emphasized' : ''}`} href={`/shop?collection=${featuredCollections[1].slug}`} onMouseEnter={() => setDiscoverHoverSlug(featuredCollections[1].slug)} onMouseLeave={() => setDiscoverHoverSlug(null)} onFocus={() => setDiscoverHoverSlug(featuredCollections[1].slug)} onBlur={() => setDiscoverHoverSlug(null)}><span aria-hidden="true">♡</span><strong>{discoverNames[featuredCollections[1].slug]}</strong></Link>
            <Link className={`journey-discover__float journey-discover__float--wild ${discoverHoverSlug === featuredCollections[2].slug ? 'is-emphasized' : ''}`} href={`/shop?collection=${featuredCollections[2].slug}`} onMouseEnter={() => setDiscoverHoverSlug(featuredCollections[2].slug)} onMouseLeave={() => setDiscoverHoverSlug(null)} onFocus={() => setDiscoverHoverSlug(featuredCollections[2].slug)} onBlur={() => setDiscoverHoverSlug(null)}><span aria-hidden="true">⊞</span><strong>{discoverNames[featuredCollections[2].slug]}</strong></Link>
          </div>
        </div>
        <div className="journey-discover__clouds" data-discover-parallax="clouds" aria-hidden="true"><Image src="/assets/clouds/soft-cloud-bank.webp" alt="" fill unoptimized sizes="100vw" /></div>
        <nav className="journey-discover__rail" aria-label="Explore featured collections">
          {featuredCollections.map((collection, index) => <Link className={`journey-discover__rail-item journey-discover__rail-item--${index + 1} ${discoverHoverSlug === collection.slug ? 'is-emphasized' : ''}`} href={`/shop?collection=${collection.slug}`} key={collection.slug} onMouseEnter={() => setDiscoverHoverSlug(collection.slug)} onMouseLeave={() => setDiscoverHoverSlug(null)} onFocus={() => setDiscoverHoverSlug(collection.slug)} onBlur={() => setDiscoverHoverSlug(null)}>
            <span className="journey-discover__number">0{index + 1}</span><span className="journey-discover__rail-icon" aria-hidden="true">{['✦', '♡', '⊞'][index]}</span><strong>{discoverNames[collection.slug]}</strong><span className="journey-discover__arrow" aria-hidden="true">→</span>
          </Link>)}
        </nav>
      </section></>}

      {sections['details']&&<><section className="journey-details" aria-labelledby="journey-details-title">
        <svg className="journey-details__clip-defs" width="0" height="0" aria-hidden="true" focusable="false">
          <defs><clipPath id="journey-story-organic-clip" clipPathUnits="objectBoundingBox"><path d="M .015 .59 C .035 .31 .22 .025 .43 .025 C .59 .015 .615 .19 .75 .22 C .84 .245 .94 .195 .985 .38 C 1 .445 .99 .64 .96 .79 C .93 .93 .78 .98 .63 .94 C .47 .895 .37 .99 .2 .935 C .06 .895 .005 .78 .015 .59 Z" /></clipPath></defs>
        </svg>
        <span className="journey-details__word" data-story-parallax="word" aria-hidden="true">SOFT</span>
        <div className="journey-details__inner">
          <div className="journey-details__art" aria-label="SoftHaven teddy and bunny editorial photography">
            <div className="journey-details__photo-parallax" data-story-parallax="photo">
              <div className="journey-details__photo-enter" data-story-enter="photo">
                <div className="journey-details__photo-outline"><div className="journey-details__photo-mask"><Image src="/assets/home-story/why-softhaven-main-complete.webp" alt="SoftHaven caramel teddy, cream bunny and pink teddy nestled together in a soft pastel setting" fill unoptimized sizes="(max-width: 760px) 100vw, (max-width: 1100px) 55vw, 900px" /></div></div>
              </div>
            </div>
            <Image className="journey-details__cloud journey-details__cloud--left" src="/assets/clouds/soft-cloud-cluster.webp" width={700} height={370} alt="" unoptimized aria-hidden="true" />
            <div className="journey-details__cloud-parallax" data-story-parallax="clouds"><Image className="journey-details__cloud journey-details__cloud--front" src="/assets/clouds/soft-cloud-bank.webp" width={1500} height={600} alt="" unoptimized aria-hidden="true" /></div>
            <div className="journey-details__detail-parallax" data-story-parallax="detail"><div className="journey-details__detail" data-story-enter="detail"><Image src="/assets/home-story/why-softhaven-detail-complete.webp" alt="Close-up of soft caramel teddy fur and lavender satin bow" fill unoptimized sizes="(max-width: 760px) 36vw, 270px" /></div></div>
            <svg className="journey-details__heart" viewBox="0 0 100 85" fill="none" aria-hidden="true"><path d="M49 73C31 58 8 41 14 24c5-16 26-15 35 3 9-18 31-18 37-4 8 19-20 39-37 50Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M49 73c13 9 26 7 37 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            <svg className="journey-details__sparkle" viewBox="0 0 40 40" aria-hidden="true"><path d="M20 0c2.2 12 7.8 17.8 20 20-12.2 2.2-17.8 8-20 20C17.8 28 12.2 22.2 0 20 12.2 17.8 17.8 12 20 0Z" fill="currentColor" /></svg>
          </div>
          <div className="journey-details__copy" data-story-enter="copy">
            <span className="eyebrow">{sections['details']?.eyebrow} <i aria-hidden="true" /></span>
            <h2 id="journey-details-title">{sections['details']?.title}<br /><em>{sections['details']?.highlight}</em></h2>
            <p>{sections['details']?.description}</p>
            <Link className="journey-details__cta" href={sections['details']?.cta_url??'/shop'}>{sections['details']?.cta_label} <span aria-hidden="true">→</span></Link>
            <div className="journey-details__benefits" aria-label="SoftHaven qualities">
              <span><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 4C9 4 5 9 5 17c6 1 15-2 15-13ZM4 21c3-5 7-8 12-11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>Soft to hold</span>
              <span><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 20s-8-5.4-8-11a4.5 4.5 0 0 1 8-2.7A4.5 4.5 0 0 1 20 9c0 5.6-8 11-8 11Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>Made to gift</span>
              <span><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m12 2 2.9 6 6.6.9-4.8 4.7 1.1 6.6L12 17.1l-5.8 3.1 1.1-6.6-4.8-4.7L9.1 8 12 2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>Easy to love</span>
            </div>
          </div>
        </div>
      </section></>}


      {sections['family']&&<><section className="journey-family" aria-labelledby="journey-family-title">
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
          <div className="journey-family__image" aria-live="polite"><picture key={activeFamily.slug}><Image src={(sections.family?.image === '/assets/collections/soft-family-editorial-final.png' ? '/assets/collections/soft-family-editorial-final-complete.webp' : sections.family?.image)??familyImages[activeFamily.slug]??activeFamily.image??'/assets/collections/soft-family-editorial.webp'} alt={activeFamily.slug === 'teddy-classic-cuddles' ? 'Editorial plush family with a caramel teddy, cream bunny, lamb, puppy and kitten' : activeFamily.imageAlt ?? `${activeFamily.name} plush companions`} fill unoptimized sizes="(max-width: 700px) 94vw, (max-width: 1100px) 58vw, 64vw" /></picture></div>
          <span className="journey-family__sparkle" aria-hidden="true">✧</span>
          <article className="journey-family__note" aria-live="polite">
            <span>✧</span><div><small>Currently meeting</small><h3>{activeFamily.name}</h3><Link href={`/shop?collection=${activeFamily.slug}`}>Explore collection <span aria-hidden="true">→</span></Link></div>
          </article>
        </div>
        <span className="journey-family__cloud journey-family__cloud--bottom" data-family-parallax="cloud" aria-hidden="true"><Image src="/assets/clouds/soft-cloud-bank.webp" alt="" fill unoptimized sizes="100vw" /></span>
      </section></>}

      {sections['next-hug']&&<><section className="journey-next-hug" aria-labelledby="journey-next-hug-title">
        <svg className="journey-next-hug__defs" width="0" height="0" aria-hidden="true" focusable="false">
          <defs><clipPath id="next-hug-organic-clip" clipPathUnits="objectBoundingBox"><path d="M .01 .53 C .025 .26 .16 .18 .27 .065 C .38 -.04 .53 .05 .63 .085 C .79 .14 .83 .105 .94 .235 C 1 .31 .995 .45 .965 .55 C .925 .68 1 .76 .93 .88 C .86 1 .68 .94 .55 .98 C .39 1.02 .23 .95 .12 .9 C .015 .85 -.005 .69 .01 .53 Z" /></clipPath></defs>
        </svg>
        <span className="journey-next-hug__word" aria-hidden="true">HUG</span>
        <Image className="journey-next-hug__cloud journey-next-hug__cloud--top" src="/assets/clouds/soft-cloud-distant.webp" width={700} height={300} alt="" unoptimized aria-hidden="true" />
        <div className="journey-next-hug__inner">
          <div className="journey-next-hug__copy" data-next-hug-enter="copy">
            <span className="journey-next-hug__eyebrow">{sections['next-hug']?.eyebrow} <i aria-hidden="true" /></span>
            <h2 id="journey-next-hug-title">{sections['next-hug']?.title}<br /><em>{sections['next-hug']?.highlight}</em>is waiting.</h2>
            <p>{sections['next-hug']?.description}</p>
            <Link className="journey-next-hug__cta" href={sections['next-hug']?.cta_url??'/shop'}>{sections['next-hug']?.cta_label} <span aria-hidden="true">→</span></Link>
            <Link className="journey-next-hug__link" href="/shop">or explore every soft friend</Link>
          </div>
          <div className="journey-next-hug__art" data-next-hug-enter="photo" aria-label="Five SoftHaven plush companions together in a pastel cloud setting">
            <div className="journey-next-hug__photo-outline"><div className="journey-next-hug__photo"><Image src="/assets/home-story/softhaven-five-companions-complete.webp" alt="Five SoftHaven plush companions including a teddy bear, bunny, elephant, husky and mint dinosaur together in a pastel cloud setting" fill unoptimized sizes="(max-width: 760px) 100vw, (max-width: 1100px) 56vw, 920px" /></div></div>
            <Image className="journey-next-hug__cloud journey-next-hug__cloud--left" src="/assets/clouds/soft-cloud-cluster.webp" width={700} height={370} alt="" unoptimized aria-hidden="true" />
            <Image className="journey-next-hug__cloud journey-next-hug__cloud--front" src="/assets/clouds/soft-cloud-bank.webp" width={1400} height={303} alt="" unoptimized aria-hidden="true" />
          </div>
        </div>
      </section></>}
    </section>
  );
}
