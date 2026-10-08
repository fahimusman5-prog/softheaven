'use client';
import Link from 'next/link';
import { useCatalogue } from '@/components/catalogue-provider';
import { resolveBusiness, policyLinks } from '@/lib/business';
import { BusinessDetails } from '@/components/business-details';
import '@/components/policy-page.css';
import { NewsletterForm } from '@/components/newsletter-form';



export function SiteFooter() {
  const {categories: records, navigation,settings} = useCatalogue();
  const categories=records.map(c=>c.name);
  const business = resolveBusiness(settings);
  return (
    <footer className="site-footer site-footer--refined">
      <div className="site-footer__brand">
        <Link href="/" className="wordmark">Soft<span>Haven</span></Link>
        <p>{settings.footer?.description}</p><BusinessDetails business={business}/>
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
        <h3>Customer care</h3>
        <Link href="/contact">Contact SoftHaven</Link>{navigation.filter(n=>n.placement==='footer').map(n=><Link href={n.url} key={n.id}>{n.label}</Link>)}{policyLinks.slice(0,2).map(link=><Link href={link.href} key={link.href}>{link.label}</Link>)}<Link href="/returns-refunds#cancellation">Cancellation Policy</Link><NewsletterForm/>
      </div>
      <div className="site-footer__column"><h3>Legal</h3>{policyLinks.slice(2).map(link=><Link key={link.href} href={link.href}>{link.label}</Link>)}{Object.entries(settings.social ?? {}).filter(([key,value])=>key !== "whatsapp" && typeof value === "string" && value.startsWith("https://")).map(([key,value])=><a href={String(value)} key={key} target="_blank" rel="noopener noreferrer">{key.charAt(0).toUpperCase()+key.slice(1)}</a>)}</div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} {business.brandName}. All rights reserved.</span><a href="#page-top">Back to top ↑</a></div>
    </footer>
  );
}
