'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { useCart } from './cart-provider';

type IconName = 'home' | 'bag' | 'heart' | 'user' | 'mail' | 'search' | 'cart' | 'menu' | 'close';
type Notice = 'account' | 'wishlist' | null;

const navigation: Array<{ href: string; label: string; icon: IconName }> = [
  { href: '/', label: 'Home', icon: 'home' },
  { href: '/shop', label: 'Shop', icon: 'bag' },
  { href: '/shop#collections', label: 'Collections', icon: 'heart' },
  { href: '/about', label: 'About', icon: 'user' },
  { href: '/contact', label: 'Contact', icon: 'mail' },
];

function HeaderIcon({ name }: { name: IconName }) {
  const shared = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };
  if (name === 'home') return <svg {...shared}><path d="m3.5 10.6 8.5-7 8.5 7"/><path d="M5.7 9.1v10.2h12.6V9.1M9.2 19.3v-6.1h5.6v6.1"/></svg>;
  if (name === 'bag') return <svg {...shared}><path d="M5.2 8.2h13.6l1 12H4.2l1-12Z"/><path d="M8.5 9V6.5a3.5 3.5 0 0 1 7 0V9"/></svg>;
  if (name === 'heart') return <svg {...shared}><path d="M20.8 4.8a5.1 5.1 0 0 0-7.2 0L12 6.4l-1.6-1.6a5.1 5.1 0 1 0-7.2 7.2L12 20.8l8.8-8.8a5.1 5.1 0 0 0 0-7.2Z"/></svg>;
  if (name === 'user') return <svg {...shared}><circle cx="12" cy="7.2" r="3.6"/><path d="M4.7 20c.5-4.1 3.2-6.3 7.3-6.3s6.8 2.2 7.3 6.3H4.7Z"/></svg>;
  if (name === 'mail') return <svg {...shared}><rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="m4.2 7 7.8 6 7.8-6"/></svg>;
  if (name === 'search') return <svg {...shared}><circle cx="10.6" cy="10.6" r="6.5"/><path d="m15.4 15.4 5 5"/></svg>;
  if (name === 'cart') return <svg {...shared}><path d="M3 4h2.2l1.9 10.3h10.8l2-7.1H6.1"/><circle cx="9" cy="19" r="1.2"/><circle cx="17" cy="19" r="1.2"/></svg>;
  if (name === 'menu') return <svg {...shared}><path d="M4 7h16M4 12h16M4 17h16"/></svg>;
  return <svg {...shared}><path d="m6 6 12 12M18 6 6 18"/></svg>;
}

function BearFaceIcon() {
  return <svg className="sfh-bear-face" viewBox="0 0 48 48" aria-hidden="true"><circle cx="13" cy="13" r="7"/><circle cx="35" cy="13" r="7"/><circle cx="24" cy="25" r="17"/><circle cx="18" cy="23" r="2" className="sfh-bear-face__eye"/><circle cx="30" cy="23" r="2" className="sfh-bear-face__eye"/><ellipse cx="24" cy="31" rx="8" ry="6" className="sfh-bear-face__muzzle"/><path d="M21 29.5c1.5-1.2 4.5-1.2 6 0-.3 2-1.3 3-3 3s-2.7-1-3-3Z" className="sfh-bear-face__nose"/></svg>;
}

function isCurrent(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : !href.includes('#') && pathname === href;
}

function BrandLogo({ mobile = false }: { mobile?: boolean }) {
  return <Link className={`sfh-brand ${mobile ? 'sfh-brand--mobile' : ''}`} href="/" aria-label="SoftHaven Sri Lanka home"><img src="/assets/soft-haven-logo-transparent.png" alt="SoftHaven Sri Lanka"/></Link>;
}

function BearNavItem({ href, label, icon, active }: { href: string; label: string; icon: IconName; active: boolean }) {
  return <Link className={`sfh-nav-item ${active ? 'is-active' : ''}`} href={href} aria-current={active ? 'page' : undefined}><span className="sfh-nav-item__ear sfh-nav-item__ear--left" aria-hidden="true"/><span className="sfh-nav-item__ear sfh-nav-item__ear--right" aria-hidden="true"/><span className="sfh-nav-item__face"><HeaderIcon name={icon}/><span>{label}</span></span></Link>;
}

function DesktopNavigation({ pathname }: { pathname: string }) {
  return <nav className="sfh-nav" aria-label="Main navigation">{navigation.map((item) => <BearNavItem key={item.label} {...item} active={isCurrent(pathname, item.href)}/>)}</nav>;
}

