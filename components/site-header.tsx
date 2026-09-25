'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { CSSProperties, FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { useCart } from './cart-provider';

type IconName = 'home' | 'bag' | 'heart' | 'user' | 'mail' | 'brand' | 'search' | 'cart' | 'menu' | 'close';

const navigation: Array<{ href: string; label: string; icon: IconName }> = [
  { href: '/', label: 'Home', icon: 'home' },
  { href: '/shop', label: 'Shop', icon: 'bag' },
  { href: '/shop#collections', label: 'Collections', icon: 'heart' },
  { href: '/about', label: 'About', icon: 'brand' },
  { href: '/contact', label: 'Contact', icon: 'mail' },
];

function HeaderIcon({ name }: { name: IconName }) {
  const shared = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };
  if (name === 'home') return <svg {...shared}><path d="m3.5 10.6 8.5-7 8.5 7"/><path d="M5.7 9.1v10.2h12.6V9.1M9.2 19.3v-6.1h5.6v6.1"/></svg>;
  if (name === 'bag') return <svg {...shared}><path d="M5.2 8.2h13.6l1 12H4.2l1-12Z"/><path d="M8.5 9V6.5a3.5 3.5 0 0 1 7 0V9"/></svg>;
  if (name === 'heart') return <svg {...shared}><path d="M20.8 4.8a5.1 5.1 0 0 0-7.2 0L12 6.4l-1.6-1.6a5.1 5.1 0 1 0-7.2 7.2L12 20.8l8.8-8.8a5.1 5.1 0 0 0 0-7.2Z"/></svg>;
  if (name === 'user') return <svg {...shared}><circle cx="12" cy="7.2" r="3.6"/><path d="M4.7 20c.5-4.1 3.2-6.3 7.3-6.3s6.8 2.2 7.3 6.3H4.7Z"/></svg>;
  if (name === 'mail') return <svg {...shared}><rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="m4.2 7 7.8 6 7.8-6"/></svg>;
  if (name === 'search') return <svg {...shared}><circle cx="10.6" cy="10.6" r="6.5"/><path d="m15.4 15.4 5 5"/></svg>;
  if (name === 'cart') return <svg {...shared}><path d="M3 4h2.2l1.9 10.3h10.8l2-7.1H6.1"/><circle cx="9" cy="19" r="1.2"/><circle cx="17" cy="19" r="1.2"/></svg>;
  if (name === 'menu') return <svg {...shared}><path d="M4 7h16M4 12h16M4 17h16"/></svg>;
  if (name === 'close') return <svg {...shared}><path d="m6 6 12 12M18 6 6 18"/></svg>;
  if (name === 'brand') return <svg className="sh-brand-icon" viewBox="0 0 48 48" aria-hidden="true"><circle cx="14" cy="13" r="6"/><circle cx="34" cy="13" r="6"/><path d="M38 25c0 9-6.2 15-14 15S10 34 10 25 16.2 10 24 10s14 6 14 15Z"/><circle cx="19" cy="24" r="1.7" className="sh-brand-icon__eye"/><circle cx="29" cy="24" r="1.7" className="sh-brand-icon__eye"/><ellipse cx="24" cy="31" rx="6.5" ry="4.5" className="sh-brand-icon__muzzle"/><path d="M22 30c1-1 3-1 4 0-.2 1.5-.8 2.2-2 2.2s-1.8-.7-2-2.2Z" className="sh-brand-icon__nose"/></svg>;
  return null;
}

function BrandMark({ compact = false }: { compact?: boolean }) {
  return <Link className={`sh-brand ${compact ? 'sh-brand--compact' : ''}`} href="/" aria-label="SoftHaven Sri Lanka home">
    <svg className="sh-brand__bear" viewBox="0 0 64 55" aria-hidden="true">
      <circle cx="14" cy="12" r="8"/><circle cx="50" cy="12" r="8"/>
      <path d="M51 27c0 13-8.5 22-19 22S13 40 13 27 21.5 7 32 7s19 7 19 20Z"/>
      <circle cx="25" cy="27" r="2.4" className="sh-brand__eye"/><circle cx="39" cy="27" r="2.4" className="sh-brand__eye"/>
      <ellipse cx="32" cy="36" rx="9.5" ry="7" className="sh-brand__muzzle"/>
      <path d="M29 34c1.5-1.5 4.5-1.5 6 0-.2 2.4-1.3 3.6-3 3.6S29.2 36.4 29 34Z" className="sh-brand__nose"/>
      <path d="M32 37.5v3m0 0c-2.5 2.2-5 1.6-6.3-.1m6.3.1c2.5 2.2 5 1.6 6.3-.1" className="sh-brand__smile"/>
    </svg>
    <span className="sh-brand__copy"><span className="sh-brand__name"><b>Soft</b>Haven</span><span className="sh-brand__country">Sri Lanka</span></span>
  </Link>;
}

function BearButtonIcon() {
  return <svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="13" cy="13" r="7"/><circle cx="35" cy="13" r="7"/><circle cx="24" cy="25" r="17"/><circle cx="18" cy="23" r="2" className="bear-eye"/><circle cx="30" cy="23" r="2" className="bear-eye"/><ellipse cx="24" cy="31" rx="8" ry="6" className="bear-muzzle"/><path d="M21 29.5c1.5-1.2 4.5-1.2 6 0-.3 2-1.3 3-3 3s-2.7-1-3-3Z" className="bear-nose"/></svg>;
}

