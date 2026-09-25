'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { CSSProperties, FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { useCart } from './cart-provider';

type IconName = 'home' | 'bag' | 'heart' | 'user' | 'bear' | 'mail' | 'search' | 'cart' | 'menu' | 'close';
type Notice = 'account' | 'wishlist' | null;

const navigation: Array<{ href: string; label: string; icon: IconName }> = [
  { href: '/', label: 'Home', icon: 'home' },
  { href: '/shop', label: 'Shop', icon: 'bag' },
  { href: '/shop#collections', label: 'Collections', icon: 'heart' },
  { href: '/about', label: 'About', icon: 'bear' },
  { href: '/contact', label: 'Contact', icon: 'mail' },
];

function HeaderIcon({ name }: { name: IconName }) {
  const shared = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };
  if (name === 'home') return <svg {...shared}><path d="m3.5 10.6 8.5-7 8.5 7"/><path d="M5.7 9.1v10.2h12.6V9.1M9.2 19.3v-6.1h5.6v6.1"/></svg>;
  if (name === 'bag') return <svg {...shared}><path d="M5.2 8.2h13.6l1 12H4.2l1-12Z"/><path d="M8.5 9V6.5a3.5 3.5 0 0 1 7 0V9"/></svg>;
  if (name === 'heart') return <svg {...shared}><path d="M20.8 4.8a5.1 5.1 0 0 0-7.2 0L12 6.4l-1.6-1.6a5.1 5.1 0 1 0-7.2 7.2L12 20.8l8.8-8.8a5.1 5.1 0 0 0 0-7.2Z"/></svg>;
  if (name === 'user') return <svg {...shared}><circle cx="12" cy="7.2" r="3.6"/><path d="M4.7 20c.5-4.1 3.2-6.3 7.3-6.3s6.8 2.2 7.3 6.3H4.7Z"/></svg>;
  if (name === 'bear') return <svg {...shared}><circle cx="7.4" cy="6.8" r="3"/><circle cx="16.6" cy="6.8" r="3"/><circle cx="12" cy="10.5" r="5.8"/><path d="M8.1 18.7c.6-2.8 2-4.2 3.9-4.2s3.3 1.4 3.9 4.2"/><circle cx="10" cy="10.2" r=".7" fill="currentColor" stroke="none"/><circle cx="14" cy="10.2" r=".7" fill="currentColor" stroke="none"/><path d="M10.7 12.2c.5.5 1.1.7 1.3.7s.8-.2 1.3-.7"/></svg>;
  if (name === 'mail') return <svg {...shared}><rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="m4.2 7 7.8 6 7.8-6"/></svg>;
  if (name === 'search') return <svg {...shared}><circle cx="10.6" cy="10.6" r="6.5"/><path d="m15.4 15.4 5 5"/></svg>;
  if (name === 'cart') return <svg {...shared}><path d="M3 4h2.2l1.9 10.3h10.8l2-7.1H6.1"/><circle cx="9" cy="19" r="1.2"/><circle cx="17" cy="19" r="1.2"/></svg>;
  if (name === 'menu') return <svg {...shared}><path d="M4 7h16M4 12h16M4 17h16"/></svg>;
  return <svg {...shared}><path d="m6 6 12 12M18 6 6 18"/></svg>;
}

function BearFaceIcon() {
  return <svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="13" cy="13" r="7"/><circle cx="35" cy="13" r="7"/><circle cx="24" cy="25" r="17"/><circle cx="18" cy="23" r="2" className="cloud-bear-eye"/><circle cx="30" cy="23" r="2" className="cloud-bear-eye"/><ellipse cx="24" cy="31" rx="8" ry="6" className="cloud-bear-muzzle"/><path d="M21 29.5c1.5-1.2 4.5-1.2 6 0-.3 2-1.3 3-3 3s-2.7-1-3-3Z" className="cloud-bear-nose"/></svg>;
}

function CloudStar({ className }: { className: string }) {
  return <svg className={`cloud-star ${className}`} viewBox="0 0 32 32" aria-hidden="true"><path d="m16 2.5 3.15 9.9 9.35 3.6-9.35 3.6L16 29.5l-3.15-9.9-9.35-3.6 9.35-3.6L16 2.5Z"/></svg>;
}

function BrandCloud({ compact = false }: { compact?: boolean }) {
  return <Link className={`cloud-brand ${compact ? 'cloud-brand--compact' : ''}`} href="/" aria-label="SoftHaven Sri Lanka home">
    <img src="/assets/soft-haven-logo-transparent.png" alt="SoftHaven Sri Lanka"/>
  </Link>;
}

function CloudLobes() {
  return <div className="cloud-lobes" aria-hidden="true">
    <span className="cloud-lobe cloud-lobe--logo-one"/><span className="cloud-lobe cloud-lobe--logo-two"/><span className="cloud-lobe cloud-lobe--logo-three"/>
    <span className="cloud-lobe cloud-lobe--left-low"/><span className="cloud-lobe cloud-lobe--left-mid"/><span className="cloud-lobe cloud-lobe--nav-top"/>
    <span className="cloud-lobe cloud-lobe--nav-low"/><span className="cloud-lobe cloud-lobe--search-top"/><span className="cloud-lobe cloud-lobe--search-low"/>
    <span className="cloud-lobe cloud-lobe--right-top"/><span className="cloud-lobe cloud-lobe--right-low"/><span className="cloud-lobe cloud-lobe--right-end"/>
    <span className="cloud-lobe cloud-lobe--far-right"/>
    <CloudStar className="cloud-star--gold"/><CloudStar className="cloud-star--pink"/><CloudStar className="cloud-star--lavender"/><CloudStar className="cloud-star--small"/>
  </div>;
}

