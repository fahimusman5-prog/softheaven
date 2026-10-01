"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { allowed } from "@/lib/admin/resources";
import {
  adminRequest,
  useAdminData,
  money,
  date,
  human,
  type Row,
} from "./shared";
import {
  PageHeader,
  Panel,
  DataTable,
  StatusBadge,
  Skeleton,
  ErrorState,
  EmptyState,
  AdminTabs,
  MetricCard,
  Pagination,
  AdminModal,
  ProductCell,
} from "./primitives";
import { ResourceEditor } from "./editor";
const transitions: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["packed", "cancelled"],
  packed: ["shipped", "cancelled"],
  shipped: ["delivered", "returned"],
  delivered: ["returned"],
  returned: ["refunded"],
};
function Address({ value }: { value: Row }) {
  return (
    <address>
      {[
        value.name,
        value.address || value.line1 || value.address_line1,
        value.line2 || value.address_line2,
        value.city,
        value.district,
        value.postal_code,
        value.country,
      ]
        .filter(Boolean)
        .map((v, i) => (
          <div key={i}>{v}</div>
        ))}
    </address>
  );
}
export function OrderDetail({ id, role }: { id: string; role: string }) {
  const { data, loading, error, refresh } = useAdminData("orders?id=" + id);
  const row = data.rows?.[0];
  const [values, setValues] = useState<Row>({});
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [refund, setRefund] = useState(false);
  useEffect(() => {
    if (row)
      setValues({
        status: row.status,
        notes: row.admin_notes ?? "",
        tracking: row.tracking_number ?? "",
        provider: row.shipping_provider ?? "",
        cod_paid: false,
      });
  }, [row]);
  return (
    <>
      <Link className="admin-back" href="/admin/orders">
        ← Back to orders
      </Link>
      <PageHeader
        title={row ? "Order #" + row.order_number : "Order details"}
        description={
          row
            ? "Placed " + date(row.created_at, true)
            : "Review customer, payment and fulfilment details."
        }
      />
      {loading ? (
        <Skeleton />
      ) : error ? (
        <ErrorState message={error} retry={refresh} />
      ) : !row ? (
        <EmptyState title="Order not found" />
      ) : (
        <>
          <div className="admin-detail-status">
            <StatusBadge value={row.status} />
            <StatusBadge value={row.payment_status} />
            <span>{human(row.payment_method)}</span>
          </div>
          <div className="admin-detail-grid">
            <div>
              <Panel title="Order items">
                <DataTable
                  rows={data.items ?? []}
                  columns={[
                    {
                      key: "name",
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
                    { key: "quantity", label: "Quantity" },
                    {
                      key: "unit_price",
                      label: "Price",
                      render: (r) => money(r.unit_price),
                    },
                    {
                      key: "total",
                      label: "Total",
                      render: (r) => money(r.quantity * r.unit_price),
                    },
                  ]}
                />
                <dl className="admin-totals">
                  {[
                    ["Subtotal", row.subtotal],
                    ["Discount", -Number(row.discount)],
                    ["Rewards discount", -Number(row.points_discount)],
                    ["Delivery", row.shipping],
                    ["Total", row.total],
                  ].map(([label, value]) => (
                    <div key={String(label)}>
                      <dt>{label}</dt>
                      <dd>{money(value)}</dd>
                    </div>
                  ))}
                </dl>
              </Panel>
              <Panel title="Fulfilment & internal notes">
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (
                      ["cancelled", "returned", "refunded"].includes(
                        values.status,
                      ) &&
                      values.status !== row.status &&
                      !confirm(
                        "Confirm this order status change? Cancellation and returns restore inventory and adjust rewards.",
                      )
                    )
                      return;
                    setBusy(true);
                    try {
                      await adminRequest("orders/update", {
                        id,
                        ...values,
                        notes: values.notes || null,
                        tracking: values.tracking || null,
                        provider: values.provider || null,
                      });
                      setNotice("Order updated.");
                      refresh();
                    } catch (e) {
                      setNotice((e as Error).message);
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  <div className="admin-form-grid">
                    <label>
                      Order status
                      <select
                        value={values.status ?? row.status}
                        onChange={(e) =>
                          setValues({ ...values, status: e.target.value })
                        }
                      >
                        {[
                          row.status,
                          ...(transitions[row.status] ?? []).filter(
                            (s) =>
                              s !== "refunded" ||
                              ["refunded", "partially_refunded"].includes(
                                row.payment_status,
                              ),
                          ),
                        ].map((s) => (
                          <option key={s} value={s}>
                            {human(s)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Delivery provider
                      <input
                        maxLength={200}
                        value={values.provider ?? ""}
                        onChange={(e) =>
                          setValues({ ...values, provider: e.target.value })
                        }
                      />
                    </label>
                    <label>
                      Tracking number
                      <input
                        maxLength={200}
                        value={values.tracking ?? ""}
                        onChange={(e) =>
                          setValues({ ...values, tracking: e.target.value })
                        }
                      />
                    </label>
                    <label className="admin-field-wide">
                      Admin notes
                      <textarea
                        maxLength={2000}
                        value={values.notes ?? ""}
                        onChange={(e) =>
                          setValues({ ...values, notes: e.target.value })
                        }
                      />
                      <small>
                        Internal notes are visible only to authorized
                        administrators.
                      </small>
                    </label>
                    {allowed(role, "settings") &&
                      row.payment_method === "cod" &&
                      values.status === "delivered" &&
                      row.payment_status !== "paid" && (
                        <label className="admin-switch-label">
                          <input
                            type="checkbox"
                            checked={values.cod_paid}
                            onChange={(e) =>
                              setValues({
                                ...values,
                                cod_paid: e.target.checked,
                              })
                            }
                          />
                          Confirm cash collected on delivery
                        </label>
                      )}
                  </div>
                  <footer className="admin-form-actions">
                    <span role="status">{notice}</span>
                    <button className="admin-primary" disabled={busy}>
                      {busy ? "Updating…" : "Update order"}
                    </button>
                  </footer>
                </form>
              </Panel>
              <Panel title="Order timeline">
                {data.events?.length ? (
                  <ol className="admin-timeline">
                    {data.events.map((r: Row) => (
                      <li key={r.id}>
                        <strong>{r.event}</strong>
                        <time>{date(r.created_at, true)}</time>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <EmptyState title="No timeline events" />
                )}
              </Panel>
            </div>
            <div>
              <Panel title="Customer">
                <strong>{row.shipping_address?.name || "Customer"}</strong>
                <p>{row.email}</p>
                <p>{row.phone}</p>
                {row.customer_id && allowed(role, "customers") && (
                  <Link
                    className="admin-text-link"
                    href={"/admin/customers/" + row.customer_id}
                  >
                    View customer →
                  </Link>
                )}
              </Panel>
              <Panel title="Delivery address">
                <Address value={row.shipping_address ?? {}} />
              </Panel>
              <Panel title="Payment">
                <p>Method: {human(row.payment_method)}</p>
                <p>
                  Status: <StatusBadge value={row.payment_status} />
                </p>
                <p>
                  Total: <strong>{money(row.total)}</strong>
                </p>
                {allowed(role, "settings") &&
                  row.payment_method === "cod" &&
                  row.status === "returned" &&
                  row.payment_status === "paid" && (
                    <button onClick={() => setRefund(true)}>
                      Record completed refund
                    </button>
                  )}
              </Panel>
            </div>
          </div>
          {refund && (
            <Refund
              id={id}
              onClose={() => setRefund(false)}
              onSaved={() => {
                setRefund(false);
                refresh();
              }}
            />
          )}
        </>
      )}
    </>
  );
}
function Refund({
  id,
  onClose,
  onSaved,
}: {
  id: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [reference, setReference] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <AdminModal title="Record completed cash refund" onClose={onClose}>
      <p className="admin-dialog-copy">
        Use this only after the refund has been completed outside SoftHaven.
        This action records the payment; it does not transfer money.
      </p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          try {
            await adminRequest("orders/refund", { id, reference, reason });
            onSaved();
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <div className="admin-form-grid">
          <label className="admin-field-wide">
            Payment reference
            <input
              required
              minLength={3}
              maxLength={200}
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </label>
          <label className="admin-field-wide">
            Reason
            <textarea
              required
              minLength={3}
              maxLength={2000}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </label>
        </div>
        {error && <p role="alert">{error}</p>}
        <footer className="admin-form-actions">
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="admin-primary" disabled={busy}>
            {busy ? "Recording…" : "Record refund"}
          </button>
        </footer>
      </form>
    </AdminModal>
  );
}
function CustomerTab({
  id,
  tab,
  role,
}: {
  id: string;
  tab: string;
  role: string;
}) {
  const [page, setPage] = useState(0);
  const { data, loading, error, refresh } = useAdminData(
    "business/customer-" +
      tab +
      "?" +
      new URLSearchParams({ customer: id, page: String(page) }),
  );
  const [adjust, setAdjust] = useState(false);
  return (
    <Panel
      title={human(tab)}
      action={
        tab === "rewards" && allowed(role, "rewards") ? (
          <button onClick={() => setAdjust(true)}>Adjust points</button>
        ) : undefined
      }
    >
      {loading ? (
        <Skeleton />
      ) : error ? (
        <ErrorState message={error} retry={refresh} />
      ) : (
        <>
          <DataTable
            rows={data.rows ?? []}
            emptyTitle={"No " + tab + " yet"}
            emptyDescription={
              tab === "orders"
                ? "This customer has not placed an order yet."
                : tab === "addresses"
                  ? "Saved delivery addresses will appear here."
                  : tab === "reviews"
                    ? "Product reviews from this customer will appear here."
                    : "Reward activity will appear when points are earned or redeemed."
            }
            columns={
              tab === "orders"
                ? [
                    {
                      key: "order_number",
                      label: "Order",
                      render: (r) =>
                        allowed(role, "orders") ? (
                          <Link href={"/admin/orders/" + r.id}>
                            #{r.order_number}
                          </Link>
                        ) : (
                          "#" + r.order_number
                        ),
                    },
                    {
                      key: "created_at",
                      label: "Date",
                      render: (r) => date(r.created_at),
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
                  ]
                : tab === "addresses"
                  ? [
                      { key: "name", label: "Recipient" },
                      {
                        key: "address",
                        label: "Address",
                        render: (r) => <Address value={r} />,
                      },
                      { key: "phone", label: "Phone" },
                    ]
                  : tab === "reviews"
                    ? [
                        {
                          key: "product",
                          label: "Product",
                          render: (r) => r.products?.name,
                        },
                        {
                          key: "rating",
                          label: "Rating",
                          render: (r) => r.rating + "/5",
                        },
                        {
                          key: "body",
                          label: "Review",
                          render: (r) => String(r.body ?? "").slice(0, 180),
                        },
                        {
                          key: "status",
                          label: "Status",
                          render: (r) => <StatusBadge value={r.status} />,
                        },
                      ]
                    : [
                        {
                          key: "created_at",
                          label: "Date",
                          render: (r) => date(r.created_at),
                        },
                        { key: "points", label: "Points" },
                        {
                          key: "type",
                          label: "Type",
                          render: (r) => human(r.type),
                        },
                        { key: "reason", label: "Reason" },
                        {
                          key: "order",
                          label: "Order",
                          render: (r) =>
                            r.orders?.order_number
                              ? "#" + r.orders.order_number
                              : "—",
                        },
                      ]
            }
          />
          <Pagination page={page} count={data.count ?? 0} onPage={setPage} />
        </>
      )}
      {adjust && (
        <RewardAdjust
          id={id}
          onClose={() => setAdjust(false)}
          onSaved={() => {
            setAdjust(false);
            refresh();
          }}
        />
      )}
    </Panel>
  );
}
function RewardAdjust({
  id,
  onClose,
  onSaved,
}: {
  id: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [points, setPoints] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <AdminModal title="Adjust reward points" onClose={onClose}>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          try {
            await adminRequest("rewards/adjust", {
              customer: id,
              points: Number(points),
              reason,
            });
            onSaved();
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <div className="admin-form-grid">
          <label>
            Points to add or deduct
            <input
              required
              type="number"
              step="1"
              min="-1000000"
              max="1000000"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
            />
            <small>Use a negative number to deduct points.</small>
          </label>
          <label>
            Reason
            <textarea
              required
              minLength={3}
              maxLength={500}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </label>
        </div>
        {error && <p role="alert">{error}</p>}
        <footer className="admin-form-actions">
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="admin-primary" disabled={busy}>
            {busy ? "Updating…" : "Update points"}
          </button>
        </footer>
      </form>
    </AdminModal>
  );
}
export function CustomerDetail({ id, role }: { id: string; role: string }) {
  const { data, loading, error, refresh } = useAdminData("customers?id=" + id);
  const row = data.rows?.[0];
  const summary = data.summary ?? {};
  const [tab, setTab] = useState("orders");
  const [edit, setEdit] = useState(false);
  return (
    <>
      <Link className="admin-back" href="/admin/customers">
        ← Back to customers
      </Link>
      <PageHeader
        title={row?.name || "Customer profile"}
        description={row?.email || "Customer details and store activity."}
        action={
          row ? (
            <button className="admin-primary" onClick={() => setEdit(true)}>
              Edit customer
            </button>
          ) : undefined
        }
      />
      {loading ? (
        <Skeleton />
      ) : error ? (
        <ErrorState message={error} retry={refresh} />
      ) : !row ? (
        <EmptyState title="Customer not found" />
      ) : (
        <>
          <div className="admin-metrics">
            <MetricCard
              label="Total orders"
              value={summary.orders ?? 0}
              note="All orders"
            />
            <MetricCard
              label="Total spent"
              value={money(summary.lifetime_spend)}
              note="Paid orders"
            />
            <MetricCard
              label="Reward points"
              value={summary.reward_balance ?? 0}
              note="Available balance"
            />
            <MetricCard
              label="Customer since"
              value={date(row.created_at)}
              note={row.active ? "Active account" : "Inactive account"}
            />
          </div>
          <Panel title="Contact & account">
            <div className="admin-customer-summary">
              <div>
                <small>Email</small>
                <strong>{row.email}</strong>
              </div>
              <div>
                <small>Phone</small>
                <strong>{row.phone || "Not provided"}</strong>
              </div>
              <div>
                <small>Account</small>
                <StatusBadge value={row.active} />
              </div>
            </div>
            {row.notes && <p>Internal notes: {row.notes}</p>}
          </Panel>
          <AdminTabs
            value={tab}
            onChange={setTab}
            items={["orders", "addresses", "reviews", "rewards"].map((id) => ({
              id,
              label: human(id),
            }))}
          />
          <CustomerTab key={tab} id={id} tab={tab} role={role} />
          {edit && (
            <ResourceEditor
              resource="customers"
              row={row}
              role={role}
              onClose={() => setEdit(false)}
              onSaved={() => {
                setEdit(false);
                refresh();
              }}
            />
          )}
        </>
      )}
    </>
  );
}
