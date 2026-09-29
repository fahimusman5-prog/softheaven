'use client';

import Link from 'next/link';

const labels = [
  { className: 'birthday', icon: '✦', title: 'Birthday', detail: 'Surprise' },
  { className: 'because', icon: '♡', title: 'Just', detail: 'Because' },
  { className: 'hug', icon: '☾', title: 'A Comforting', detail: 'Hug' },
];

export function SoftHavenForThat() {
  return (
    <section className="softhaven-moment" aria-labelledby="softhaven-moment-title">
      <div className="softhaven-moment__atmosphere" aria-hidden="true" />
      <div className="softhaven-moment__distant-cloud softhaven-moment__distant-cloud--left" aria-hidden="true" />
      <div className="softhaven-moment__distant-cloud softhaven-moment__distant-cloud--right" aria-hidden="true" />
      <div className="softhaven-moment__content">
        <div className="softhaven-moment__copy">
          <span className="softhaven-moment__eyebrow">WHATEVER THE MOMENT <i aria-hidden="true" /></span>
          <h2 id="softhaven-moment-title"><span>There&apos;s a SoftHaven</span><em>For That.</em></h2>
          <p>Big celebrations, little surprises, comforting hugs<br className="softhaven-moment__desktop-break" /> or simply because — find a companion made<br className="softhaven-moment__desktop-break" /> for the moment.</p>
          <Link className="softhaven-moment__cta" href="/shop"><span>Find Your Perfect Match</span><b aria-hidden="true">→</b></Link>
        </div>
        <div className="softhaven-moment__world" aria-label="Four SoftHaven plush companions nestled in clouds">
          <div className="softhaven-moment__heart-cloud" aria-hidden="true"><span /><span /><span /></div>
          <svg className="softhaven-moment__strokes" viewBox="0 0 760 560" fill="none" aria-hidden="true">
            <path d="M141 164c-27 8-29 34-9 39 25 6 27-22 7-20-25 3-12 34 22 35 22 1 34-10 42-23" />
            <path d="M600 144c20 9 22 29 9 38m-13-15c8 9 20 8 29-1" />
            <path d="M585 393c29 0 41-20 28-34-13-13-34 2-19 17 13 13 39 5 52-14" />
            <path d="M221 416c-12 11-2 26 13 24 14-1 16-17 5-21-16-5-20 16 1 28" />
          </svg>
          <div className="softhaven-moment__sparkle softhaven-moment__sparkle--one" aria-hidden="true">✧</div>
          <div className="softhaven-moment__sparkle softhaven-moment__sparkle--two" aria-hidden="true">✦</div>
          {labels.map((label) => (
            <div className={`softhaven-moment__label softhaven-moment__label--${label.className}`} key={label.className}>
              <span className="softhaven-moment__label-icon" aria-hidden="true">{label.icon}</span>
              <span><strong>{label.title}</strong><small>{label.detail}</small></span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
