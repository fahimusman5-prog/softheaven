import type { Metadata } from 'next';
import { getStorefront } from '@/lib/storefront';
import { businessConfig, resolveBusiness } from '@/lib/business';
import { policyMeta, policySections } from '@/lib/policies';
import { PolicyPage } from '@/components/policy-page';
const info = policyMeta['privacy-policy'];
export const metadata: Metadata = { title: { absolute: info.title + ' | SoftHaven Sri Lanka' }, description: info.description, alternates: { canonical: new URL('/privacy-policy', businessConfig.websiteUrl).href }, openGraph: { title: info.title, description: info.description, type: 'website' } };
export default async function Page() { const { settings } = await getStorefront(); const business = resolveBusiness(settings); return <PolicyPage title={info.title} description={info.description} business={business} sections={policySections('privacy-policy',business)} />; }
