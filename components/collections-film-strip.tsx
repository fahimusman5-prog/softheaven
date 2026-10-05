'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { SoftHavenCollection } from '@/lib/collections';
import { ProductMedia } from '@/components/product-media';
import styles from './collections-film-strip.module.css';

// Only imagery falls back to the existing asset library; names, descriptions,
// ordering, availability, and destinations always come from the live catalogue.
const imageFallbacks: Record<string, string> = {
  'teddy-classic-cuddles': '/images/collections/teddy-classic-cuddles.webp',
  'bunny-sweet-friends': '/images/collections/bunny-sweet-friends.webp',
  'wild-wonderful': '/images/collections/wild-wonderful.webp',
  'puppy-pals': '/assets/collections/personalities/puppy-pals.webp',
  'kitty-corner': '/assets/collections/personalities/kitty-corner.webp',
  'fantasy-friends': '/assets/collections/personalities/fantasy-friends.webp',
};
const editorialCovers: Record<string, string> = {
  'teddy-classic-cuddles': '/assets/home-collections/teddy-editorial.jpg',
  'bunny-sweet-friends': '/assets/home-collections/bunny-editorial.jpg',
};
function collectionCover(collection: SoftHavenCollection) {
  const fallback = imageFallbacks[collection.slug];
  // Art-direct known library images for the new cover format, while honouring
  // any custom image supplied by the collection editor.
  return !collection.image || collection.image === fallback
    ? editorialCovers[collection.slug] ?? collection.image ?? fallback
    : collection.image;
}
const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

