import Image from 'next/image';
import Link from 'next/link';

export function CollectionsDifference() {
  return (
    <section className="collections-difference" aria-labelledby="collections-difference-title">
      <div className="collections-difference__cloud collections-difference__cloud--left" aria-hidden="true" />
      <div className="collections-difference__cloud collections-difference__cloud--right" aria-hidden="true" />
      <div className="collections-difference__cloud collections-difference__cloud--lower-right" aria-hidden="true" />
      <div className="collections-difference__heart-cloud" aria-hidden="true" />

      <div className="collections-difference__intro">
        <span className="collections-difference__eyebrow">The SoftHaven Difference</span>
        <h2 id="collections-difference-title"><span>Made to Feel</span><em>Extra Special.</em></h2>
        <p>Thoughtfully selected plush companions with the softness, character and quality that make every hug feel a little more special.</p>
      </div>

      <div className="collections-difference__scene">
        <Image
          src="/assets/collections/softhaven-four-companions-cloud-world.webp"
          alt="A blue-eared bunny, brown teddy, grey kitten and brown-and-white puppy nestled in pastel clouds"
          width={1536}
          height={1024}
          sizes="(max-width: 767px) 120vw, (max-width: 1100px) 72vw, 64vw"
          unoptimized
          className="collections-difference__plush"
        />
      </div>

      <div className="collections-difference__values" aria-label="The SoftHaven difference">
        <div className="collections-difference__value collections-difference__value--soft">
          <span className="collections-difference__icon" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none"><path d="M26 5C15 6 7 11 6 21c0 3 2 5 5 5 10-1 15-9 15-21Z" /><path d="M7 26c5-7 10-12 17-17M13 19l-1-6M18 14l5 1" /></svg></span>
          <span>Soft to<br />the Touch</span>
        </div>
        <div className="collections-difference__value collections-difference__value--selected">
          <span className="collections-difference__icon" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none"><path d="M27 11.7c0 6-11 13.5-11 13.5S5 17.7 5 11.7a5.5 5.5 0 0 1 11-1 5.5 5.5 0 0 1 11 1Z" /></svg></span>
          <span>Thoughtfully<br />Selected</span>
        </div>
        <div className="collections-difference__value collections-difference__value--gifting">
          <span className="collections-difference__icon" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none"><path d="M5 14h22v13H5zM3 9h26v5H3zM16 9v18M16 9H11c-2.5 0-4-1.1-4-3.1C7 4 8.4 3 10 3c3.1 0 6 6 6 6Zm0 0h5c2.5 0 4-1.1 4-3.1C25 4 23.6 3 22 3c-3.1 0-6 6-6 6Z" /></svg></span>
          <span>Made for<br />Meaningful Moments</span>
        </div>
      </div>

      <Link className="collections-difference__cta" href="/about">
        <span>Discover the SoftHaven Story</span><span aria-hidden="true">→</span>
      </Link>
    </section>
  );
}