function HeaderSearch({ id, query, setQuery, submitSearch }: { id: string; query: string; setQuery: (value: string) => void; submitSearch: (event: FormEvent<HTMLFormElement>) => void }) {
  return <form className="sfh-search" role="search" onSubmit={submitSearch}><label htmlFor={id} className="sr-only">Search for soft toys</label><HeaderIcon name="search"/><input id={id} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search for soft toys..." autoComplete="off"/><button className="sfh-search__bear" type="submit" aria-label="Submit product search"><BearFaceIcon/></button></form>;
}

function HeaderActions({ count, setNotice }: { count: number; setNotice: (notice: Notice) => void }) {
  return <div className="sfh-actions" aria-label="Account actions"><button className="sfh-action" type="button" aria-label="Account" onClick={() => setNotice('account')}><HeaderIcon name="user"/></button><button className="sfh-action" type="button" aria-label="Wishlist, 0 items" onClick={() => setNotice('wishlist')}><HeaderIcon name="heart"/><span className="sfh-count">0</span></button><Link className="sfh-action" href="/cart" aria-label={`Cart, ${count} ${count === 1 ? 'item' : 'items'}`}><HeaderIcon name="cart"/><span className="sfh-count">{count}</span></Link></div>;
}

function MobileHeader({ count, menuOpen, searchOpen, setMenuOpen, setNotice, setSearchOpen }: { count: number; menuOpen: boolean; searchOpen: boolean; setMenuOpen: (value: boolean) => void; setNotice: (notice: Notice) => void; setSearchOpen: (value: boolean) => void }) {
  return <div className="sfh-mobile-panel"><BrandLogo mobile/><div className="sfh-mobile-actions"><button className="sfh-mobile-action" type="button" aria-label="Open search" aria-expanded={searchOpen} onClick={() => { setSearchOpen(!searchOpen); setMenuOpen(false); }}><HeaderIcon name="search"/></button><button className="sfh-mobile-action" type="button" aria-label="Wishlist, 0 items" onClick={() => setNotice('wishlist')}><HeaderIcon name="heart"/><span className="sfh-count">0</span></button><Link className="sfh-mobile-action" href="/cart" aria-label={`Cart, ${count} ${count === 1 ? 'item' : 'items'}`}><HeaderIcon name="cart"/><span className="sfh-count">{count}</span></Link><button className="sfh-mobile-action" type="button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} aria-controls="sfh-mobile-menu" onClick={() => { setMenuOpen(!menuOpen); setSearchOpen(false); }}><HeaderIcon name={menuOpen ? 'close' : 'menu'}/></button></div></div>;
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
    const onScroll = () => setScrolled(window.scrollY > 120);
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

  return <header className={`sfh-header ${scrolled ? 'is-compact' : ''}`}><div className="sfh-stage"><div className="sfh-panel"><BrandLogo/><DesktopNavigation pathname={pathname}/><span className="sfh-divider" aria-hidden="true"/><HeaderSearch id="header-product-search" query={query} setQuery={setQuery} submitSearch={submitSearch}/><HeaderActions count={count} setNotice={setNotice}/><span className="sfh-panel__accent" aria-hidden="true"/></div></div><MobileHeader count={count} menuOpen={menuOpen} searchOpen={searchOpen} setMenuOpen={setMenuOpen} setNotice={setNotice} setSearchOpen={setSearchOpen}/>{searchOpen && <form className="sfh-mobile-search" role="search" onSubmit={submitSearch}><HeaderIcon name="search"/><label htmlFor="mobile-product-search" className="sr-only">Search for soft toys</label><input id="mobile-product-search" autoFocus type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search for soft toys..."/><button type="submit" aria-label="Submit product search"><BearFaceIcon/></button></form>}<nav id="sfh-mobile-menu" className={`sfh-mobile-menu ${menuOpen ? 'is-open' : ''}`} aria-label="Mobile navigation" aria-hidden={!menuOpen}>{navigation.map((item) => <Link className={`sfh-mobile-menu__link ${isCurrent(pathname, item.href) ? 'is-active' : ''}`} href={item.href} key={item.label} tabIndex={menuOpen ? 0 : -1}><HeaderIcon name={item.icon}/><span>{item.label}</span></Link>)}<button className="sfh-mobile-menu__link" type="button" tabIndex={menuOpen ? 0 : -1} onClick={() => setNotice('account')}><HeaderIcon name="user"/><span>Account</span></button></nav>{notice && <div className="sfh-notice" role="status"><b>{notice === 'account' ? 'Customer account' : 'Your wishlist'}</b><span>{notice === 'account' ? 'Account access will be available with the customer portal.' : 'Wishlist saving will be available with customer accounts.'}</span><button type="button" onClick={() => setNotice(null)} aria-label="Close message"><HeaderIcon name="close"/></button></div>}</header>;
}
