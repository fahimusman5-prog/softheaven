"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, type ReactNode } from "react";
import { allowed } from "@/lib/admin/resources";
import { browserClient } from "@/lib/supabase/browser";
import { AdminIcon } from "./icons";
import { human } from "./shared";
export const adminMenu = [
  {
    section: "Overview",
    label: "Dashboard",
    path: "",
    icon: "dashboard",
    areas: [],
  },
  {
    section: "Catalog",
    label: "Products",
    path: "products",
    icon: "products",
    areas: ["products"],
  },
  {
    section: "Catalog",
    label: "Reviews",
    path: "reviews",
    icon: "reviews",
    areas: ["reviews"],
  },
  {
    section: "Catalog",
    label: "Categories",
    path: "categories",
    icon: "categories",
    areas: ["products"],
  },
  {
    section: "Catalog",
    label: "Collections",
    path: "collections",
    icon: "collections",
    areas: ["products"],
  },
  {
    section: "Sales",
    label: "Orders",
    path: "orders",
    icon: "orders",
    areas: ["orders"],
  },
  {
    section: "Sales",
    label: "Commerce",
    path: "commerce",
    icon: "commerce",
    areas: ["settings", "marketing", "rewards"],
  },
  {
    section: "Customers",
    label: "Customers",
    path: "customers",
    icon: "customers",
    areas: ["customers"],
  },
  {
    section: "Marketing",
    label: "Newsletter",
    path: "newsletter",
    icon: "newsletter",
    areas: ["marketing"],
  },
  {
    section: "Operations",
    label: "Inventory",
    path: "inventory",
    icon: "inventory",
    areas: ["inventory"],
  },
  {
    section: "Insights",
    label: "Reports",
    path: "reports",
    icon: "reports",
    areas: ["reports"],
  },
  {
    section: "System",
    label: "Settings",
    path: "settings",
    icon: "settings",
    areas: ["settings", "users"],
  },
];
export function AdminShell({
  path,
  role,
  email,
  children,
}: {
  path: string;
  role: string;
  email: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const [drawer, setDrawer] = useState(false);
  const [mobile, setMobile] = useState(false);
  const sidebar = useRef<HTMLElement>(null);
  useEffect(() => {
    const media = window.matchMedia("(max-width:767px)");
    const update = () => setMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (!drawer) return;
    if (sidebar.current) sidebar.current.inert = false;
    const first = sidebar.current?.querySelector<HTMLElement>("a");
    first?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDrawer(false);
        document.querySelector<HTMLButtonElement>(".admin-menu")?.focus();
      }
      if (event.key === "Tab") {
        const controls = Array.from(
          sidebar.current?.querySelectorAll<HTMLElement>(
            "a,button:not(:disabled)",
          ) ?? [],
        );
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [drawer]);
  useEffect(() => {
    if (sidebar.current) sidebar.current.inert = mobile && !drawer;
  }, [mobile, drawer]);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState("");
  const section = path.split("/")[0];
  const current = adminMenu.find((m) => m.path === section);
  async function signOut() {
    setSigningOut(true);
    const { error } = await browserClient().auth.signOut();
    if (error) {
      setError("Unable to sign out. Please try again.");
      setSigningOut(false);
    } else router.refresh();
  }
  return (
    <div className="admin-app">
      {drawer && (
        <button
          className="admin-sidebar-scrim"
          aria-label="Close navigation"
          onClick={() => setDrawer(false)}
        />
      )}
      <aside
        ref={sidebar}
        className={"admin-sidebar" + (drawer ? " open" : "")}
        aria-label="Administration navigation"
      >
        <Link className="admin-brand" href="/admin">
          <span className="admin-brand-mark">S</span>
          <span>
            SoftHaven<small>Store administration</small>
          </span>
        </Link>
        <nav>
          {adminMenu
            .filter(
              (m) => !m.areas.length || m.areas.some((a) => allowed(role, a)),
            )
            .map((m, i, items) => (
              <div key={m.path}>
                {items[i - 1]?.section !== m.section && (
                  <p className="admin-nav-group">{m.section}</p>
                )}
                <Link
                  href={"/admin" + (m.path ? "/" + m.path : "")}
                  className={section === m.path ? "active" : ""}
                  aria-current={section === m.path ? "page" : undefined}
                  onClick={() => setDrawer(false)}
                >
                  <AdminIcon name={m.icon} />
                  <span>{m.label}</span>
                  {section === m.path && <i />}
                </Link>
              </div>
            ))}
        </nav>
        <div className="admin-sidebar-bottom">
          <Link href="/admin/profile" onClick={() => setDrawer(false)}>
            <AdminIcon name="profile" />
            Admin profile
          </Link>
          <button onClick={signOut} disabled={signingOut}>
            <AdminIcon name="logout" />
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
          <Link className="admin-store-link" href="/">
            View storefront <span>↗</span>
          </Link>
        </div>
      </aside>
      <div className="admin-workspace">
        <header className="admin-topbar">
          <div className="admin-breadcrumb">
            <button
              className="admin-menu"
              aria-label="Open navigation"
              aria-expanded={drawer}
              onClick={() => setDrawer(!drawer)}
            >
              <AdminIcon name="menu" />
            </button>
            <Link href="/admin">Administration</Link>
            <span>/</span>
            <strong>
              {current?.label ??
                (section === "profile" ? "Admin profile" : "Details")}
            </strong>
            {path.includes("/") && (
              <>
                <span>/</span>
                <small>Details</small>
              </>
            )}
          </div>
          <details className="admin-profile-menu">
            <summary>
              <span className="admin-avatar">
                {email.slice(0, 1).toUpperCase()}
              </span>
              <span>
                <strong>{email}</strong>
                <small>{human(role)}</small>
              </span>
              <AdminIcon name="chevron" />
            </summary>
            <div>
              <Link href="/admin/profile">Admin profile</Link>
              <button disabled={signingOut} onClick={signOut}>
                Sign out
              </button>
            </div>
          </details>
        </header>
        <main className="admin-main">
          {error && (
            <p className="admin-error" role="alert">
              {error}
            </p>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
