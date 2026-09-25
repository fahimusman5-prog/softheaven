'use client';

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { ProductMedia } from './product-media';
import { useSyncExternalStore } from 'react';

export type PortraitHeroSlide = {
  id: string;
  image: string;
  name: string;
  descriptor: string;
  category: string;
};

type Position = -3 | -2 | -1 | 0 | 1 | 2 | 3;

const positionClass: Record<Position, string> = {
  [-3]: 'is-far-left',
  [-2]: 'is-side-left',
  [-1]: 'is-near-left',
  [0]: 'is-center',
  [1]: 'is-near-right',
  [2]: 'is-side-right',
  [3]: 'is-far-right',
};

function getPosition(index: number, activeIndex: number, total: number): Position {
  let offset = index - activeIndex;
  if (offset > Math.floor(total / 2)) offset -= total;
  if (offset < -Math.floor(total / 2)) offset += total;
  return Math.max(-3, Math.min(3, offset)) as Position;
}

function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onStoreChange) => {
      const mediaQuery = window.matchMedia(query);
      mediaQuery.addEventListener('change', onStoreChange);
      return () => mediaQuery.removeEventListener('change', onStoreChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

function ArrowIcon({ direction }: { direction: 'left' | 'right' }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d={direction === 'left' ? 'm14.5 5-7 7 7 7' : 'm9.5 5 7 7-7 7'} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></svg>;
}

function BagIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8.5h14l1 11H4l1-11Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.6" /><path d="M8.5 9V6.8a3.5 3.5 0 0 1 7 0V9" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" /></svg>;
}

function MessageIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5.5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H11l-4.7 3v-3H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.6" /></svg>;
}

function ArrowTail() {
  return <svg className="portrait-hero-button__arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" /></svg>;
}

export function PortraitHeroCarousel({ slides }: { slides: PortraitHeroSlide[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isDocumentVisible, setIsDocumentVisible] = useState(true);
  const dragStart = useRef<number | null>(null);
  const isHovering = useRef(false);
  const resumeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMobile = useMediaQuery('(max-width: 620px)');
  const visibleRadius = isMobile ? 1 : 2;

  const scheduleResume = () => {
    if (resumeTimeout.current) clearTimeout(resumeTimeout.current);
    resumeTimeout.current = setTimeout(() => {
      if (!isHovering.current) setIsPaused(false);
    }, 1500);
  };

  const move = (direction: 1 | -1) => {
    setActiveIndex((current) => (current + direction + slides.length) % slides.length);
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotionPreference = () => setReducedMotion(mediaQuery.matches);
    updateMotionPreference();
    mediaQuery.addEventListener('change', updateMotionPreference);
    return () => mediaQuery.removeEventListener('change', updateMotionPreference);
  }, []);

  useEffect(() => {
    const updateVisibility = () => setIsDocumentVisible(document.visibilityState === 'visible');
    updateVisibility();
    document.addEventListener('visibilitychange', updateVisibility);
    return () => document.removeEventListener('visibilitychange', updateVisibility);
  }, []);

  useEffect(() => {
    if (reducedMotion || isPaused || !isDocumentVisible) return;
    const timer = setInterval(() => {
      move(1);
    }, 3200);
    return () => clearInterval(timer);
  }, [isDocumentVisible, isPaused, reducedMotion, slides.length]);

  useEffect(() => () => {
    if (resumeTimeout.current) clearTimeout(resumeTimeout.current);
  }, []);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    dragStart.current = event.clientX;
    setIsPaused(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (dragStart.current !== null) {
      const distance = event.clientX - dragStart.current;
      if (Math.abs(distance) > 42) move(distance < 0 ? 1 : -1);
    }
    dragStart.current = null;
    scheduleResume();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      setIsPaused(true);
      move(-1);
      scheduleResume();
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      setIsPaused(true);
      move(1);
      scheduleResume();
    }
  };

  return (
    <div className="portrait-carousel" aria-label="SoftHaven featured companions">
      <div
        className="portrait-carousel__stage"
        role="region"
        aria-roledescription="carousel"
        aria-label="Featured plush companions"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => { isHovering.current = true; setIsPaused(true); }}
        onMouseLeave={() => { isHovering.current = false; scheduleResume(); }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {slides.map((slide, index) => {
          const position = getPosition(index, activeIndex, slides.length);
          if (Math.abs(position) > visibleRadius) return null;
          const isActive = position === 0;
          return (
            <article
              className={`portrait-carousel__card ${positionClass[position]}`}
              key={slide.id}
              aria-hidden={!isActive}
              aria-label={`${slide.name}, slide ${index + 1} of ${slides.length}`}
              aria-roledescription="slide"
            >
              <ProductMedia
                src={slide.image}
                alt={isActive ? slide.name : ''}
                fill
                fit="cover"
                sizes="(max-width: 620px) 76vw, (max-width: 1023px) 330px, (max-width: 1439px) 340px, 360px"
                priority={index === 0}
                loading={index === 0 ? 'eager' : 'lazy'}
              />
              <div className="portrait-carousel__shade" />
              <div className="portrait-carousel__caption">
                <span>{slide.category}</span>
                <h2>{slide.name}</h2>
                <p>{slide.descriptor}</p>
              </div>
            </article>
          );
        })}
        <button className="portrait-carousel__arrow portrait-carousel__arrow--left" type="button" onClick={() => { setIsPaused(true); move(-1); scheduleResume(); }} aria-label="Previous featured companion"><ArrowIcon direction="left" /></button>
        <button className="portrait-carousel__arrow portrait-carousel__arrow--right" type="button" onClick={() => { setIsPaused(true); move(1); scheduleResume(); }} aria-label="Next featured companion"><ArrowIcon direction="right" /></button>
      </div>

      <div className="portrait-carousel__controls">
        <div className="portrait-carousel__dots" role="tablist" aria-label="Choose a featured companion">
          {slides.map((slide, index) => <button className={index === activeIndex ? 'is-active' : ''} key={slide.id} type="button" role="tab" aria-label={`Show ${slide.name}`} aria-selected={index === activeIndex} onClick={() => { setActiveIndex(index); setIsPaused(true); scheduleResume(); }} />)}
        </div>
        <button className="portrait-carousel__pause" type="button" aria-label={isPaused ? 'Resume carousel autoplay' : 'Pause carousel autoplay'} aria-pressed={isPaused} onClick={() => { if (resumeTimeout.current) clearTimeout(resumeTimeout.current); setIsPaused((paused) => !paused); }}>
          {isPaused ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 10 7-10 7V5Z" fill="currentColor" /></svg> : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 6v12M16 6v12" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" /></svg>}
        </button>
      </div>

      <div className="portrait-hero-actions">
        <a className="portrait-hero-button portrait-hero-button--primary" href="/shop"><BagIcon /><span>Shop Now</span><ArrowTail /></a>
        <a className="portrait-hero-button portrait-hero-button--secondary" href="/contact"><MessageIcon /><span>Contact Us</span><ArrowTail /></a>
      </div>
      <p className="portrait-hero-note">Little Moments, Lasting Happiness <span aria-hidden="true">♡</span></p>
    </div>
  );
}
