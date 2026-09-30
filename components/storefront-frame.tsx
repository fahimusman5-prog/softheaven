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
  const admin = usePathname().startsWith('/admin');
  return admin ? (
    <>{children}</>
  ) : (
    <div className="softhaven-app">
      {background}
      {header}
      <main>{children}</main>
      {footer}
    </div>
  );
}
