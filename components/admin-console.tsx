"use client";
import Link from "next/link";
import { RelationField, SettingsFields } from "./admin-form-controls";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { resources, allowed, type Field } from "@/lib/admin/resources";
type Row = Record<string, unknown>;
const relationTargets: Record<string, string> = {
  category_id: "categories",
  product_id: "products",
  collection_id: "collections",
  coupon_id: "coupons",
  zone_id: "shipping",
};
const menu = [
  ["Overview", "Dashboard", ""],
  ["Commerce", "Orders", "orders"],
  ["Commerce", "Products", "products"],
  ["Commerce", "Colour variants", "variants"],
  ["Commerce", "Categories", "categories"],
  ["Commerce", "Collections", "collections"],
  ["Commerce", "Collection assignments", "product-collections"],
  ["Commerce", "Inventory", "inventory"],
  ["Commerce", "Stock movements", "movements"],
  ["Customers", "Customers", "customers"],
  ["Customers", "Addresses", "addresses"],
  ["Customers", "Reviews", "reviews"],
  ["Customers", "Reward ledger", "rewards"],
  ["Customers", "Loyalty settings", "reward-settings"],
  ["Marketing", "Coupons", "coupons"],
  ["Marketing", "Promotions", "promotions"],
  ["Marketing", "Newsletter", "newsletter"],
  ["Marketing", "Campaigns", "campaigns"],
  ["Content", "Homepage", "content/homepage"],
  ["Content", "Slideshow", "content/slideshow"],
  ["Content", "Media", "media"],
  ["Content", "Navigation & footer", "navigation"],
  ["Operations", "Shipping zones", "shipping"],
  ["Operations", "Shipping rates", "shipping-rates"],
  ["Insights", "Reports", "reports"],
  ["System", "Notifications", "notifications"],
  ["System", "Administrators", "users"],
  ["System", "Settings", "settings"],
  ["System", "Audit log", "audit"],
];
async function request(url: string, body?: unknown) {
  const res = await fetch(
    url,
    body
      ? {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      : { cache: "no-store" },
  );
  const result = await res.json();
  if (!res.ok) throw new Error(result.error ?? "Operation failed");
  return result;
}
function format(v: unknown) {
  if (v == null) return "—";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}
function initial(fields: Record<string, Field>, row?: Row) {
  return Object.fromEntries(
    Object.entries(fields).map(([key, f]) => [
      key,
      row?.[key] ??
        (f.type === "checkbox"
          ? false
          : f.type === "json"
            ? []
            : f.type === "select"
              ? f.options?.[0]
              : ""),
    ]),
  );
}
function exportCsv(rows: Row[], columns: string[]) {
  const esc = (v: unknown) =>
    '"' +
    format(v)
      .replace(/^[=+@-]/, "'")
      .replace(/"/g, '""') +
    '"';
  const csv = [
    columns.join(","),
    ...rows.map((r) => columns.map((c) => esc(r[c])).join(",")),
  ].join("\r\n");
  const url = URL.createObjectURL(
    new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = "softhaven-export-page.csv";
  a.click();
  URL.revokeObjectURL(url);
}
export function AdminConsole({
  path,
  role,
  email,
}: {
  path: string;
  role: string;
  email: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedProduct = searchParams.get("product_id");
  const known = Object.keys(resources)
    .sort((a, b) => b.length - a.length)
    .find((k) => path === k || path.startsWith(k + "/"));
  const resource = known ?? "";
  const config = resources[resource];
  const detail = known && path !== known ? path.slice(known.length + 1) : "";
  const [rows, setRows] = useState<Row[]>([]);
  const [details, setDetails] = useState<Row>({});
  const [stats, setStats] = useState<Row>({});
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [filter, setFilter] = useState("");
  const [days, setDays] = useState("30");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editing, setEditing] = useState<Row | null>(null);
  const [values, setValues] = useState<Row>({});
  const [busy, setBusy] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [reload, setReload] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [tab, setTab] = useState("General");
  const [selected, setSelected] = useState<string[]>([]);
  const [sortColumn, setSortColumn] = useState("");
  const [ascending, setAscending] = useState(true);
  useEffect(() => {
    if (config && detail === "new" && !config.readonly) {
      setEditing({});
      setValues(initial(config.fields));
      setDirty(false);
    }
  }, [config, detail]);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    const timer = setTimeout(() => {
      const endpoint = !config
        ? "/api/admin/dashboard?" +
          new URLSearchParams({
            from: new Date(
              from || Date.now() - Number(days) * 86400000,
            ).toISOString(),
            to: new Date(to ? to + "T23:59:59" : Date.now()).toISOString(),
            ...(path === "reports" ? { reports: "true" } : {}),
          })
        : "/api/admin/" +
          resource +
          "?" +
          new URLSearchParams({
            page: String(page),
            q: query,
            status: filter,
            sort: sortColumn,
            ascending: String(ascending),
            ...(selectedProduct ? { product_id: selectedProduct } : {}),
            ...(detail && detail !== "new" ? { id: detail } : {}),
          });
      request(endpoint)
        .then((r) => {
          if (!active) return;
          if (config) {
            setRows(r.rows);
            setCount(r.count);
            setDetails(r);
          } else setStats(r);
        })
        .catch((e) => active && setError(e.message))
        .finally(() => active && setLoading(false));
    }, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [
    resource,
    detail,
    config,
    page,
    query,
    filter,
    days,
    from,
    to,
    reload,
    path,
    selectedProduct,
    sortColumn,
    ascending,
  ]);
  function open(row: Row = {}) {
    setEditing(row);
    setValues({
      ...initial(config.fields, row),
      ...(resource === "variants" && selectedProduct
        ? { product_id: selectedProduct }
        : {}),
    });
    setTab("General");
    setDirty(false);
    setError("");
  }
  function close() {
    if (dirty && !confirm("Discard unsaved changes?")) return;
    setEditing(null);
    setDirty(false);
  }
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (
        resource === "users" &&
        !confirm("Apply this administrator access change?")
      )
        return;
      const normalized: Row = {};
      for (const [key, field] of Object.entries(config.fields)) {
        const raw = values[key];
        if (raw === "" || raw == null) {
          if (field.required) normalized[key] = "";
          else if (editing?.id)
            normalized[key] = config.schema.shape[key].isNullable()
              ? null
              : field.type === "number"
                ? undefined
                : "";
          continue;
        }
        normalized[key] =
          field.type === "number"
            ? Number(raw)
            : field.type === "datetime-local"
              ? new Date(String(raw)).toISOString()
              : raw;
      }
      await request("/api/admin/" + resource, {
        id: editing?.id,
        values: normalized,
      });
      setEditing(null);
      setDirty(false);
      setReload((r) => r + 1);
      setNotice("Saved successfully.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function adjust(kind: "inventory" | "rewards", row?: Row) {
    const id = row?.id ?? prompt("Customer ID");
    if (!id) return;
    const delta = prompt(
      kind === "inventory"
        ? "Quantity change (positive to receive, negative to deduct)"
        : "Points change",
    );
    if (delta === null) return;
    const reason =
      kind === "inventory"
        ? prompt(
            "Reason: stock received, manual correction, return/restock, damage, other",
            "stock received",
          )
        : prompt("Reason for adjustment");
    if (!reason) return;
    try {
      setBusy(true);
      await request(
        "/api/admin/" + kind + "/adjust",
        kind === "inventory"
          ? { variant: id, delta: Number(delta), reason }
          : { customer: id, points: Number(delta), reason },
      );
      setReload((r) => r + 1);
      setNotice("Adjustment recorded in the ledger.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function updateOrder(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (
      !confirm(
        "Apply this order update? Inventory effects are recorded automatically.",
      )
    )
      return;
    setBusy(true);
    const f = new FormData(e.currentTarget);
    try {
      await request("/api/admin/orders/update", {
        id: rows[0].id,
        status: f.get("status"),
        notes: f.get("notes") || null,
        tracking: f.get("tracking") || null,
        provider: f.get("provider") || null,
        cod_paid: f.get("cod_paid") === "on",
      });
      setReload((r) => r + 1);
      setNotice("Order updated.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.[0]) return;
    const f = new FormData();
    f.set("file", e.target.files[0]);
    setBusy(true);
    try {
      const r = await fetch("/api/admin/media-upload", {
        method: "POST",
        body: f,
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      setReload((v) => v + 1);
      setNotice("Image uploaded.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const title = config?.title ?? (path === "reports" ? "Reports" : "Dashboard");
  const hasAccess = !config || allowed(role, config.area);
  return (
    <div className="admin-app">
      <aside className={"admin-sidebar " + (mobile ? "open" : "")}>
        <Link className="admin-brand" href="/admin">
          SoftHaven<span>STORE ADMINISTRATION</span>
        </Link>
        {menu
          .filter(
            ([, , key]) =>
              !resources[key] || allowed(role, resources[key].area),
          )
          .map(([group, label, key], i, all) => (
            <div key={key}>
              {(!i || all[i - 1][0] !== group) && (
                <p className="admin-nav-group">{group}</p>
              )}
              <Link
                className={
                  resource === key || (!resource && path === key)
                    ? "active"
                    : ""
                }
                href={"/admin" + (key ? "/" + key : "")}
                onClick={(e) => {
                  if (dirty && !confirm("Discard unsaved changes?"))
                    e.preventDefault();
                  else {
                    setEditing(null);
                    setDirty(false);
                    setMobile(false);
                    setPage(0);
                  }
                }}
              >
                {label}
              </Link>
            </div>
          ))}
        <Link href="/">View storefront ↗</Link>
      </aside>
      <div className="admin-workspace">
        <header className="admin-topbar">
          <button
            className="admin-menu"
            onClick={() => setMobile(!mobile)}
            aria-label="Toggle administration menu"
          >
            ☰
          </button>
          <span>
            <Link href="/admin">Administration</Link> / {title}
          </span>
          <form
            className="admin-global-search"
            onSubmit={(e) => {
              e.preventDefault();
              const q = String(new FormData(e.currentTarget).get("q") ?? "");
              const target = allowed(role, "products")
                ? "products"
                : allowed(role, "orders")
                  ? "orders"
                  : allowed(role, "customers")
                    ? "customers"
                    : allowed(role, "content")
                      ? "content/slideshow"
                      : "audit";
              setQuery(q);
              router.push("/admin/" + target + "?q=" + encodeURIComponent(q));
            }}
          >
            <input
              type="search"
              name="q"
              aria-label="Global administration search"
              placeholder="Search administration…"
            />
          </form>
          <div>
            <span>
              {email} · {role.replaceAll("_", " ")}
            </span>
            <button
              onClick={async () => {
                await request("/api/auth", { action: "logout" });
                router.refresh();
              }}
            >
              Sign out
            </button>
          </div>
        </header>
        <main className="admin-main">
          <div className="admin-heading">
            <div>
              <p className="admin-kicker">SOFTHAVEN OPERATIONS</p>
              <h1>{title}</h1>
              <p>
                {config
                  ? `${count} records · Shared with your storefront`
                  : "Live commerce figures from Supabase · LKR"}
              </p>
            </div>
            {config &&
              !config.readonly &&
              hasAccess &&
              ![
                "reviews",
                "newsletter",
                "settings",
                "reward-settings",
                "media",
                "content/homepage",
                "customers",
              ].includes(resource) && (
                <button className="admin-primary" onClick={() => open()}>
                  + Add {title.toLowerCase()}
                </button>
              )}
            {resource === "rewards" && (
              <button onClick={() => adjust("rewards")} disabled={busy}>
                Adjust points
              </button>
            )}
          </div>
          {resource === "campaigns" && (
            <p className="admin-note">
              Campaign drafts are stored here. Delivery is unavailable until a
              supported email provider is configured; no messages are sent by
              this screen.
            </p>
          )}
          {resource === "content/homepage" && (
            <p className="admin-note">
              Edit content within the existing layouts.{" "}
              <Link href="/" target="_blank">
                Preview homepage ↗
              </Link>
            </p>
          )}
          {resource === "media" && (
            <label className="admin-upload">
              Upload image (JPEG, PNG, WebP or AVIF, up to 5 MB)
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                disabled={busy}
                onChange={upload}
              />
            </label>
          )}
          {notice && (
            <div className="admin-success" role="status">
              {notice}
              <button onClick={() => setNotice("")}>Dismiss</button>
            </div>
          )}
          {error && (
            <div className="admin-error" role="alert">
              {error}
              <button onClick={() => setReload((v) => v + 1)}>Retry</button>
            </div>
          )}
          {!hasAccess ? (
            <p className="admin-note">
              Your role does not have access to this area.
            </p>
          ) : !config ? (
            <>
              <div className="admin-filters">
                <label>
                  Period
                  <select
                    value={days}
                    onChange={(e) => {
                      setDays(e.target.value);
                      setFrom("");
                      setTo("");
                    }}
                  >
                    {[1, 7, 30, 90].map((d) => (
                      <option key={d} value={d}>
                        {d === 1 ? "Today" : `Last ${d} days`}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  From
                  <input
                    type="date"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                  />
                </label>
                <label>
                  To
                  <input
                    type="date"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                  />
                </label>
              </div>
              {loading ? (
                <p role="status">Loading live statistics…</p>
              ) : (
                <>
                  <div className="admin-stats">
                    {Object.entries(stats)
                      .filter(([k]) => k !== "daily" && k !== "reports")
                      .map(([k, v]) => (
                        <article key={k}>
                          <span>{k.replaceAll("_", " ")}</span>
                          <strong>
                            {Number(v).toLocaleString("en-LK", {
                              maximumFractionDigits: 2,
                            })}
                          </strong>
                        </article>
                      ))}
                  </div>
                  <section className="admin-panel">
                    <h2>Revenue and orders by day</h2>
                    {Array.isArray(stats.daily) && stats.daily.length ? (
                      <div className="admin-chart">
                        {(stats.daily as Row[]).map((day) => (
                          <div key={String(day.day)}>
                            <span
                              style={{
                                height: Math.max(
                                  4,
                                  (Number(day.revenue) /
                                    Math.max(
                                      ...(stats.daily as Row[]).map((r) =>
                                        Number(r.revenue),
                                      ),
                                      1,
                                    )) *
                                    160,
                                ),
                              }}
                            />
                            <small>{String(day.day)}</small>
                            <b>LKR {format(day.revenue)}</b>
                            <small>{format(day.orders)} orders</small>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>
                        No orders in this period. Figures will appear when real
                        orders are recorded.
                      </p>
                    )}
                  </section>
                  {Boolean(stats.reports) &&
                    Object.entries(stats.reports as Row).map(
                      ([name, value]) => (
                        <section className="admin-panel" key={name}>
                          <h2>{name}</h2>
                          {Array.isArray(value) && value.length ? (
                            <>
                              <button
                                onClick={() =>
                                  exportCsv(value, Object.keys(value[0]))
                                }
                              >
                                Export report CSV
                              </button>
                              <pre>{JSON.stringify(value, null, 2)}</pre>
                            </>
                          ) : (
                            <p>No data in this period.</p>
                          )}
                        </section>
                      ),
                    )}
                </>
              )}
            </>
          ) : (
            <>
              {resource === "products" && selected.length > 0 && (
                <div className="admin-filters">
                  <span>{selected.length} selected</span>
                  {["published", "draft", "archived", "featured"].map(
                    (action) => (
                      <button
                        disabled={busy}
                        key={action}
                        onClick={async () => {
                          if (
                            action === "archived" &&
                            !confirm("Archive the selected products?")
                          )
                            return;
                          setBusy(true);
                          try {
                            await request("/api/admin/products/bulk", {
                              ids: selected,
                              action,
                            });
                            setSelected([]);
                            setReload((v) => v + 1);
                            setNotice("Products updated.");
                          } catch (e) {
                            setError((e as Error).message);
                          } finally {
                            setBusy(false);
                          }
                        }}
                      >
                        {action}
                      </button>
                    ),
                  )}
                </div>
              )}
              <div className="admin-filters">
                <label>
                  Search
                  <input
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setPage(0);
                    }}
                    placeholder={`Search ${config.search.replaceAll("_", " ")}`}
                  />
                </label>
                {config.fields.status?.options && (
                  <label>
                    Status
                    <select
                      value={filter}
                      onChange={(e) => {
                        setFilter(e.target.value);
                        setPage(0);
                      }}
                    >
                      <option value="">All statuses</option>
                      {config.fields.status.options.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                )}
                <button
                  onClick={() => exportCsv(rows, config.columns)}
                  disabled={!rows.length}
                >
                  Export current page CSV
                </button>
                <button onClick={() => setReload((v) => v + 1)}>Refresh</button>
              </div>
              {loading ? (
                <div className="admin-panel" role="status">
                  Loading {title.toLowerCase()}…
                </div>
              ) : rows.length === 0 ? (
                <div className="admin-empty">
                  <h2>No {title.toLowerCase()} found</h2>
                  <p>
                    {query
                      ? "Try another search."
                      : "Records will appear here when they are created. No sample business data has been added."}
                  </p>
                </div>
              ) : (
                <div className="admin-table-wrap">
                  <table>
                    <thead>
                      <tr>
                        {resource === "products" && <th>Select</th>}
                        {config.columns.map((c) => (
                          <th key={c}>
                            <button
                              onClick={() => {
                                setSortColumn(c);
                                setAscending((a) =>
                                  sortColumn === c ? !a : true,
                                );
                              }}
                            >
                              {c.replaceAll("_", " ")}{" "}
                              {sortColumn === c ? (ascending ? "↑" : "↓") : ""}
                            </button>
                          </th>
                        ))}
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr key={String(row.id)}>
                          {resource === "products" && (
                            <td>
                              <input
                                type="checkbox"
                                aria-label={"Select " + row.name}
                                checked={selected.includes(String(row.id))}
                                onChange={(e) =>
                                  setSelected((ids) =>
                                    e.target.checked
                                      ? [...ids, String(row.id)]
                                      : ids.filter((id) => id !== row.id),
                                  )
                                }
                              />
                            </td>
                          )}
                          {config.columns.map((c) => (
                            <td key={c}>
                              {c === "url" ? (
                                <a
                                  href={String(row[c])}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  View image ↗
                                </a>
                              ) : (
                                format(row[c])
                              )}
                            </td>
                          ))}
                          <td>
                            {resource === "media" && (
                              <>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(
                                      String(row.url),
                                    );
                                    setNotice("Image URL copied.");
                                  }}
                                >
                                  Copy image URL
                                </button>
                                <button
                                  disabled={busy}
                                  onClick={async () => {
                                    if (
                                      !confirm(
                                        "Remove this unused image? Referenced images are protected.",
                                      )
                                    )
                                      return;
                                    setBusy(true);
                                    try {
                                      await request("/api/admin/media/remove", {
                                        id: row.id,
                                      });
                                      setReload((v) => v + 1);
                                      setNotice("Unused media removed.");
                                    } catch (e) {
                                      setError((e as Error).message);
                                    } finally {
                                      setBusy(false);
                                    }
                                  }}
                                >
                                  Remove
                                </button>
                              </>
                            )}
                            {resource === "notifications" && (
                              <button
                                onClick={async () => {
                                  try {
                                    await request(
                                      "/api/admin/notifications/read",
                                      { id: row.id },
                                    );
                                    setNotice("Notification marked read.");
                                  } catch (e) {
                                    setError((e as Error).message);
                                  }
                                }}
                              >
                                Mark read
                              </button>
                            )}
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(String(row.id));
                                setNotice("ID copied.");
                              }}
                            >
                              Copy ID
                            </button>
                            {!config.readonly && (
                              <button onClick={() => open(row)}>Edit</button>
                            )}
                            {["orders", "customers", "products"].includes(
                              resource,
                            ) && (
                              <Link href={`/admin/${resource}/${row.id}`}>
                                Details →
                              </Link>
                            )}
                            {resource === "products" && (
                              <Link
                                href={`/admin/variants?product_id=${encodeURIComponent(String(row.id))}`}
                              >
                                Variants
                              </Link>
                            )}
                            {resource === "inventory" && (
                              <button
                                disabled={busy}
                                onClick={() => adjust("inventory", row)}
                              >
                                Adjust stock
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {!detail && (
                <div className="admin-pagination">
                  <button
                    disabled={page === 0 || loading}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </button>
                  <span>
                    Page {page + 1} · {count} records
                  </span>
                  <button
                    disabled={(page + 1) * 25 >= count || loading}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
              {detail && rows[0] && (
                <section className="admin-panel">
                  <h2>Record details</h2>
                  {resource === "orders" &&
                    rows[0].payment_status === "paid" &&
                    allowed(role, "settings") && (
                      <button
                        disabled={busy}
                        onClick={async () => {
                          const reference = prompt(
                            "Reference for the full COD refund already completed outside SoftHaven",
                          );
                          if (!reference) return;
                          const reason = prompt("Refund reason");
                          if (
                            !reason ||
                            !confirm(
                              "Record the full offline refund? This records evidence; it does not transfer money.",
                            )
                          )
                            return;
                          setBusy(true);
                          try {
                            await request("/api/admin/orders/refund", {
                              id: rows[0].id,
                              reference,
                              reason,
                            });
                            setReload((v) => v + 1);
                            setNotice("Completed offline refund recorded.");
                          } catch (e) {
                            setError((e as Error).message);
                          } finally {
                            setBusy(false);
                          }
                        }}
                      >
                        Record completed COD refund
                      </button>
                    )}
                  <dl className="admin-detail">
                    {Object.entries(rows[0]).map(([k, v]) => (
                      <div key={k}>
                        <dt>{k.replaceAll("_", " ")}</dt>
                        <dd>{format(v)}</dd>
                      </div>
                    ))}
                  </dl>
                  {resource === "orders" && (
                    <form className="admin-form" onSubmit={updateOrder}>
                      <label>
                        Status
                        <select
                          name="status"
                          defaultValue={String(rows[0].status)}
                        >
                          {[
                            "pending",
                            "confirmed",
                            "processing",
                            "packed",
                            "shipped",
                            "delivered",
                            "cancelled",
                            "returned",
                            "refunded",
                          ].map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Admin notes
                        <textarea
                          name="notes"
                          defaultValue={String(rows[0].admin_notes ?? "")}
                        />
                      </label>
                      <label>
                        Tracking number
                        <input
                          name="tracking"
                          defaultValue={String(rows[0].tracking_number ?? "")}
                        />
                      </label>
                      <label>
                        Shipping provider
                        <input
                          name="provider"
                          defaultValue={String(rows[0].shipping_provider ?? "")}
                        />
                      </label>
                      {allowed(role, "settings") && (
                        <label>
                          <input type="checkbox" name="cod_paid" /> Confirm COD
                          collected on delivery
                        </label>
                      )}
                      <button className="admin-primary" disabled={busy}>
                        Save order update
                      </button>
                    </form>
                  )}
                  {Object.entries(details)
                    .filter(
                      ([k]) => !["rows", "count", "page", "size"].includes(k),
                    )
                    .map(([k, v]) => (
                      <div key={k}>
                        <h3>{k}</h3>
                        <pre>{JSON.stringify(v, null, 2)}</pre>
                      </div>
                    ))}
                </section>
              )}
            </>
          )}
        </main>
      </div>
      {editing && (
        <div className="admin-modal-backdrop">
          <section
            className="admin-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="editor-title"
          >
            <header>
              <h2 id="editor-title">
                {editing.id ? "Edit" : "Add"} {title.toLowerCase()}
              </h2>
              <button onClick={close} disabled={busy} aria-label="Close editor">
                ×
              </button>
            </header>
            {resource === "products" && (
              <div className="admin-editor-tabs">
                {["General", "Media", "Pricing", "Organization", "SEO"].map(
                  (t) => (
                    <button
                      type="button"
                      key={t}
                      className={tab === t ? "selected" : ""}
                      onClick={() => setTab(t)}
                    >
                      {t}
                    </button>
                  ),
                )}
                {Boolean(editing.id) && (
                  <Link href={"/admin/variants?product_id=" + editing.id}>
                    Variants & inventory ↗
                  </Link>
                )}
              </div>
            )}
            <form className="admin-form" onSubmit={save}>
              {resource === "settings" && (
                <SettingsFields
                  id={String(editing.id)}
                  value={(values.value ?? {}) as Row}
                  onChange={(value) => {
                    setValues((v) => ({ ...v, value }));
                    setDirty(true);
                  }}
                />
              )}
              {Object.entries(config.fields)
                .filter(([key]) => resource !== "settings" || key !== "value")
                .filter(
                  ([key]) =>
                    resource !== "products" ||
                    (
                      {
                        image: "Media",
                        images: "Media",
                        price: "Pricing",
                        compare_at: "Pricing",
                        cost_price: "Pricing",
                        category_id: "Organization",
                        featured: "Organization",
                        new_arrival: "Organization",
                        best_seller: "Organization",
                        seo_title: "SEO",
                        seo_description: "SEO",
                      } as Record<string, string>
                    )[key] === tab ||
                    (tab === "General" &&
                      ![
                        "image",
                        "images",
                        "price",
                        "compare_at",
                        "cost_price",
                        "category_id",
                        "featured",
                        "new_arrival",
                        "best_seller",
                        "seo_title",
                        "seo_description",
                      ].includes(key)),
                )
                .map(([key, f]) => (
                  <label key={key}>
                    {f.label}
                    {f.required ? " *" : ""}
                    {relationTargets[key] ||
                    (resource === "users" && key === "id") ? (
                      <RelationField
                        target={relationTargets[key] ?? "customers"}
                        value={String(values[key] ?? "")}
                        required={f.required}
                        onChange={(value) => {
                          setValues((v) => ({ ...v, [key]: value }));
                          setDirty(true);
                        }}
                      />
                    ) : f.type === "checkbox" ? (
                      <input
                        type="checkbox"
                        checked={Boolean(values[key])}
                        onChange={(e) => {
                          setValues((v) => ({ ...v, [key]: e.target.checked }));
                          setDirty(true);
                        }}
                      />
                    ) : f.type === "select" ? (
                      <select
                        value={String(values[key] ?? "")}
                        onChange={(e) => {
                          setValues((v) => ({ ...v, [key]: e.target.value }));
                          setDirty(true);
                        }}
                      >
                        {f.options?.map((o) => (
                          <option key={o}>{o}</option>
                        ))}
                      </select>
                    ) : f.type === "json" ? (
                      <textarea
                        defaultValue={JSON.stringify(values[key], null, 2)}
                        onChange={(e) => {
                          try {
                            setValues((v) => ({
                              ...v,
                              [key]: JSON.parse(e.target.value),
                            }));
                            setError("");
                          } catch {
                            setError(`${f.label}: enter valid JSON`);
                          }
                          setDirty(true);
                        }}
                      />
                    ) : f.type === "textarea" ? (
                      <textarea
                        value={String(values[key] ?? "")}
                        onChange={(e) => {
                          setValues((v) => ({ ...v, [key]: e.target.value }));
                          setDirty(true);
                        }}
                      />
                    ) : (
                      <input
                        required={f.required}
                        type={f.type ?? "text"}
                        step={f.type === "number" ? "any" : undefined}
                        value={
                          f.type === "datetime-local"
                            ? String(values[key] ?? "").slice(0, 16)
                            : String(values[key] ?? "")
                        }
                        onChange={(e) => {
                          setValues((v) => ({ ...v, [key]: e.target.value }));
                          setDirty(true);
                        }}
                      />
                    )}
                  </label>
                ))}
              {error && (
                <p className="admin-error" role="alert">
                  {error}
                </p>
              )}
              <footer>
                <button type="button" onClick={close} disabled={busy}>
                  Cancel
                </button>
                <button
                  className="admin-primary"
                  disabled={busy || Boolean(error)}
                >
                  {busy ? "Saving…" : "Save changes"}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
