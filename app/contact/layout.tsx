import type { Metadata } from 'next';
import { businessConfig } from '@/lib/business';
export const metadata: Metadata = { title: { absolute: 'Contact Us | SoftHaven Sri Lanka' }, description: 'Contact SoftHaven Sri Lanka for order, delivery, return and payment support.', alternates: { canonical: new URL('/contact',businessConfig.websiteUrl).href } };
export default function Layout({children}:{children:React.ReactNode}) { return children; }
