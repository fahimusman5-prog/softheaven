"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { allowed } from "@/lib/admin/resources";
import { SettingsFields } from "../admin-form-controls";
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
  AdminTabs,
  DataTable,
  StatusBadge,
  Skeleton,
  ErrorState,
  Pagination,
  AdminModal,
} from "./primitives";
import { ResourceEditor } from "./editor";
export function SettingsForm({ id, title }: { id: string; title: string }) {
  const { data, loading, error, refresh } = useAdminData("settings?id=" + id);
  const [value, setValue] = useState<Row>({});
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    if (data.rows?.[0]) setValue(data.rows[0].value);
  }, [data]);
  return (
    <Panel title={title}>
      {loading ? (
        <Skeleton />
      ) : error ? (
        <ErrorState message={error} retry={refresh} />
      ) : (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            try {
              await adminRequest("settings", { id, values: { value } });
              setNotice("Settings saved.");
              refresh();
            } catch (e) {
              setNotice((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <div className="admin-form-grid">
            {id === "bank_transfer" ? (
              <>
                {[
                  ["bank_name", "Bank name"],
                  ["account_name", "Account name"],
                  ["account_number", "Account number"],
                  ["branch", "Branch"],
                ].map(([key, label]) => (
                  <label key={key}>
                    {label}
                    <input
                      value={value[key] ?? ""}
                      maxLength={key === "account_number" ? 60 : 150}
                      onChange={(e) =>
                        setValue({ ...value, [key]: e.target.value })
                      }
                    />
                  </label>
                ))}
                <label className="admin-field-wide">
                  Manual payment instructions
                  <textarea
                    value={value.instructions ?? ""}
                    maxLength={2000}
                    onChange={(e) =>
                      setValue({ ...value, instructions: e.target.value })
                    }
                  />
                </label>
                <label className="admin-switch-label">
                  <input
                    type="checkbox"
                    checked={Boolean(value.enabled)}
                    onChange={(e) =>
                      setValue({ ...value, enabled: e.target.checked })
                    }
                  />
                  Enable internal bank instructions
                </label>
              </>
            ) : (
              <SettingsFields id={id} value={value} onChange={setValue} />
            )}
          </div>
          <div className="admin-form-actions">
            <span role="status">{notice}</span>
            <button className="admin-primary" disabled={busy}>
              {busy ? "Saving…" : "Save settings"}
            </button>
          </div>
        </form>
      )}
    </Panel>
  );
}
function Admins({ role }: { role: string }) {
  const [page, setPage] = useState(0);
  const { data, loading, error, refresh } = useAdminData("users?page=" + page);
  const [edit, setEdit] = useState<Row | null>(null);
  const [names, setNames] = useState<Row[]>([]);
  useEffect(() => {
    const ids = (data.rows ?? []).map((r: Row) => r.id);
    if (ids.length)
      adminRequest(
        "business/options?" +
          new URLSearchParams({ target: "customers", ids: ids.join(",") }),
      )
        .then((r) => setNames(r.rows))
        .catch(() => {});
  }, [data]);
  return (
    <Panel
      title="Administrators"
      action={
        <button
          className="admin-primary"
          onClick={() => setEdit({ active: true })}
        >
          Add administrator
        </button>
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
            emptyTitle="No administrators found"
            emptyDescription="Add a confirmed account to grant administrator access."
            columns={[
              {
                key: "name",
                label: "Administrator",
                render: (r) => {
                  const person = names.find((p) => p.id === r.id);
                  return (
                    <span>
                      {person?.name || person?.email || "Administrator"}
                      <small className="admin-cell-secondary">
                        {person?.email}
                      </small>
                    </span>
                  );
                },
              },
              { key: "role", label: "Role", render: (r) => human(r.role) },
              {
                key: "active",
                label: "Status",
                render: (r) => <StatusBadge value={r.active} />,
              },
              {
                key: "created_at",
                label: "Added",
                render: (r) => date(r.created_at),
              },
              {
                key: "actions",
                label: "Actions",
                render: (r) => (
                  <button onClick={() => setEdit(r)}>Manage access</button>
                ),
              },
            ]}
          />
          <Pagination page={page} count={data.count ?? 0} onPage={setPage} />
        </>
      )}
      {edit && (
        <ResourceEditor
          resource="users"
          row={edit}
          role={role}
          onClose={() => setEdit(null)}
          onSaved={() => {
            setEdit(null);
            refresh();
          }}
        />
      )}
    </Panel>
  );
}
export function SettingsWorkspace({ role }: { role: string }) {
  const query = useSearchParams();
  const tabs = [
    ...(allowed(role, "settings")
      ? [
          { id: "general", label: "General" },
          { id: "seo", label: "SEO" },
        ]
      : []),
    ...(allowed(role, "users")
      ? [{ id: "administrators", label: "Administrators" }]
      : []),
  ];
  const [tab, setTab] = useState(query.get("tab") || tabs[0]?.id || "general");
  return (
    <>
      <PageHeader
        title="Settings"
        description="Store contact details, search defaults and administrator access."
      />
      <AdminTabs items={tabs} value={tab} onChange={setTab} />
      {tab === "administrators" && allowed(role, "users") ? (
        <Admins role={role} />
      ) : allowed(role, "settings") ? (
        <>
          <SettingsForm
            id={tab === "seo" ? "seo" : "general"}
            title={tab === "seo" ? "Search appearance" : "Store details"}
          />
          {tab === "general" && (
            <SettingsForm id="social" title="Social accounts" />
          )}
        </>
      ) : (
        <p>Your role cannot edit these settings.</p>
      )}
    </>
  );
}
function ShippingEditor({
  row,
  onClose,
  onSaved,
}: {
  row: Row;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [area, setArea] = useState(row.shipping_zones?.name ?? "");
  const [districts, setDistricts] = useState(
    (row.shipping_zones?.districts ?? []).join("\n"),
  );
  const [name, setName] = useState(row.name ?? "Standard delivery");
  const [rate, setRate] = useState(row.rate ?? "");
  const [free, setFree] = useState(row.free_over ?? "");
  const [active, setActive] = useState(row.active ?? true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <AdminModal
      title={row.id ? "Edit shipping charge" : "Add shipping charge"}
      onClose={onClose}
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          try {
            await adminRequest("business/shipping", {
              id: row.id ?? null,
              area,
              districts: districts
                .split("\n")
                .map((v: string) => v.trim())
                .filter(Boolean),
              name,
              rate: Number(rate),
              free_over: free === "" ? null : Number(free),
              active,
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
            Area name
            <input
              required
              maxLength={200}
              value={area}
              onChange={(e) => setArea(e.target.value)}
            />
          </label>
          <label>
            Delivery method
            <input
              required
              value={name}
              maxLength={200}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className="admin-field-wide">
            Districts
            <textarea
              value={districts}
              onChange={(e) => setDistricts(e.target.value)}
            />
            <small>One district per line. Leave blank for all Sri Lanka.</small>
          </label>
          <label>
            Charge (LKR)
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
            />
          </label>
          <label>
            Free shipping above (LKR)
            <input
              type="number"
              min="0"
              step="0.01"
              value={free}
              onChange={(e) => setFree(e.target.value)}
            />
          </label>
          <label className="admin-switch-label">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
            />
            Active
          </label>
        </div>
        {error && (
          <p role="alert" className="admin-error">
            {error}
          </p>
        )}
        <footer className="admin-form-actions">
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="admin-primary" disabled={busy}>
            {busy ? "Saving…" : "Save charge"}
          </button>
        </footer>
      </form>
    </AdminModal>
  );
}
function CommerceTable({
  resource,
  role,
}: {
  resource: "shipping" | "coupons" | "reward-settings";
  role: string;
}) {
  const [page, setPage] = useState(0);
  const { data, loading, error, refresh } = useAdminData(
    (resource !== "reward-settings" ? "business/" : "") +
      resource +
      "?page=" +
      page,
  );
  const [edit, setEdit] = useState<Row | null>(null);
  return (
    <Panel
      title={
        resource === "shipping"
          ? "Shipping charges"
          : resource === "coupons"
            ? "Coupons"
            : "Rewards programme"
      }
      action={
        resource !== "reward-settings" ? (
          <button
            className="admin-primary"
            onClick={() => setEdit({ active: true })}
          >
            Add {resource === "shipping" ? "charge" : "coupon"}
          </button>
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
            columns={
              resource === "shipping"
                ? [
                    {
                      key: "area",
                      label: "Area",
                      render: (r) => (
                        <span>
                          {r.shipping_zones?.name}
                          <small className="admin-cell-secondary">
                            {r.shipping_zones?.districts?.join(", ") ||
                              "All Sri Lanka"}
                          </small>
                        </span>
                      ),
                    },
                    { key: "name", label: "Delivery method" },
                    {
                      key: "rate",
                      label: "Charge",
                      render: (r) => money(r.rate),
                    },
                    {
                      key: "free_over",
                      label: "Free above",
                      render: (r) =>
                        r.free_over == null ? "—" : money(r.free_over),
                    },
                    {
                      key: "active",
                      label: "Status",
                      render: (r) => <StatusBadge value={r.active} />,
                    },
                    {
                      key: "actions",
                      label: "Actions",
                      render: (r) => (
                        <button onClick={() => setEdit(r)}>Edit</button>
                      ),
                    },
                  ]
                : resource === "coupons"
                  ? [
                      { key: "code", label: "Code" },
                      {
                        key: "kind",
                        label: "Discount",
                        render: (r) =>
                          r.kind === "percentage"
                            ? r.value + "%"
                            : r.kind === "free_shipping"
                              ? "Free shipping"
                              : money(r.value),
                      },
                      {
                        key: "uses",
                        label: "Uses",
                        render: (r) => r.coupon_redemptions?.[0]?.count ?? 0,
                      },
                      {
                        key: "min_order",
                        label: "Minimum",
                        render: (r) => money(r.min_order),
                      },
                      {
                        key: "ends_at",
                        label: "Expires",
                        render: (r) => date(r.ends_at),
                      },
                      {
                        key: "active",
                        label: "Status",
                        render: (r) => <StatusBadge value={r.active} />,
                      },
                      {
                        key: "actions",
                        label: "Actions",
                        render: (r) => (
                          <button onClick={() => setEdit(r)}>Edit</button>
                        ),
                      },
                    ]
                  : [
                      {
                        key: "enabled",
                        label: "Programme status",
                        render: (r) => <StatusBadge value={r.enabled} />,
                      },
                      { key: "earn_per_currency", label: "Points per LKR" },
                      {
                        key: "point_value",
                        label: "Value per point",
                        render: (r) => money(r.point_value),
                      },
                      {
                        key: "minimum_redemption",
                        label: "Minimum redemption",
                      },
                      {
                        key: "actions",
                        label: "Actions",
                        render: (r) => (
                          <button onClick={() => setEdit(r)}>
                            Edit programme
                          </button>
                        ),
                      },
                    ]
            }
          />
          <Pagination page={page} count={data.count ?? 0} onPage={setPage} />
        </>
      )}
      {edit &&
        (resource === "shipping" ? (
          <ShippingEditor
            row={edit}
            onClose={() => setEdit(null)}
            onSaved={() => {
              setEdit(null);
              refresh();
            }}
          />
        ) : (
          <ResourceEditor
            resource={resource}
            row={edit}
            role={role}
            onClose={() => setEdit(null)}
            onSaved={() => {
              setEdit(null);
              refresh();
            }}
          />
        ))}
    </Panel>
  );
}
export function CommerceWorkspace({ role }: { role: string }) {
  const query = useSearchParams();
  const tabs = [
    ...(allowed(role, "settings")
      ? [
          { id: "shipping", label: "Shipping charges" },
          { id: "bank", label: "Bank transfer" },
        ]
      : []),
    ...(allowed(role, "marketing")
      ? [{ id: "coupons", label: "Coupons" }]
      : []),
    ...(allowed(role, "rewards") ? [{ id: "rewards", label: "Rewards" }] : []),
  ];
  const [tab, setTab] = useState(query.get("tab") || tabs[0]?.id || "");
  const chosen = tabs.find((t) => t.id === tab) ? tab : tabs[0]?.id;
  return (
    <>
      <PageHeader
        title="Commerce"
        description="Manage delivery charges, discounts and customer rewards in one place."
      />
      <AdminTabs items={tabs} value={chosen} onChange={setTab} />
      {chosen === "bank" ? (
        <>
          <p className="admin-notice">
            Checkout currently accepts cash on delivery. These details are for
            internal manual payment instructions; saving them does not add bank
            transfer to checkout.
          </p>
          <SettingsForm id="bank_transfer" title="Bank details" />
        </>
      ) : (
        <CommerceTable
          key={chosen}
          resource={
            chosen === "shipping"
              ? "shipping"
              : chosen === "coupons"
                ? "coupons"
                : "reward-settings"
          }
          role={role}
        />
      )}
    </>
  );
}
