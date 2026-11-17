'use client';
import Link from 'next/link';
import { useCatalogue } from '@/components/catalogue-provider';
import { NewsletterForm } from '@/components/newsletter-form';



export function SiteFooter() {
  const {categories: records, navigation,settings} = useCatalogue();
  const categories=records.map(c=>c.name);
  return (
    <footer className="site-footer site-footer--refined">
      <div className="site-footer__brand">
        <Link href="/" className="wordmark">Soft<span>Haven</span></Link>
        <p>{settings.footer?.description}</p>
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
        <Link href="/contact">Contact SoftHaven</Link>{settings.general?.email&&<a href={"mailto:"+settings.general.email}>{settings.general.email}</a>}{settings.general?.phone&&<a href={"tel:"+settings.general.phone}>{settings.general.phone}</a>}{navigation.filter(n=>n.placement==='footer').map(n=><Link href={n.url} key={n.id}>{n.label}</Link>)}<NewsletterForm/>
      </div>
      <div className="footer-bottom"><span>{settings.footer?.copyright}</span><a href="#page-top">Back to top ↑</a></div>
    </footer>
  );
}
