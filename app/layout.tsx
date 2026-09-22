import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/components/cart-provider';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { AuroraBackground } from '@/components/aurora-background';

export const metadata: Metadata = {
  title: { default: 'ANTZ SoftHaven | The softer side of luxury', template: '%s | ANTZ SoftHaven' },
  description: 'Heirloom plush companions and sensory gifts, curated for better hugs.',
  metadataBase: new URL('https://softhaven.example'),
  openGraph: { title: 'ANTZ SoftHaven', description: 'Heirloom plush companions for softer living.', type: 'website' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AuroraBackground />
        <CartProvider>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </CartProvider>
      </body>
    </html>
  );
}
