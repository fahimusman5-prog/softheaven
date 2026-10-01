"use client";
import Link from "next/link";
import { useState } from "react";
import { allowed } from "@/lib/admin/resources";
import { useAdminData, money, date, human, type Row } from "./shared";
import {
  PageHeader,
  MetricCard,
  Panel,
  DataTable,
  StatusBadge,
  Skeleton,
  ErrorState,
  EmptyState,
  ProductCell,
  AdminTabs,
} from "./primitives";
export function Dashboard({ role }: { role: string }) {
  const { data, loading, error, refresh } = useAdminData("business/overview");
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="A clear view of your store, orders and stock today."
        action={
          allowed(role, "products") ? (
            <Link className="admin-primary" href="/admin/products/new">
              Add product
            </Link>
          ) : undefined
        }
      />
      {error ? (
        <ErrorState message={error} retry={refresh} />
      ) : loading ? (
        <Skeleton metrics />
      ) : (
        <>
          {["reports", "orders", "products"].some((area) =>
            allowed(role, area),
          ) ? (
            <>
              {" "}
              <div className="admin-metrics">
                <MetricCard
                  label="Today's sales"
                  value={money(data.today_sales)}
                  note="Paid orders today · Sri Lanka time"
                  icon="commerce"
                />
                <MetricCard
                  label="Total orders"
                  value={data.total_orders ?? 0}
                  note="All order statuses"
                  icon="orders"
                />
                <MetricCard
                  label="Total revenue"
                  value={money(data.total_revenue)}
                  note="Paid orders · all time"
                />
                <MetricCard
                  label="Low stock items"
                  value={data.low_stock ?? 0}
                  note="Active variants at or below alert level"
                  icon="inventory"
                />
              </div>
            </>
          ) : (
            <div className="admin-metrics">
              {[
                {
                  area: "customers",
                  key: "customers",
                  label: "Total customers",
                  note: "Customer database",
                },
                {
                  area: "customers",
                  key: "new_customers",
                  label: "New customers",
                  note: "Joined in the last 30 days",
                },
                {
                  area: "marketing",
                  key: "active_subscribers",
                  label: "Active subscribers",
                  note: "Current newsletter audience",
                },
                {
                  area: "reviews",
                  key: "reviews_pending",
                  label: "Pending reviews",
                  note: "Awaiting moderation",
                },
              ]
                .filter((m) => allowed(role, m.area))
                .map((m) => (
                  <MetricCard
                    key={m.key}
                    label={m.label}
                    value={data[m.key] ?? 0}
                    note={m.note}
                  />
                ))}
            </div>
          )}
          <div className="admin-dashboard-grid">
            {allowed(role, "orders") && (
              <Panel
                title="Recent orders"
                action={<Link href="/admin/orders">View all orders →</Link>}
              >
                <DataTable
                  rows={data.recent_orders ?? []}
                  emptyTitle="No orders yet"
                  emptyDescription="New customer orders will appear here."
                  columns={[
                    {
                      key: "order_number",
                      label: "Order",
                      render: (r) => (
                        <Link
                          className="admin-text-link"
                          href={"/admin/orders/" + r.id}
                        >
                          #{r.order_number}
                        </Link>
                      ),
                    },
                    {
                      key: "customer_name",
                      label: "Customer",
                      render: (r) => (
                        <span>
                          {r.customer_name || r.email}
                          <small className="admin-cell-secondary">
                            {r.email}
                          </small>
                        </span>
                      ),
                    },
                    {
                      key: "total",
                      label: "Total",
                      render: (r) => money(r.total),
                    },
                    {
                      key: "status",
                      label: "Status",
                      render: (r) => <StatusBadge value={r.status} />,
                    },
                    {
                      key: "created_at",
                      label: "Date",
                      render: (r) => date(r.created_at),
                    },
                  ]}
                />
              </Panel>
            )}
            {(allowed(role, "inventory") || allowed(role, "products")) && (
              <Panel
                title="Stock alerts"
                action={
                  <Link
                    href={
                      "/admin/" +
                      (allowed(role, "inventory") ? "inventory" : "products")
                    }
                  >
                    View inventory →
                  </Link>
                }
              >
                <DataTable
                  rows={data.stock_alerts ?? []}
                  emptyTitle="Stock is looking healthy"
                  emptyDescription="Variants needing attention will appear here."
                  columns={[
                    {
                      key: "product",
                      label: "Product",
                      render: (r) => (
                        <ProductCell
                          name={r.name}
                          image={r.image}
                          secondary={[r.color, r.sku]
                            .filter(Boolean)
                            .join(" · ")}
                        />
                      ),
                    },
                    {
                      key: "stock",
                      label: "Remaining",
                      render: (r) => (
                        <span
                          className={
                            r.stock === 0 ? "admin-negative" : "admin-warning"
                          }
                        >
                          {r.stock} units
                        </span>
                      ),
                    },
                  ]}
                />
              </Panel>
            )}
          </div>
          <Panel title="Quick actions">
            <div className="admin-quick-actions">
              {[
                ["products", "Manage products", "products"],
                ["orders", "Review orders", "orders"],
                ["inventory", "Check stock", "inventory"],
                ["reports", "View reports", "reports"],
                ["customers", "View customers", "customers"],
                ["reviews", "Moderate reviews", "reviews"],
                ["newsletter", "Manage subscribers", "marketing"],
              ]
                .filter(([, , area]) => allowed(role, area))
                .map(([path, label]) => (
                  <Link key={path} href={"/admin/" + path}>
                    {label} →
                  </Link>
                ))}
            </div>
          </Panel>
        </>
      )}
    </>
  );
}
export function Reports() {
  const [from, setFrom] = useState(() =>
    new Date(Date.now() + 19800000 - 29 * 86400000).toISOString().slice(0, 10),
  );
  const [to, setTo] = useState(() =>
    new Date(Date.now() + 19800000).toISOString().slice(0, 10),
  );
  const [tab, setTab] = useState("sales");
  const { data, loading, error, refresh } = useAdminData(
    "dashboard?" +
      new URLSearchParams({
        reports: "true",
        from: new Date(from + "T00:00:00+05:30").toISOString(),
        to: new Date(to + "T23:59:59.999+05:30").toISOString(),
      }),
  );
  const reports = data.reports ?? {};
  const daily = data.daily_sales ?? data.daily ?? [];
  const rows = reports[tab] ?? [];
  return (
    <>
      <PageHeader
        title="Reports"
        description="Understand paid sales, product performance and store activity."
      />
      <div className="admin-filter-bar">
        <label>
          Period
          <select
            aria-label="Report period"
            defaultValue="30"
            onChange={(e) => {
              if (e.target.value === "custom") return;
              const days = Number(e.target.value);
              const end = new Date(Date.now() + 19800000)
                .toISOString()
                .slice(0, 10);
              setTo(end);
              setFrom(
                new Date(Date.now() + 19800000 - (days - 1) * 86400000)
                  .toISOString()
                  .slice(0, 10),
              );
            }}
          >
            <option value="1">Today</option>
            <option value="7">7 days</option>
            <option value="30">30 days</option>
            <option value="90">90 days</option>
            <option value="custom">Custom</option>
          </select>
        </label>
        <label>
          From
          <input
            type="date"
            value={from}
            max={to}
            onChange={(e) => {
              if (e.target.value) setFrom(e.target.value);
            }}
          />
        </label>
        <label>
          To
          <input
            type="date"
            value={to}
            min={from}
            onChange={(e) => {
              if (e.target.value) setTo(e.target.value);
            }}
          />
        </label>
        <span className="admin-helper">
          Inventory shows current stock. Sales reports include paid orders.
        </span>
      </div>
      <AdminTabs
        value={tab}
        onChange={setTab}
        items={[
          "sales",
          "products",
          "categories",
          "customers",
          "coupons",
          "inventory",
          "reviews",
          "rewards",
        ].map((id) => ({ id, label: human(id) }))}
      />
      {error ? (
        <ErrorState message={error} retry={refresh} />
      ) : loading ? (
        <Skeleton />
      ) : tab === "sales" ? (
        <>
          <div className="admin-metrics">
            <MetricCard
              label="Revenue"
              value={money(data.sales)}
              note="Paid orders in selected period"
            />
            <MetricCard
              label="Orders"
              value={data.orders ?? 0}
              note="Orders in selected period"
            />
            <MetricCard
              label="Average order value"
              value={money(data.average_order)}
              note="Paid order average"
            />
            <MetricCard
              label="Customers"
              value={data.new_customers ?? 0}
              note="New customers in selected period"
            />
          </div>
          <Panel title="Daily sales">
            {daily.length ? (
              <div
                className="admin-chart"
                role="img"
                aria-label="Daily paid revenue"
              >
                {daily.map((r: Row, i: number) => {
                  const revenue = Number(r.revenue ?? r.total ?? 0);
                  const max = Math.max(
                    ...daily.map((x: Row) => Number(x.revenue ?? x.total ?? 0)),
                    1,
                  );
                  return (
                    <div key={i}>
                      <span>{money(revenue)}</span>
                      <i
                        style={{ height: Math.max(2, (revenue / max) * 160) }}
                      />
                      <small>{date(r.day ?? r.date)}</small>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                title="No paid sales in this period"
                description="Choose another date range to view sales activity."
              />
            )}
          </Panel>
          <Panel title="Orders over time">
            <Trend rows={daily} field="orders" />
          </Panel>
        </>
      ) : (
        <Panel title={human(tab) + " report"}>
          <DataTable
            rows={rows}
            emptyTitle="No activity in this period"
            columns={
              tab === "products" || tab === "categories"
                ? [
                    {
                      key: "name",
                      label: tab === "products" ? "Product" : "Category",
                    },
                    { key: "units_sold", label: "Units sold" },
                    {
                      key: "gross_revenue",
                      label: "Revenue",
                      render: (r) => money(r.gross_revenue),
                    },
                  ]
                : tab === "customers"
                  ? [
                      { key: "customer_name", label: "Customer" },
                      { key: "orders", label: "Paid orders" },
                      {
                        key: "lifetime_spend",
                        label: "Period spend",
                        render: (r) => money(r.lifetime_spend),
                      },
                    ]
                  : tab === "coupons"
                    ? [
                        { key: "code", label: "Coupon" },
                        { key: "redemptions", label: "Uses" },
                        {
                          key: "discount",
                          label: "Discount",
                          render: (r) => money(r.discount),
                        },
                      ]
                    : tab === "inventory"
                      ? [
                          { key: "name", label: "Product" },
                          { key: "color", label: "Colour" },
                          { key: "stock", label: "Stock" },
                          { key: "low_stock_threshold", label: "Alert level" },
                        ]
                      : tab === "reviews"
                        ? [
                            {
                              key: "status",
                              label: "Status",
                              render: (r) => <StatusBadge value={r.status} />,
                            },
                            { key: "reviews", label: "Reviews" },
                            {
                              key: "rating",
                              label: "Average rating",
                              render: (r) => Number(r.rating).toFixed(1),
                            },
                          ]
                        : [
                            {
                              key: "type",
                              label: "Activity",
                              render: (r) => human(r.type),
                            },
                            { key: "points", label: "Points" },
                            { key: "transactions", label: "Transactions" },
                          ]
            }
          />
        </Panel>
      )}
    </>
  );
}

function Trend({ rows, field }: { rows: Row[]; field: string }) {
  const maximum = Math.max(1, ...rows.map((r) => Number(r[field] ?? 0)));
  return rows.length ? (
    <div className="admin-chart" role="img" aria-label="Orders per day">
      {rows.map((r, i) => (
        <div key={i}>
          <span>{r[field] ?? 0} orders</span>
          <i
            style={{
              height: Math.max(2, (Number(r[field] ?? 0) / maximum) * 160),
            }}
          />
          <small>{date(r.day)}</small>
        </div>
      ))}
    </div>
  ) : (
    <EmptyState
      title="No orders in this period"
      description="Order activity will appear here as customers purchase."
    />
  );
}