export function CollectionsFilmStrip({ collections }: { collections: SoftHavenCollection[] }) {
  const root = useRef<HTMLElement>(null);
  const moveTo = useRef<(index: number) => void>(() => {});
  const activeIndex = useRef(0);
  const count = collections.length;
  const echoCount = count > 1 ? Math.min(2, count - 1) : 0;
  // In animated mode, two decorative neighbours keep the ribbon full at its ends.
  // They never enter the keyboard/screen-reader order or the fallback layout.
  const items = [
    ...collections.slice(-echoCount || count).map((collection, i) => ({ collection, index: i - echoCount, echo: true })),
    ...collections.map((collection, index) => ({ collection, index, echo: false })),
    ...collections.slice(0, echoCount).map((collection, i) => ({ collection, index: count + i, echo: true })),
  ];

  useEffect(() => {
    const section = root.current;
    if (!section || !count) return;
    const viewport = section.querySelector<HTMLElement>('[data-reel-viewport]')!;
    const track = section.querySelector<HTMLElement>('[data-reel-track]')!;
    const positions = Array.from(track.querySelectorAll<HTMLElement>('[data-reel-position]'));
    const originals = positions.filter(item => item.dataset.echo !== 'true');
    const buttons = Array.from(section.querySelectorAll<HTMLButtonElement>('[data-reel-select]'));
    const currentLabel = section.querySelector<HTMLElement>('[data-reel-current]')!;
    let disposed = false;
    let refreshFrame = 0;
    const updateActive = (index: number) => {
      activeIndex.current = index;
      currentLabel.textContent = String(index + 1).padStart(2, '0');
      originals.forEach(item => { item.dataset.active = String(Number(item.dataset.reelIndex) === index); });
      buttons.forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.reelSelect) === index)));
    };
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      media.add('(prefers-reduced-motion: reduce)', () => {
        section.dataset.reelMode = 'static';
        const select = (index: number) => {
          const item = originals[clamp(index, 0, count - 1)];
          viewport.scrollTo({ left: track.offsetLeft + item.offsetLeft - (viewport.clientWidth - item.offsetWidth) / 2, behavior: 'instant' });
          updateActive(clamp(index, 0, count - 1));
        };
        moveTo.current = select;
        const onScroll = () => {
          const center = viewport.scrollLeft + viewport.clientWidth / 2;
          let closest = 0;
          originals.forEach((item, i) => { if (Math.abs(track.offsetLeft + item.offsetLeft + item.offsetWidth / 2 - center) < Math.abs(track.offsetLeft + originals[closest].offsetLeft + originals[closest].offsetWidth / 2 - center)) closest = i; });
          updateActive(closest);
        };
        viewport.addEventListener('scroll', onScroll, { passive: true });
        return () => { viewport.removeEventListener('scroll', onScroll); if (section.dataset.reelMode === 'static') delete section.dataset.reelMode; };
      });
      media.add({ desktop: '(min-width: 1025px)', tablet: '(min-width: 768px) and (max-width: 1024px)', mobile: '(max-width: 767px)', motion: '(prefers-reduced-motion: no-preference)' }, match => {
        if (!match.conditions?.motion) return;
        const mobile = Boolean(match.conditions?.mobile);
        const tablet = Boolean(match.conditions?.tablet);
        section.dataset.reelMode = 'animated';
        viewport.scrollLeft = 0;
        const driver = { progress: 0 };
        let origin = 0;
        let travel = 0;
        let step = 0;
        let cardWidth = 0;
        let lastScrollProgress = 0;
        let manualOffset = 0;
        let manualMode = false;
        let manualTween: gsap.core.Tween | undefined;
        const setTrackX = gsap.quickSetter(track, 'x', 'px');
        const setters = positions.map(item => ({
          item,
          offset: 0,
          y: gsap.quickSetter(item, 'y', 'px'),
          rotation: gsap.quickSetter(item, 'rotation', 'deg'),
          scaleX: gsap.quickSetter(item, 'scaleX'),
          scaleY: gsap.quickSetter(item, 'scaleY'),
          opacity: gsap.quickSetter(item, 'opacity'),
          imageX: gsap.quickSetter(item.querySelector('[data-reel-image]'), 'x', 'px'),
        }));
        const render = (progress: number) => {
          driver.progress = clamp(progress);
          const x = origin - travel * driver.progress;
          setTrackX(x);
          setters.forEach(({ item, offset, y, rotation, scaleX, scaleY, opacity, imageX }) => {
            const relative = (offset + cardWidth / 2 + x - viewport.clientWidth / 2) / step;
            const distance = Math.min(Math.abs(relative), 3);
            y((mobile ? 32 : 65) - distance * distance * (mobile ? 5 : tablet ? 17 : 27));
            rotation(-clamp(relative, -2.3, 2.3) * (mobile ? 2.5 : tablet ? 6 : 10));
            const emphasis = 1.1 - Math.min(distance, 2) * .12;
            scaleX(emphasis);
            scaleY(emphasis);
            opacity(1 - Math.min(distance, 2) * .075);
            item.style.zIndex = String(Math.round(100 - distance * 15));
            imageX(clamp(relative, -2, 2) * (mobile ? -5 : -9));
          });
          const index = Math.round(driver.progress * Math.max(0, count - 1));
          if (index !== activeIndex.current) updateActive(index);
        };
        const measure = () => {
          setters.forEach(setter => { setter.offset = setter.item.offsetLeft; });
          cardWidth = originals[0].offsetWidth;
          step = cardWidth + parseFloat(getComputedStyle(track).columnGap || '0');
          origin = (viewport.clientWidth - cardWidth) / 2 - originals[0].offsetLeft;
          // Measured first-to-last centres, independent of collection count/viewport.
          travel = Math.max(0, originals[count - 1].offsetLeft - originals[0].offsetLeft);
          const width = viewport.clientWidth;
          const curve = mobile ? 5 : tablet ? 17 : 27;
          const edgeX = -width * .15;
          const rightX = width * 1.15;
          const distance = (width / 2 - edgeX) / step;
          const height = originals[0].offsetHeight;
          section.querySelectorAll<SVGPathElement>('[data-reel-rail]').forEach(path => {
            const centerY = path.dataset.reelRail === 'top' ? (mobile ? 19 : 43) : height + (mobile ? 53 : 94);
            const edgeY = centerY - distance * distance * curve;
            path.setAttribute('d', `M ${edgeX} ${edgeY} Q ${width / 2} ${2 * centerY - edgeY} ${rightX} ${edgeY}`);
          });
          const rail = section.querySelector<SVGSVGElement>('[data-reel-ribbon]')!;
          rail.setAttribute('viewBox', `0 0 ${width} ${viewport.clientHeight}`);
          render(driver.progress);
        };
        measure();
        updateActive(0);
        const trigger = ScrollTrigger.create({
          trigger: section,
          start: 'top top',
          end: mobile ? 'bottom 65%' : 'bottom 60%',
          invalidateOnRefresh: true,
          onRefreshInit: measure,
          onRefresh: self => {
            if (manualMode) manualOffset = driver.progress - self.progress;
            lastScrollProgress = self.progress;
            render(clamp(self.progress + manualOffset));
          },
          onUpdate: self => {
            lastScrollProgress = self.progress;
            if (manualTween?.isActive()) return;
            render(clamp(self.progress + manualOffset));
          },
        });
        moveTo.current = index => {
          const progress = count > 1 ? clamp(index, 0, count - 1) / (count - 1) : 0;
          manualTween?.kill();
          manualMode = true;
          manualOffset = progress - lastScrollProgress;
          manualTween = gsap.to(driver, { progress, duration: .55, ease: 'power2.out', onUpdate: () => { manualOffset = driver.progress - lastScrollProgress; render(driver.progress); } });
        };
        const focusCard = (event: FocusEvent) => {
          const item = (event.target as HTMLElement).closest<HTMLElement>('[data-reel-position]');
          if (item && item.dataset.echo !== 'true') moveTo.current(Number(item.dataset.reelIndex));
        };
        track.addEventListener('focusin', focusCard);
        let pointer: { id: number; x: number; y: number; progress: number; dragging: boolean } | undefined;
        let blockClickUntil = 0;
        const down = (event: PointerEvent) => {
          if (event.pointerType === 'mouse' || event.isPrimary === false) return;
          pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, progress: driver.progress, dragging: false };
        };
        const move = (event: PointerEvent) => {
          if (!pointer || event.pointerId !== pointer.id || !travel) return;
          const dx = event.clientX - pointer.x;
          const dy = event.clientY - pointer.y;
          if (!pointer.dragging && Math.abs(dx) > Math.abs(dy) + 10) { pointer.dragging = true; manualMode = true; viewport.setPointerCapture(event.pointerId); manualTween?.kill(); }
          if (!pointer.dragging) return;
          event.preventDefault();
          const progress = clamp(pointer.progress - dx / travel);
          manualOffset = progress - lastScrollProgress;
          render(progress);
        };
        const up = () => {
          if (pointer?.dragging) { blockClickUntil = performance.now() + 350; moveTo.current(Math.round(driver.progress * (count - 1))); }
          pointer = undefined;
        };
        const click = (event: MouseEvent) => { if (performance.now() < blockClickUntil) { event.preventDefault(); event.stopPropagation(); } };
        viewport.addEventListener('pointerdown', down);
        viewport.addEventListener('pointermove', move);
        viewport.addEventListener('pointerup', up);
        viewport.addEventListener('pointercancel', up);
        viewport.addEventListener('click', click, true);

        gsap.fromTo(section.querySelectorAll('[data-film-enter]'), { y: 12, opacity: .8 }, { y: 0, opacity: 1, duration: .8, stagger: .08, clearProps: 'transform,opacity', scrollTrigger: { trigger: section, start: 'top 85%', once: true } });
        return () => {
          trigger.kill(); manualTween?.kill();
          track.removeEventListener('focusin', focusCard);
          viewport.removeEventListener('pointerdown', down); viewport.removeEventListener('pointermove', move); viewport.removeEventListener('pointerup', up); viewport.removeEventListener('pointercancel', up); viewport.removeEventListener('click', click, true);
          gsap.set([track, ...positions, ...positions.map(item => item.querySelector('[data-reel-image]'))], { clearProps: 'transform,opacity,zIndex' });
          if (section.dataset.reelMode === 'animated') delete section.dataset.reelMode;
        };
      });
    }, section);
    section.dataset.reelReady = 'true';
    const refresh = () => { cancelAnimationFrame(refreshFrame); refreshFrame = requestAnimationFrame(() => { if (!disposed) ScrollTrigger.refresh(); }); };
    const observer = new ResizeObserver(refresh);
    observer.observe(viewport);
    section.addEventListener('load', refresh, true);
    void document.fonts.ready.then(() => { if (!disposed) refresh(); });
    refresh();
    return () => {
      disposed = true; cancelAnimationFrame(refreshFrame); observer.disconnect();
      section.removeEventListener('load', refresh, true);
      media.revert(); context.revert();
      moveTo.current = () => {};
      delete section.dataset.reelReady;
    };
  }, [collections, count, echoCount]);

  if (!count) return null;
  return <section ref={root} className={styles.section} aria-labelledby="collection-world-title" data-collections-section="world">
    <div className={styles.atmosphere} aria-hidden="true" />
    <div className={styles.heading}>
      <span className={styles.eyebrow} data-film-enter>Explore every collection</span>
      <h2 id="collection-world-title" data-film-enter>A World of Soft<br /><em>Companions.</em></h2>
      <p data-film-enter>From timeless teddy bears to playful personalities, there&apos;s a SoftHaven collection for every kind of moment.</p>
    </div>
    <div className={styles.viewport} data-reel-viewport role="region" aria-label="Explore all SoftHaven collections">
      <svg className={styles.ribbon} data-reel-ribbon aria-hidden="true" preserveAspectRatio="none">
        <defs><linearGradient id="collection-ribbon-colour"><stop stopColor="#a9c9f2" /><stop offset=".5" stopColor="#f5c6e5" /><stop offset="1" stopColor="#a8ceef" /></linearGradient></defs>
        {(['top', 'bottom'] as const).map(edge => <g key={edge}><path data-reel-rail={edge} className={styles.railGlow} /><path data-reel-rail={edge} className={styles.railEdge} /><path data-reel-rail={edge} className={styles.perforations} /></g>)}
      </svg>
      <div className={styles.track} data-reel-track>
        {items.map(({ collection, index, echo }) => <div className={`${styles.position} ${echo ? styles.echo : ''}`} key={`${echo ? 'echo' : 'collection'}-${index}-${collection.slug}`} data-reel-position data-reel-index={index} data-echo={echo} data-active={!echo && index === 0} aria-hidden={echo || undefined}>
          <Link className={styles.card} href={`/shop?collection=${collection.slug}`} tabIndex={echo ? -1 : 0} aria-label={`Explore ${collection.name}`} data-cover-slug={collection.slug} data-film-collection={echo ? undefined : collection.slug}>
            <div className={styles.photo}><div className={styles.imageParallax} data-reel-image><ProductMedia src={collectionCover(collection)} sources={imageFallbacks[collection.slug] ? [imageFallbacks[collection.slug]] : []} alt={collection.imageAlt ?? `${collection.name} plush companions`} className={styles.image} sizes="(max-width: 767px) 82vw, (max-width: 1024px) 320px, 390px" /></div><div className={styles.photoHaze} /></div>
            <div className={styles.caption}><span className={styles.number}>{String(collections.findIndex(item => item.slug === collection.slug) + 1).padStart(2, '0')}</span><h3>{collection.name}</h3><p>{collection.description}</p><span className={styles.arrow} aria-hidden="true">→</span></div>
          </Link>
        </div>)}
      </div>
    </div>
    <div className={styles.controls} aria-label="Collection explorer controls">
      <button type="button" className={styles.controlArrow} aria-label="Previous collection" onClick={() => moveTo.current(Math.max(0, activeIndex.current - 1))}>←</button>
      <div className={styles.selectors}>{collections.map((collection, index) => <button key={collection.slug} type="button" aria-label={`Show ${collection.name}`} aria-pressed={index === 0} data-reel-select={index} onClick={() => moveTo.current(index)}><span>{String(index + 1).padStart(2, '0')}</span></button>)}</div>
      <button type="button" className={styles.controlArrow} aria-label="Next collection" onClick={() => moveTo.current(Math.min(count - 1, activeIndex.current + 1))}>→</button>
      <span className={styles.status} aria-hidden="true"><span data-reel-current>01</span> / {String(count).padStart(2, '0')}</span>
    </div>
  </section>;
}
