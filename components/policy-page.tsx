import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Business } from '@/lib/business';
import { PolicyToc } from '@/components/policy-toc';
import { BusinessDetails } from '@/components/business-details';
import './policy-page.css';
export type PolicySection = { id: string; title: string; body: ReactNode };
export function PolicyPage({ title, description, sections, business }: { title: string; description: string; sections: PolicySection[]; business: Business }) {
  return <div className="care-page"><header className="care-hero"><span className="care-pill">SoftHaven · Customer care</span><h1>{title}</h1><p>{description}</p><small>Last updated: {business.lastPolicyUpdateDate}</small></header>
    <div className="care-layout"><PolicyToc sections={sections.map(({id,title})=>({id,title}))} /><article className="care-reading" aria-label={title}>
      <aside className="care-notice"><strong>Merchant confirmation required</strong><p>Bracketed details are awaiting approval from SoftHaven. These pages must be completed and reviewed before publication or payment-gateway submission.</p></aside>
      {sections.map(s=><section id={s.id} key={s.id} className="care-section"><h2>{s.title}</h2>{s.body}</section>)}
      <section className="care-support" id="support"><span className="care-pill">A little help, with care</span><h2>Need help?</h2><p>Questions about an order, delivery, return or payment? Find our available contact channels and include your order number when asking about a purchase.</p><BusinessDetails business={business} /><div className="care-actions"><Link className="primary-button" href="/contact">Contact us →</Link>{business.whatsapp && <a className="secondary-button" href={business.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp us</a>}</div></section>
    </article></div></div>;
}