function CloudDetails() {
  return <div className="sh-cloud-details" aria-hidden="true">
    <span className="sh-cloud-bubble sh-cloud-bubble--logo-a"/><span className="sh-cloud-bubble sh-cloud-bubble--logo-b"/><span className="sh-cloud-bubble sh-cloud-bubble--left"/>
    <span className="sh-cloud-bubble sh-cloud-bubble--nav"/><span className="sh-cloud-bubble sh-cloud-bubble--right"/><span className="sh-cloud-bubble sh-cloud-bubble--bottom"/>
    <span className="sh-star sh-star--one">✦</span><span className="sh-star sh-star--two">✦</span><span className="sh-star sh-star--three">✦</span><span className="sh-star sh-star--four">✦</span>
  </div>;
}

export function SiteHeader() {
  const { count } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState<'account' | 'wishlist' | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); setSearchOpen(false); setNotice(null); }, [pathname]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const search = query.trim();
    router.push(search ? `/shop?search=${encodeURIComponent(search)}` : '/shop');
    setSearchOpen(false);
  }

  const isActive = (href: string) => href === '/' ? pathname === '/' : !href.includes('#') && pathname === href;
  const navStyle = (index: number) => ({ '--sh-nav-order': index } as CSSProperties);

  return <header className={`sh-header-shell ${scrolled ? 'is-scrolled' : ''}`}>
    <div className="sh-desktop-header">
      <div className="sh-cloud-rail">
        <CloudDetails />
        <div className="sh-logo-cluster"><BrandMark /></div>
        <nav className="sh-main-nav" aria-label="Main navigation">
          {navigation.map((item, index) => <Link className={`sh-nav-item ${isActive(item.href) ? 'is-active' : ''}`} href={item.href} key={item.label} style={navStyle(index)} aria-current={isActive(item.href) ? 'page' : undefined}><span className="sh-nav-item__icon"><HeaderIcon name={item.icon}/></span><span>{item.label}</span></Link>)}
        </nav>
        <div className="sh-header-tools">
          <form className="sh-search" role="search" onSubmit={submitSearch}>
            <label htmlFor="header-product-search" className="sr-only">Search for soft toys</label><HeaderIcon name="search"/><input id="header-product-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search for soft toys..." autoComplete="off"/><button className="sh-search__bear" type="submit" aria-label="Submit product search"><BearButtonIcon/></button>
          </form>
          <span className="sh-divider" aria-hidden="true"/>
          <div className="sh-action-group">
            <button className="sh-action" type="button" aria-label="Account" onClick={() => setNotice(notice === 'account' ? null : 'account')}><HeaderIcon name="user"/></button>
            <button className="sh-action" type="button" aria-label="Wishlist, 0 items" onClick={() => setNotice(notice === 'wishlist' ? null : 'wishlist')}><HeaderIcon name="heart"/><span className="sh-count">0</span></button>
            <Link className="sh-action" href="/cart" aria-label={`Cart, ${count} ${count === 1 ? 'item' : 'items'}`}><HeaderIcon name="cart"/><span className="sh-count">{count}</span></Link>
          </div>
        </div>
      </div>
    </div>

    <div className="sh-mobile-header">
      <BrandMark compact/>
      <div className="sh-mobile-actions">
        <button className="sh-action" type="button" aria-label="Open search" aria-expanded={searchOpen} onClick={() => { setSearchOpen(!searchOpen); setMenuOpen(false); }}><HeaderIcon name="search"/></button>
        <button className="sh-action sh-mobile-wishlist" type="button" aria-label="Wishlist, 0 items" onClick={() => setNotice(notice === 'wishlist' ? null : 'wishlist')}><HeaderIcon name="heart"/><span className="sh-count">0</span></button>
        <Link className="sh-action" href="/cart" aria-label={`Cart, ${count} ${count === 1 ? 'item' : 'items'}`}><HeaderIcon name="cart"/><span className="sh-count">{count}</span></Link>
        <button className="sh-action sh-menu-trigger" type="button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} aria-controls="sh-mobile-menu" onClick={() => { setMenuOpen(!menuOpen); setSearchOpen(false); }}><HeaderIcon name={menuOpen ? 'close' : 'menu'}/></button>
      </div>
    </div>

    {searchOpen && <form className="sh-mobile-search" role="search" onSubmit={submitSearch}><HeaderIcon name="search"/><label htmlFor="mobile-product-search" className="sr-only">Search for soft toys</label><input id="mobile-product-search" autoFocus type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search for soft toys..."/><button type="submit" aria-label="Submit product search"><BearButtonIcon/></button></form>}
    <nav id="sh-mobile-menu" className={`sh-mobile-menu ${menuOpen ? 'is-open' : ''}`} aria-label="Mobile navigation" aria-hidden={!menuOpen}>
      {navigation.map((item) => <Link className={isActive(item.href) ? 'is-active' : ''} href={item.href} key={item.label} tabIndex={menuOpen ? 0 : -1}><span><HeaderIcon name={item.icon}/></span>{item.label}</Link>)}
      <button type="button" tabIndex={menuOpen ? 0 : -1} onClick={() => setNotice(notice === 'account' ? null : 'account')}><span><HeaderIcon name="user"/></span>Account</button>
    </nav>
    {notice && <div className="sh-header-notice" role="status"><b>{notice === 'account' ? 'Customer account' : 'Your wishlist'}</b><span>{notice === 'account' ? 'Account access will be available with the customer portal.' : 'Wishlist saving will be available with customer accounts.'}</span><button type="button" onClick={() => setNotice(null)} aria-label="Close message"><HeaderIcon name="close"/></button></div>}
  </header>;
}
