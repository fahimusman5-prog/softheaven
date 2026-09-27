'use client';
import Link from 'next/link';
import { products } from '@/lib/data';

const categories = Array.from(new Set(products.map((product) => product.category)));

export function SiteFooter() {
  return (
    <footer className="site-footer site-footer--refined">
      <div className="site-footer__brand">
        <Link href="/" className="wordmark">Soft<span>Haven</span></Link>
        <p>Soft companions for thoughtful gifting and everyday comfort.</p>
      </div>
      <div className="site-footer__column">
        <h3>Shop</h3>
        <Link href="/shop">All companions</Link>
        {categories.map((category) => <Link href={`/shop?category=${encodeURIComponent(category)}`} key={category}>{category}</Link>)}
      </div>
      <div className="site-footer__column">
        <h3>Discover</h3>
        <Link href="/collections">Collections</Link>
        <Link href="/about">About SoftHaven</Link>
      </div>
      <div className="site-footer__column">
        <h3>Get in touch</h3>
        <Link href="/contact">Contact SoftHaven</Link>
      </div>
      <div className="footer-bottom"><span>© 2026 SoftHaven</span><Link href="/">Back to top ↑</Link></div>
    </footer>
  );
}
