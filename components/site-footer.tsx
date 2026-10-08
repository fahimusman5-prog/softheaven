'use client';
import Link from 'next/link';
import { useCatalogue } from '@/components/catalogue-provider';
import { confirmedUrl } from '@/lib/business';
import './site-footer.css';

const groups = [
  { title: 'Shop', links: [['Shop All', '/shop'], ['Collections', '/collections']] },
  { title: 'Explore', links: [['About SoftHaven', '/about'], ['Contact Us', '/contact']] },
  { title: 'Customer care', links: [['Shipping & Delivery', '/shipping-delivery'], ['Returns & Refunds', '/returns-refunds']] },
  { title: 'Legal', links: [['Privacy Policy', '/privacy-policy'], ['Terms & Conditions', '/terms-conditions']] },
];
export function SiteFooter() {
  const { settings } = useCatalogue();
  const socials = [['Instagram', 'instagram'], ['TikTok', 'tiktok'], ['Facebook', 'facebook']]
    .map(([label, key]) => ({ label, href: confirmedUrl(settings.social?.[key]) }))
    .filter((social): social is { label: string; href: string } => Boolean(social.href));
  return <footer className="site-footer site-footer--refined sh-footer--minimal">
    <div className="site-footer__brand"><Link href="/" className="wordmark">Soft<span>Haven</span></Link><p>Soft companions for thoughtful gifting<br />and everyday comfort.</p></div>
    {groups.map(group => <nav className="site-footer__column" aria-label={group.title} key={group.title}><h3>{group.title}</h3>{group.links.map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}</nav>)}
    <div className="footer-bottom"><span>© {new Date().getFullYear()} SoftHaven. All rights reserved.</span>{socials.length > 0 && <nav className="sh-footer__socials" aria-label="Social media">{socials.map(social => <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer">{social.label}</a>)}</nav>}<a href="#page-top">Back to top ↑</a></div>
  </footer>;
}
