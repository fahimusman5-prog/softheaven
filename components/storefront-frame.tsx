'use client';
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
  if (pathname === '/checkout') return <main id="main-content">{children}</main>;
  const admin = pathname.startsWith('/admin');
  if (pathname === '/account' || pathname.startsWith('/account/'))
    return <main id="main-content">{children}</main>;
  return admin ? (
    <>{children}</>
  ) : (
    <div className="softhaven-app" id="page-top">
      {background}
      {header}
      <main id="main-content">{children}</main>
      {footer}
    </div>
  );
}
