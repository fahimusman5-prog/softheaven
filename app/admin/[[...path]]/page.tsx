import { redirect, notFound } from "next/navigation";
import { requireAdmin, AccessError } from "@/lib/admin/auth";
import { AdminConsole } from "@/components/admin-console";
import { AuthForm } from "@/components/auth-form";
import "../admin.css";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Administration",
  robots: { index: false, follow: false },
};
export default async function AdminPage({
  params,
}: {
  params: Promise<{ path?: string[] }>;
}) {
  const rawPath = (await params).path?.join("/") ?? "";
  const aliases: Record<string, string> = {
    variants: "products",
    "product-collections": "collections",
    movements: "inventory",
    addresses: "customers",
    rewards: "customers",
    coupons: "commerce?tab=coupons",
    shipping: "commerce?tab=shipping",
    "shipping-rates": "commerce?tab=shipping",
    "reward-settings": "commerce?tab=rewards",
    users: "settings?tab=administrators",
  };
  const path = rawPath;
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
  if (aliases[path]) redirect("/admin/" + aliases[path]);
  if (
    [
      "content",
      "media",
      "navigation",
      "notifications",
      "audit",
      "promotions",
      "campaigns",
    ].includes(path.split("/")[0])
  )
    notFound();
  return (
    <AdminConsole
      path={path}
      role={access.role}
      email={access.user.email ?? ""}
    />
  );
}
