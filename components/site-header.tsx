'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useCart } from './cart-provider';

export function SiteHeader() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  return <>
    <div className="announcement">Complimentary signature gift box <span>•</span> Softness worth sharing — islandwide & international gifting delivery available <span>•</span> Global Express</div>
    <header className="site-header">
      <Link href="/" className="wordmark">Soft<span>Haven</span></Link>
      <nav className="desktop-nav" aria-label="Main navigation"><Link href="/">Home</Link><Link href="/shop">Shop</Link><Link href="/shop#collections">Collections</Link><Link href="/shop">New Arrivals</Link><Link href="/shop">Gifts</Link><Link href="/about">About</Link><Link href="/contact">Contact</Link></nav>
      <div className="header-actions"><button className="search-pill" aria-label="Search">⌕ <span>Search companions</span></button><button className="icon-button" aria-label="Account">♙</button><Link className="bag-button" href="/cart">Bag <b>{count}</b></Link><button className="menu-button" aria-label="Open menu" onClick={() => setOpen(!open)}>{open ? '×' : '☰'}</button></div>
    </header>
    {open && <nav className="mobile-nav" aria-label="Mobile navigation"><Link onClick={() => setOpen(false)} href="/">Home</Link><Link onClick={() => setOpen(false)} href="/shop">Shop all</Link><Link onClick={() => setOpen(false)} href="/shop#collections">Collections</Link><Link onClick={() => setOpen(false)} href="/about">About</Link><Link onClick={() => setOpen(false)} href="/contact">Contact</Link><Link onClick={() => setOpen(false)} href="/cart">Your bag ({count})</Link></nav>}
  </>;
}
