'use client';
import { StoreMotion } from './store-motion';
import { usePathname } from 'next/navigation';
export function StorefrontFrame({
  children,
  header,
  footer,
  background,
}: {
  children: React.ReactNode;
  header: React.ReactNode;
  footer: React.ReactNode;
  background: React.ReactNode;
}) {
  const pathname = usePathname();
  const admin = pathname.startsWith('/admin');
  if (pathname === '/checkout' || pathname === '/account' || pathname.startsWith('/account/'))
    return <div className="softhaven-app sh-transaction-shell">{background}<main id="main-content">{children}</main></div>;
  return admin ? (
    <>{children}</>
  ) : (
    <div className="softhaven-app" id="page-top">
      {background}
      {header}
      <main id="main-content">{children}</main>
      <StoreMotion>{footer}</StoreMotion>
    </div>
  );
}
