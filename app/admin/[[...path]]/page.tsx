import { requireAdmin, AccessError } from '@/lib/admin/auth';
import { AdminConsole } from '@/components/admin-console';
import { AuthForm } from '@/components/auth-form';
import '../admin.css';
export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Administration',
  robots: { index: false, follow: false },
};
export default async function AdminPage({
  params,
}: {
  params: Promise<{ path?: string[] }>;
}) {
  const rawPath = (await params).path?.join('/') ?? '';
  const path = rawPath === 'content' ? 'content/homepage' : rawPath;
  let access: Awaited<ReturnType<typeof requireAdmin>> | null = null;
  let denied: AccessError | null = null;
  try {
    access = await requireAdmin();
  } catch (e) {
    if (e instanceof AccessError) denied = e;
    else throw e;
  }
  if (!access)
    return (
      <div className="admin-auth">
        <AuthForm admin />
        {denied?.status === 403 && <p role="alert">{denied.message}</p>}
      </div>
    );
  return (
    <AdminConsole
      path={path}
      role={access.role}
      email={access.user.email ?? ''}
    />
  );
}
