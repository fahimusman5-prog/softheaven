import { getStorefront } from '@/lib/storefront';
import { CatalogueProvider } from '@/components/catalogue-provider';
import type { Metadata } from 'next';
import './globals.css';
import './softhaven-premium.css';
import './home-reference.css';
import 'lenis/dist/lenis.css';
import './home-sky.css';
import './readiness.css';
import { StorefrontFrame } from '@/components/storefront-frame';
import { CartProvider } from '@/components/cart-provider';
import { WishlistProvider } from '@/components/wishlist-provider';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { SoftHavenCloudBackground } from '@/components/effects/SoftHavenSky';

export const dynamic = 'force-dynamic';
export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getStorefront();
  const seo = settings.seo ?? {};
  return {
    title: {
      default: seo.title ?? 'ANTZ SoftHaven',
      template: '%s | ANTZ SoftHaven',
    },
    description: seo.description ?? '',
    ...(process.env.NEXT_PUBLIC_SITE_URL
      ? { metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL) }
      : {}),
    openGraph: {
      title: seo.title ?? 'ANTZ SoftHaven',
      description: seo.description ?? '',
      type: 'website',
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const catalogue = await getStorefront();
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <CatalogueProvider value={catalogue}>
          <CartProvider>
            <WishlistProvider>
            <StorefrontFrame
              header={<SiteHeader />}
              footer={<SiteFooter />}
              background={<SoftHavenCloudBackground />}
            >
              {children}
            </StorefrontFrame>
            </WishlistProvider>
          </CartProvider>
        </CatalogueProvider>
      </body>
    </html>
  );
}
