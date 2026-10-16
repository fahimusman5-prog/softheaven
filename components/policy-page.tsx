import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Business } from '@/lib/business';
import { PolicyToc } from '@/components/policy-toc';
import { BusinessDetails } from '@/components/business-details';
import './policy-page.css';
export type PolicySection = { id: string; title: string; body: ReactNode };
export function PolicyPage({ title, description, sections, business, returns = false }: { title: string; description: string; sections: PolicySection[]; business: Business; returns?: boolean }) {
  return <div className={`care-page${returns ? ' care-page--returns' : ''}`}><header className="care-hero"><span className="care-pill">{returns ? 'SoftHaven Customer Care' : 'SoftHaven · Customer care'}</span><h1>{title}</h1><p>{description}</p><small>Last updated: {business.lastPolicyUpdateDate}</small></header>
    <div className="care-layout"><PolicyToc sections={[...sections.map(({id,title})=>({id,title})), ...(returns ? [{id:'support',title:'Customer Support'}] : [])]} /><article className="care-reading" aria-label={title}>
      {sections.map(s=><section id={s.id} key={s.id} className="care-section"><h2>{s.title}</h2>{s.body}</section>)}
      <section className="care-support" id="support"><span className="care-pill">A little help, with care</span><h2>{returns ? 'Need help with your order?' : 'Need help?'}</h2><p>{returns ? 'Our SoftHaven team is here to help with questions about returns, refunds, exchanges, and cancellations.' : 'Questions about an order, delivery, return or payment? Find our available contact channels and include your order number when asking about a purchase.'}</p><BusinessDetails business={business} /><div className="care-actions"><Link className="primary-button" href="/contact">{returns ? 'Contact SoftHaven' : 'Contact us →'}</Link>{business.whatsapp && <a className="secondary-button" href={business.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp us</a>}</div></section>
    </article></div></div>;
}
