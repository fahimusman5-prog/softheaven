"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  adminRequest,
  date,
  exportRows,
  human,
  money,
  useAdminData,
  type Row,
} from "./shared";
import {
  ConfirmDialog,
  DataTable,
  ErrorState,
  MetricCard,
  PageHeader,
  Pagination,
  ProductCell,
  Skeleton,
  StatusBadge,
  type Column,
} from "./primitives";
import { ResourceEditor, RecordPicker } from "./editor";
import { StockAdjustment, StockHistory, stockState } from "./stock";
import { AdminIcon } from "./icons";
import { ActionMenu } from "./action-menu";
const titles: Record<string, [string, string]> = {
  products: [
    "Products",
    "Manage your SoftHaven catalogue, pricing and availability.",
  ],
  categories: [
    "Categories",
    "Keep your catalogue organized and easy to browse.",
  ],
  collections: [
    "Collections",
    "Curate groups of products for every kind of customer.",
  ],
  reviews: ["Reviews", "Moderate customer feedback and product ratings."],
  orders: ["Orders", "Manage and fulfil customer purchases."],
  customers: [
    "Customers",
    "View customer details, orders and lifetime activity.",
  ],
  newsletter: [
    "Newsletter",
    "Manage subscribers and keep your audience up to date.",
  ],
  inventory: ["Inventory", "Monitor and update SoftHaven product stock."],
};
const statuses: Record<string, string[]> = {
  products: ["published", "draft", "archived"],
  orders: [
    "pending",
    "confirmed",
    "processing",
    "packed",
    "shipped",
    "delivered",
    "cancelled",
    "returned",
    "refunded",
  ],
  reviews: ["pending", "approved", "rejected", "hidden"],
  newsletter: ["subscribed", "unsubscribed"],
  customers: ["active", "inactive"],
  categories: ["active", "inactive"],
  collections: ["active", "inactive"],
};
export function ResourceList({
  resource,
  role,
}: {
  resource: string;
  role: string;
}) {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("");
  const [payment, setPayment] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [editor, setEditor] = useState<Row | null>(null);
  const [adjust, setAdjust] = useState<Row | null>(null);
  const [history, setHistory] = useState<Row | null>(null);
  const [archive, setArchive] = useState<Row | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const params = new URLSearchParams({
    page: String(page),
    q,
    status,
    category,
    stock,
    payment,
    from,
    to,
  });
  const {
    data,
    loading,
    error: loadError,
    refresh,
  } = useAdminData("business/" + resource + "?" + params);
  const overview = useAdminData("business/overview");
  const rows: Row[] = data.rows ?? [];
  const [title, description] = titles[resource] ?? [
    human(resource),
    "Manage your store records.",
  ];
  const change = (setter: (v: string) => void) => (value: string) => {
    setter(value);
    setPage(0);
    setSelected([]);
  };
  async function moderate(row: Row, next: string) {
    setBusy(true);
    setError("");
    try {
      await adminRequest("reviews", { id: row.id, values: { status: next } });
      setNotice("Review " + human(next).toLowerCase() + ".");
      refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function bulk(action: string, ids = selected) {
    setBusy(true);
    setError("");
    try {
      await adminRequest("products/bulk", { ids, action });
      setNotice("Products updated.");
      setSelected([]);
      setArchive(null);
      refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const actions = (row: Row) => (
    <div className="admin-row-actions">
      <button
        onClick={() =>
          resource === "products"
            ? router.push("/admin/products/" + row.id)
            : resource === "collections"
              ? router.push("/admin/collections/" + row.id)
              : setEditor(row)
        }
      >
        Edit
      </button>
      {resource === "products" && (
        <ActionMenu
          label={"More actions for " + row.name}
          items={[
            { label: "View product ↗", href: "/product/" + row.slug },
            { label: "Archive product", run: () => setArchive(row) },
          ]}
        />
      )}
    </div>
  );
  let columns: Column[] = [];
  if (resource === "products")
    columns = [
      {
        key: "select",
        label: "Select",
        render: (r) => (
          <input
            type="checkbox"
            aria-label={"Select " + r.name}
            checked={selected.includes(r.id)}
            onChange={(e) =>
              setSelected((v) =>
                e.target.checked ? [...v, r.id] : v.filter((id) => id !== r.id),
              )
            }
          />
        ),
      },
      {
        key: "product",
        label: "Product",
        render: (r) => (
          <Link href={"/admin/products/" + r.id}>
            <ProductCell
              name={r.name}
              image={r.image}
              secondary={`${r.category_name ?? "Uncategorized"} · ${r.variant_count} ${r.variant_count === 1 ? "variant" : "variants"}`}
            />
          </Link>
        ),
      },
      { key: "display_sku", label: "SKU" },
      { key: "price", label: "Price", render: (r) => money(r.price) },
      {
        key: "total_stock",
        label: "Stock",
        render: (r) => (
          <span className={Number(r.total_stock) === 0 ? "admin-negative" : ""}>
            {r.total_stock} units
          </span>
        ),
      },
      {
        key: "status",
        label: "Status",
        render: (r) => <StatusBadge value={r.status} />,
      },
      {
        key: "featured",
        label: "Featured",
        render: (r) => (
          <span aria-label={r.featured ? "Featured" : "Not featured"}>
            {r.featured ? "★" : "—"}
          </span>
        ),
      },
      { key: "updated", label: "Updated", render: (r) => date(r.updated_at) },
      { key: "actions", label: "Actions", render: actions },
    ];
  if (resource === "categories")
    columns = [
      {
        key: "name",
        label: "Category",
        render: (r) => <ProductCell name={r.name} image={r.image} />,
      },
      {
        key: "products",
        label: "Products",
        render: (r) => r.products?.[0]?.count ?? 0,
      },
      {
        key: "active",
        label: "Status",
        render: (r) => <StatusBadge value={r.active} />,
      },
      { key: "sort_order", label: "Sort order" },
      { key: "actions", label: "Actions", render: actions },
    ];
  if (resource === "collections")
    columns = [
      {
        key: "name",
        label: "Collection",
        render: (r) => (
          <Link href={"/admin/collections/" + r.id}>
            <ProductCell name={r.name} image={r.image} />
          </Link>
        ),
      },
      {
        key: "products",
        label: "Products",
        render: (r) => r.product_collections?.[0]?.count ?? 0,
      },
      {
        key: "featured",
        label: "Featured",
        render: (r) => (r.featured ? "★ Featured" : "—"),
      },
      {
        key: "active",
        label: "Status",
        render: (r) => <StatusBadge value={r.active} />,
      },
      { key: "actions", label: "Actions", render: actions },
    ];
  if (resource === "orders")
    columns = [
      {
        key: "order",
        label: "Order",
        render: (r) => (
          <Link className="admin-text-link" href={"/admin/orders/" + r.id}>
            #{r.order_number}
          </Link>
        ),
      },
      {
        key: "customer",
        label: "Customer",
        render: (r) => (
          <span>
            <strong>{r.shipping_address?.name || r.email}</strong>
            <small className="admin-cell-secondary">{r.email}</small>
          </span>
        ),
      },
      {
        key: "items",
        label: "Items",
        render: (r) => r.order_items?.[0]?.count ?? 0,
      },
      { key: "total", label: "Total", render: (r) => money(r.total) },
      {
        key: "payment",
        label: "Payment",
        render: (r) => <StatusBadge value={r.payment_status} />,
      },
      {
        key: "status",
        label: "Status",
        render: (r) => <StatusBadge value={r.status} />,
      },
      { key: "date", label: "Date", render: (r) => date(r.created_at) },
      {
        key: "actions",
        label: "Action",
        render: (r) => (
          <Link className="admin-button" href={"/admin/orders/" + r.id}>
            View order
          </Link>
        ),
      },
    ];
  if (resource === "customers")
    columns = [
      {
        key: "name",
        label: "Customer",
        render: (r) => (
          <Link className="admin-text-link" href={"/admin/customers/" + r.id}>
            {r.name || r.email || "Customer"}
          </Link>
        ),
      },
      { key: "phone", label: "Phone" },
      { key: "email", label: "Email" },
      { key: "orders", label: "Orders" },
      {
        key: "lifetime_spend",
        label: "Total spent",
        render: (r) => money(r.lifetime_spend),
      },
      {
        key: "last_order",
        label: "Last order",
        render: (r) => date(r.last_order),
      },
      {
        key: "active",
        label: "Status",
        render: (r) => <StatusBadge value={r.active} />,
      },
    ];
  if (resource === "reviews")
    columns = [
      {
        key: "product",
        label: "Product",
        render: (r) => (
          <ProductCell
            name={r.products?.name ?? "Product"}
            image={r.products?.image}
          />
        ),
      },
      {
        key: "customer",
        label: "Customer",
        render: (r) => r.profiles?.name || r.profiles?.email || "Customer",
      },
      {
        key: "rating",
        label: "Rating",
        render: (r) => (
          <span className="admin-stars" aria-label={r.rating + " out of 5"}>
            {"★".repeat(r.rating)}
            <span>{"☆".repeat(5 - r.rating)}</span>
          </span>
        ),
      },
      {
        key: "review",
        label: "Review",
        render: (r) => (
          <div className="admin-review-excerpt">
            <strong>{r.title}</strong>
            <p>{r.body}</p>
          </div>
        ),
      },
      {
        key: "verified",
        label: "Verified",
        render: (r) =>
          r.verified_purchase ? (
            <span className="admin-positive">✓ Purchase</span>
          ) : (
            "—"
          ),
      },
      {
        key: "status",
        label: "Status",
        render: (r) => <StatusBadge value={r.status} />,
      },
      { key: "date", label: "Date", render: (r) => date(r.created_at) },
      {
        key: "actions",
        label: "Action",
        render: (r) => (
          <div className="admin-row-actions">
            <button onClick={() => setEditor(r)}>View</button>
            <ActionMenu
              label="Moderation actions"
              items={["approved", "rejected", "hidden"].map((next) => ({
                label:
                  next === "approved"
                    ? "Approve"
                    : next === "rejected"
                      ? "Reject"
                      : "Hide",
                disabled: busy || r.status === next,
                run: () => moderate(r, next),
              }))}
            />
          </div>
        ),
      },
    ];
  if (resource === "newsletter")
    columns = [
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      {
        key: "date",
        label: "Subscribed date",
        render: (r) => date(r.created_at),
      },
      { key: "source", label: "Source", render: (r) => human(r.source) },
      {
        key: "status",
        label: "Status",
        render: (r) => <StatusBadge value={r.status} />,
      },
      {
        key: "actions",
        label: "Action",
        render: (r) => (
          <button onClick={() => setEditor(r)}>Manage subscription</button>
        ),
      },
    ];
  if (resource === "inventory")
    columns = [
      {
        key: "product",
        label: "Product",
        render: (r) => (
          <ProductCell
            name={r.products?.name ?? "Product"}
            image={r.products?.image}
          />
        ),
      },
      { key: "color", label: "Variant" },
      { key: "sku", label: "SKU" },
      {
        key: "stock",
        label: "Current stock",
        render: (r) => <strong>{r.stock} units</strong>,
      },
      { key: "low_stock_threshold", label: "Low stock level" },
      {
        key: "status",
        label: "Status",
        render: (r) => <StatusBadge value={stockState(r)} />,
      },
      {
        key: "actions",
        label: "Action",
        render: (r) => (
          <div className="admin-row-actions">
            <button onClick={() => setAdjust(r)}>Adjust stock</button>
            <button className="admin-ghost" onClick={() => setHistory(r)}>
              Stock history
            </button>
          </div>
        ),
      },
    ];
  const summary =
    resource === "customers"
      ? [
          ["customers", "Total customers", "Your customer database"],
          ["new_customers", "New customers", "Joined in the last 30 days"],
          ["returning_customers", "Returning customers", "More than one order"],
        ]
      : resource === "newsletter"
        ? [
            ["subscribers", "Total subscribers", "Your newsletter audience"],
            ["active_subscribers", "Active", "Currently subscribed"],
            ["unsubscribed", "Unsubscribed", "Opted out of updates"],
          ]
        : resource === "inventory"
          ? [
              ["in_stock", "In stock", "Above the alert level"],
              ["low_stock", "Low stock", "Above zero, at or below alert level"],
              ["out_of_stock", "Out of stock", "No units available"],
            ]
          : resource === "reviews"
            ? [
                ["reviews_pending", "Pending", "Waiting for moderation"],
                ["reviews_approved", "Approved", "Visible to customers"],
                [
                  "average_rating",
                  "Average rating",
                  "Approved customer ratings",
                ],
              ]
            : [];
  return (
    <>
      <PageHeader
        title={title}
        description={description}
        action={
          ["products", "categories", "collections"].includes(resource) && (
            <button
              className="admin-primary"
              onClick={() =>
                resource === "products"
                  ? router.push("/admin/products/new")
                  : resource === "collections"
                    ? router.push("/admin/collections/new")
                    : setEditor({})
              }
            >
              <AdminIcon name="plus" />
              Add{" "}
              {resource === "categories"
                ? "category"
                : resource === "collections"
                  ? "collection"
                  : "product"}
            </button>
          )
        }
      />
      {summary.length > 0 && (
        <div className="admin-metrics admin-metrics--three">
          {summary.map(([key, label, note]) => (
            <MetricCard
              key={key}
              label={label}
              value={
                overview.loading
                  ? "—"
                  : resource === "inventory" && key === "low_stock"
                    ? Math.max(
                        0,
                        (overview.data.low_stock ?? 0) -
                          (overview.data.out_of_stock ?? 0),
                      )
                    : (overview.data[key] ?? 0)
              }
              note={note}
              icon={resource}
            />
          ))}
        </div>
      )}
      <div className="admin-list-card">
        <div className="admin-filter-bar">
          <label className="admin-search-field">
            <AdminIcon name="search" />
            <input
              type="search"
              placeholder={
                resource === "orders"
                  ? "Search order or customer…"
                  : "Search " + resource + "…"
              }
              value={q}
              onChange={(e) => change(setQ)(e.target.value)}
              aria-label={"Search " + resource}
            />
          </label>
          {resource === "products" && (
            <div className="admin-category-filter">
              <RecordPicker
                target="categories"
                label="Filter by category"
                value={category}
                onChange={change(setCategory)}
              />
            </div>
          )}
          {statuses[resource] && (
            <select
              value={status}
              aria-label="Filter by status"
              onChange={(e) => change(setStatus)(e.target.value)}
            >
              <option value="">All statuses</option>
              {statuses[resource].map((s) => (
                <option key={s} value={s}>
                  {human(s)}
                </option>
              ))}
            </select>
          )}
          {["products", "inventory"].includes(resource) && (
            <select
              value={stock}
              aria-label="Filter by stock"
              onChange={(e) => change(setStock)(e.target.value)}
            >
              <option value="">All stock</option>
              <option value="in">In stock</option>
              {resource === "inventory" && (
                <option value="low">Low stock</option>
              )}
              <option value="out">Out of stock</option>
            </select>
          )}
          {resource === "orders" && (
            <>
              <select
                value={payment}
                aria-label="Filter by payment"
                onChange={(e) => change(setPayment)(e.target.value)}
              >
                <option value="">All payments</option>
                {[
                  "pending",
                  "paid",
                  "failed",
                  "partially_refunded",
                  "refunded",
                ].map((s) => (
                  <option key={s} value={s}>
                    {human(s)}
                  </option>
                ))}
              </select>
              <label className="admin-date-filter">
                From
                <input
                  type="date"
                  value={from}
                  onChange={(e) => change(setFrom)(e.target.value)}
                />
              </label>
              <label className="admin-date-filter">
                To
                <input
                  type="date"
                  value={to}
                  onChange={(e) => change(setTo)(e.target.value)}
                />
              </label>
            </>
          )}
          <button
            className="admin-ghost admin-filter-refresh"
            onClick={refresh}
          >
            Refresh
          </button>
          {resource === "newsletter" && (
            <button
              disabled={!rows.length}
              onClick={() =>
                exportRows(rows, [
                  ["name", "Name"],
                  ["email", "Email"],
                  ["created_at", "Subscribed date"],
                  ["source", "Source"],
                  ["status", "Status"],
                ])
              }
            >
              Export page CSV
            </button>
          )}
        </div>
        {selected.length > 0 && (
          <div className="admin-bulk-bar">
            <strong>{selected.length} selected</strong>
            <button onClick={() => bulk("published")} disabled={busy}>
              Publish
            </button>
            <button onClick={() => bulk("draft")} disabled={busy}>
              Set draft
            </button>
            <button onClick={() => bulk("featured")} disabled={busy}>
              Feature
            </button>
            <button onClick={() => setSelected([])}>Clear</button>
          </div>
        )}
        {notice && (
          <p className="admin-success" role="status">
            {notice}
            <button onClick={() => setNotice("")}>Dismiss</button>
          </p>
        )}
        {error && <ErrorState message={error} retry={() => setError("")} />}{" "}
        {loadError ? (
          <ErrorState
            message={"Couldn’t load " + resource + ". " + loadError}
            retry={refresh}
          />
        ) : loading ? (
          <Skeleton />
        ) : (
          <DataTable
            rows={rows}
            columns={columns}
            emptyTitle={
              q || status || stock
                ? "No matching " + resource
                : "No " + resource + " yet"
            }
            emptyDescription={
              resource === "orders"
                ? "Orders placed through SoftHaven will appear here."
                : "Try changing the filters or add your first record."
            }
            caption={title}
          />
        )}
        <Pagination
          page={page}
          count={data.count ?? 0}
          onPage={(p) => {
            setPage(p);
            setSelected([]);
          }}
        />
      </div>
      {editor && (
        <ResourceEditor
          resource={resource}
          row={editor}
          role={role}
          onClose={() => setEditor(null)}
          onSaved={() => {
            setEditor(null);
            refresh();
            overview.refresh();
            setNotice("Changes saved.");
          }}
        />
      )}
      {archive && (
        <ConfirmDialog
          title="Archive product?"
          description={
            archive.name +
            " will be removed from the public catalogue. Existing orders are preserved."
          }
          busy={busy}
          onClose={() => setArchive(null)}
          onConfirm={() => bulk("archived", [archive.id])}
        />
      )}{" "}
      {adjust && (
        <StockAdjustment
          row={adjust}
          onClose={() => setAdjust(null)}
          onSaved={() => {
            setAdjust(null);
            refresh();
            overview.refresh();
            setNotice("Stock updated and history recorded.");
          }}
        />
      )}
      {history && (
        <StockHistory row={history} onClose={() => setHistory(null)} />
      )}
    </>
  );
}
