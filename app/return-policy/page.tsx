import type { Metadata } from 'next';
import { getStorefront } from '@/lib/storefront';
import { businessConfig, resolveBusiness } from '@/lib/business';
import { policySections } from '@/lib/policies';
import { PolicyPage } from '@/components/policy-page';
const info = { title: 'Return Policy', description: "Read SoftHaven Sri Lanka's Return Policy, including information about returns, refunds, exchanges, damaged products, and order cancellations." };
export const metadata: Metadata = { title: { absolute: info.title + ' | SoftHaven Sri Lanka' }, description: info.description, alternates: { canonical: new URL('/return-policy', businessConfig.websiteUrl).href }, openGraph: { title: info.title, description: info.description, type: 'website' } };
export default async function Page() { const { settings } = await getStorefront(); const business = { ...resolveBusiness(settings), lastPolicyUpdateDate: '2026-10-16' }; const order = ['overview', 'returns', 'conditions', 'damaged', 'incorrect', 'request', 'eligibility-refund', 'refunds', 'exchanges', 'excluded', 'cancellation', 'charges'];
 const sections = policySections('returns-refunds', business);
 const timing = sections.find(section => section.id === 'timing');
 const ordered = order.flatMap(id => {
   const section = sections.find(item => item.id === id);
   return section ? [{ ...section, body: id === 'refunds' ? <>{section.body}{timing?.body}</> : section.body }] : [];
 });
 return <PolicyPage returns title="Returns, Refunds & Cancellations" description="A clear guide to our return process, refunds, exchanges, and order cancellations." business={business} sections={ordered} />; }
