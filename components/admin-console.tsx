"use client";
import { allowed, resources } from "@/lib/admin/resources";
import { AdminShell } from "./admin/shell";
import { ResourceList } from "./admin/resource-list";
import { CatalogueEditor } from "./admin/catalogue-editors";
import { Dashboard, Reports } from "./admin/overview";
import {
  CommerceWorkspace,
  SettingsWorkspace,
} from "./admin/settings-workspace";
import { OrderDetail, CustomerDetail } from "./admin/detail-pages";
import { PageHeader, Panel, EmptyState } from "./admin/primitives";
import { human } from "./admin/shared";
export function AdminConsole({
  path,
  role,
  email,
}: {
  path: string;
  role: string;
  email: string;
}) {
  const [section, id] = path.split("/");
  const area =
    resources[section]?.area ?? (section === "reports" ? "reports" : undefined);
  const permitted =
    section === "commerce"
      ? ["settings", "marketing", "rewards"].some((a) => allowed(role, a))
      : section === "settings"
        ? ["settings", "users"].some((a) => allowed(role, a))
        : !area || allowed(role, area);
  return (
    <AdminShell path={path} role={role} email={email}>
      {!permitted ? (
        <EmptyState
          title="Access restricted"
          description="Your administrator role cannot access this area."
        />
      ) : !section ? (
        <Dashboard role={role} />
      ) : section === "products" || section === "collections" ? (
        id ? (
          <CatalogueEditor resource={section} id={id} role={role} />
        ) : (
          <ResourceList resource={section} role={role} />
        )
      ) : section === "orders" && id ? (
        <OrderDetail id={id} role={role} />
      ) : section === "customers" && id ? (
        <CustomerDetail id={id} role={role} />
      ) : [
          "categories",
          "orders",
          "customers",
          "reviews",
          "newsletter",
          "inventory",
        ].includes(section) ? (
        <ResourceList resource={section} role={role} />
      ) : section === "commerce" ? (
        <CommerceWorkspace role={role} />
      ) : section === "settings" ? (
        <SettingsWorkspace role={role} />
      ) : section === "reports" ? (
        <Reports />
      ) : section === "profile" ? (
        <>
          <PageHeader
            title="Admin profile"
            description="Your current administrator account."
          />
          <Panel title="Account details">
            <p>{email}</p>
            <p>{human(role)}</p>
            <p>
              Use the sign-in page’s password reset to change your password
              securely.
            </p>
          </Panel>
        </>
      ) : (
        <EmptyState
          title="Page unavailable"
          description="Choose a destination in the navigation to continue."
        />
      )}
    </AdminShell>
  );
}
