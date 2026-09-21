import Link from 'next/link';
export default function NotFound() { return <div className="simple-page not-found"><span className="eyebrow">A softer wrong turn</span><h1>That page has<br/><em>gone to nap.</em></h1><p>Let&apos;s find you something lovely instead.</p><Link className="primary-button" href="/">Return home →</Link></div>; }