function isCurrent(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : !href.includes('#') && pathname === href;
}

export function SiteHeader() {
  const { count } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState<Notice>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 72);
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

  const setToggleNotice = (next: Notice) => setNotice(notice === next ? null : next);

  return <header className={`cloud-header ${scrolled ? 'is-scrolled' : ''}`}>
    <div className="cloud-header__desktop">
      <div className="cloud-nav" aria-label="SoftHaven navigation">
        <div className="cloud-nav__ribbon" aria-hidden="true"/>
        <CloudLobes/>
        <div className="cloud-nav__content">
          <div className="cloud-brand-wrap"><BrandCloud/></div>
          <nav className="cloud-nav__links" aria-label="Main navigation">
            {navigation.map((item, index) => <Link className={`cloud-nav__item ${isCurrent(pathname, item.href) ? 'is-active' : ''}`} href={item.href} key={item.label} style={{ '--cloud-item-order': index } as CSSProperties} aria-current={isCurrent(pathname, item.href) ? 'page' : undefined}><span className="cloud-nav__item-icon"><HeaderIcon name={item.icon}/></span><span>{item.label}</span></Link>)}
          </nav>
          <div className="cloud-nav__tools">
            <form className="cloud-search" role="search" action="/shop" method="get" onSubmit={submitSearch}>
              <label htmlFor="cloud-product-search" className="sr-only">Search for soft toys</label><HeaderIcon name="search"/><input id="cloud-product-search" name="search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search for soft toys..." autoComplete="off"/><button type="submit" aria-label="Submit product search"><BearFaceIcon/></button>
            </form>
            <span className="cloud-divider" aria-hidden="true"/>
            <div className="cloud-actions" aria-label="Account actions">
              <button className="cloud-action" type="button" aria-label="Account" onClick={() => setToggleNotice('account')}><HeaderIcon name="user"/></button>
              <button className="cloud-action" type="button" aria-label="Wishlist, 0 items" onClick={() => setToggleNotice('wishlist')}><HeaderIcon name="heart"/><span className="cloud-count">0</span></button>
              <Link className="cloud-action" href="/cart" aria-label={`Cart, ${count} ${count === 1 ? 'item' : 'items'}`}><HeaderIcon name="cart"/><span className="cloud-count">{count}</span></Link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="cloud-header__mobile">
      <BrandCloud compact/>
      <div className="cloud-mobile-actions">
        <button className="cloud-action" type="button" aria-label="Open search" aria-expanded={searchOpen} onClick={() => { setSearchOpen(!searchOpen); setMenuOpen(false); }}><HeaderIcon name="search"/></button>
        <button className="cloud-action" type="button" aria-label="Wishlist, 0 items" onClick={() => setToggleNotice('wishlist')}><HeaderIcon name="heart"/><span className="cloud-count">0</span></button>
        <Link className="cloud-action" href="/cart" aria-label={`Cart, ${count} ${count === 1 ? 'item' : 'items'}`}><HeaderIcon name="cart"/><span className="cloud-count">{count}</span></Link>
        <button className="cloud-action" type="button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} aria-controls="cloud-mobile-menu" onClick={() => { setMenuOpen(!menuOpen); setSearchOpen(false); }}><HeaderIcon name={menuOpen ? 'close' : 'menu'}/></button>
      </div>
    </div>

    {searchOpen && <form className="cloud-mobile-search" role="search" action="/shop" method="get" onSubmit={submitSearch}><HeaderIcon name="search"/><label htmlFor="cloud-mobile-product-search" className="sr-only">Search for soft toys</label><input id="cloud-mobile-product-search" name="search" autoFocus type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search for soft toys..."/><button type="submit" aria-label="Submit product search"><BearFaceIcon/></button></form>}
    <nav id="cloud-mobile-menu" className={`cloud-mobile-menu ${menuOpen ? 'is-open' : ''}`} aria-label="Mobile navigation" aria-hidden={!menuOpen}>
      {navigation.map((item) => <Link className={isCurrent(pathname, item.href) ? 'is-active' : ''} href={item.href} key={item.label} tabIndex={menuOpen ? 0 : -1}><HeaderIcon name={item.icon}/><span>{item.label}</span></Link>)}
      <button type="button" tabIndex={menuOpen ? 0 : -1} onClick={() => setToggleNotice('account')}><HeaderIcon name="user"/><span>Account</span></button>
    </nav>
    {notice && <div className="cloud-header-notice" role="status"><b>{notice === 'account' ? 'Customer account' : 'Your wishlist'}</b><span>{notice === 'account' ? 'Account access will be available with the customer portal.' : 'Wishlist saving will be available with customer accounts.'}</span><button type="button" onClick={() => setNotice(null)} aria-label="Close message"><HeaderIcon name="close"/></button></div>}
  </header>;
}
